#!/usr/bin/env node

import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const REQUIRED_ENV_KEYS = [
  'CLOUDINARY_CLOUD_NAME',
  'CLOUDINARY_API_KEY',
  'CLOUDINARY_API_SECRET',
];

const OUTPUT_DIR = path.resolve('output/cloudinary-audit');
const MAX_PAGES_PER_TARGET = 1000;
const RESOURCE_TARGETS = [
  { resourceType: 'image', type: 'upload' },
  { resourceType: 'video', type: 'upload' },
  { resourceType: 'raw', type: 'upload' },
];

const STRAPI_PREFIXES = ['large_', 'medium_', 'small_', 'thumbnail_'];
const GENERIC_DISPLAY_NAMES = new Set([
  'image',
  'photo',
  'picture',
  'asset',
  'file',
  'upload',
  'untitled',
]);
const TEXT_ENCODER = new TextEncoder();

function getMissingEnvKeys() {
  return REQUIRED_ENV_KEYS.filter((key) => !process.env[key]?.trim());
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function escapeCsv(value) {
  if (value === null || value === undefined) return '';
  const stringValue =
    typeof value === 'string' ? value : Array.isArray(value) ? value.join('|') : String(value);
  return /[",\n]/.test(stringValue) ? `"${stringValue.replace(/"/g, '""')}"` : stringValue;
}

function toCsv(rows) {
  if (rows.length === 0) return '';
  const headers = Object.keys(rows[0]);
  const lines = [headers.join(',')];

  for (const row of rows) {
    lines.push(headers.map((header) => escapeCsv(row[header])).join(','));
  }

  return `${lines.join('\n')}\n`;
}

function makeBasicAuthHeader(apiKey, apiSecret) {
  const token = Buffer.from(`${apiKey}:${apiSecret}`, 'utf8').toString('base64');
  return `Basic ${token}`;
}

async function fetchWithRetry(url, options, attempt = 0) {
  const response = await fetch(url, options);

  if (response.ok) return response;

  const retriable = response.status === 429 || response.status >= 500;
  if (!retriable || attempt >= 4) {
    const message = await response.text();
    throw new Error(`Cloudinary API request failed (${response.status}): ${message}`);
  }

  const retryAfterHeader = Number(response.headers.get('retry-after'));
  const backoff = Number.isFinite(retryAfterHeader) && retryAfterHeader > 0
    ? retryAfterHeader * 1000
    : 500 * 2 ** attempt;

  await sleep(backoff);
  return fetchWithRetry(url, options, attempt + 1);
}

function getPublicIdLeaf(publicId) {
  return publicId.split('/').pop() ?? publicId;
}

function isCloudinarySample(resource) {
  return (
    resource.public_id?.startsWith('samples/') ||
    resource.asset_folder === 'samples' ||
    resource.secure_url?.includes('/samples/')
  );
}

function isStrapiResponsiveCopy(resource) {
  const leaf = getPublicIdLeaf(resource.public_id ?? '');
  return STRAPI_PREFIXES.some((prefix) => leaf.startsWith(prefix));
}

function likelyOwnerFor(resource) {
  if (isCloudinarySample(resource)) return 'CLOUDINARY_SAMPLE';
  if (isStrapiResponsiveCopy(resource)) return 'STRAPI';

  const publicId = resource.public_id ?? '';
  const displayName = (resource.display_name ?? '').toLowerCase();
  const assetFolder = resource.asset_folder ?? '';

  if (
    publicId.startsWith('creare/') ||
    publicId.startsWith('creare-') ||
    assetFolder.startsWith('creare') ||
    displayName.includes('creare')
  ) {
    return 'CREARE';
  }

  return 'UNKNOWN';
}

function likelyUsageClassFor(resource) {
  if (isCloudinarySample(resource)) return 'SAMPLE';
  if (isStrapiResponsiveCopy(resource)) return 'STRAPI_RESPONSIVE_DERIVATIVE';
  if (resource.type !== 'upload') return 'CLOUDINARY_DERIVED';
  if (resource.public_id) return 'ORIGINAL';
  return 'UNKNOWN';
}

function hasLikelyTransparencyDependency(resource) {
  const haystack = `${resource.public_id ?? ''} ${resource.display_name ?? ''} ${(resource.tags ?? []).join(' ')}`.toLowerCase();
  return ['logo', 'icon', 'mark', 'glyph', 'transparent', 'overlay', 'graphic'].some((term) =>
    haystack.includes(term)
  );
}

function isGenericDisplayName(displayName = '') {
  const normalized = displayName.trim().toLowerCase();
  return !normalized || GENERIC_DISPLAY_NAMES.has(normalized);
}

function safeAspectRatio(width, height) {
  if (!width || !height) return null;
  return Number((width / height).toFixed(4));
}

function getAuditFlags(resource) {
  const flags = [];
  const longestSide = Math.max(resource.width ?? 0, resource.height ?? 0);
  const bytes = resource.bytes ?? 0;
  const leaf = getPublicIdLeaf(resource.public_id ?? '');
  const lowerLeaf = leaf.toLowerCase();

  if (!resource.context?.custom?.alt) flags.push('MISSING_ALT');
  if (!resource.context?.custom?.caption) flags.push('MISSING_CAPTION');
  if (!resource.tags?.length) flags.push('MISSING_TAGS');
  if (isGenericDisplayName(resource.display_name)) flags.push('GENERIC_DISPLAY_NAME');
  if (!resource.asset_folder) flags.push('ROOT_FOLDER');
  if (isCloudinarySample(resource)) flags.push('CLOUDINARY_SAMPLE');
  if (isStrapiResponsiveCopy(resource)) flags.push('STRAPI_RESPONSIVE_COPY');

  if (longestSide > 4000 || bytes > 3 * 1024 * 1024) flags.push('VERY_LARGE_ORIGINAL');

  const exemptLowRes =
    isStrapiResponsiveCopy(resource) ||
    hasLikelyTransparencyDependency(resource) ||
    lowerLeaf.includes('thumbnail');
  if (!exemptLowRes && longestSide > 0 && longestSide < 1000) flags.push('LOW_RESOLUTION');

  const pngPhotoCandidate =
    resource.format === 'png' &&
    bytes > 500 * 1024 &&
    !hasLikelyTransparencyDependency(resource) &&
    resource.resource_type === 'image';
  if (pngPhotoCandidate) flags.push('PNG_PHOTO_CANDIDATE');

  const inconsistentPublicId =
    resource.asset_folder &&
    resource.asset_folder !== 'samples' &&
    !resource.public_id?.startsWith(`${resource.asset_folder}/`);
  if (inconsistentPublicId) flags.push('PUBLIC_ID_INCONSISTENT');

  flags.push('REVIEW_USAGE');
  return flags.length === 1 ? ['OK'] : flags;
}

function normalizedRecord(resource) {
  const flags = getAuditFlags(resource);
  const owner = likelyOwnerFor(resource);
  const usageClass = likelyUsageClassFor(resource);

  return {
    asset_id: resource.asset_id ?? '',
    public_id: resource.public_id ?? '',
    display_name: resource.display_name ?? '',
    asset_folder: resource.asset_folder ?? '',
    resource_type: resource.resource_type ?? '',
    delivery_type: resource.type ?? '',
    format: resource.format ?? '',
    width: resource.width ?? null,
    height: resource.height ?? null,
    aspect_ratio: safeAspectRatio(resource.width, resource.height),
    bytes: resource.bytes ?? 0,
    created_at: resource.created_at ?? '',
    secure_url: resource.secure_url ?? '',
    alt: resource.context?.custom?.alt ?? '',
    caption: resource.context?.custom?.caption ?? '',
    tags: resource.tags ?? [],
    derived_resource_count: Array.isArray(resource.derived) ? resource.derived.length : 0,
    likely_owner: owner,
    likely_usage_class: usageClass,
    audit_status: flags.includes('OK') ? 'OK' : 'REVIEW',
    audit_flags: flags,
    recommended_action: flags.includes('OK') ? 'KEEP_AS_IS' : 'REVIEW_USAGE',
  };
}

function groupCounts(items, key) {
  return items.reduce((acc, item) => {
    const value = item[key] || 'UNKNOWN';
    acc[value] = (acc[value] ?? 0) + 1;
    return acc;
  }, {});
}

function findDuplicateNameGroups(items) {
  const byName = new Map();

  for (const item of items) {
    const key = item.display_name?.trim().toLowerCase();
    if (!key) continue;
    const list = byName.get(key) ?? [];
    list.push(item.public_id);
    byName.set(key, list);
  }

  return [...byName.entries()]
    .filter(([, publicIds]) => publicIds.length > 1)
    .map(([display_name, public_ids]) => ({ display_name, public_ids }))
    .sort((a, b) => b.public_ids.length - a.public_ids.length);
}

function summarize(records) {
  const ownerCounts = groupCounts(records, 'likely_owner');
  const usageCounts = groupCounts(records, 'likely_usage_class');
  const resourceTypeCounts = groupCounts(records, 'resource_type');
  const metadataCompleteness = {
    missing_alt: records.filter((record) => record.audit_flags.includes('MISSING_ALT')).length,
    missing_caption: records.filter((record) => record.audit_flags.includes('MISSING_CAPTION')).length,
    missing_tags: records.filter((record) => record.audit_flags.includes('MISSING_TAGS')).length,
  };
  const folderOrganization = {
    root_folder_assets: records.filter((record) => record.audit_flags.includes('ROOT_FOLDER')).length,
    foldered_assets: records.filter((record) => record.asset_folder).length,
  };
  const issueTotals = records.reduce((acc, record) => {
    for (const flag of record.audit_flags) {
      acc[flag] = (acc[flag] ?? 0) + 1;
    }
    return acc;
  }, {});

  const strapiResponsiveGroups = records
    .filter((record) => record.likely_usage_class === 'STRAPI_RESPONSIVE_DERIVATIVE')
    .reduce((acc, record) => {
      const leaf = getPublicIdLeaf(record.public_id);
      const baseName = STRAPI_PREFIXES.reduce(
        (value, prefix) => (value.startsWith(prefix) ? value.slice(prefix.length) : value),
        leaf
      );
      acc[baseName] = (acc[baseName] ?? 0) + 1;
      return acc;
    }, {});

  return {
    generated_at: new Date().toISOString(),
    total_assets: records.length,
    resource_type_counts: resourceTypeCounts,
    owner_counts: ownerCounts,
    usage_class_counts: usageCounts,
    metadata_completeness: metadataCompleteness,
    folder_organization: folderOrganization,
    issue_totals: issueTotals,
    derived_resource_total: records.reduce((sum, record) => sum + record.derived_resource_count, 0),
    duplicate_name_group_count: findDuplicateNameGroups(records).length,
    strapi_responsive_group_count: Object.keys(strapiResponsiveGroups).length,
    sample_asset_count: records.filter((record) => record.likely_usage_class === 'SAMPLE').length,
  };
}

function markdownListFromCounts(counts) {
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .map(([key, value]) => `- ${key}: ${value}`)
    .join('\n');
}

function renderReport(records, summary) {
  const duplicateGroups = findDuplicateNameGroups(records).slice(0, 15);
  const strapiGroups = records
    .filter((record) => record.likely_usage_class === 'STRAPI_RESPONSIVE_DERIVATIVE')
    .reduce((acc, record) => {
      const leaf = getPublicIdLeaf(record.public_id);
      const baseName = STRAPI_PREFIXES.reduce(
        (value, prefix) => (value.startsWith(prefix) ? value.slice(prefix.length) : value),
        leaf
      );
      const list = acc.get(baseName) ?? [];
      list.push(record.public_id);
      acc.set(baseName, list);
      return acc;
    }, new Map());

  const topStrapiGroups = [...strapiGroups.entries()]
    .sort((a, b) => b[1].length - a[1].length)
    .slice(0, 15);

  return `# Cloudinary Audit Report

## 1. Executive Summary

- Total original assets audited: ${summary.total_assets}
- Derived resources referenced on originals: ${summary.derived_resource_total}
- Duplicate display-name groups detected: ${summary.duplicate_name_group_count}
- Strapi responsive groups detected: ${summary.strapi_responsive_group_count}
- Cloudinary sample assets detected: ${summary.sample_asset_count}

## 2. Inventory by Resource Type

${markdownListFromCounts(summary.resource_type_counts)}

## 3. Inventory by Owner Classification

${markdownListFromCounts(summary.owner_counts)}

## 4. Metadata Completeness

${markdownListFromCounts(summary.metadata_completeness)}

## 5. Folder Organization

${markdownListFromCounts(summary.folder_organization)}

## 6. File Size and Resolution Findings

${markdownListFromCounts(
    Object.fromEntries(
      Object.entries(summary.issue_totals).filter(([key]) =>
        ['VERY_LARGE_ORIGINAL', 'LOW_RESOLUTION', 'PNG_PHOTO_CANDIDATE'].includes(key)
      )
    )
  ) || '- None'}

## 7. Strapi Responsive Asset Groups

${
  topStrapiGroups.length
    ? topStrapiGroups
        .map(([baseName, publicIds]) => `- ${baseName}: ${publicIds.length} assets`)
        .join('\n')
    : '- None detected'
}

## 8. Cloudinary Sample Assets

- Count: ${summary.sample_asset_count}
- Note: sample assets are preserved and only flagged for review, not removal.

## 9. Possible Duplicate Name Groups

${
  duplicateGroups.length
    ? duplicateGroups
        .map(({ display_name, public_ids }) => `- ${display_name}: ${public_ids.length} assets`)
        .join('\n')
    : '- None detected'
}

## 10. Safe Next Actions

- Review root-folder assets and decide whether they should eventually be organized under owned folders.
- Review missing alt, caption, and tag coverage before any future governance cleanup.
- Review large originals and PNG photo candidates for future optimization planning.
- Review duplicate display-name groups manually before making any lifecycle decisions.
- Review sample assets separately from CREARE-owned assets to avoid accidental scope mixing.

## 11. Actions Explicitly Deferred

- No delete recommendations in this first report.
- No rename or move recommendations in this first report.
- No usage inference based only on repository search.
- No Cloudinary updates, transformations, or metadata writes were performed.
`;
}

async function fetchResourcesForTarget(authHeader, { resourceType, type }) {
  const allResources = [];
  let nextCursor = null;
  let page = 0;
  let encounteredEmptyPageWithCursor = false;
  const seenCursors = new Set();
  const label = `${resourceType}/${type}`;

  do {
    page += 1;
    if (page > MAX_PAGES_PER_TARGET) {
      throw new Error(
        `${label} exceeded the maximum page safety limit (${MAX_PAGES_PER_TARGET}).`
      );
    }

    if (nextCursor) {
      if (seenCursors.has(nextCursor)) {
        throw new Error(`${label} returned the same next_cursor twice: ${nextCursor}`);
      }
      seenCursors.add(nextCursor);
    }

    const url = new URL(
      `https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_CLOUD_NAME}/resources/${resourceType}/${type}`
    );
    url.searchParams.set('max_results', '500');
    url.searchParams.set('direction', 'desc');
    url.searchParams.set('context', 'true');
    url.searchParams.set('tags', 'true');
    url.searchParams.set('metadata', 'true');
    if (nextCursor) url.searchParams.set('next_cursor', nextCursor);

    const response = await fetchWithRetry(url, {
      headers: {
        Authorization: authHeader,
        Accept: 'application/json',
      },
    });
    const payload = await response.json();
    const pageResources = payload.resources ?? [];
    const returnedCursor =
      typeof payload.next_cursor === 'string' && payload.next_cursor.trim()
        ? payload.next_cursor
        : null;

    if (pageResources.length === 0 && returnedCursor) {
      encounteredEmptyPageWithCursor = true;
    }

    allResources.push(...pageResources);
    nextCursor = returnedCursor;

    if (nextCursor) {
      console.log(`${label}: page ${page}, assets ${pageResources.length}, continuation available`);
    } else {
      console.log(`${label}: page ${page}, assets ${pageResources.length}`);
    }

    if (nextCursor) await sleep(150);
  } while (nextCursor);

  return {
    resources: allResources,
    pageCount: page,
    encounteredEmptyPageWithCursor,
  };
}

async function main() {
  const missingEnvKeys = getMissingEnvKeys();
  if (missingEnvKeys.length) {
    console.error(`Missing required environment variables: ${missingEnvKeys.join(', ')}`);
    process.exit(1);
  }

  const authHeader = makeBasicAuthHeader(
    process.env.CLOUDINARY_API_KEY,
    process.env.CLOUDINARY_API_SECRET
  );

  const resources = [];
  const pagination = {};
  for (const target of RESOURCE_TARGETS) {
    const targetResult = await fetchResourcesForTarget(authHeader, target);
    resources.push(...targetResult.resources);
    pagination[`${target.resourceType}/${target.type}`] = {
      pages_fetched: targetResult.pageCount,
      assets_fetched: targetResult.resources.length,
      encountered_empty_page_with_cursor: targetResult.encounteredEmptyPageWithCursor,
    };
  }

  const records = resources.map(normalizedRecord);
  const summary = summarize(records);
  const csvRows = records.map((record) => ({
    ...record,
    tags: record.tags.join('|'),
    audit_flags: record.audit_flags.join('|'),
  }));
  const report = renderReport(records, summary);

  await mkdir(OUTPUT_DIR, { recursive: true });
  await writeFile(
    path.join(OUTPUT_DIR, 'cloudinary-assets.json'),
    JSON.stringify(records, null, 2),
    'utf8'
  );
  await writeFile(path.join(OUTPUT_DIR, 'cloudinary-assets.csv'), toCsv(csvRows), 'utf8');
  await writeFile(
    path.join(OUTPUT_DIR, 'cloudinary-audit-summary.json'),
    JSON.stringify(
      {
        ...summary,
        pagination,
      },
      null,
      2
    ),
    'utf8'
  );
  await writeFile(path.join(OUTPUT_DIR, 'cloudinary-audit-report.md'), report, 'utf8');

  console.log(`Cloudinary audit complete: ${OUTPUT_DIR}`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});

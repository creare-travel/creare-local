import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { insights } from '../../data/insights';
import { isKnownEditorialImageSentinel, isRenderableEditorialImage } from '../editorial-image';
import {
  CULTURAL_WORLD_INSIGHT_SLUGS,
  INSIGHT_EDITORIAL_ORDER_SLUGS,
  PRIVATE_LIFE_INSIGHT_SLUG,
  canUseStaticInsightIdentity,
  getInsightIdentityDestination,
  getRelatedEssayLinkAriaLabel,
  getRelatedEssaysSectionAriaLabel,
  getStaticInsightIdentity,
  isMigratedStaticInsightSlug,
  orderInsightItemsForLocale,
  selectItemsBySlugOrder,
} from '../insights/parity';
import { localizePathname } from './pathname';

const expectedEditorialOrder = [
  'private-experiences-istanbul-what-access-really-means',
  'private-life-of-istanbul',
  'cappadocia-without-balloons-a-different-kind-of-silence',
  'bodrum-beyond-the-coast-where-the-aegean-slows-down',
  'private-experiences-bodrum-beyond-the-marina',
  'bodrum-without-beach-clubs-a-different-rhythm',
  'cappadocia-at-first-light',
  'cappadocia-without-tours-moving-outside-the-routes',
  'private-experiences-cappadocia-silence-space-access',
  'istanbul-without-the-crowds-where-the-city-still-breathes',
  'what-makes-an-experience-truly-private',
  'what-exclusive-travel-actually-means',
  'why-most-luxury-travel-is-actually-mass-tourism',
  'the-aegean-as-a-cultural-argument',
  'bodrum-beyond-the-marina',
  'private-experiences-aegean-what-cannot-be-booked',
] as const;

const expectedEnBaselineOrder = [
  'private-life-of-istanbul',
  'bodrum-beyond-the-marina',
  'cappadocia-at-first-light',
  'the-aegean-as-a-cultural-argument',
  'private-experiences-istanbul-what-access-really-means',
  'bodrum-beyond-the-coast-where-the-aegean-slows-down',
  'cappadocia-without-balloons-a-different-kind-of-silence',
  'what-exclusive-travel-actually-means',
  'private-experiences-bodrum-beyond-the-marina',
  'private-experiences-cappadocia-silence-space-access',
  'private-experiences-aegean-what-cannot-be-booked',
  'bodrum-without-beach-clubs-a-different-rhythm',
  'istanbul-without-the-crowds-where-the-city-still-breathes',
  'cappadocia-without-tours-moving-outside-the-routes',
  'why-most-luxury-travel-is-actually-mass-tourism',
  'what-makes-an-experience-truly-private',
] as const;

const expectedBatchARelation = {
  sourceSlug: 'private-experiences-istanbul-what-access-really-means',
  targetSlug: 'private-life-of-istanbul',
  targetPath: '/tr/insights/private-life-of-istanbul',
} as const;
const expectedRelatedLinkCounts = [1, 11, 30] as const;

const migrationSlugs = insights
  .map((insight) => insight.slug)
  .filter((slug) => slug !== PRIVATE_LIFE_INSIGHT_SLUG);
const staticInsightBySlug = new Map(insights.map((insight) => [insight.slug, insight]));

assert.equal(insights.length, 16, 'Static registry must describe all 16 Insight identities');
assert.equal(migrationSlugs.length, 15, 'Exactly 15 static-backed Insight migrations expected');
assert.deepEqual(
  insights.map((insight) => insight.slug),
  expectedEnBaselineOrder,
  'English registry order must remain at the pre-patch baseline'
);
assert.deepEqual(INSIGHT_EDITORIAL_ORDER_SLUGS, expectedEditorialOrder);
assert.equal(new Set(INSIGHT_EDITORIAL_ORDER_SLUGS).size, 16, 'Editorial order must be unique');
assert.deepEqual(
  new Set(INSIGHT_EDITORIAL_ORDER_SLUGS),
  new Set(insights.map((insight) => insight.slug)),
  'Editorial order must cover the complete registry'
);

for (const slug of migrationSlugs) {
  const identity = getStaticInsightIdentity(slug);
  assert.ok(identity, `Static identity missing for ${slug}`);
  assert.deepEqual(
    Object.keys(identity).sort(),
    [
      'culturalWorldSlug',
      'location',
      'relatedExperienceSlugs',
      'relatedInsightSlugs',
      'slug',
    ].sort(),
    `Static identity exposes editorial fields for ${slug}`
  );
  assert.equal(isMigratedStaticInsightSlug(slug), true);
  assert.equal(canUseStaticInsightIdentity(slug, 'tr'), true);
}

assert.equal(isMigratedStaticInsightSlug(PRIVATE_LIFE_INSIGHT_SLUG), false);
assert.equal(canUseStaticInsightIdentity(PRIVATE_LIFE_INSIGHT_SLUG, 'tr'), false);
assert.equal(
  getInsightIdentityDestination(PRIVATE_LIFE_INSIGHT_SLUG, 'tr'),
  null,
  'Existing Turkish private-life CMS destination ownership must remain frozen'
);
assert.deepEqual(getInsightIdentityDestination('bodrum-beyond-the-marina', 'tr'), {
  slug: 'bodrum',
  name: 'Bodrum',
});
assert.deepEqual(getInsightIdentityDestination('cappadocia-at-first-light', 'tr'), {
  slug: 'cappadocia',
  name: 'Kapadokya',
});
assert.deepEqual(
  getInsightIdentityDestination('private-experiences-istanbul-what-access-really-means', 'tr'),
  { slug: 'istanbul', name: 'İstanbul' }
);
assert.equal(
  getInsightIdentityDestination('the-aegean-as-a-cultural-argument', 'tr'),
  null,
  'Aegean must not fabricate a Cultural World route'
);
assert.equal(getRelatedEssaysSectionAriaLabel('en', 'Related Essays'), 'Related essays');
assert.equal(
  getRelatedEssayLinkAriaLabel('en', 'Example Essay', 'Read'),
  'Read related essay: Example Essay'
);
assert.equal(getRelatedEssaysSectionAriaLabel('tr', 'İlgili Yazılar'), 'İlgili Yazılar');
assert.equal(getRelatedEssayLinkAriaLabel('tr', 'Örnek Yazı', 'Oku'), 'Oku: Örnek Yazı');

const sentinelImages = [
  { id: 59, name: 'future-name.jpg', url: 'https://cdn.example.com/future-name.jpg' },
  { id: 900, name: 'creare-image-placeholder.jpg', url: 'https://cdn.example.com/other.jpg' },
  {
    id: 900,
    name: 'other.jpg',
    url: 'https://res.cloudinary.com/creare/image/upload/v1/creare_image_placeholder_3c5059c819.jpg',
  },
];

for (const image of sentinelImages) {
  assert.equal(isKnownEditorialImageSentinel(image), true);
  assert.equal(isRenderableEditorialImage(image), false);
}

const privateLifeCover = {
  id: 15,
  name: 'private-life-of-istanbul.jpg',
  url: 'https://res.cloudinary.com/creare/image/upload/private-life-of-istanbul.jpg',
};
assert.equal(isKnownEditorialImageSentinel(privateLifeCover), false);
assert.equal(isRenderableEditorialImage(privateLifeCover), true);
assert.equal(isRenderableEditorialImage(null), false);

const simulatedTrCmsItems = expectedEditorialOrder.map((slug) => ({
  slug,
  title: `TR CMS TITLE: ${slug}`,
  excerpt: `TR CMS EXCERPT: ${slug}`,
  content: `TR CMS BODY: ${slug}`,
  coverImage: slug === PRIVATE_LIFE_INSIGHT_SLUG ? privateLifeCover : sentinelImages[0],
}));
const simulatedTrListing = orderInsightItemsForLocale(simulatedTrCmsItems, 'tr');
const simulatedEnListing = orderInsightItemsForLocale(
  expectedEnBaselineOrder.map((slug) => ({ slug })),
  'en'
);

assert.equal(simulatedTrListing.length, 16);
assert.equal(new Set(simulatedTrListing.map((item) => item.slug)).size, 16);
assert.deepEqual(
  simulatedTrListing.map((item) => item.slug),
  expectedEditorialOrder
);
assert.deepEqual(
  simulatedEnListing.map((item) => item.slug),
  expectedEnBaselineOrder,
  'English list and JSON-LD identity order must remain unchanged'
);
assert.equal(
  simulatedTrListing.filter((item) => isRenderableEditorialImage(item.coverImage)).length,
  1,
  'Only the real private-life cover may render in the simulated inventory'
);
assert.equal(
  simulatedTrListing.filter(
    (item) => item.slug !== PRIVATE_LIFE_INSIGHT_SLUG && isRenderableEditorialImage(item.coverImage)
  ).length,
  0,
  'No migration sentinel may render'
);

for (const item of simulatedTrListing) {
  assert.match(item.title, /^TR CMS TITLE:/);
  assert.match(item.excerpt, /^TR CMS EXCERPT:/);
  assert.match(item.content, /^TR CMS BODY:/);
  assert.notEqual(item.title, staticInsightBySlug.get(item.slug)?.title);
  assert.notEqual(item.excerpt, staticInsightBySlug.get(item.slug)?.description);
  assert.notEqual(item.content, staticInsightBySlug.get(item.slug)?.content);
}

const culturalGroups = new Map<string, string[]>();
for (const slug of CULTURAL_WORLD_INSIGHT_SLUGS) {
  const destination = getInsightIdentityDestination(slug, 'tr');
  if (!destination) continue;
  culturalGroups.set(destination.slug, [...(culturalGroups.get(destination.slug) ?? []), slug]);
}
assert.deepEqual(culturalGroups.get('bodrum'), [
  'private-experiences-bodrum-beyond-the-marina',
  'bodrum-without-beach-clubs-a-different-rhythm',
]);
assert.deepEqual(culturalGroups.get('cappadocia'), [
  'cappadocia-at-first-light',
  'cappadocia-without-tours-moving-outside-the-routes',
  'private-experiences-cappadocia-silence-space-access',
]);
assert.deepEqual(culturalGroups.get('istanbul'), [
  'istanbul-without-the-crowds-where-the-city-still-breathes',
]);

for (const slug of migrationSlugs) {
  const intendedSlugs = getStaticInsightIdentity(slug)?.relatedExperienceSlugs ?? [];
  const availableItems = intendedSlugs
    .map((experienceSlug, index) => ({
      slug: experienceSlug,
      title: `TR EXPERIENCE ${index}: ${experienceSlug}`,
    }))
    .filter((_, index) => index !== 1);
  const selectedItems = selectItemsBySlugOrder(intendedSlugs, availableItems);

  assert.deepEqual(
    selectedItems.map((item) => item.slug),
    intendedSlugs.filter((_, index) => index !== 1),
    `Related Experience order or missing-item omission failed for ${slug}`
  );
  selectedItems.forEach((item) => {
    assert.equal(
      localizePathname(`/experiences/${item.slug}`, 'tr'),
      `/tr/experiences/${item.slug}`
    );
    assert.match(item.title, /^TR EXPERIENCE/);
  });
}

const relatedLinkCounts: number[] = [];
const relatedLinksByBatch: Array<
  Array<{ sourceSlug: string; targetSlug: string; targetPath: string }>
> = [];
const unpublishedRelatedLinkCounts: number[] = [];

assert.equal(
  getStaticInsightIdentity(expectedBatchARelation.sourceSlug)?.relatedInsightSlugs.includes(
    expectedBatchARelation.targetSlug
  ),
  true,
  'Batch A source must retain the private-life related Insight identity'
);

for (const publishedMigrationCount of [5, 10, 15]) {
  const publishedSlugs = new Set([
    PRIVATE_LIFE_INSIGHT_SLUG,
    ...migrationSlugs.slice(0, publishedMigrationCount),
  ]);
  const unpublishedMigrationSlugs = new Set(migrationSlugs.slice(publishedMigrationCount));
  const publishedCmsItems = [...publishedSlugs].map((slug) => ({
    slug,
    title: `TR CMS TITLE: ${slug}`,
  }));
  const partialListing = orderInsightItemsForLocale(publishedCmsItems, 'tr');

  assert.equal(partialListing.length, publishedMigrationCount + 1);
  assert.equal(new Set(partialListing.map((item) => item.slug)).size, partialListing.length);

  let relatedLinkCount = 0;
  let unpublishedRelatedLinkCount = 0;
  const relatedLinks: Array<{ sourceSlug: string; targetSlug: string; targetPath: string }> = [];
  for (const currentSlug of publishedSlugs) {
    if (currentSlug === PRIVATE_LIFE_INSIGHT_SLUG) continue;
    const intendedSlugs = getStaticInsightIdentity(currentSlug)?.relatedInsightSlugs ?? [];
    const relatedItems = selectItemsBySlugOrder(intendedSlugs, publishedCmsItems);

    assert.deepEqual(
      relatedItems.map((item) => item.slug),
      intendedSlugs.filter((slug) => publishedSlugs.has(slug)),
      `Published-only related Insight filtering failed for ${currentSlug}`
    );
    relatedItems.forEach((item) => {
      const targetPath = localizePathname(`/insights/${item.slug}`, 'tr');
      assert.equal(targetPath, `/tr/insights/${item.slug}`);
      assert.equal(publishedSlugs.has(item.slug), true, `TR 404 link generated for ${item.slug}`);
      if (!publishedSlugs.has(item.slug) || unpublishedMigrationSlugs.has(item.slug)) {
        unpublishedRelatedLinkCount += 1;
      }
      relatedLinks.push({ sourceSlug: currentSlug, targetSlug: item.slug, targetPath });
    });
    relatedLinkCount += relatedItems.length;
  }
  relatedLinkCounts.push(relatedLinkCount);
  relatedLinksByBatch.push(relatedLinks);
  unpublishedRelatedLinkCounts.push(unpublishedRelatedLinkCount);

  assert.equal(
    unpublishedRelatedLinkCount,
    0,
    `Publication batch ${publishedMigrationCount} generated an unpublished related Insight link`
  );
}

assert.ok(relatedLinkCounts[1] >= relatedLinkCounts[0]);
assert.ok(relatedLinkCounts[2] >= relatedLinkCounts[1]);
assert.ok(relatedLinkCounts[2] > relatedLinkCounts[0]);
assert.deepEqual(relatedLinkCounts, [...expectedRelatedLinkCounts]);
assert.equal(relatedLinkCounts[0], 1, 'Batch A must render exactly one related Insight link');
assert.deepEqual(relatedLinksByBatch[0], [expectedBatchARelation]);
assert.deepEqual(unpublishedRelatedLinkCounts, [0, 0, 0]);

const listingSource = readFileSync(
  join(process.cwd(), 'src/features/i18n-pages/insights.tsx'),
  'utf8'
);
const detailSource = readFileSync(
  join(process.cwd(), 'src/features/i18n-pages/insight-detail.tsx'),
  'utf8'
);
const relatedInsightFetchSource = detailSource.slice(
  detailSource.indexOf('async function fetchInsightsBySlugs'),
  detailSource.indexOf('async function buildRelatedEssayReferences')
);

assert.match(listingSource, /if \(!canUseEnglishFallback\(locale\)\) return \[\];/);
assert.match(listingSource, /return orderInsightItemsForLocale\(\s*\[/);
assert.match(listingSource, /mergeInsights\(staticInsights, strapiInsights, locale\)/);
assert.match(detailSource, /if \(!canUseEnglishFallback\(locale\)\) return null;/);
assert.match(detailSource, /locale !== DEFAULT_SITE_LOCALE && isMigratedStaticInsightSlug\(slug\)/);
assert.match(
  detailSource,
  /useMigratedTrExperienceIdentity \? \[\.\.\.\(identity\?\.relatedInsightSlugs \?\? \[\]\)\] : undefined/
);
assert.match(detailSource, /const publishedInsights = await fetchInsightsBySlugs/);
assert.doesNotMatch(relatedInsightFetchSource, /visibility_status/);
assert.match(relatedInsightFetchSource, /params\.set\('status', 'published'\)/);
assert.match(relatedInsightFetchSource, /params\.set\('fields\[3\]', 'publishedAt'\)/);
assert.match(relatedInsightFetchSource, /\.filter\(\(item\) => isPublicInsightRecord\(item\)\)/);
assert.match(detailSource, /getRelatedEssaysSectionAriaLabel\(locale,/);
assert.match(detailSource, /getRelatedEssayLinkAriaLabel\(/);
assert.match(detailSource, /coverImageUrl && \(/);
assert.match(detailSource, /coverImageUrl \? 'pt-12' : 'pt-36 sm:pt-44'/);

console.info('TR Insight parity assertions passed', {
  inventory: simulatedTrListing.length,
  uniqueSlugs: new Set(simulatedTrListing.map((item) => item.slug)).size,
  renderedSentinels: 0,
  renderedRealCovers: 1,
  batchListingCounts: [6, 11, 16],
  relatedLinkCounts,
  exactBatchARelation: expectedBatchARelation,
  unpublishedRelatedLinkCounts,
});

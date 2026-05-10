import Script from 'next/script';
import { cleanSchemaObject, dedupeGraphById, SCHEMA_CONTEXT } from '@/lib/schema-builder';
import type { SchemaNode } from '@/lib/schema-builder';

interface JsonLdProps {
  id?: string;
  schema: SchemaNode | SchemaNode[];
}

export default function JsonLd({ id, schema }: JsonLdProps) {
  const normalizedGraph = Array.isArray(schema) ? schema : [schema];
  const cleanedGraph = normalizedGraph
    .map((node) => cleanSchemaObject(node))
    .filter(Boolean) as SchemaNode[];
  const dedupedGraph = dedupeGraphById(cleanedGraph);

  if (dedupedGraph.length === 0) {
    return null;
  }

  const payload =
    dedupedGraph.length === 1
      ? cleanSchemaObject({
          '@context': SCHEMA_CONTEXT,
          ...dedupedGraph[0],
        })
      : cleanSchemaObject({
          '@context': SCHEMA_CONTEXT,
          '@graph': dedupedGraph,
        });

  if (!payload) {
    return null;
  }

  return (
    <Script
      id={id}
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(payload) }}
    />
  );
}

'use client';
import { redirect } from 'next/navigation';

// Visual sitemap removed — system-level sitemap.xml handles SEO indexing
export default function SitemapPageRedirect() {
  redirect('/');
}

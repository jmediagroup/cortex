// Client-safe metadata describing every CMS content type.
//
// `lib/cms/admin.ts` is `server-only`, so its `CONTENT_TYPES` array can't be
// imported into the admin UI (client components). This module is the shared,
// dependency-free source of truth the admin list + editor use to render each
// type: labels, the public URL base, the shape of its type-specific metadata,
// and a badge colour. Keep it free of React/server imports.

export type ContentTypeKey = 'article' | 'guide' | 'daily' | 'weekly';

export interface ContentTypeMeta {
  key: ContentTypeKey;
  /** Singular label, e.g. "Article", "Daily Outlook". */
  label: string;
  /** Short label for filter chips + table badges, e.g. "Daily". */
  short: string;
  /** Public URL base the slug lives under, e.g. "/articles", "/thinking". */
  pathPrefix: string;
  /**
   * Whether the public site currently reads this type from the CMS database.
   * Only `article` is DB-backed today; guides/outlook still render from the
   * Markdown pipeline (Phase 2). Used to decide whether to surface a public
   * "view" link (a fresh CMS slug for a non-DB type would 404).
   */
  publicReadsFromDb: boolean;
  /** Whether the generic categories/tags taxonomy applies to this type. */
  usesTaxonomy: boolean;
  /** One-line hint shown under the editor header. */
  hint: string;
  /** Badge colours (inline styles, mirroring the status badges). */
  badge: { bg: string; color: string };
}

export const CONTENT_TYPES: ContentTypeMeta[] = [
  {
    key: 'article',
    label: 'Article',
    short: 'Articles',
    pathPrefix: '/articles',
    publicReadsFromDb: true,
    usesTaxonomy: true,
    hint: 'Evergreen explainers published to /articles.',
    badge: { bg: 'var(--color-accent-light)', color: 'var(--color-accent)' },
  },
  {
    key: 'guide',
    label: 'Guide',
    short: 'Guides',
    pathPrefix: '/guides',
    publicReadsFromDb: false,
    usesTaxonomy: true,
    hint: 'Cornerstone personal-finance guides published to /guides.',
    badge: { bg: '#dcfce7', color: 'var(--color-positive)' },
  },
  {
    key: 'daily',
    label: 'Daily Outlook',
    short: 'Daily',
    pathPrefix: '/thinking',
    publicReadsFromDb: false,
    usesTaxonomy: false,
    hint: 'Daily investment outlook published to /thinking.',
    badge: { bg: '#ede9fe', color: '#6d28d9' },
  },
  {
    key: 'weekly',
    label: 'Weekly Outlook',
    short: 'Weekly',
    pathPrefix: '/thinking',
    publicReadsFromDb: false,
    usesTaxonomy: false,
    hint: 'Weekly market recap published to /thinking.',
    badge: { bg: '#fef3c7', color: 'var(--color-warning)' },
  },
];

export const CONTENT_TYPE_MAP: Record<ContentTypeKey, ContentTypeMeta> =
  CONTENT_TYPES.reduce(
    (acc, t) => ({ ...acc, [t.key]: t }),
    {} as Record<ContentTypeKey, ContentTypeMeta>,
  );

/** Narrow an untrusted string to a known content type, defaulting to `article`. */
export function normalizeContentType(value: string | null | undefined): ContentTypeKey {
  return value && value in CONTENT_TYPE_MAP ? (value as ContentTypeKey) : 'article';
}

/** Meta for a type, falling back to the article meta for unknown values. */
export function getContentTypeMeta(value: string | null | undefined): ContentTypeMeta {
  return CONTENT_TYPE_MAP[normalizeContentType(value)];
}

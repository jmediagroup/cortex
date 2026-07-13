// The Money Guy Show — YouTube channel helpers.
//
// Money Guy Mutants is an independent fan project. This module reads the show's
// PUBLIC Atom feed (no API key, no OAuth) so we can point our visitors at the
// real channel and surface its latest uploads as links back to YouTube. We do
// not re-host, transcode, or embed the videos — every card links out to
// youtube.com, where the creators get the view, the watch time, and the ad
// revenue. See /the-money-guy-show for how this is used.
//
// Channel identity (verified via public analytics listings):
//   handle:     @MoneyGuyShow
//   channel id: UC9vUu4vlIlMC0dHQCTvQPbg

export const MONEY_GUY_CHANNEL_ID = 'UC9vUu4vlIlMC0dHQCTvQPbg';
export const MONEY_GUY_CHANNEL_HANDLE = '@MoneyGuyShow';
export const MONEY_GUY_CHANNEL_URL = 'https://www.youtube.com/@MoneyGuyShow';
/** Deep link that opens YouTube with the "Subscribe?" confirmation dialog. */
export const MONEY_GUY_SUBSCRIBE_URL =
  'https://www.youtube.com/@MoneyGuyShow?sub_confirmation=1';
/** The show's official website (where the podcast + resources live). */
export const MONEY_GUY_SITE_URL = 'https://moneyguy.com';

export const MONEY_GUY_FEED_URL = `https://www.youtube.com/feeds/videos.xml?channel_id=${MONEY_GUY_CHANNEL_ID}`;

export type YouTubeVideo = {
  /** 11-character YouTube video id. */
  id: string;
  title: string;
  /** Canonical watch URL on youtube.com. */
  url: string;
  /** hqdefault thumbnail — always present for a public video. */
  thumbnail: string;
  /** ISO-8601 publish timestamp. */
  published: string;
  /** View count if the feed exposed it, otherwise null. */
  views: number | null;
};

const NAMED_ENTITIES: Record<string, string> = {
  amp: '&',
  lt: '<',
  gt: '>',
  quot: '"',
  apos: "'",
  '#39': "'",
  '#039': "'",
  '#34': '"',
};

/** Decode the handful of XML/HTML entities that show up in video titles. */
function decodeEntities(input: string): string {
  return input.replace(/&(#x?[0-9a-fA-F]+|[a-zA-Z]+);/g, (match, code: string) => {
    const named = NAMED_ENTITIES[code];
    if (named !== undefined) return named;
    if (code[0] === '#') {
      const isHex = code[1] === 'x' || code[1] === 'X';
      const num = parseInt(isHex ? code.slice(2) : code.slice(1), isHex ? 16 : 10);
      if (Number.isFinite(num)) {
        try {
          return String.fromCodePoint(num);
        } catch {
          return match;
        }
      }
    }
    return match;
  });
}

function firstMatch(source: string, pattern: RegExp): string | null {
  const m = source.match(pattern);
  return m ? m[1] : null;
}

/**
 * Parse a YouTube channel Atom feed into typed video records. Pure and
 * dependency-free — the feed format has been stable for years, so a small
 * string parser beats pulling in an XML library. Malformed entries are skipped
 * rather than throwing.
 */
export function parseYouTubeFeed(xml: string, limit = 6): YouTubeVideo[] {
  if (!xml) return [];

  const videos: YouTubeVideo[] = [];
  // Each upload is one <entry>…</entry>. Splitting on the open tag and cutting
  // at the close tag isolates entry scope and skips the channel-level header
  // (whose <title> would otherwise be mistaken for a video title).
  const chunks = xml.split('<entry>').slice(1);

  for (const chunk of chunks) {
    const end = chunk.indexOf('</entry>');
    const entry = end === -1 ? chunk : chunk.slice(0, end);

    const id = firstMatch(entry, /<yt:videoId>([^<]+)<\/yt:videoId>/);
    if (!id) continue;

    const rawTitle = firstMatch(entry, /<title[^>]*>([\s\S]*?)<\/title>/);
    const published = firstMatch(entry, /<published>([^<]+)<\/published>/);
    const viewsRaw = firstMatch(entry, /<media:statistics\s+views="(\d+)"/);

    videos.push({
      id,
      title: rawTitle ? decodeEntities(rawTitle).trim() : 'Untitled',
      url: `https://www.youtube.com/watch?v=${id}`,
      thumbnail: `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
      published: published ?? '',
      views: viewsRaw ? Number(viewsRaw) : null,
    });

    if (videos.length >= limit) break;
  }

  return videos;
}

/**
 * Fetch the latest uploads from The Money Guy Show's public YouTube feed.
 *
 * Cached at the edge via Next's `revalidate` so we hit YouTube at most once an
 * hour. Any failure (network policy, feed downtime, unexpected shape) resolves
 * to an empty array so callers can render a static "watch on YouTube" fallback
 * instead of erroring the page.
 */
export async function getLatestMoneyGuyVideos(limit = 6): Promise<YouTubeVideo[]> {
  try {
    const res = await fetch(MONEY_GUY_FEED_URL, {
      next: { revalidate: 3600 },
      headers: {
        'User-Agent':
          'MoneyGuyMutants/1.0 (+https://moneyguymutants.com; fan project)',
        Accept: 'application/atom+xml, application/xml, text/xml',
      },
    });
    if (!res.ok) {
      console.warn(`youtube: feed responded ${res.status}`);
      return [];
    }
    return parseYouTubeFeed(await res.text(), limit);
  } catch (error) {
    console.warn('youtube: failed to load feed', error);
    return [];
  }
}

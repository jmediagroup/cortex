import Image from 'next/image';
import { MarketingIcon } from '@/components/marketing/Icons';
import { Button } from '@/components/ui/Button';
import {
  getLatestMoneyGuyVideos,
  MONEY_GUY_CHANNEL_URL,
  MONEY_GUY_SUBSCRIBE_URL,
  type YouTubeVideo,
} from '@/lib/youtube';

const dateFmt = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
});

function formatDate(iso: string): string {
  if (!iso) return '';
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? '' : dateFmt.format(d);
}

function formatViews(views: number | null): string | null {
  if (views == null || views <= 0) return null;
  if (views >= 1_000_000) return `${(views / 1_000_000).toFixed(1).replace(/\.0$/, '')}M views`;
  if (views >= 1_000) return `${Math.round(views / 1_000)}K views`;
  return `${views} views`;
}

/**
 * Latest uploads from The Money Guy Show's public YouTube channel. Rendered on
 * the /the-money-guy-show homage page. Async server component: fetches the feed
 * at request time (cached for an hour) and links every card out to YouTube so
 * the creators keep the view. If the feed can't be reached, we degrade to a
 * static "watch on YouTube" call-to-action rather than showing an empty slot.
 */
export async function LatestVideos({ limit = 6 }: { limit?: number }) {
  const videos = await getLatestMoneyGuyVideos(limit);

  if (videos.length === 0) {
    return <FeedFallback />;
  }

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
        gap: 20,
      }}
    >
      {videos.map((video) => (
        <VideoCard key={video.id} video={video} />
      ))}
    </div>
  );
}

function VideoCard({ video }: { video: YouTubeVideo }) {
  const views = formatViews(video.views);
  const date = formatDate(video.published);

  return (
    <a
      href={video.url}
      target="_blank"
      rel="noopener noreferrer"
      className="mgm-card mgm-card--hover"
      style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}
      aria-label={`Watch “${video.title}” on YouTube (opens in a new tab)`}
    >
      {/* 16:9 thumbnail with a play affordance */}
      <div
        style={{
          position: 'relative',
          aspectRatio: '16 / 9',
          background: 'var(--navy-deep)',
          overflow: 'hidden',
        }}
      >
        <Image
          src={video.thumbnail}
          alt=""
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1100px) 50vw, 360px"
          style={{ objectFit: 'cover' }}
        />
        <span
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background:
              'linear-gradient(180deg, rgba(21,48,85,0) 40%, rgba(21,48,85,0.35) 100%)',
          }}
        >
          <span
            style={{
              width: 52,
              height: 52,
              borderRadius: '50%',
              background: 'var(--orange)',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              paddingLeft: 4,
              boxShadow: '0 6px 20px rgba(242,101,49,0.45)',
            }}
          >
            <MarketingIcon name="play" size={22} />
          </span>
        </span>
      </div>

      <div
        style={{
          padding: 18,
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
          flex: 1,
        }}
      >
        <h3
          style={{
            fontSize: 15,
            fontWeight: 700,
            color: 'var(--navy)',
            margin: 0,
            lineHeight: 1.35,
            letterSpacing: '-0.01em',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {video.title}
        </h3>

        <div
          style={{
            marginTop: 'auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 8,
            fontSize: 11,
            color: 'var(--text-muted)',
            fontFamily: 'var(--font-mono)',
          }}
        >
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            {date && <span>{date}</span>}
            {date && views && <span aria-hidden="true">·</span>}
            {views && <span>{views}</span>}
          </span>
          <span
            style={{
              color: 'var(--orange)',
              fontWeight: 700,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 5,
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              fontFamily: 'var(--font-sans)',
            }}
          >
            Watch <MarketingIcon name="arrowUpRight" size={12} />
          </span>
        </div>
      </div>
    </a>
  );
}

/**
 * Shown when the YouTube feed is unavailable (network policy, feed downtime, a
 * cold build). Keeps the section useful by sending people straight to the
 * channel instead of rendering nothing.
 */
function FeedFallback() {
  return (
    <div
      className="mgm-card"
      style={{
        padding: 40,
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 16,
      }}
    >
      <span
        style={{
          width: 56,
          height: 56,
          borderRadius: 'var(--radius-circle)',
          background: 'var(--mint)',
          color: 'var(--navy)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <MarketingIcon name="youtube" size={26} />
      </span>
      <div>
        <h3
          style={{
            fontSize: 18,
            fontWeight: 700,
            color: 'var(--navy)',
            margin: '0 0 6px',
            letterSpacing: '-0.01em',
          }}
        >
          New episodes drop on YouTube.
        </h3>
        <p
          style={{
            fontSize: 14,
            color: 'var(--text-secondary)',
            lineHeight: 1.6,
            margin: 0,
            maxWidth: '46ch',
          }}
        >
          We couldn&rsquo;t load the latest videos right now — head straight to
          The Money Guy Show&rsquo;s channel to watch and subscribe.
        </p>
      </div>
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
        <Button href={MONEY_GUY_SUBSCRIBE_URL} variant="primary" target="_blank" rel="noopener noreferrer">
          Subscribe on YouTube <MarketingIcon name="arrowUpRight" size={14} />
        </Button>
        <Button href={MONEY_GUY_CHANNEL_URL} variant="secondary" tone="navy" target="_blank" rel="noopener noreferrer">
          Visit the channel
        </Button>
      </div>
    </div>
  );
}

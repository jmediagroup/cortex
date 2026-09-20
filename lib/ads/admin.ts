import 'server-only';
import { revalidateTag } from 'next/cache';
import { ADS_CACHE_TAGS } from './public';

export {
  AdsValidationError,
  isUuid,
  slugify,
  pickAdvertiserFields,
  pickPlacementFields,
  pickCampaignFields,
  validateCreative,
  validateCreatives,
  ADVERTISER_FIELDS,
  PLACEMENT_FIELDS,
  CAMPAIGN_FIELDS,
  type CreativeInput,
} from './validation';

// Next 16's revalidateTag takes a cache profile as its second argument.
const EXPIRE_NOW = { expire: 0 };

/**
 * Bust the public ad caches after any admin write. Every cached entry carries
 * the umbrella `ads` tag, so one call covers all placements and tools; the
 * per-tool tags are also expired when the caller knows which tools changed.
 */
export function revalidateAds(toolIds?: Array<string | null | undefined>): void {
  revalidateTag(ADS_CACHE_TAGS.all, EXPIRE_NOW);
  for (const toolId of toolIds ?? []) {
    if (toolId) revalidateTag(ADS_CACHE_TAGS.tool(toolId), EXPIRE_NOW);
  }
}

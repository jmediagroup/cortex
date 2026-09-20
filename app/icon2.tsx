import { ImageResponse } from 'next/og';
import { MUTANT_MARK_DATA_URI, BRAND } from '@/lib/brand-assets';

export const runtime = 'edge';

export const size = {
  width: 512,
  height: 512,
};
export const contentType = 'image/png';

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: BRAND.navy,
          borderRadius: '112px',
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={MUTANT_MARK_DATA_URI} width={384} height={398} alt="" />
      </div>
    ),
    {
      ...size,
    }
  );
}

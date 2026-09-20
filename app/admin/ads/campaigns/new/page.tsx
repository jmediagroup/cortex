import CampaignEditor from '@/components/admin/CampaignEditor';

export default async function NewCampaignPage({
  searchParams,
}: {
  searchParams: Promise<{ advertiser?: string }>;
}) {
  const { advertiser } = await searchParams;
  return <CampaignEditor initialAdvertiserId={advertiser} />;
}

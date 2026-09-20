import AdvertiserEditor from '@/components/admin/AdvertiserEditor';

export default async function EditAdvertiserPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <AdvertiserEditor advertiserId={id} />;
}

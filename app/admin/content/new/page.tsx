import ContentEditor from '@/components/admin/ContentEditor';
import { normalizeContentType } from '@/lib/cms/content-types';

export default async function NewContentPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string }>;
}) {
  const { type } = await searchParams;
  return <ContentEditor initialType={normalizeContentType(type)} />;
}

// manager dan halaman kategori
import { requireRole } from '@/lib/auth';
import { getCategoriesWithCount } from '@/lib/queries';
import { PageHeader } from '@/components/staff/StaffShell';
import CategoryManager from '@/components/managers/CategoryManager';

export const metadata = { title: 'Kategori Buku' };

export default async function CategoriesPage() {
  await requireRole('admin');
  const items = await getCategoriesWithCount();
  return (
    <>
      <PageHeader eyebrow="Admin" title="Manajemen Kategori Buku"/>
      <CategoryManager items={items} />
    </>
  );
}

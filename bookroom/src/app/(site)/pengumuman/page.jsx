// Halaman: api dan daftar pengumuman published
import { getPublishedAnnouncements } from '@/lib/queries';
import AnnouncementCard from '@/components/site/AnnouncementCard';
import PageBanner from '@/components/art/PageBanner';

export const metadata = { title: 'Pengumuman' };

export default async function AnnouncementsPage() {
  const items = await getPublishedAnnouncements(50);
  return (
    <>
      <PageBanner title="Pengumuman" subtitle="Kabar operasional, layanan, dan agenda kegiatan perpustakaan" />
      <div className="mx-auto max-w-7xl px-4 pt-8 sm:px-6 sm:pt-10">
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {items.map((a) => <AnnouncementCard key={a.id} item={a} />)}
        </div>
      </div>
    </>
  );
}

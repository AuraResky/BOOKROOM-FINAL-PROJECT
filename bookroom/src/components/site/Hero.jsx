import Link from 'next/link';
import QuickSearch from './QuickSearch';
import CuratedBoard from './CuratedBoard';

export default function Hero({ books = [], categories = [] }) {
  const preferred = [/komputer|informasi|teknologi/i, /sastra|fiksi|humaniora/i, /manajemen|bisnis/i];
  const selected = [];
  for (const pattern of preferred) {
    const category = categories.find((item) => pattern.test(item.name) && !selected.some((old) => old.id === item.id));
    if (category) selected.push(category);
  }
  for (const category of categories) {
    if (selected.length === 3) break;
    if (!selected.some((old) => old.id === category.id)) selected.push(category);
  }
  return (
    <section className="curated-hero-shell">
      <div className="curated-hero">
        <div className="curated-hero-copy">
          <h1>Satu ruang baca.<span>Untuk setiap rasa ingin tahu</span></h1>
          <p>Jelajahi halaman penuh gagasan, temukan bacaan yang menginspirasi, dan bawa pulang buku pilihanmu dengan mudah</p>
          <QuickSearch />
          <div className="curated-quickfilters"><span>Jelajahi:</span>{selected.map((category) => <Link href={`/katalog?kategori=${encodeURIComponent(category.code)}`} key={category.id}>{category.name}</Link>)}<Link href="/katalog?sort=terbaru">Koleksi Terbaru</Link></div>
        </div>
        <CuratedBoard books={books} />
      </div>
    </section>
  );
}

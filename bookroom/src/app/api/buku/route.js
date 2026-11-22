// pencarian katalog publik. Dipakai pencarian cepat beranda
import { getCatalog, SORT_OPTIONS } from '@/lib/queries';
import { json, apiError, intParam, handle } from '@/lib/api';

export const dynamic = 'force-dynamic';

const SORTS = SORT_OPTIONS.map((o) => o.value);

export const GET = handle(async (request) => {
  const sp = request.nextUrl.searchParams;
  const q = String(sp.get('q') || '').trim();
  if (q.length > 100) return apiError(422, 'Kata kunci maksimal 100 karakter.', { q: 'Kata kunci terlalu panjang.' });

  const category = String(sp.get('kategori') || '').trim();
  if (category && !/^[A-Za-z0-9.\-]{1,20}$/.test(category)) return apiError(422, 'Kode kategori tidak valid.', { kategori: 'Format kode tidak valid.' });

  const availability = ['tersedia', 'dipinjam'].includes(sp.get('ketersediaan')) ? sp.get('ketersediaan') : '';
  const sort = SORTS.includes(sp.get('sort')) ? sp.get('sort') : 'terbaru';
  const page = intParam(sp.get('page'), 1, 1000);
  const perPage = intParam(sp.get('limit'), 12, 50);

  const { rows, total, pages } = await getCatalog({ q, category, availability, sort, page, perPage });
  return json({
    ok: true,
    meta: { q, kategori: category || null, sort, page, limit: perPage, total, pages },
    data: rows.map((b) => ({
      id: b.id,
      title: b.title,
      author: b.author,
      isbn: b.isbn,
      publish_year: b.publish_year,
      category: { name: b.category_name, code: b.category_code },
      stock: b.stock,
      avg_rating: b.avg_rating,
      review_count: b.review_count,
      loan_count: b.loan_count,
      cover_url: b.cover_url,
      url: `/buku/${b.id}`,
    })),
  });
});

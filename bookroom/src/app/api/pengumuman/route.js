// daftar pengumuman berstatus Published 
import { query } from '@/lib/db';
import { json, apiError, intParam, handle } from '@/lib/api';

export const dynamic = 'force-dynamic';

const CATEGORIES = ['Operasional', 'Layanan', 'Acara'];

export const GET = handle(async (request) => {
  const sp = request.nextUrl.searchParams;
  const category = sp.get('kategori');
  if (category && !CATEGORIES.includes(category)) {
    return apiError(422, 'Kategori harus Operasional, Layanan, atau Acara.', { kategori: 'Kategori tidak valid.' });
  }
  const limit = intParam(sp.get('limit'), 10, 50);
  const params = [limit];
  let filter = '';
  if (category) { params.push(category); filter = 'AND a.category = $2'; }

  const rows = await query(
    `SELECT a.id, a.title, a.category, a.release_date, LEFT(a.content, 220) AS excerpt, u.full_name AS author_name
       FROM v_pengumuman a LEFT JOIN v_pengguna u ON u.id = a.author_id
      WHERE a.status = 'Published' AND a.release_date <= CURRENT_DATE ${filter}
      ORDER BY a.release_date DESC, a.id DESC LIMIT $1`,
    params
  );
  return json({ ok: true, data: rows.map((r) => ({ ...r, url: `/pengumuman/${r.id}` })) });
});

// Log mahasiswa yang sedang login.
import { revalidatePath } from 'next/cache';
import { json, apiError, requireApiRole, intParam, handle } from '@/lib/api';
import { generateDueReminders, getNotifications, countUnread, markRead } from '@/lib/notifications';

export const dynamic = 'force-dynamic';

export const GET = handle(async (request) => {
  const { user, response } = await requireApiRole('mahasiswa');
  if (response) return response;
  const sp = request.nextUrl.searchParams;
  await generateDueReminders(user.id);
  const [items, unread] = await Promise.all([
    getNotifications(user.id, { limit: intParam(sp.get('limit'), 20, 100), unreadOnly: sp.get('unread') === '1' }),
    countUnread(user.id),
  ]);
  return json({ ok: true, unread, data: items });
});

export const PATCH = handle(async (request) => {
  const { user, response } = await requireApiRole('mahasiswa');
  if (response) return response;

  let body = {};
  const text = await request.text();
  if (text) {
    try { body = JSON.parse(text); } catch { return apiError(400, 'Body harus berupa JSON yang valid.'); }
  }
  if (body.ids !== undefined) {
    const valid = Array.isArray(body.ids) && body.ids.length <= 100 && body.ids.every((n) => Number.isInteger(n) && n > 0);
    if (!valid) return apiError(422, 'ids harus berupa array ID notifikasi (maks. 100).', { ids: 'Format ids tidak valid.' });
  }

  const changed = await markRead(user.id, body.ids ?? null);
  revalidatePath('/mahasiswa');
  return json({ ok: true, changed, unread: await countUnread(user.id) });
});

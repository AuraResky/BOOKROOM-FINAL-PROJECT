'use client';

import {
  useEffect,
  useMemo,
  useState,
  useTransition,
} from 'react';
import { useRouter } from 'next/navigation';
import {
  createBookAction,
  updateBookAction,
  deleteBookAction,
} from '@/app/actions/books';
import Modal, { ConfirmModal } from '@/components/ui/Modal';
import {
  TextInput,
  TextArea,
  Select,
  Alert,
  Spinner,
} from '@/components/ui/Form';
import { toast } from '@/components/ui/Toast';
import BookCover from '@/components/books/BookCover';
import {
  StockBadge,
  Mono,
  Stars,
} from '@/components/ui/Badges';
import {
  IconPlus,
  IconEdit,
  IconTrash,
  IconSearch,
} from '@/components/ui/Icons';
import { formatRupiah } from '@/lib/format';

// Format dasar ISBN
const ISBN_RE = /^(\d{9}[\dX]|\d{13})$/;

// Form tambah dan ubah buku
function BookForm({ book, categories, onDone }) {
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState('');
  const [pending, startTransition] = useTransition();
  const [isbn, setIsbn] = useState(book?.isbn || '');
  const [cover, setCover] = useState(book?.cover_url || '');
  const [coverFile, setCoverFile] = useState(null);
  const [title, setTitle] = useState(book?.title || '');

  const cleanIsbn = isbn.replace(/[-\s]/g, '').toUpperCase();

  // Membuat pratinjau gambar yang dipilih
  useEffect(() => {
    if (!coverFile) return;

    const url = URL.createObjectURL(coverFile);
    setCover(url);

    return () => URL.revokeObjectURL(url);
  }, [coverFile]);

  // Memeriksa isian sebelum menyimpan
  function onSubmit(e) {
    e.preventDefault();

    const fd = new FormData(e.currentTarget);
    const local = {};

    const req = {
      title: 'Judul',
      author: 'Pengarang',
      publisher: 'Penerbit',
      publish_year: 'Tahun terbit',
      stock: 'Jumlah stok',
      max_loan_days: 'Durasi pinjam',
      fine_per_day: 'Tarif denda',
    };

    Object.entries(req).forEach(([key, label]) => {
      if (!String(fd.get(key) || '').trim()) {
        local[key] = `${label} wajib diisi.`;
      }
    });

    if (!cleanIsbn) {
      local.isbn = 'ISBN wajib diisi.';
    } else if (!ISBN_RE.test(cleanIsbn)) {
      local.isbn = 'ISBN harus 10 atau 13 digit angka.';
    }

    if (!fd.get('category_id')) {
      local.category_id = 'Pilih kategori buku.';
    }

    // Sampul wajib untuk buku baru
    if (!book && !fd.get('cover_file')?.size) {
      local.cover_file = 'Unggah gambar sampul buku.';
    }

    setErrors(local);
    setMessage('');

    if (Object.keys(local).length) return;

    startTransition(async () => {
      const res = book
        ? await updateBookAction(book.id, fd)
        : await createBookAction(fd);

      if (res.ok) {
        toast(res);
        onDone();
      } else {
        setErrors(res.errors || {});
        setMessage(res.message);
      }
    });
  }

  return (
    <form
      noValidate
      onSubmit={onSubmit}
      className="grid gap-6 md:grid-cols-[150px_1fr]"
    >
      <div className="group">
        <p className="label">Pratinjau sampul</p>

        <BookCover
          key={cover + cleanIsbn}
          src={cover || null}
          title={title || 'Judul Buku'}
        />

        <p className="mt-2 text-xs leading-snug text-ink-soft">
          {book
            ? 'Sampul lama dipertahankan jika tidak diganti.'
            : 'Buku baru wajib memiliki gambar sampul.'}
          {' '}Pilih JPEG, PNG, atau WebP maksimal 2 MB.
        </p>
      </div>

      <div className="space-y-4">
        {message && <Alert>{message}</Alert>}

        <TextInput
          label="Judul"
          name="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          error={errors.title}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <TextInput
            label="ISBN (unik)"
            name="isbn"
            value={isbn}
            onChange={(e) => setIsbn(e.target.value)}
            inputClassName="font-mono"
            placeholder="9780132350884"
            error={errors.isbn}
          />

          <Select
            label="Kategori"
            name="category_id"
            defaultValue={book?.category_id || ''}
            placeholder="Pilih kategori"
            options={categories.map((c) => ({
              value: c.id,
              label: `${c.code} — ${c.name}`,
            }))}
            error={errors.category_id}
          />

          <TextInput
            label="Pengarang"
            name="author"
            defaultValue={book?.author}
            error={errors.author}
          />

          <TextInput
            label="Penerbit"
            name="publisher"
            defaultValue={book?.publisher}
            error={errors.publisher}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-4">
          <TextInput
            label="Tahun terbit"
            name="publish_year"
            inputMode="numeric"
            defaultValue={book?.publish_year}
            inputClassName="font-mono"
            error={errors.publish_year}
          />

          <TextInput
            label="Stok total (eksemplar)"
            name="stock"
            inputMode="numeric"
            defaultValue={book?.total_stock ?? 1}
            inputClassName="font-mono"
            error={errors.stock}
          />

          <TextInput
            label="Maks. pinjam (hari)"
            name="max_loan_days"
            inputMode="numeric"
            defaultValue={book?.max_loan_days ?? 14}
            inputClassName="font-mono"
            error={errors.max_loan_days}
          />

          <TextInput
            label="Denda/hari (Rp)"
            name="fine_per_day"
            inputMode="numeric"
            defaultValue={book?.fine_per_day ?? 1000}
            inputClassName="font-mono"
            error={errors.fine_per_day}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-[1fr_160px]">
          <label className="block text-sm font-medium text-ink">
            Unggah sampul buku

            <input
              type="file"
              name="cover_file"
              accept="image/jpeg,image/png,image/webp"
              onChange={(e) => {
                const file = e.target.files?.[0];
                setCoverFile(file || null);

                if (!file) {
                  setCover(book?.cover_url || '');
                }
              }}
              className="input mt-2 block w-full text-sm file:mr-3 file:rounded file:border-0 file:bg-navy file:px-3 file:py-2 file:text-white"
              aria-describedby="cover-file-help"
              aria-invalid={Boolean(errors.cover_file)}
            />

            <span
              id="cover-file-help"
              className="mt-1 block text-xs text-ink-muted"
            >
              {book ? 'Opsional jika tidak diganti' : 'Wajib diunggah'}
              {' '}· JPEG / PNG / WebP · Maksimal 2 MB
            </span>

            {errors.cover_file && (
              <span
                role="alert"
                className="mt-1 block text-sm text-danger"
              >
                {errors.cover_file}
              </span>
            )}
          </label>

          <TextInput
            label="Lokasi rak"
            name="shelf_location"
            defaultValue={book?.shelf_location || ''}
            inputClassName="font-mono"
            placeholder="A1-005.1 MAR"
          />
        </div>

        <TextArea
          label="Sinopsis"
          name="description"
          rows={3}
          defaultValue={book?.description || ''}
        />

        <div className="flex justify-end gap-2 pt-1">
          <button
            type="button"
            onClick={onDone}
            className="btn-ghost"
          >
            Batal
          </button>

          <button
            type="submit"
            disabled={pending}
            className="btn-primary"
          >
            {pending && <Spinner />}
            {' '}{book ? 'Simpan Perubahan' : 'Tambah Buku'}
          </button>
        </div>
      </div>
    </form>
  );
}

// Pengelolaan daftar buku
export default function BookManager({ books, categories }) {
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [deleteError, setDeleteError] = useState('');
  const [q, setQ] = useState('');
  const [cat, setCat] = useState('');
  const [pending, startTransition] = useTransition();

  const router = useRouter();

  // Pencarian dan filter kategori
  const filtered = useMemo(() => {
    const s = q.toLowerCase();

    return books.filter((b) =>
      (!cat || String(b.category_id) === cat) &&
      (
        !s ||
        b.title.toLowerCase().includes(s) ||
        b.author.toLowerCase().includes(s) ||
        b.isbn.includes(s)
      )
    );
  }, [books, q, cat]);

  // Menutup form dan memperbarui daftar buku
  const close = () => {
    setEditing(null);
    router.refresh();
  };

  // Menghapus buku setelah dikonfirmasi
  function confirmDelete() {
    startTransition(async () => {
      const res = await deleteBookAction(deleting.id);

      if (res.ok) {
        toast(res);
        setDeleting(null);
        router.refresh();
      } else {
        setDeleteError(res.message);
      }
    });
  }

  return (
    <>
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex flex-1 items-center gap-2 rounded-lg border border-line bg-cream-50 px-3">
          <IconSearch className="h-4 w-4 text-ink-soft" />

          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Cari judul, pengarang, ISBN"
            className="w-full bg-transparent py-2.5 text-sm focus:outline-none"
          />
        </div>

        <select
          value={cat}
          onChange={(e) => setCat(e.target.value)}
          className="input w-auto"
        >
          <option value="">Semua kategori</option>

          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>

        <button
          type="button"
          onClick={() => setEditing('new')}
          className="btn-primary"
        >
          <IconPlus className="h-4 w-4" />
          Tambah Buku
        </button>
      </div>

      <div className="card mt-4 overflow-x-auto">
        <table className="w-full min-w-[960px] text-sm">
          <thead className="table-head">
            <tr>
              <th className="px-5 py-3">Buku</th>
              <th className="px-3 py-3">Kategori</th>
              <th className="px-3 py-3">Terbit</th>
              <th className="px-3 py-3">Stok</th>
              <th className="px-3 py-3">Aturan Pinjam</th>
              <th className="px-5 py-3 text-right">Aksi</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-line">
            {filtered.map((b) => (
              <tr key={b.id} className="hover:bg-canvas/40">
                <td className="px-5 py-3">
                  <div className="flex items-center gap-3">
                    <div className="group w-11 shrink-0">
                      <BookCover
                        src={b.cover_url}
                        title={b.title}
                      />
                    </div>

                    <div className="min-w-0">
                      <p className="font-semibold leading-snug text-navy">
                        {b.title}
                      </p>
                      <p className="text-xs text-ink-muted">
                        {b.author}
                      </p>
                      <Mono className="text-ink-soft">
                        {b.isbn}
                      </Mono>
                    </div>
                  </div>
                </td>

                <td className="px-3 py-3">
                  <p className="text-sm">{b.category_name}</p>
                  <Mono className="text-ink-soft">
                    {b.category_code}
                  </Mono>
                </td>

                <td className="px-3 py-3">
                  <p className="text-xs text-ink-muted">
                    {b.publisher}
                  </p>
                  <Mono>{b.publish_year}</Mono>
                </td>

                <td className="px-3 py-3">
                  <StockBadge stock={b.stock} />

                  <p className="mt-1 text-xs text-ink-muted">
                    Dari {b.total_stock} eksemplar
                  </p>

                  {b.on_loan > 0 && (
                    <p className="mt-1 text-xs text-ink-soft">
                      {b.on_loan} sedang dipinjam
                    </p>
                  )}
                </td>

                <td className="px-3 py-3 text-xs text-ink-muted">
                  <Mono>{b.max_loan_days} hari</Mono>
                  <br />
                  <Mono>{formatRupiah(b.fine_per_day)}/hari</Mono>

                  <div className="mt-1">
                    <Stars
                      value={b.avg_rating}
                      size="h-3 w-3"
                    />
                  </div>
                </td>

                <td className="px-5 py-3">
                  <div className="flex justify-end gap-1.5">
                    <button
                      type="button"
                      onClick={() => setEditing(b)}
                      className="btn-outline btn-sm"
                      aria-label={`Ubah ${b.title}`}
                    >
                      <IconEdit className="h-3.5 w-3.5" />
                      Ubah
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setDeleteError('');
                        setDeleting(b);
                      }}
                      disabled={b.open_loans > 0}
                      title={
                        b.open_loans > 0
                          ? 'Tidak dapat dihapus: buku sedang dipinjam'
                          : 'Hapus buku'
                      }
                      className="btn-sm btn border border-line bg-cream-50 text-danger hover:border-danger"
                      aria-label={`Hapus ${b.title}`}
                    >
                      <IconTrash className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}

            {!filtered.length && (
              <tr>
                <td
                  colSpan={6}
                  className="px-5 py-12 text-center text-ink-muted"
                >
                  Tidak ada buku yang cocok.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Modal
        open={!!editing}
        onClose={() => setEditing(null)}
        width="max-w-4xl"
        title={
          editing === 'new'
            ? 'Tambah Koleksi Buku'
            : 'Ubah Data Buku'
        }
        description="Seluruh isian divalidasi ulang di server."
      >
        {editing && (
          <BookForm
            book={editing === 'new' ? null : editing}
            categories={categories}
            onDone={close}
          />
        )}
      </Modal>

      <ConfirmModal
        open={!!deleting}
        onClose={() => setDeleting(null)}
        onConfirm={confirmDelete}
        pending={pending}
        error={deleteError}
        title="Hapus buku?"
        message={
          deleting
            ? `“${deleting.title}” akan dihapus permanen dari katalog.`
            : ''
        }
      />
    </>
  );
}
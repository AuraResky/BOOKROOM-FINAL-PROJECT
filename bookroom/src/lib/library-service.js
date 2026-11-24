import crypto from 'node:crypto';
import { transaction } from './db.js';
import { notify } from './notifications.js';

// Error khusus layanan perpustakaan
export class LibraryError extends Error {}

// Menghentikan proses jika syarat tidak terpenuhi
function demand(ok, message) {
  if (!ok) throw new LibraryError(message);
}

// Memvalidasi ID data
export function validId(id) {
  demand(
    /^\d+$/.test(String(id)) &&
      Number.isSafeInteger(Number(id)) &&
      Number(id) > 0,
    'Data yang dipilih tidak valid.'
  );

  return Number(id);
}

// Batas jumlah reservasi aktif
export const MAX_RESERVATIONS = 3;

// Batas pengambilan reservasi: 2 hari
export const HOLD_DAYS = 2;

// Status peminjaman yang masih aktif
const ACTIVE = [
  'Dipinjam',
  'Perpanjangan Diajukan',
  'Perpanjangan Disetujui',
  'Perpanjangan Ditolak',
];

// Format nominal rupiah
const rupiah = (n) =>
  'Rp' + Number(n || 0).toLocaleString('id-ID');

// Format tanggal menjadi DD-MM-YYYY
const tanggal = (d) => {
  const s = d instanceof Date
    ? d.toISOString().slice(0, 10)
    : String(d || '');

  return /^\d{4}-\d{2}-\d{2}$/.test(s)
    ? s.split('-').reverse().join('-')
    : s;
};

// Mengunci dan memeriksa akun mahasiswa
async function lockUser(tx, id) {
  const user = await tx.one(
    'SELECT * FROM pengguna WHERE id=$1 FOR UPDATE',
    [id]
  );

  demand(
    user?.aktif && user.peran === 'mahasiswa',
    'Akun mahasiswa tidak aktif atau tidak ditemukan.'
  );

  return user;
}

// Memastikan tidak ada denda tertunggak
async function noDebt(tx, id) {
  const row = await tx.one(
    `SELECT COUNT(*)::int AS jumlah
     FROM v_peminjaman
     WHERE user_id=$1 AND fine_status='Tertunggak'`,
    [id]
  );

  demand(
    row.jumlah === 0,
    'Masih ada denda tertunggak. Lunasi denda sebelum meminjam buku.'
  );
}

// Memeriksa pemilik transaksi dan mengunci data terkait
async function lockLoan(tx, id, ownerId) {
  const initial = await tx.one(
    'SELECT id_pengguna,id_buku FROM peminjaman WHERE id=$1',
    [validId(id)]
  );

  demand(
    initial && (!ownerId || initial.id_pengguna === ownerId),
    'Transaksi tidak ditemukan.'
  );

  // Urutan kunci: pengguna, buku, lalu peminjaman
  await tx.one(
    'SELECT id FROM pengguna WHERE id=$1 FOR UPDATE',
    [initial.id_pengguna]
  );

  const book = await tx.one(
    'SELECT * FROM buku WHERE id=$1 FOR UPDATE',
    [initial.id_buku]
  );

  const loan = await tx.one(
    'SELECT * FROM peminjaman WHERE id=$1 FOR UPDATE',
    [id]
  );

  return { loan, book };
}

// Menghitung buku yang ditahan untuk pemesan lain
async function heldByOthers(tx, bookId, userId = 0) {
  const row = await tx.one(
    `SELECT COUNT(*)::int AS n
     FROM reservasi_buku
     WHERE id_buku=$1
       AND status='Siap Diambil'
       AND id_pengguna<>$2`,
    [bookId, userId]
  );

  return row.n;
}

// Memperbarui reservasi kedaluwarsa dan memajukan antrean
export async function promoteQueue(tx, bookId) {
  // Melepas reservasi yang melewati batas pengambilan
  const expired = await tx.query(
    `UPDATE reservasi_buku r
     SET status='Kedaluwarsa',diubah_pada=NOW()
     WHERE r.id_buku=$1
       AND r.status='Siap Diambil'
       AND r.batas_ambil<CURRENT_DATE
       AND NOT EXISTS (
         SELECT 1 FROM peminjaman p
         WHERE p.id_pengguna=r.id_pengguna
           AND p.id_buku=r.id_buku
           AND p.status='Menunggu Konfirmasi'
       )
     RETURNING r.id,r.id_pengguna`,
    [bookId]
  );

  const book = await tx.one(
    'SELECT judul,stok_tersedia FROM buku WHERE id=$1',
    [bookId]
  );

  // Memberi tahu pemesan yang reservasinya kedaluwarsa
  for (const r of expired) {
    await notify(tx, r.id_pengguna, {
      jenis: 'Reservasi',
      judul: 'Reservasi kedaluwarsa',
      pesan: `Batas pengambilan reservasi buku "${book.judul}" telah lewat sehingga reservasi dibatalkan otomatis.`,
      tautan: `/buku/${bookId}`,
    });
  }

  const held = await heldByOthers(tx, bookId, 0);
  let free = book.stok_tersedia - held;

  // Menawarkan stok bebas kepada antrean terdepan
  while (free > 0) {
    const next = await tx.one(
      `SELECT r.id,r.id_pengguna
       FROM reservasi_buku r
       JOIN pengguna u ON u.id=r.id_pengguna
       WHERE r.id_buku=$1
         AND r.status='Menunggu'
         AND u.aktif
       ORDER BY r.dibuat_pada,r.id
       LIMIT 1 FOR UPDATE OF r`,
      [bookId]
    );

    if (!next) break;

    const ready = await tx.one(
      `UPDATE reservasi_buku
       SET status='Siap Diambil',
           siap_pada=NOW(),
           batas_ambil=CURRENT_DATE+$2::int,
           diubah_pada=NOW()
       WHERE id=$1
       RETURNING batas_ambil`,
      [next.id, HOLD_DAYS]
    );

    await notify(tx, next.id_pengguna, {
      jenis: 'Reservasi',
      judul: 'Buku reservasi siap dipinjam',
      pesan: `Buku "${book.judul}" kini tersedia untuk Anda. Ajukan pinjam paling lambat ${tanggal(ready.batas_ambil)} sebelum ditawarkan ke antrean berikutnya.`,
      tautan: `/buku/${bookId}`,
      kunci: `siap-${next.id}`,
    });

    free--;
  }

  return expired.length;
}

// Membuat reservasi ketika buku tidak tersedia untuk peminjam
export async function reserveBook(userId, bookId) {
  return transaction(async (tx) => {
    await lockUser(tx, userId);
    await noDebt(tx, userId);

    const book = await tx.one(
      'SELECT * FROM buku WHERE id=$1 FOR UPDATE',
      [validId(bookId)]
    );

    demand(book, 'Buku tidak ditemukan.');

    await promoteQueue(tx, book.id);

    const held = await heldByOthers(tx, book.id, userId);

    demand(
      book.stok_tersedia - held <= 0,
      'Buku masih tersedia. Silakan langsung ajukan pinjam.'
    );

    // Memastikan buku belum sedang diajukan atau dipinjam
    const open = await tx.one(
      `SELECT kode_transaksi FROM peminjaman
       WHERE id_pengguna=$1 AND id_buku=$2
         AND status NOT IN ('Selesai','Ditolak')`,
      [userId, book.id]
    );

    demand(!open, 'Anda sedang meminjam atau mengajukan buku ini.');

    // Memeriksa duplikasi dan batas reservasi
    const mine = await tx.one(
      `SELECT COUNT(*)::int AS total,
              COUNT(*) FILTER(WHERE id_buku=$2)::int AS sama
       FROM reservasi_buku
       WHERE id_pengguna=$1
         AND status IN ('Menunggu','Siap Diambil')`,
      [userId, book.id]
    );

    demand(
      mine.sama === 0,
      'Anda sudah berada di antrean reservasi buku ini.'
    );

    demand(
      mine.total < MAX_RESERVATIONS,
      `Maksimal ${MAX_RESERVATIONS} reservasi aktif.`
    );

    const row = await tx.one(
      `INSERT INTO reservasi_buku(id_pengguna,id_buku)
       VALUES($1,$2) RETURNING id`,
      [userId, book.id]
    );

    const { queue_position: pos } = await tx.one(
      'SELECT queue_position FROM v_reservasi WHERE id=$1',
      [row.id]
    );

    await notify(tx, userId, {
      jenis: 'Reservasi',
      judul: 'Reservasi tercatat',
      pesan: `Anda masuk antrean reservasi buku "${book.judul}" di posisi ${pos}. Kami memberi tahu saat buku siap diambil.`,
      tautan: `/buku/${book.id}`,
    });

    return { id: row.id, queue_position: pos };
  });
}

// Membatalkan reservasi milik mahasiswa
export async function cancelReservation(userId, id) {
  return transaction(async (tx) => {
    const initial = await tx.one(
      'SELECT id_pengguna,id_buku FROM reservasi_buku WHERE id=$1',
      [validId(id)]
    );

    demand(
      initial && initial.id_pengguna === userId,
      'Reservasi tidak ditemukan.'
    );

    await tx.one(
      'SELECT id FROM pengguna WHERE id=$1 FOR UPDATE',
      [userId]
    );

    await tx.one(
      'SELECT id FROM buku WHERE id=$1 FOR UPDATE',
      [initial.id_buku]
    );

    const r = await tx.one(
      'SELECT * FROM reservasi_buku WHERE id=$1 FOR UPDATE',
      [id]
    );

    demand(
      ['Menunggu', 'Siap Diambil'].includes(r.status),
      'Reservasi ini sudah tidak aktif.'
    );

    await tx.query(
      `UPDATE reservasi_buku
       SET status='Dibatalkan',diubah_pada=NOW()
       WHERE id=$1`,
      [id]
    );

    // Menawarkan stok yang dilepas ke antrean berikutnya
    if (r.status === 'Siap Diambil') {
      await promoteQueue(tx, r.id_buku);
    }

    return r;
  });
}

// Mengajukan peminjaman buku
export async function requestLoan(userId, bookId) {
  return transaction(async (tx) => {
    await lockUser(tx, userId);
    await noDebt(tx, userId);

    const book = await tx.one(
      'SELECT * FROM buku WHERE id=$1 FOR UPDATE',
      [validId(bookId)]
    );

    demand(book, 'Buku tidak ditemukan.');

    await promoteQueue(tx, book.id);

    const held = await heldByOthers(tx, book.id, userId);

    // Memeriksa stok dan buku yang ditahan untuk reservasi
    demand(
      book.stok_tersedia > 0,
      'Stok buku sedang habis. Anda dapat masuk antrean reservasi.'
    );

    demand(
      book.stok_tersedia - held > 0,
      'Buku tersisa sedang ditahan untuk mahasiswa yang lebih dulu mereservasi. Anda dapat masuk antrean reservasi.'
    );

    const open = await tx.query(
      `SELECT id_buku FROM peminjaman
       WHERE id_pengguna=$1
         AND status NOT IN ('Selesai','Ditolak')`,
      [userId]
    );

    // Batas tiga pinjaman atau pengajuan aktif
    demand(
      open.length < 3,
      'Maksimal tiga pinjaman atau pengajuan aktif.'
    );

    demand(
      !open.some((x) => x.id_buku === book.id),
      'Buku ini sudah Anda ajukan atau pinjam.'
    );

    return tx.one(
      `INSERT INTO peminjaman(id_pengguna,id_buku)
       VALUES($1,$2) RETURNING *`,
      [userId, book.id]
    );
  });
}

// Menyetujui pinjaman dan mengurangi stok tersedia
export async function approveLoan(staffId, id) {
  return transaction(async (tx) => {
    const { loan, book } = await lockLoan(tx, id);

    demand(
      loan.status === 'Menunggu Konfirmasi',
      'Transaksi ini sudah diproses.'
    );

    await lockUser(tx, loan.id_pengguna);
    await noDebt(tx, loan.id_pengguna);
    await promoteQueue(tx, book.id);

    const held = await heldByOthers(tx, book.id, loan.id_pengguna);

    // Memilih satu buku yang tersedia
    const copy = await tx.one(
      `SELECT id FROM eksemplar_buku
       WHERE id_buku=$1 AND status='Tersedia'
       ORDER BY id LIMIT 1 FOR UPDATE`,
      [book.id]
    );

    demand(
      book.stok_tersedia > 0 && copy,
      'Stok buku habis. Pengajuan belum disetujui.'
    );

    demand(
      book.stok_tersedia - held > 0,
      'buku tersisa sedang ditahan untuk pemesan reservasi. Pengajuan belum disetujui.'
    );

    await tx.query(
      "UPDATE eksemplar_buku SET status='Dipinjam' WHERE id=$1",
      [copy.id]
    );

    await tx.query(
      `UPDATE buku
       SET stok_tersedia=stok_tersedia-1,diubah_pada=NOW()
       WHERE id=$1`,
      [book.id]
    );

    // Menyelesaikan reservasi milik peminjam
    await tx.query(
      `UPDATE reservasi_buku
       SET status='Dipenuhi',diubah_pada=NOW()
       WHERE id_pengguna=$1 AND id_buku=$2
         AND status IN ('Menunggu','Siap Diambil')`,
      [loan.id_pengguna, book.id]
    );

    // Menyimpan tanggal pinjam, jatuh tempo, dan tarif denda
    const approved = await tx.one(
      `UPDATE peminjaman
       SET status='Dipinjam',
           id_eksemplar=$2,
           tanggal_pinjam=CURRENT_DATE,
           tanggal_jatuh_tempo=CURRENT_DATE+$3::int,
           durasi_pinjam_hari=$3,
           tarif_denda_harian=$4,
           diproses_oleh=$5,
           diubah_pada=NOW()
       WHERE id=$1 RETURNING *`,
      [
        loan.id,
        copy.id,
        book.batas_hari_pinjam,
        book.denda_per_hari,
        staffId,
      ]
    );

    await notify(tx, loan.id_pengguna, {
      jenis: 'Peminjaman',
      judul: 'Peminjaman disetujui',
      pesan: `Pengajuan ${approved.kode_transaksi} untuk buku "${book.judul}" disetujui. Jatuh tempo ${tanggal(approved.tanggal_jatuh_tempo)}.`,
      tautan: '/mahasiswa',
    });

    return approved;
  });
}

// Menolak pengajuan pinjaman dengan alasan
export async function rejectLoan(staffId, id, reason) {
  const text = String(reason || '').trim();

  demand(
    text.length >= 10 && text.length <= 1000,
    'Alasan penolakan harus 10–1.000 karakter.'
  );

  return transaction(async (tx) => {
    const { loan, book } = await lockLoan(tx, id);

    demand(
      loan.status === 'Menunggu Konfirmasi',
      'Transaksi ini sudah diproses.'
    );

    const rejected = await tx.one(
      `UPDATE peminjaman
       SET status='Ditolak',
           alasan_penolakan=$2,
           diproses_oleh=$3,
           diubah_pada=NOW()
       WHERE id=$1 RETURNING *`,
      [id, text, staffId]
    );

    await notify(tx, loan.id_pengguna, {
      jenis: 'Peminjaman',
      judul: 'Pengajuan pinjam ditolak',
      pesan: `Pengajuan ${rejected.kode_transaksi} untuk buku "${book.judul}" ditolak. Alasan: ${text}`,
      tautan: '/mahasiswa',
    });

    return rejected;
  });
}

// Mengajukan perpanjangan sebelum melewati jatuh tempo
export async function requestExtension(userId, id) {
  return transaction(async (tx) => {
    const { loan } = await lockLoan(tx, id, userId);

    demand(
      loan.status === 'Dipinjam',
      'Perpanjangan hanya untuk buku berstatus Dipinjam.'
    );

    demand(
      loan.jumlah_perpanjangan < 1,
      'Perpanjangan maksimal satu kali per transaksi.'
    );

    const row = await tx.one(
      'SELECT CURRENT_DATE>$1::date AS terlambat',
      [loan.tanggal_jatuh_tempo]
    );

    demand(
      !row.terlambat,
      'Buku sudah melewati jatuh tempo. Silakan kembalikan buku.'
    );

    await tx.query(
      `INSERT INTO perpanjangan_peminjaman(
         id_peminjaman,tanggal_lama,tambahan_hari
       )
       VALUES($1,$2,$3)`,
      [id, loan.tanggal_jatuh_tempo, loan.durasi_pinjam_hari]
    );

    return tx.one(
      `UPDATE peminjaman
       SET status='Perpanjangan Diajukan',diubah_pada=NOW()
       WHERE id=$1 RETURNING *`,
      [id]
    );
  });
}

// Menyetujui atau menolak perpanjangan pinjaman
export async function decideExtension(
  staffId,
  id,
  approved,
  reason = ''
) {
  const text = String(reason || '').trim();

  if (!approved) {
    demand(
      text.length >= 10 && text.length <= 1000,
      'Alasan penolakan harus 10–1.000 karakter.'
    );
  }

  return transaction(async (tx) => {
    const { loan, book } = await lockLoan(tx, id);

    demand(
      loan.status === 'Perpanjangan Diajukan',
      'Permohonan perpanjangan sudah diproses.'
    );

    const extension = await tx.one(
      `SELECT * FROM perpanjangan_peminjaman
       WHERE id_peminjaman=$1 AND status='Diajukan'
       FOR UPDATE`,
      [id]
    );

    demand(extension, 'Permohonan perpanjangan tidak ditemukan.');

    // Mengubah jatuh tempo hanya jika disetujui
    const updated = await tx.one(
      `UPDATE peminjaman
       SET status=$2,
           tanggal_jatuh_tempo=tanggal_jatuh_tempo+$3::int,
           jumlah_perpanjangan=jumlah_perpanjangan+$4,
           alasan_penolakan=$5,
           diproses_oleh=$6,
           diubah_pada=NOW()
       WHERE id=$1 RETURNING *`,
      [
        id,
        approved
          ? 'Perpanjangan Disetujui'
          : 'Perpanjangan Ditolak',
        approved ? extension.tambahan_hari : 0,
        approved ? 1 : 0,
        approved ? null : text,
        staffId,
      ]
    );

    await tx.query(
      `UPDATE perpanjangan_peminjaman
       SET status=$2,
           tanggal_baru=$3,
           alasan_penolakan=$4,
           diproses_pada=NOW(),
           diproses_oleh=$5
       WHERE id=$1`,
      [
        extension.id,
        approved ? 'Disetujui' : 'Ditolak',
        approved ? updated.tanggal_jatuh_tempo : null,
        approved ? null : text,
        staffId,
      ]
    );

    await notify(
      tx,
      loan.id_pengguna,
      approved
        ? {
            jenis: 'Perpanjangan',
            judul: 'Perpanjangan disetujui',
            pesan: `Masa pinjam "${book.judul}" (${updated.kode_transaksi}) diperpanjang. Jatuh tempo baru ${tanggal(updated.tanggal_jatuh_tempo)}.`,
            tautan: '/mahasiswa',
          }
        : {
            jenis: 'Perpanjangan',
            judul: 'Perpanjangan ditolak',
            pesan: `Perpanjangan "${book.judul}" (${updated.kode_transaksi}) ditolak. Alasan: ${text}. Kembalikan buku sebelum ${tanggal(updated.tanggal_jatuh_tempo)}.`,
            tautan: '/mahasiswa',
          }
    );

    return updated;
  });
}

// Mencatat pengembalian, memperbarui stok, dan menghitung denda
export async function returnLoan(staffId, id) {
  return transaction(async (tx) => {
    const { loan, book } = await lockLoan(tx, id);

    demand(
      ACTIVE.includes(loan.status),
      'Buku ini sudah dikembalikan atau belum dipinjam.'
    );

    const returned = await tx.one(
      `UPDATE peminjaman
       SET status='Selesai',
           tanggal_kembali=CURRENT_DATE,
           diproses_oleh=$2,
           diubah_pada=NOW()
       WHERE id=$1
       RETURNING *,
         GREATEST(CURRENT_DATE-tanggal_jatuh_tempo,0)::int
         AS hari_terlambat`,
      [id, staffId]
    );

    // Mengembalikan buku dan stok tersedia
    await tx.query(
      "UPDATE eksemplar_buku SET status='Tersedia' WHERE id=$1",
      [loan.id_eksemplar]
    );

    await tx.query(
      `UPDATE buku
       SET stok_tersedia=stok_tersedia+1,diubah_pada=NOW()
       WHERE id=$1`,
      [loan.id_buku]
    );

    // Mencatat denda berdasarkan hari keterlambatan
    let fine = null;

    if (
      returned.hari_terlambat > 0 &&
      loan.tarif_denda_harian > 0
    ) {
      fine = await tx.one(
        `INSERT INTO denda(
           id_peminjaman,hari_terlambat,tarif_per_hari,jumlah_denda
         )
         VALUES($1,$2,$3,$2::int*$3::int)
         RETURNING jumlah_denda`,
        [id, returned.hari_terlambat, loan.tarif_denda_harian]
      );
    }

    // Menutup pengajuan perpanjangan yang masih menunggu
    await tx.query(
      `UPDATE perpanjangan_peminjaman
       SET status='Ditolak',
           alasan_penolakan='Buku telah dikembalikan.',
           diproses_oleh=$2,
           diproses_pada=NOW()
       WHERE id_peminjaman=$1 AND status='Diajukan'`,
      [id, staffId]
    );

    await notify(tx, loan.id_pengguna, {
      jenis: 'Pengembalian',
      judul: 'Pengembalian tercatat',
      pesan: `Buku "${book.judul}" (${returned.kode_transaksi}) telah dikembalikan. Anda kini dapat memberi rating dan ulasan.`,
      tautan: '/mahasiswa',
    });

    if (fine) {
      await notify(tx, loan.id_pengguna, {
        jenis: 'Denda',
        judul: 'Denda baru tercatat',
        pesan: `Keterlambatan ${returned.hari_terlambat} hari untuk "${book.judul}" menghasilkan denda ${rupiah(fine.jumlah_denda)} (Tertunggak). Pengajuan pinjam baru diblokir sampai denda lunas.`,
        tautan: '/mahasiswa',
      });
    }

    // Menawarkan stok kembali kepada antrean reservasi
    await promoteQueue(tx, loan.id_buku);

    return {
      ...returned,
      jumlah_denda: fine?.jumlah_denda || 0,
    };
  });
}

// Mencatat pelunasan denda setelah pengembalian
export async function payFine(staffId, id) {
  return transaction(async (tx) => {
    const { loan, book } = await lockLoan(tx, id);

    demand(
      loan.status === 'Selesai',
      'Denda dilunasi setelah pengembalian agar nominalnya final.'
    );

    const fine = await tx.one(
      `UPDATE denda
       SET status_pembayaran='Lunas',
           dibayar_pada=NOW(),
           diterima_oleh=$2
       WHERE id_peminjaman=$1
         AND status_pembayaran='Tertunggak'
       RETURNING *`,
      [id, staffId]
    );

    demand(fine, 'Denda tidak ditemukan atau sudah lunas.');

    await notify(tx, loan.id_pengguna, {
      jenis: 'Denda',
      judul: 'Denda lunas',
      pesan: `Pembayaran denda ${rupiah(fine.jumlah_denda)} untuk "${book.judul}" (${loan.kode_transaksi}) telah diterima.`,
      tautan: '/mahasiswa',
    });

    return fine;
  });
}

// Menyimpan rating dan ulasan untuk pinjaman yang selesai
export async function saveReview(userId, loanId, rating, comment) {
  demand(
    Number.isInteger(rating) && rating >= 1 && rating <= 5,
    'Pilih rating 1 sampai 5 bintang.'
  );

  const text = String(comment || '').trim();

  demand(
    text.length >= 10 && text.length <= 1000,
    'Komentar harus 10–1.000 karakter.'
  );

  return transaction(async (tx) => {
    const { loan } = await lockLoan(tx, loanId, userId);

    demand(
      loan.status === 'Selesai',
      'Ulasan hanya untuk buku yang sudah selesai Anda pinjam.'
    );

    return tx.one(
      `INSERT INTO penilaian_buku(
         id_peminjaman,id_pengguna,id_buku,nilai_bintang,komentar
       )
       VALUES($1,$2,$3,$4,$5)
       ON CONFLICT(id_pengguna,id_buku)
       DO UPDATE SET
         id_peminjaman=EXCLUDED.id_peminjaman,
         nilai_bintang=EXCLUDED.nilai_bintang,
         komentar=EXCLUDED.komentar,
         diubah_pada=NOW()
       RETURNING *`,
      [loan.id, userId, loan.id_buku, rating, text]
    );
  });
}

// Menyesuaikan jumlah buku dengan stok total buku
export async function synchronizeCopies(tx, bookId, total) {
  const copies = await tx.query(
    `SELECT * FROM eksemplar_buku
     WHERE id_buku=$1 AND status<>'Ditarik'
     ORDER BY id FOR UPDATE`,
    [bookId]
  );

  const borrowed = copies.filter(
    (x) => x.status === 'Dipinjam'
  ).length;

  demand(
    total >= borrowed,
    `Minimal ${borrowed} eksemplar karena sedang dipinjam.`
  );

  // Menambahkan buku baru
  if (total > copies.length) {
    for (let i = copies.length; i < total; i++) {
      await tx.query(
        `INSERT INTO eksemplar_buku(id_buku,kode_eksemplar)
         VALUES($1,$2)`,
        [
          bookId,
          `BK-${bookId}-${crypto.randomUUID().slice(0, 8)}`,
        ]
      );
    }
  } else if (total < copies.length) {
    // Menarik buku tersedia ketika stok dikurangi
    const remove = copies
      .filter((x) => x.status === 'Tersedia')
      .slice(0, copies.length - total)
      .map((x) => x.id);

    await tx.query(
      `UPDATE eksemplar_buku
       SET status='Ditarik'
       WHERE id=ANY($1::int[])`,
      [remove]
    );
  }

  // Memperbarui stok total dan stok tersedia
  await tx.query(
    `UPDATE buku
     SET stok_total=$2,
         stok_tersedia=$2::int-$3::int,
         diubah_pada=NOW()
     WHERE id=$1`,
    [bookId, total, borrowed]
  );

  // Menawarkan stok baru kepada antrean reservasi
  await promoteQueue(tx, bookId);
}
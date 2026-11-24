BEGIN;
SET LOCAL TIMEZONE = 'Asia/Makassar';

INSERT INTO pengguna (
    id, nama_lengkap, email, kata_sandi_hash, peran, nomor_identitas,
    nomor_telepon, program_studi, aktif, dibuat_pada
)
VALUES
    (1, 'Dr. Ratna Kusumawa, S.IP., M.Hum.', 'ratna.kusuma@unhas.ac.id', 'scrypt$9a1c74e5b8d2603f17ac6492e0bd53c1$c28fe153541a83c95dae6d759116db79697177aa7621474c8a43d74906ef4a7af0a8be52e0bf3c217b4a1757f9043dc66c3445d08846f97939723b4d58587db7', 'admin', '198203152008012004', '081241550912', NULL, TRUE, (CURRENT_DATE + INTERVAL '-400 days' + TIME '14:33:58')),
    (2, 'Budi dirgantara, A.Md.', 'budi.dirga@unhas.ac.id', 'scrypt$9a1c74e5b8d2603f17ac6492e0bd53c1$c28fe153541a83c95dae6d759116db79697177aa7621474c8a43d74906ef4a7af0a8be52e0bf3c217b4a1757f9043dc66c3445d08846f97939723b4d58587db7', 'pegawai', '199006122015041001', '085256781203', NULL, TRUE, (CURRENT_DATE + INTERVAL '-390 days' + TIME '14:33:58')),
    (3, 'Sri ayu, S.IIP.', 'sri.ayu@unhas.ac.id', 'scrypt$9a1c74e5b8d2603f17ac6492e0bd53c1$c28fe153541a83c95dae6d759116db79697177aa7621474c8a43d74906ef4a7af0a8be52e0bf3c217b4a1757f9043dc66c3445d08846f97939723b4d58587db7', 'pegawai', '199211082019032010', '081355420876', NULL, TRUE, (CURRENT_DATE + INTERVAL '-300 days' + TIME '14:33:58')),
    (4, 'Andi Talistah', 'talista@unhas.ac.id', 'scrypt$9a1c74e5b8d2603f17ac6492e0bd53c1$c28fe153541a83c95dae6d759116db79697177aa7621474c8a43d74906ef4a7af0a8be52e0bf3c217b4a1757f9043dc66c3445d08846f97939723b4d58587db7', 'mahasiswa', 'I201010045', '082291104587', 'S1 Teknik Informatika', TRUE, (CURRENT_DATE + INTERVAL '-260 days' + TIME '14:33:58')),
    (5, 'Aura Resky Ramadhani', 'aura@unhas.ac.id', 'scrypt$9a1c74e5b8d2603f17ac6492e0bd53c1$c28fe153541a83c95dae6d759116db79697177aa7621474c8a43d74906ef4a7af0a8be52e0bf3c217b4a1757f9043dc66c3445d08846f97939723b4d58587db7', 'mahasiswa', 'P201020078', '085342218890', 'S1 Psikologi', TRUE, (CURRENT_DATE + INTERVAL '-250 days' + TIME '14:33:58')),
    (6, 'Mawaddah Fajri', 'mawaddah@unhas.ac.id', 'scrypt$9a1c74e5b8d2603f17ac6492e0bd53c1$c28fe153541a83c95dae6d759116db79697177aa7621474c8a43d74906ef4a7af0a8be52e0bf3c217b4a1757f9043dc66c3445d08846f97939723b4d58587db7', 'mahasiswa', 'H101030112', '081198764420', 'S1 Sistem Informasi', TRUE, (CURRENT_DATE + INTERVAL '-380 days' + TIME '14:33:58')),
    (7, 'Anita Aminarti', 'nita@unhas.ac.id', 'scrypt$9a1c74e5b8d2603f17ac6492e0bd53c1$c28fe153541a83c95dae6d759116db79697177aa7621474c8a43d74906ef4a7af0a8be52e0bf3c217b4a1757f9043dc66c3445d08846f97939723b4d58587db7', 'mahasiswa', 'D301010021', '087754230019', 'S1 Desain Komunikasi Visual', TRUE, (CURRENT_DATE + INTERVAL '-200 days' + TIME '14:33:58')),
    (8, 'Aliyah Fitraturramadhani', 'aliyah@unhas.ac.id', 'scrypt$9a1c74e5b8d2603f17ac6492e0bd53c1$c28fe153541a83c95dae6d759116db79697177aa7621474c8a43d74906ef4a7af0a8be52e0bf3c217b4a1757f9043dc66c3445d08846f97939723b4d58587db7', 'mahasiswa', 'A201040056', '081343987215', 'S1 Teknik Informatika', TRUE, (CURRENT_DATE + INTERVAL '-240 days' + TIME '14:33:58')),
    (9, 'Salwa Ainiyyah', 'salwa@unhas.ac.id', 'scrypt$9a1c74e5b8d2603f17ac6492e0bd53c1$c28fe153541a83c95dae6d759116db79697177aa7621474c8a43d74906ef4a7af0a8be52e0bf3c217b4a1757f9043dc66c3445d08846f97939723b4d58587db7', 'mahasiswa', 'B301020033', '082187650034', 'S1 Manajemen', TRUE, (CURRENT_DATE + INTERVAL '-190 days' + TIME '14:33:58')),
    (10, 'Nafisah Nailal', 'visya@unhas.ac.id', 'scrypt$9a1c74e5b8d2603f17ac6492e0bd53c1$c28fe153541a83c95dae6d759116db79697177aa7621474c8a43d74906ef4a7af0a8be52e0bf3c217b4a1757f9043dc66c3445d08846f97939723b4d58587db7', 'mahasiswa', 'H901010099', '081245671188', 'S1 Sistem Informasi', FALSE, (CURRENT_DATE + INTERVAL '-900 days' + TIME '14:33:58'));

INSERT INTO kategori_buku (
    id, nama_kategori, kode_klasifikasi, deskripsi
)
VALUES
    (1, 'Program Komputer', '005', 'Program komputer, pemrograman, dan rekayasa perangkat lunak.'),
    (2, 'Metode Komputer Khusus', '006', 'Metode komputer khusus, termasuk aplikasi web dan antarmuka.'),
    (3, 'Psikologi', '150', 'Psikologi dan kajian perilaku manusia.'),
    (4, 'Proses Mental dan Inteligensi', '153', 'Proses mental, kognisi, inteligensi, dan pengambilan keputusan.'),
    (5, 'Psikologi Terapan', '158', 'Psikologi terapan, kebiasaan, produktivitas, dan pengembangan diri.'),
    (6, 'Ekonomi Keuangan', '332', 'Ekonomi keuangan dan keuangan pribadi.'),
    (7, 'Astronomi', '520', 'Astronomi dan kajian umum alam semesta.'),
    (8, 'Benda Langit dan Fenomena', '523', 'Benda langit khusus, kosmologi, dan fenomena astronomi.'),
    (9, 'Manajemen Umum', '658', 'Manajemen, kewirausahaan, produk, dan usaha rintisan.'),
    (10, 'Seni Dekoratif', '745', 'Seni dekoratif, desain produk, dan desain benda sehari-hari.'),
    (11, 'Sejarah Dunia', '909', 'Sejarah dunia dan peradaban manusia.'),
    (12, 'Biografi Umum', '920', 'Biografi umum, autobiografi, dan memoar.');

INSERT INTO gambar (
    id, nama_file, nama_asli, jenis_file, ukuran_byte, lokasi_file, diunggah_oleh
)
VALUES
    (1, '594e17cf-3b55-4967-a759-d6953649e13c.webp', 'code complete (2nd ed.).webp', 'image/webp', 91766, '/uploads/sampul-buku/594e17cf-3b55-4967-a759-d6953649e13c.webp', 2),
    (2, '737cbc7b-f7a0-4141-a500-c23121d6d7c3.webp', 'design patterns.webp', 'image/webp', 68938, '/uploads/sampul-buku/737cbc7b-f7a0-4141-a500-c23121d6d7c3.webp', 2),
    (3, '7fbcbc7a-8947-43f4-8c67-c274cd9ab414.webp', 'introduction to algorithms (3rd ed.).webp', 'image/webp', 33624, '/uploads/sampul-buku/7fbcbc7a-8947-43f4-8c67-c274cd9ab414.webp', 2),
    (4, '409ceb2f-342b-446c-8e47-99b19ae7b83d.webp', 'refactoring (2nd ed.).webp', 'image/webp', 79440, '/uploads/sampul-buku/409ceb2f-342b-446c-8e47-99b19ae7b83d.webp', 2),
    (5, '1657b444-e7ec-415c-b1ca-8e9359f3ae56.webp', 'the pragmatic programmer (20th anniv.).webp', 'image/webp', 312700, '/uploads/sampul-buku/1657b444-e7ec-415c-b1ca-8e9359f3ae56.webp', 2),
    (6, 'c3c0e5bf-3831-4ce7-a7f1-d5941ece5026.webp', 'clean code.webp', 'image/webp', 58738, '/uploads/sampul-buku/c3c0e5bf-3831-4ce7-a7f1-d5941ece5026.webp', 2),
    (7, '8920b490-5919-471c-9e4f-696ce37218fc.webp', 'man''s search for meaning.webp', 'image/webp', 229674, '/uploads/sampul-buku/8920b490-5919-471c-9e4f-696ce37218fc.webp', 2),
    (8, '26e06934-cb02-4fe0-911d-1f03a6fd5935.webp', 'grit.webp', 'image/webp', 49680, '/uploads/sampul-buku/26e06934-cb02-4fe0-911d-1f03a6fd5935.webp', 2),
    (9, '242ad30e-8cdf-4d3f-a416-ffdecc5c2cd6.webp', 'thinking, fast and slow.webp', 'image/webp', 61994, '/uploads/sampul-buku/242ad30e-8cdf-4d3f-a416-ffdecc5c2cd6.webp', 2),
    (10, '3c9d984c-bd19-4fc3-b916-42d2774540fc.webp', 'deep work.webp', 'image/webp', 107746, '/uploads/sampul-buku/3c9d984c-bd19-4fc3-b916-42d2774540fc.webp', 2),
    (11, '6d3f8fa5-229f-451c-a5fc-2ef43c0be2f4.webp', 'atomic habits.webp', 'image/webp', 151846, '/uploads/sampul-buku/6d3f8fa5-229f-451c-a5fc-2ef43c0be2f4.webp', 2),
    (12, '1b10fc13-a9d8-47fb-b1a1-56861bc9eefd.webp', 'hooked: how to build habit-forming products.webp', 'image/webp', 74432, '/uploads/sampul-buku/1b10fc13-a9d8-47fb-b1a1-56861bc9eefd.webp', 2),
    (13, 'e4e6b327-02dc-48f9-85d6-4f45e0ac5c1b.webp', 'don''t make me think, revisited.webp', 'image/webp', 55176, '/uploads/sampul-buku/e4e6b327-02dc-48f9-85d6-4f45e0ac5c1b.webp', 2),
    (14, 'b7002633-4a6b-4350-99d6-36db3ff156ab.webp', 'the design of everyday things.webp', 'image/webp', 55460, '/uploads/sampul-buku/b7002633-4a6b-4350-99d6-36db3ff156ab.webp', 2),
    (15, '3a6bf3e5-7632-4dce-adb6-f626785ecff1.webp', 'zero to one.webp', 'image/webp', 41960, '/uploads/sampul-buku/3a6bf3e5-7632-4dce-adb6-f626785ecff1.webp', 2),
    (16, 'cb15f191-3335-44f9-9568-900bcd30d72e.webp', 'the lean startup.webp', 'image/webp', 115498, '/uploads/sampul-buku/cb15f191-3335-44f9-9568-900bcd30d72e.webp', 2),
    (17, 'c25eae43-3c0e-4df8-93df-9695f66a766a.webp', 'the psychology of money.webp', 'image/webp', 91930, '/uploads/sampul-buku/c25eae43-3c0e-4df8-93df-9695f66a766a.webp', 2),
    (18, '9c93dce0-6c47-48db-ad66-30aa0f026d3b.webp', 'a brief history of time.webp', 'image/webp', 108198, '/uploads/sampul-buku/9c93dce0-6c47-48db-ad66-30aa0f026d3b.webp', 2),
    (19, '7dd4109d-41c4-4642-b9e3-002defdd9281.webp', 'cosmos.webp', 'image/webp', 85078, '/uploads/sampul-buku/7dd4109d-41c4-4642-b9e3-002defdd9281.webp', 2),
    (20, '6fa6bf6a-9baf-484d-a1ab-acc8e7e318aa.webp', 'educated.webp', 'image/webp', 94116, '/uploads/sampul-buku/6fa6bf6a-9baf-484d-a1ab-acc8e7e318aa.webp', 2),
    (21, '2e3ec6b7-ec4b-4f86-be38-7dd229cf19e9.webp', 'sapiens.webp', 'image/webp', 58998, '/uploads/sampul-buku/2e3ec6b7-ec4b-4f86-be38-7dd229cf19e9.webp', 2);

INSERT INTO buku (
    id, judul, isbn, penulis, penerbit, tahun_terbit, id_kategori,
    stok_total, stok_tersedia, batas_hari_pinjam, denda_per_hari,
    id_gambar_sampul, sinopsis
)
VALUES
    (1, 'Code Complete (2nd ed.)', '9780735619678', 'Steve McConnell', 'Microsoft Press', 2004, 1, 2, 2, 14, 2000, 1, 'Panduan praktis konstruksi perangkat lunak: perancangan, penulisan rutin, pengujian, dan debugging.'),
    (2, 'Design Patterns', '9780201633610', 'Erich Gamma et al.', 'Addison-Wesley', 1994, 1, 2, 2, 14, 2000, 2, 'Dua puluh tiga pola desain berorientasi objek klasik dari "Gang of Four" beserta konteks penerapannya.'),
    (3, 'Introduction to Algorithms (3rd ed.)', '9780262033848', 'Thomas H. Cormen et al.', 'MIT Press', 2009, 1, 3, 2, 14, 2000, 3, 'Buku referensi utama mata kuliah Algoritma dan Struktur Data: analisis kompleksitas, graf, pemrograman dinamis, dan lainnya.'),
    (4, 'Refactoring (2nd ed.)', '9780134757599', 'Martin Fowler', 'Addison-Wesley', 2018, 1, 2, 1, 14, 2000, 4, 'Katalog teknik refaktor dengan contoh JavaScript untuk memperbaiki desain kode tanpa mengubah perilakunya.'),
    (5, 'The Pragmatic Programmer (20th Anniv.)', '9780135957059', 'David Thomas & Andrew Hunt', 'Addison-Wesley', 2019, 1, 2, 2, 14, 2000, 5, 'Kumpulan praktik dan cara berpikir pengembang perangkat lunak profesional, dari prinsip DRY hingga estimasi dan otomasi.'),
    (6, 'Clean Code', '9780132350884', 'Robert C. Martin', 'Prentice Hall', 2008, 1, 3, 3, 14, 2000, 6, 'Panduan menulis kode yang mudah dibaca, diuji, dan dirawat: penamaan, fungsi, komentar, penanganan galat, hingga refaktor bertahap.'),
    (7, 'Man''s Search for Meaning', '9780807014271', 'Viktor E. Frankl', 'Beacon Press', 2006, 3, 2, 2, 14, 1000, 7, 'Memoar dan dasar logoterapi dari pengalaman penulis di kamp konsentrasi tentang makna hidup.'),
    (8, 'Grit', '9781501111112', 'Angela Duckworth', 'Scribner', 2016, 5, 2, 1, 14, 1000, 8, 'Riset tentang ketekunan dan gairah jangka panjang sebagai penentu keberhasilan, melampaui bakat semata.'),
    (9, 'Thinking, Fast and Slow', '9780374533557', 'Daniel Kahneman', 'Farrar, Straus and Giroux', 2011, 4, 3, 3, 14, 1500, 9, 'Penjelasan dua sistem berpikir manusia dan bias kognitif yang memengaruhi penilaian serta keputusan.'),
    (10, 'Deep Work', '9781455586691', 'Cal Newport', 'Grand Central Publishing', 2016, 5, 3, 3, 7, 1000, 10, 'Strategi melatih fokus mendalam untuk menghasilkan karya bernilai tinggi di tengah distraksi digital.'),
    (11, 'Atomic Habits', '9786021637517', 'James Clear', 'Avery', 2018, 5, 5, 4, 7, 1000, 11, 'Kerangka praktis membangun kebiasaan baik dan menghentikan kebiasaan buruk melalui perubahan kecil yang konsisten.'),
    (12, 'Hooked: How to Build Habit-Forming Products', '9781591847786', 'Nir Eyal', 'Portfolio', 2014, 9, 2, 1, 7, 1500, 12, 'Model Hook (pemicu, aksi, imbalan, investasi) untuk memahami produk digital yang membentuk kebiasaan.'),
    (13, 'Don''t Make Me Think, Revisited', '9780321965516', 'Steve Krug', 'New Riders', 2014, 2, 2, 1, 7, 1500, 13, 'Pendekatan akal sehat terhadap kegunaan web dan seluler, lengkap dengan panduan uji kegunaan sederhana.'),
    (14, 'The Design of Everyday Things', '9780465050659', 'Don Norman', 'Basic Books', 2013, 10, 3, 3, 14, 1500, 14, 'Dasar desain berpusat pada manusia: affordance, signifier, umpan balik, dan mengapa banyak benda sehari-hari membingungkan.'),
    (15, 'Zero to One', '9780804139298', 'Peter Thiel & Blake Masters', 'Crown Business', 2014, 9, 2, 1, 7, 1000, 15, 'Pemikiran tentang inovasi, monopoli kreatif, dan membangun perusahaan yang menciptakan hal baru.'),
    (16, 'The Lean Startup', '9780307887894', 'Eric Ries', 'Crown Business', 2011, 9, 2, 2, 14, 1000, 16, 'Metode build–measure–learn untuk membangun usaha rintisan secara efisien melalui eksperimen tervalidasi.'),
    (17, 'The Psychology of Money', '9780857197689', 'Morgan Housel', 'Harriman House', 2020, 6, 2, 2, 7, 1000, 17, 'Sembilan belas cerita singkat tentang perilaku manusia terhadap uang, kekayaan, dan keputusan finansial.'),
    (18, 'A Brief History of Time', '9780553380163', 'Stephen Hawking', 'Bantam', 1998, 8, 2, 2, 14, 1000, 18, 'Pengantar kosmologi modern: Big Bang, lubang hitam, dan sifat waktu untuk pembaca umum.'),
    (19, 'Cosmos', '9780345539434', 'Carl Sagan', 'Ballantine Books', 2013, 7, 1, 0, 14, 1000, 19, 'Perjalanan populer menyusuri sejarah sains, astronomi, dan tempat manusia di alam semesta.'),
    (20, 'Educated', '9780399590504', 'Tara Westover', 'Random House', 2018, 12, 1, 1, 14, 1000, 20, 'Memoar perjalanan seorang perempuan dari keluarga terisolasi di Idaho hingga meraih gelar doktor di Cambridge.'),
    (21, 'Sapiens', '9780062316097', 'Yuval Noah Harari', 'Harper', 2015, 11, 2, 2, 14, 1000, 21, 'Sejarah umat manusia dari revolusi kognitif, pertanian, hingga revolusi sains.');

INSERT INTO eksemplar_buku (
    id, id_buku, kode_eksemplar, status
)
VALUES
    (1, 1, 'BK-1-0001', 'Tersedia'),
    (2, 1, 'BK-1-0002', 'Tersedia'),
    (3, 2, 'BK-2-0001', 'Tersedia'),
    (4, 2, 'BK-2-0002', 'Tersedia'),
    (5, 3, 'BK-3-0001', 'Dipinjam'),
    (6, 3, 'BK-3-0002', 'Tersedia'),
    (7, 3, 'BK-3-0003', 'Tersedia'),
    (8, 4, 'BK-4-0001', 'Dipinjam'),
    (9, 4, 'BK-4-0002', 'Tersedia'),
    (10, 5, 'BK-5-0001', 'Tersedia'),
    (11, 5, 'BK-5-0002', 'Tersedia'),
    (12, 6, 'BK-6-0001', 'Tersedia'),
    (13, 6, 'BK-6-0002', 'Tersedia'),
    (14, 6, 'BK-6-0003', 'Tersedia'),
    (15, 7, 'BK-7-0001', 'Tersedia'),
    (16, 7, 'BK-7-0002', 'Tersedia'),
    (17, 8, 'BK-8-0001', 'Dipinjam'),
    (18, 8, 'BK-8-0002', 'Tersedia'),
    (19, 9, 'BK-9-0001', 'Tersedia'),
    (20, 9, 'BK-9-0002', 'Tersedia'),
    (21, 9, 'BK-9-0003', 'Tersedia'),
    (22, 10, 'BK-10-0001', 'Tersedia'),
    (23, 10, 'BK-10-0002', 'Tersedia'),
    (24, 10, 'BK-10-0003', 'Tersedia'),
    (25, 11, 'BK-11-0001', 'Dipinjam'),
    (26, 11, 'BK-11-0002', 'Tersedia'),
    (27, 11, 'BK-11-0003', 'Tersedia'),
    (28, 11, 'BK-11-0004', 'Tersedia'),
    (29, 11, 'BK-11-0005', 'Tersedia'),
    (30, 12, 'BK-12-0001', 'Dipinjam'),
    (31, 12, 'BK-12-0002', 'Tersedia'),
    (32, 13, 'BK-13-0001', 'Dipinjam'),
    (33, 13, 'BK-13-0002', 'Tersedia'),
    (34, 14, 'BK-14-0001', 'Tersedia'),
    (35, 14, 'BK-14-0002', 'Tersedia'),
    (36, 14, 'BK-14-0003', 'Tersedia'),
    (37, 15, 'BK-15-0001', 'Dipinjam'),
    (38, 15, 'BK-15-0002', 'Tersedia'),
    (39, 16, 'BK-16-0001', 'Tersedia'),
    (40, 16, 'BK-16-0002', 'Tersedia'),
    (41, 17, 'BK-17-0001', 'Tersedia'),
    (42, 17, 'BK-17-0002', 'Tersedia'),
    (43, 18, 'BK-18-0001', 'Tersedia'),
    (44, 18, 'BK-18-0002', 'Tersedia'),
    (45, 19, 'BK-19-0001', 'Dipinjam'),
    (46, 20, 'BK-20-0001', 'Tersedia'),
    (47, 21, 'BK-21-0001', 'Tersedia'),
    (48, 21, 'BK-21-0002', 'Tersedia');

INSERT INTO peminjaman (
    id, kode_transaksi, id_pengguna, id_buku, id_eksemplar, status,
    diajukan_pada, tanggal_pinjam, tanggal_jatuh_tempo, tanggal_kembali,
    durasi_pinjam_hari, tarif_denda_harian, jumlah_perpanjangan,
    alasan_penolakan, diproses_oleh, diubah_pada
)
VALUES
    (1, 'TRX-261109-0001', 4, 4, 8, 'Perpanjangan Diajukan', (CURRENT_DATE + INTERVAL '-11 days' + TIME '09:20:00'), (CURRENT_DATE + -10), (CURRENT_DATE + 4), NULL, 14, 2000, 0, NULL, 3, (CURRENT_DATE + INTERVAL '0 days' + TIME '09:33:58')),
    (2, 'TRX-261113-0002', 4, 13, 32, 'Dipinjam', (CURRENT_DATE + INTERVAL '-7 days' + TIME '09:20:00'), (CURRENT_DATE + -6), (CURRENT_DATE + 1), NULL, 7, 1500, 0, NULL, 2, (CURRENT_DATE + INTERVAL '-6 days' + TIME '10:05:00')),
    (3, 'TRX-261104-0003', 4, 17, 41, 'Selesai', (CURRENT_DATE + INTERVAL '-16 days' + TIME '09:20:00'), (CURRENT_DATE + -15), (CURRENT_DATE + -8), (CURRENT_DATE + -9), 7, 1000, 0, NULL, 3, (CURRENT_DATE + INTERVAL '-9 days' + TIME '11:00:00')),
    (4, 'TRX-260523-0004', 4, 5, 10, 'Selesai', (CURRENT_DATE + INTERVAL '-181 days' + TIME '09:20:00'), (CURRENT_DATE + -180), (CURRENT_DATE + -166), (CURRENT_DATE + -166), 14, 2000, 0, NULL, 2, (CURRENT_DATE + INTERVAL '-166 days' + TIME '11:00:00')),
    (5, 'TRX-261015-0005', 4, 10, 22, 'Selesai', (CURRENT_DATE + INTERVAL '-36 days' + TIME '09:20:00'), (CURRENT_DATE + -35), (CURRENT_DATE + -28), (CURRENT_DATE + -30), 7, 1000, 0, NULL, 3, (CURRENT_DATE + INTERVAL '-30 days' + TIME '11:00:00')),
    (6, 'TRX-260915-0006', 4, 9, 19, 'Selesai', (CURRENT_DATE + INTERVAL '-66 days' + TIME '09:20:00'), (CURRENT_DATE + -65), (CURRENT_DATE + -51), (CURRENT_DATE + -52), 14, 1500, 0, NULL, 2, (CURRENT_DATE + INTERVAL '-52 days' + TIME '11:00:00')),
    (7, 'TRX-260622-0007', 4, 6, 12, 'Selesai', (CURRENT_DATE + INTERVAL '-151 days' + TIME '09:20:00'), (CURRENT_DATE + -150), (CURRENT_DATE + -136), (CURRENT_DATE + -138), 14, 2000, 0, NULL, 2, (CURRENT_DATE + INTERVAL '-138 days' + TIME '11:00:00')),
    (8, 'TRX-260816-0008', 4, 11, 25, 'Selesai', (CURRENT_DATE + INTERVAL '-96 days' + TIME '09:20:00'), (CURRENT_DATE + -95), (CURRENT_DATE + -88), (CURRENT_DATE + -86), 7, 1000, 0, NULL, 3, (CURRENT_DATE + INTERVAL '-85 days' + TIME '10:00:00')),
    (9, 'TRX-261110-0009', 5, 3, NULL, 'Ditolak', (CURRENT_DATE + INTERVAL '-10 days' + TIME '09:20:00'), NULL, NULL, NULL, NULL, NULL, 0, 'Peminjam masih memiliki denda berstatus Tertunggak. Mohon lunasi denda di meja sirkulasi.', 3, (CURRENT_DATE + INTERVAL '-10 days' + TIME '12:20:00')),
    (10, 'TRX-260905-0010', 5, 21, 47, 'Selesai', (CURRENT_DATE + INTERVAL '-76 days' + TIME '09:20:00'), (CURRENT_DATE + -75), (CURRENT_DATE + -61), (CURRENT_DATE + -56), 14, 1000, 0, NULL, 2, (CURRENT_DATE + INTERVAL '-56 days' + TIME '11:00:00')),
    (11, 'TRX-260712-0011', 5, 10, 22, 'Selesai', (CURRENT_DATE + INTERVAL '-131 days' + TIME '09:20:00'), (CURRENT_DATE + -130), (CURRENT_DATE + -123), (CURRENT_DATE + -119), 7, 1000, 0, NULL, 2, (CURRENT_DATE + INTERVAL '-118 days' + TIME '10:00:00')),
    (12, 'TRX-261004-0012', 5, 6, 12, 'Selesai', (CURRENT_DATE + INTERVAL '-47 days' + TIME '09:20:00'), (CURRENT_DATE + -46), (CURRENT_DATE + -32), (CURRENT_DATE + -24), 14, 2000, 0, NULL, 3, (CURRENT_DATE + INTERVAL '-24 days' + TIME '11:00:00')),
    (13, 'TRX-261107-0013', 6, 15, 37, 'Perpanjangan Disetujui', (CURRENT_DATE + INTERVAL '-13 days' + TIME '09:20:00'), (CURRENT_DATE + -12), (CURRENT_DATE + 2), NULL, 7, 1000, 1, NULL, 2, (CURRENT_DATE + INTERVAL '-2 days' + TIME '14:33:58')),
    (14, 'TRX-260503-0014', 6, 16, 39, 'Selesai', (CURRENT_DATE + INTERVAL '-201 days' + TIME '09:20:00'), (CURRENT_DATE + -200), (CURRENT_DATE + -186), (CURRENT_DATE + -186), 14, 1000, 0, NULL, 2, (CURRENT_DATE + INTERVAL '-186 days' + TIME '11:00:00')),
    (15, 'TRX-261030-0015', 6, 14, 34, 'Selesai', (CURRENT_DATE + INTERVAL '-21 days' + TIME '09:20:00'), (CURRENT_DATE + -20), (CURRENT_DATE + -6), (CURRENT_DATE + -11), 14, 1500, 0, NULL, 3, (CURRENT_DATE + INTERVAL '-11 days' + TIME '11:00:00')),
    (16, 'TRX-261010-0016', 6, 5, 10, 'Selesai', (CURRENT_DATE + INTERVAL '-41 days' + TIME '09:20:00'), (CURRENT_DATE + -40), (CURRENT_DATE + -26), (CURRENT_DATE + -27), 14, 2000, 0, NULL, 2, (CURRENT_DATE + INTERVAL '-27 days' + TIME '11:00:00')),
    (17, 'TRX-260925-0017', 6, 10, 22, 'Selesai', (CURRENT_DATE + INTERVAL '-56 days' + TIME '09:20:00'), (CURRENT_DATE + -55), (CURRENT_DATE + -48), (CURRENT_DATE + -48), 7, 1000, 0, NULL, 3, (CURRENT_DATE + INTERVAL '-48 days' + TIME '11:00:00')),
    (18, 'TRX-260612-0018', 6, 9, 19, 'Selesai', (CURRENT_DATE + INTERVAL '-161 days' + TIME '09:20:00'), (CURRENT_DATE + -160), (CURRENT_DATE + -146), (CURRENT_DATE + -150), 14, 1500, 0, NULL, 2, (CURRENT_DATE + INTERVAL '-150 days' + TIME '11:00:00')),
    (19, 'TRX-260821-0019', 6, 6, 12, 'Selesai', (CURRENT_DATE + INTERVAL '-91 days' + TIME '09:20:00'), (CURRENT_DATE + -90), (CURRENT_DATE + -62), (CURRENT_DATE + -65), 14, 2000, 1, NULL, 3, (CURRENT_DATE + INTERVAL '-65 days' + TIME '11:00:00')),
    (20, 'TRX-260722-0020', 6, 11, 25, 'Selesai', (CURRENT_DATE + INTERVAL '-121 days' + TIME '09:20:00'), (CURRENT_DATE + -120), (CURRENT_DATE + -113), (CURRENT_DATE + -110), 7, 1000, 0, NULL, 2, (CURRENT_DATE + INTERVAL '-109 days' + TIME '10:00:00')),
    (21, 'TRX-261114-0021', 7, 19, 45, 'Dipinjam', (CURRENT_DATE + INTERVAL '-6 days' + TIME '09:20:00'), (CURRENT_DATE + -5), (CURRENT_DATE + 9), NULL, 14, 1000, 0, NULL, 3, (CURRENT_DATE + INTERVAL '-5 days' + TIME '10:05:00')),
    (22, 'TRX-260712-0022', 7, 20, 46, 'Selesai', (CURRENT_DATE + INTERVAL '-131 days' + TIME '09:20:00'), (CURRENT_DATE + -130), (CURRENT_DATE + -116), (CURRENT_DATE + -118), 14, 1000, 0, NULL, 3, (CURRENT_DATE + INTERVAL '-118 days' + TIME '11:00:00')),
    (23, 'TRX-260920-0023', 7, 17, 41, 'Selesai', (CURRENT_DATE + INTERVAL '-61 days' + TIME '09:20:00'), (CURRENT_DATE + -60), (CURRENT_DATE + -53), (CURRENT_DATE + -53), 7, 1000, 0, NULL, 2, (CURRENT_DATE + INTERVAL '-53 days' + TIME '11:00:00')),
    (24, 'TRX-260905-0024', 7, 14, 34, 'Selesai', (CURRENT_DATE + INTERVAL '-76 days' + TIME '09:20:00'), (CURRENT_DATE + -75), (CURRENT_DATE + -61), (CURRENT_DATE + -61), 14, 1500, 0, NULL, 3, (CURRENT_DATE + INTERVAL '-61 days' + TIME '11:00:00')),
    (25, 'TRX-260801-0025', 7, 9, 19, 'Selesai', (CURRENT_DATE + INTERVAL '-111 days' + TIME '09:20:00'), (CURRENT_DATE + -110), (CURRENT_DATE + -96), (CURRENT_DATE + -96), 14, 1500, 0, NULL, 3, (CURRENT_DATE + INTERVAL '-96 days' + TIME '11:00:00')),
    (26, 'TRX-261010-0026', 7, 11, 25, 'Selesai', (CURRENT_DATE + INTERVAL '-41 days' + TIME '09:20:00'), (CURRENT_DATE + -40), (CURRENT_DATE + -33), (CURRENT_DATE + -34), 7, 1000, 0, NULL, 2, (CURRENT_DATE + INTERVAL '-34 days' + TIME '11:00:00')),
    (27, 'TRX-261117-0027', 8, 11, 25, 'Dipinjam', (CURRENT_DATE + INTERVAL '-3 days' + TIME '09:20:00'), (CURRENT_DATE + -2), (CURRENT_DATE + 5), NULL, 7, 1000, 0, NULL, 2, (CURRENT_DATE + INTERVAL '-2 days' + TIME '10:05:00')),
    (28, 'TRX-261116-0028', 8, 3, 5, 'Dipinjam', (CURRENT_DATE + INTERVAL '-4 days' + TIME '09:20:00'), (CURRENT_DATE + -3), (CURRENT_DATE + 11), NULL, 14, 2000, 0, NULL, 3, (CURRENT_DATE + INTERVAL '-3 days' + TIME '10:05:00')),
    (29, 'TRX-260622-0029', 8, 21, 47, 'Selesai', (CURRENT_DATE + INTERVAL '-151 days' + TIME '09:20:00'), (CURRENT_DATE + -150), (CURRENT_DATE + -136), (CURRENT_DATE + -136), 14, 1000, 0, NULL, 2, (CURRENT_DATE + INTERVAL '-136 days' + TIME '11:00:00')),
    (30, 'TRX-261025-0030', 8, 5, 10, 'Selesai', (CURRENT_DATE + INTERVAL '-26 days' + TIME '09:20:00'), (CURRENT_DATE + -25), (CURRENT_DATE + -11), (CURRENT_DATE + -13), 14, 2000, 0, NULL, 3, (CURRENT_DATE + INTERVAL '-13 days' + TIME '11:00:00')),
    (31, 'TRX-260811-0031', 8, 10, 22, 'Selesai', (CURRENT_DATE + INTERVAL '-101 days' + TIME '09:20:00'), (CURRENT_DATE + -100), (CURRENT_DATE + -93), (CURRENT_DATE + -94), 7, 1000, 0, NULL, 2, (CURRENT_DATE + INTERVAL '-94 days' + TIME '11:00:00')),
    (32, 'TRX-260920-0032', 8, 6, 12, 'Selesai', (CURRENT_DATE + INTERVAL '-61 days' + TIME '09:20:00'), (CURRENT_DATE + -60), (CURRENT_DATE + -46), (CURRENT_DATE + -46), 14, 2000, 0, NULL, 2, (CURRENT_DATE + INTERVAL '-46 days' + TIME '11:00:00')),
    (33, 'TRX-260910-0033', 8, 11, 25, 'Selesai', (CURRENT_DATE + INTERVAL '-71 days' + TIME '09:20:00'), (CURRENT_DATE + -70), (CURRENT_DATE + -63), (CURRENT_DATE + -62), 7, 1000, 0, NULL, 2, (CURRENT_DATE + INTERVAL '-61 days' + TIME '10:00:00')),
    (34, 'TRX-261109-0034', 9, 12, 30, 'Dipinjam', (CURRENT_DATE + INTERVAL '-11 days' + TIME '09:20:00'), (CURRENT_DATE + -10), (CURRENT_DATE + -3), NULL, 7, 1500, 0, NULL, 2, (CURRENT_DATE + INTERVAL '-10 days' + TIME '10:05:00')),
    (35, 'TRX-261110-0035', 9, 8, 17, 'Perpanjangan Ditolak', (CURRENT_DATE + INTERVAL '-10 days' + TIME '09:20:00'), (CURRENT_DATE + -9), (CURRENT_DATE + 5), NULL, 14, 1000, 0, NULL, 3, (CURRENT_DATE + INTERVAL '-1 days' + TIME '18:33:58')),
    (36, 'TRX-260811-0036', 9, 18, 43, 'Selesai', (CURRENT_DATE + INTERVAL '-101 days' + TIME '09:20:00'), (CURRENT_DATE + -100), (CURRENT_DATE + -86), (CURRENT_DATE + -87), 14, 1000, 0, NULL, 3, (CURRENT_DATE + INTERVAL '-87 days' + TIME '11:00:00')),
    (37, 'TRX-260702-0037', 9, 14, 34, 'Selesai', (CURRENT_DATE + INTERVAL '-141 days' + TIME '09:20:00'), (CURRENT_DATE + -140), (CURRENT_DATE + -126), (CURRENT_DATE + -129), 14, 1500, 0, NULL, 2, (CURRENT_DATE + INTERVAL '-129 days' + TIME '11:00:00')),
    (38, 'TRX-260826-0038', 9, 9, 19, 'Selesai', (CURRENT_DATE + INTERVAL '-86 days' + TIME '09:20:00'), (CURRENT_DATE + -85), (CURRENT_DATE + -71), (CURRENT_DATE + -73), 14, 1500, 0, NULL, 3, (CURRENT_DATE + INTERVAL '-73 days' + TIME '11:00:00')),
    (39, 'TRX-261020-0039', 9, 6, 12, 'Selesai', (CURRENT_DATE + INTERVAL '-31 days' + TIME '09:20:00'), (CURRENT_DATE + -30), (CURRENT_DATE + -16), (CURRENT_DATE + -17), 14, 2000, 0, NULL, 2, (CURRENT_DATE + INTERVAL '-17 days' + TIME '11:00:00')),
    (40, 'TRX-260930-0040', 9, 11, 25, 'Selesai', (CURRENT_DATE + INTERVAL '-51 days' + TIME '09:20:00'), (CURRENT_DATE + -50), (CURRENT_DATE + -43), (CURRENT_DATE + -41), 7, 1000, 0, NULL, 3, (CURRENT_DATE + INTERVAL '-40 days' + TIME '10:00:00')),
    (41, 'TRX-260424-0041', 10, 4, NULL, 'Ditolak', (CURRENT_DATE + INTERVAL '-210 days' + TIME '09:20:00'), NULL, NULL, NULL, NULL, NULL, 0, 'Eksemplar sedang dalam perbaikan jilid. Silakan ajukan kembali setelah koleksi tersedia.', 2, (CURRENT_DATE + INTERVAL '-210 days' + TIME '12:20:00')),
    (42, 'TRX-260503-0042', 10, 11, 25, 'Selesai', (CURRENT_DATE + INTERVAL '-201 days' + TIME '09:20:00'), (CURRENT_DATE + -200), (CURRENT_DATE + -193), (CURRENT_DATE + -193), 7, 1000, 0, NULL, 2, (CURRENT_DATE + INTERVAL '-193 days' + TIME '11:00:00')),
    (43, 'TRX-261119-0043', 6, 2, NULL, 'Menunggu Konfirmasi', (CURRENT_DATE + INTERVAL '-1 days' + TIME '12:33:58'), NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, (CURRENT_DATE + INTERVAL '-1 days' + TIME '12:33:58')),
    (44, 'TRX-261119-0044', 7, 6, NULL, 'Menunggu Konfirmasi', (CURRENT_DATE + INTERVAL '-1 days' + TIME '18:33:58'), NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, (CURRENT_DATE + INTERVAL '-1 days' + TIME '18:33:58')),
    (45, 'TRX-261120-0045', 8, 16, NULL, 'Menunggu Konfirmasi', (CURRENT_DATE + INTERVAL '0 days' + TIME '13:33:58'), NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, (CURRENT_DATE + INTERVAL '0 days' + TIME '13:33:58')),
    (46, 'TRX-261120-0046', 9, 10, NULL, 'Menunggu Konfirmasi', (CURRENT_DATE + INTERVAL '0 days' + TIME '11:33:58'), NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, (CURRENT_DATE + INTERVAL '0 days' + TIME '11:33:58'));

INSERT INTO perpanjangan_peminjaman (
    id_peminjaman, tanggal_lama, tanggal_baru, tambahan_hari, status,
    alasan_penolakan, diproses_oleh, diproses_pada
)
VALUES
    (1, (CURRENT_DATE + 4), NULL, 14, 'Diajukan', NULL, NULL, NULL),
    (13, (CURRENT_DATE + -5), (CURRENT_DATE + 2), 7, 'Disetujui', NULL, 2, (CURRENT_DATE + INTERVAL '-2 days' + TIME '14:33:58')),
    (19, (CURRENT_DATE + -76), (CURRENT_DATE + -62), 14, 'Disetujui', NULL, 3, (CURRENT_DATE + INTERVAL '-65 days' + TIME '11:00:00')),
    (35, (CURRENT_DATE + 5), NULL, 14, 'Ditolak', NULL, NULL, NULL);

INSERT INTO denda (
    id_peminjaman, hari_terlambat, tarif_per_hari, jumlah_denda,
    status_pembayaran, dibayar_pada, diterima_oleh, dibuat_pada
)
VALUES
    (8, 2, 1000, 2000, 'Lunas', (CURRENT_DATE + INTERVAL '-85 days' + TIME '10:00:00'), 3, (CURRENT_DATE + INTERVAL '-86 days' + TIME '09:00:00')),
    (10, 5, 1000, 5000, 'Tertunggak', NULL, NULL, (CURRENT_DATE + INTERVAL '-56 days' + TIME '09:00:00')),
    (11, 4, 1000, 4000, 'Lunas', (CURRENT_DATE + INTERVAL '-118 days' + TIME '10:00:00'), 2, (CURRENT_DATE + INTERVAL '-119 days' + TIME '09:00:00')),
    (12, 8, 2000, 16000, 'Tertunggak', NULL, NULL, (CURRENT_DATE + INTERVAL '-24 days' + TIME '09:00:00')),
    (20, 3, 1000, 3000, 'Lunas', (CURRENT_DATE + INTERVAL '-109 days' + TIME '10:00:00'), 2, (CURRENT_DATE + INTERVAL '-110 days' + TIME '09:00:00')),
    (33, 1, 1000, 1000, 'Lunas', (CURRENT_DATE + INTERVAL '-61 days' + TIME '10:00:00'), 2, (CURRENT_DATE + INTERVAL '-62 days' + TIME '09:00:00')),
    (40, 2, 1000, 2000, 'Lunas', (CURRENT_DATE + INTERVAL '-40 days' + TIME '10:00:00'), 3, (CURRENT_DATE + INTERVAL '-41 days' + TIME '09:00:00'));

INSERT INTO penilaian_buku (
    id_peminjaman, id_pengguna, id_buku, nilai_bintang, komentar,
    dibuat_pada
)
VALUES
    (20, 6, 11, 5, 'Sangat aplikatif. Konsep perbaikan 1% setiap hari membantu saya menyusun rutinitas belajar menjelang ujian.', (CURRENT_DATE + INTERVAL '-110 days' + TIME '19:30:00')),
    (8, 4, 11, 5, 'Bahasanya ringan dan contohnya konkret. Cocok untuk mahasiswa tingkat awal yang ingin lebih disiplin.', (CURRENT_DATE + INTERVAL '-86 days' + TIME '19:30:00')),
    (33, 8, 11, 4, 'Bagus, meski beberapa bab terasa mengulang. Bagian tentang mendesain lingkungan sangat berguna.', (CURRENT_DATE + INTERVAL '-62 days' + TIME '19:30:00')),
    (40, 9, 11, 5, 'Habit stacking langsung saya praktikkan untuk jadwal organisasi dan kuliah. Recommended!', (CURRENT_DATE + INTERVAL '-41 days' + TIME '19:30:00')),
    (26, 7, 11, 4, 'Ringkas dan mudah diikuti. Tabel ringkasan di akhir bab memudahkan saat membaca ulang.', (CURRENT_DATE + INTERVAL '-34 days' + TIME '19:30:00')),
    (7, 4, 6, 5, 'Wajib untuk mahasiswa Informatika. Bab penamaan dan fungsi langsung saya terapkan di tugas besar.', (CURRENT_DATE + INTERVAL '-138 days' + TIME '19:30:00')),
    (19, 6, 6, 4, 'Prinsipnya kuat, walau contoh Java-nya agak lawas. Tetap relevan untuk proyek kelompok.', (CURRENT_DATE + INTERVAL '-65 days' + TIME '19:30:00')),
    (32, 8, 6, 5, 'Mengubah cara saya melakukan code review dengan teman satu tim.', (CURRENT_DATE + INTERVAL '-46 days' + TIME '19:30:00')),
    (12, 5, 6, 4, 'Isinya padat; perlu dibaca pelan-pelan sambil praktik langsung.', (CURRENT_DATE + INTERVAL '-24 days' + TIME '19:30:00')),
    (18, 6, 9, 5, 'Membuka wawasan tentang bias kognitif. Sangat membantu untuk mata kuliah Sistem Pendukung Keputusan.', (CURRENT_DATE + INTERVAL '-150 days' + TIME '19:30:00')),
    (25, 7, 9, 4, 'Agak berat di tengah buku, tetapi contoh eksperimennya menarik untuk didiskusikan.', (CURRENT_DATE + INTERVAL '-96 days' + TIME '19:30:00')),
    (6, 4, 9, 4, 'Bagus untuk memahami kenapa kita sering salah menilai peluang.', (CURRENT_DATE + INTERVAL '-52 days' + TIME '19:30:00')),
    (31, 8, 10, 5, 'Setelah membaca ini saya mulai menjadwalkan sesi fokus 90 menit tanpa ponsel. Produktivitas naik drastis.', (CURRENT_DATE + INTERVAL '-94 days' + TIME '19:30:00')),
    (17, 6, 10, 4, 'Argumennya meyakinkan, cocok dibaca saat menyusun skripsi.', (CURRENT_DATE + INTERVAL '-48 days' + TIME '19:30:00')),
    (5, 4, 10, 5, 'Buku yang membuat saya keluar dari kebiasaan multitasking.', (CURRENT_DATE + INTERVAL '-30 days' + TIME '19:30:00')),
    (16, 6, 5, 5, 'Edisi ulang tahun ke-20 ini terasa modern. Tips tentang tracer bullets sangat berguna.', (CURRENT_DATE + INTERVAL '-27 days' + TIME '19:30:00')),
    (30, 8, 5, 5, 'Setiap bab pendek dan langsung ke inti. Cocok dibaca sambil magang.', (CURRENT_DATE + INTERVAL '-13 days' + TIME '19:30:00')),
    (24, 7, 14, 5, 'Bacaan wajib anak DKV dan UX. Konsep signifier menjadi dasar tugas akhir saya.', (CURRENT_DATE + INTERVAL '-61 days' + TIME '19:30:00')),
    (37, 9, 14, 4, 'Contoh pintu dan kompor yang membingungkan membuat saya lebih peka terhadap desain sekitar.', (CURRENT_DATE + INTERVAL '-129 days' + TIME '19:30:00')),
    (15, 6, 14, 5, 'Sangat relevan untuk mata kuliah Interaksi Manusia dan Komputer.', (CURRENT_DATE + INTERVAL '-11 days' + TIME '19:30:00')),
    (29, 8, 21, 5, 'Narasi sejarahnya mengalir dan memancing banyak diskusi.', (CURRENT_DATE + INTERVAL '-136 days' + TIME '19:30:00')),
    (3, 4, 17, 4, 'Pendek tetapi bermakna, terutama soal konsep "cukup".', (CURRENT_DATE + INTERVAL '-9 days' + TIME '19:30:00')),
    (23, 7, 17, 5, 'Buku keuangan paling mudah dipahami yang pernah saya baca.', (CURRENT_DATE + INTERVAL '-53 days' + TIME '19:30:00')),
    (36, 9, 18, 4, 'Butuh konsentrasi, tetapi penjelasannya tetap ramah untuk non-fisika.', (CURRENT_DATE + INTERVAL '-87 days' + TIME '19:30:00')),
    (22, 7, 20, 5, 'Memoar yang sangat menyentuh tentang arti pendidikan.', (CURRENT_DATE + INTERVAL '-118 days' + TIME '19:30:00'));

INSERT INTO pengumuman (
    id, judul, isi, kategori, tanggal_rilis, status, ditulis_oleh,
    dibuat_pada
)
VALUES
    (1, 'Jadwal Layanan Perpustakaan Selama Libur Semester Ganjil', 'Sehubungan dengan berakhirnya perkuliahan dan memasuki masa libur semester ganjil 2026/2027, layanan sirkulasi dan ruang baca Perpustakaan BookRoom mengalami penyesuaian jam operasional mulai Senin, 14 Desember 2026.

Senin–Jumat: 08.00–15.00 WITA
Sabtu & Minggu: Tutup

Peminjaman buku tetap dilayani seperti biasa. Buku yang jatuh tempo pada masa libur tetap wajib dikembalikan atau diperpanjang secara daring melalui akun masing-masing.', 'Operasional', (CURRENT_DATE + -10), 'Published', 2, (CURRENT_DATE + INTERVAL '-10 days' + TIME '08:30:00')),
    (2, 'Bedah Buku "The Psychology of Money" bersama Komunitas Literasi', 'Perpustakaan BookRoom mengundang seluruh mahasiswa untuk mengikuti diskusi bedah buku The Psychology of Money karya Morgan Housel.

Waktu: Jumat, 4 Desember 2026, pukul 15.30–17.30 WITA
Tempat: Lecture Theater Lantai 2
Narasumber: Dosen Manajemen Keuangan & Penggiat Literasi

Kuota terbatas untuk 50 peserta. Pendaftaran dapat dilakukan di meja informasi sirkulasi. Peserta hadir mendapatkan e-sertifikat dan voucher prioritas peminjaman koleksi baru.', 'Acara', (CURRENT_DATE + -6), 'Published', 3, (CURRENT_DATE + INTERVAL '-6 days' + TIME '09:15:00')),
    (3, 'Layanan Bebas Pustaka Periode Wisuda Akhir Tahun', 'Pengajuan surat keterangan bebas pustaka bagi mahasiswa tingkat akhir yang telah menyelesaikan ujian skripsi dibuka hingga 18 Desember 2026.

Syarat pengajuan:
1. Tidak memiliki tanggungan peminjaman buku aktif.
2. Tidak memiliki denda keterlambatan berstatus Tertunggak.
3. Bukti unggah karya ilmiah telah terverifikasi.

Surat keterangan dapat diambil di loket administrasi maksimal dua hari kerja setelah berkas dinyatakan lengkap.', 'Layanan', (CURRENT_DATE + -4), 'Published', 2, (CURRENT_DATE + INTERVAL '-4 days' + TIME '10:00:00')),
    (4, 'Pembaruan Fitur Reservasi Antrean Buku Koleksi Populer', 'Mahasiswa kini dapat masuk ke dalam antrean reservasi daring apabila seluruh eksemplar buku sedang dipinjam oleh anggota lain.

Begitu buku dikembalikan ke meja sirkulasi, sistem akan mengirimkan notifikasi otomatis dan menahan eksemplar tersebut selama 2 hari kerja khusus untuk pemesan urutan pertama.', 'Layanan', (CURRENT_DATE + -2), 'Published', 2, (CURRENT_DATE + INTERVAL '-2 days' + TIME '11:20:00')),
    (5, 'Pekan Pemutihan Denda Keterlambatan Menjelang Akhir Semester', 'Dalam rangka penertiban administrasi koleksi sebelum libur semester, Perpustakaan BookRoom memberikan keringanan potongan denda keterlambatan sebesar 50% bagi mahasiswa yang mengembalikan buku melewati jatuh tempo pada periode 1–10 Desember 2026.

Pengembalian dan pelunasan dilakukan langsung di meja layanan sirkulasi pada jam kerja.', 'Operasional', (CURRENT_DATE + -1), 'Published', 3, (CURRENT_DATE + INTERVAL '-1 days' + TIME '08:45:00')),
    (6, 'Lokakarya Penulisan Esai dan Resensi Koleksi Ilmu Komputer', 'Draf rencana kegiatan pelatihan penulisan ulasan kritis buku-buku rekayasa perangkat lunak dan desain interaksi bagi mahasiswa baru. Menunggu konfirmasi jadwal narasumber dan ruang aula.', 'Acara', (CURRENT_DATE + 0), 'Draft', 3, (CURRENT_DATE + INTERVAL '0 days' + TIME '09:00:00'));
INSERT INTO reservasi_buku (
    id, id_pengguna, id_buku, status, dibuat_pada
)
VALUES
    (1, 4, 19, 'Menunggu', (CURRENT_DATE + INTERVAL '-2 days' + TIME '10:15:00')),
    (2, 6, 19, 'Menunggu', (CURRENT_DATE + INTERVAL '-1 days' + TIME '13:40:00'));

INSERT INTO notifikasi (
    id_pengguna, jenis, judul, pesan, tautan, dibaca, dibuat_pada
)
VALUES
    (4, 'Peminjaman', 'Peminjaman disetujui', 'Pengajuan pinjam Anda telah disetujui pegawai. Perhatikan tanggal jatuh tempo pada dashboard.', '/mahasiswa', TRUE, (CURRENT_DATE + INTERVAL '-13 days' + TIME '09:05:00')),
    (4, 'Reservasi', 'Reservasi tercatat', 'Anda masuk antrean reservasi buku "Cosmos" di posisi 1. Kami akan memberi tahu saat buku siap diambil.', '/buku/19', FALSE, (CURRENT_DATE + INTERVAL '-2 days' + TIME '10:15:00')),
    (5, 'Denda', 'Denda keterlambatan tercatat', 'Terdapat denda keterlambatan berstatus Tertunggak. Pengajuan pinjam baru diblokir sampai denda dilunasi di meja sirkulasi.', '/mahasiswa', FALSE, (CURRENT_DATE + INTERVAL '-5 days' + TIME '14:20:00')),
    (6, 'Perpanjangan', 'Perpanjangan disetujui', 'Perpanjangan masa pinjam Anda disetujui. Jatuh tempo baru tertera di dashboard.', '/mahasiswa', FALSE, (CURRENT_DATE + INTERVAL '-3 days' + TIME '11:00:00')),
    (6, 'Reservasi', 'Reservasi tercatat', 'Anda masuk antrean reservasi buku "Cosmos" di posisi 2.', '/buku/19', TRUE, (CURRENT_DATE + INTERVAL '-1 days' + TIME '13:40:00')),
    (9, 'Perpanjangan', 'Perpanjangan ditolak', 'Permohonan perpanjangan Anda ditolak. Kembalikan buku sesuai jatuh tempo.', '/mahasiswa', FALSE, (CURRENT_DATE + INTERVAL '-4 days' + TIME '10:30:00'));

SELECT setval(
    pg_get_serial_sequence('pengguna', 'id'),
    COALESCE((SELECT MAX(id) FROM pengguna), 1)
);

SELECT setval(
    pg_get_serial_sequence('kategori_buku', 'id'),
    COALESCE((SELECT MAX(id) FROM kategori_buku), 1)
);

SELECT setval(
    pg_get_serial_sequence('gambar', 'id'),
    COALESCE((SELECT MAX(id) FROM gambar), 1)
);

SELECT setval(
    pg_get_serial_sequence('buku', 'id'),
    COALESCE((SELECT MAX(id) FROM buku), 1)
);

SELECT setval(
    pg_get_serial_sequence('eksemplar_buku', 'id'),
    COALESCE((SELECT MAX(id) FROM eksemplar_buku), 1)
);

SELECT setval(
    pg_get_serial_sequence('peminjaman', 'id'),
    COALESCE((SELECT MAX(id) FROM peminjaman), 1)
);

SELECT setval(
    pg_get_serial_sequence('pengumuman', 'id'),
    COALESCE((SELECT MAX(id) FROM pengumuman), 1)
);

SELECT setval(
    pg_get_serial_sequence('reservasi_buku', 'id'),
    COALESCE((SELECT MAX(id) FROM reservasi_buku), 1)
);

SELECT setval(
    pg_get_serial_sequence('notifikasi', 'id'),
    COALESCE((SELECT MAX(id) FROM notifikasi), 1)
);

SELECT setval('kode_peminjaman_seq', 146);

COMMIT;

-- Menambahkan akun contoh setiap role
BEGIN;

INSERT INTO pengguna (
  nama_lengkap,
  email,
  kata_sandi_hash,
  peran,
  nomor_identitas,
  program_studi,
  aktif
)
VALUES
  (
    'Admin',
    'admin@unhas.ac.id',
    'scrypt$9a1c74e5b8d2603f17ac6492e0bd53c1$c28fe153541a83c95dae6d759116db79697177aa7621474c8a43d74906ef4a7af0a8be52e0bf3c217b4a1757f9043dc66c3445d08846f97939723b4d58587db7',
    'admin',
    '900000000001',
    NULL,
    TRUE
  ),
  (
    'Pegawai',
    'pegawai@unhas.ac.id',
    'scrypt$9a1c74e5b8d2603f17ac6492e0bd53c1$c28fe153541a83c95dae6d759116db79697177aa7621474c8a43d74906ef4a7af0a8be52e0bf3c217b4a1757f9043dc66c3445d08846f97939723b4d58587db7',
    'pegawai',
    '900000000002',
    NULL,
    TRUE
  ),
  (
    'Mahasiswa',
    'mahasiswa@unhas.ac.id',
    'scrypt$9a1c74e5b8d2603f17ac6492e0bd53c1$c28fe153541a83c95dae6d759116db79697177aa7621474c8a43d74906ef4a7af0a8be52e0bf3c217b4a1757f9043dc66c3445d08846f97939723b4d58587db7',
    'mahasiswa',
    'A000000001',
    'S1 Informatika',
    TRUE
  )
ON CONFLICT DO NOTHING;

COMMIT;

-- Melihat akun yang tersedia
SELECT
  nama_lengkap,
  email,
  peran,
  nomor_identitas,
  aktif
FROM pengguna
WHERE LOWER(email) IN (
  'admin@unhas.ac.id',
  'pegawai@unhas.ac.id',
  'mahasiswa@unhas.ac.id'
);
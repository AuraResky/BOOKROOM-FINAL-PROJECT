// Label dan warna punggung buku
const spines = [
  ['Referensi', 'navy'],
  ['Literatur', 'blue'],
  ['Pengetahuan', 'green'],
  ['Wawasan', 'gold'],
];

// Ornamen dekoratif pada banner dan buku
function Ornament({ className = '' }) {
  return (
    <svg
      className={className}
      viewBox="0 0 40 40"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M20 5c-6 7-6 12 0 18 6-6 6-11 0-18Zm-3 20C8 24 6 18 8 13c7 1 11 5 9 12Zm6 0c9-1 11-7 9-12-7 1-11 5-9 12Z" />

      <path
        d="M12 29h16M20 23v12"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      />
    </svg>
  );
}

// Banner judul dan ilustrasi halaman publik
export default function PageBanner({
  title,
  subtitle,
  children,
  compact = false,
}) {
  return (
    <section
      className={`shelf-page-banner ${
        compact ? 'shelf-page-banner--compact' : ''
      }`}
    >
      <div className="shelf-banner-inner">
        {/* Judul dan keterangan halaman */}
        <div className="shelf-banner-copy">
          <p className="shelf-banner-eyebrow">
            BOOKROOM
            <span aria-hidden="true" />
            PERPUSTAKAAN DIGITAL
          </p>

          <h1>{title}</h1>

          {subtitle && (
            <p className="shelf-banner-description">
              {subtitle}
            </p>
          )}

          {/* Garis pemisah dan ornamen */}
          <div
            className="shelf-banner-divider"
            aria-hidden="true"
          >
            <span />
            <Ornament />
            <span />
          </div>

          {/* Area tombol atau konten tambahan */}
          {children && (
            <div className="shelf-banner-actions">
              {children}
            </div>
          )}
        </div>

        {/* Ilustrasi rak buku */}
        <div
          className="shelf-banner-art"
          aria-hidden="true"
        >
          <div className="shelf-alcove">
            <div className="shelf-lights">
              <span />
              <span />
              <span />
            </div>

            <div className="shelf-books">
              {spines.map(([label, color]) => (
                <div
                  key={color}
                  className={`shelf-book shelf-book--${color}`}
                >
                  <div className="shelf-book-frame">
                    <Ornament className="shelf-book-ornament" />

                    <span className="shelf-book-rule" />

                    <span className="shelf-book-title">
                      {label}
                    </span>

                    <span className="shelf-book-rule" />

                    <Ornament className="shelf-book-ornament" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="shelf-ledge" />
        </div>
      </div>
    </section>
  );
}
'use client';

// Sampul unggahan; tampil kosong jika gambar belum tersedia

import { useState } from 'react';

// Menampilkan sampul unggahan tanpa mengambil gambar dari ISBN
export default function BookCover({
  src,
  title,
  className = '',
  priority = false,
}) {
  const [failedSource, setFailedSource] = useState(null);

  const url = typeof src === 'string' && src.trim()
    ? src
    : null;

  const hasImage = Boolean(url) && failedSource !== url;

  return (
    <div className={`book-object relative aspect-[2/3] ${className}`}>
      <div className="book-cover-face absolute inset-0 overflow-hidden rounded-md border border-line bg-cream-100">
        {hasImage ? (
          <img
            src={url}
            alt={`Sampul buku ${title || ''}`.trim()}
            loading={priority ? 'eager' : 'lazy'}
            decoding="async"
            onError={() => setFailedSource(url)}
            className="h-full w-full object-contain"
          />
        ) : (
          <div
            role="img"
            aria-label="Sampul belum diunggah"
            className="h-full w-full"
          />
        )}
      </div>
    </div>
  );
}
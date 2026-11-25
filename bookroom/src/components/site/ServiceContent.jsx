// Isi kebijakan dan informasi layanan perpustakaan
import Link from 'next/link';
import {
  IconArrowRight,
  IconCalendar,
  IconPhone,
  IconChevron,
} from '@/components/ui/Icons';

export default function ServiceContent({
  services,
  steps,
  hours,
  faqs,
  days,
  fines,
  maxLoans,
}) {
  return (
    <div className="reference-services-shell">
      <div className="reference-service-cards">
        {services.map((service) => (
          <article key={service.title} className="reference-service-card">
            <service.art className="reference-service-icon" />
            <div>
              <h2>{service.title}</h2>
              <p>{service.text}</p>
              {service.href && (
                <Link href={service.href}>
                  {service.cta || 'Lihat informasi'}
                  <IconArrowRight className="h-4 w-4" />
                </Link>
              )}
            </div>
          </article>
        ))}
      </div>

      <div className="reference-services-grid">
        <section id="cara-meminjam" className="reference-service-panel">
          <h2 className="reference-lined-title">
            Cara Meminjam Buku
            <span />
          </h2>

          <ol className="reference-loan-steps">
            {steps.map((step, i) => (
              <li key={step.n}>
                <span className="reference-step-number">{step.n}</span>
                <step.art className="reference-step-icon" />
                <h3>{step.title}</h3>
                <p>{step.text}</p>
                {i < steps.length - 1 && (
                  <IconArrowRight className="reference-step-arrow" />
                )}
              </li>
            ))}
          </ol>

          <div className="reference-service-rules">
            <span>Maks. {maxLoans} pinjaman aktif</span>
            <span>Masa pinjam {days}</span>
            <span>Perpanjangan 1x</span>
            <span>Denda {fines}/hari</span>
          </div>
        </section>

        <section id="jam-operasional" className="reference-service-panel">
          <h2 className="reference-lined-title">
            Jam Operasional
            <span />
          </h2>

          <ul className="reference-service-hours">
            {hours.map((hour) => (
              <li key={hour.day}>
                <IconCalendar className="h-5 w-5" />
                <strong>{hour.day}</strong>
                {hour.time ? (
                  <span className="font-mono">{hour.time}</span>
                ) : (
                  <span className="reference-closed">Tutup</span>
                )}
              </li>
            ))}
          </ul>

          <p className="reference-hours-note">
            Waktu layanan WITA. Perubahan jadwal diumumkan melalui halaman pengumuman.
          </p>
        </section>
      </div>

      <section className="reference-faq">
        <h2 className="reference-lined-title">
          Pertanyaan Umum (FAQ)
          <span />
        </h2>

        <div>
          {faqs.map(([question, answer]) => (
            <details key={question}>
              <summary>
                {question}
                <IconChevron className="h-5 w-5" />
              </summary>
              <p>{answer}</p>
            </details>
          ))}
        </div>
      </section>
    </div>
  );
}
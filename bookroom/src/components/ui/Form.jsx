'use client';

import { useState } from 'react';
import { IconEye, IconEyeOff } from './Icons';

export function Field({ label, name, error, hint, children, className = '' }) {
  return (
    <div className={className}>
      {label && <label htmlFor={name} className="label">{label}</label>}
      {children}
      {error ? <p className="field-error" role="alert">{error}</p> : hint ? <p className="mt-1.5 text-xs text-ink-soft">{hint}</p> : null}
    </div>
  );
}

export function TextInput({ label, name, error, hint, className, inputClassName = '', ...props }) {
  return (
    <Field label={label} name={name} error={error} hint={hint} className={className}>
      <input id={name} name={name} className={`input ${error ? 'input-error' : ''} ${inputClassName}`} aria-invalid={!!error} {...props} />
    </Field>
  );
}

export function TextArea({ label, name, error, hint, className, rows = 4, ...props }) {
  return (
    <Field label={label} name={name} error={error} hint={hint} className={className}>
      <textarea id={name} name={name} rows={rows} className={`input resize-y ${error ? 'input-error' : ''}`} aria-invalid={!!error} {...props} />
    </Field>
  );
}

export function Select({ label, name, error, hint, className, options, placeholder, ...props }) {
  return (
    <Field label={label} name={name} error={error} hint={hint} className={className}>
      <select id={name} name={name} className={`input ${error ? 'input-error' : ''}`} aria-invalid={!!error} {...props}>
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </Field>
  );
}

//Satu kolom kata sandi dengan tombol mata transparan untuk tampil/sembunyi
export function PasswordInput({ label = 'Kata Sandi', name = 'password', error, hint, className, ...props }) {
  const [show, setShow] = useState(false);
  return (
    <Field label={label} name={name} error={error} hint={hint} className={className}>
      <div className="relative">
        <input
          id={name}
          name={name}
          type={show ? 'text' : 'password'}
          className={`input pr-11 ${error ? 'input-error' : ''}`}
          aria-invalid={!!error}
          {...props}
        />
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          className="absolute inset-y-0 right-0 flex w-11 items-center justify-center bg-transparent text-ink-soft transition hover:text-navy focus:outline-none focus-visible:text-navy"
          aria-label={show ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
          aria-pressed={show}
          title={show ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
        >
          {show ? <IconEyeOff className="h-[18px] w-[18px]" /> : <IconEye className="h-[18px] w-[18px]" />}
        </button>
      </div>
    </Field>
  );
}

export function Alert({ tone = 'red', children }) {
  const styles = {
    red: 'border-danger/30 bg-danger/5 text-red-700',
    green: 'border-ok/30 bg-ok/5 text-emerald-700',
    amber: 'border-warn/40 bg-warn/5 text-amber-800',
  };
  return <div role="status" className={`animate-fadein rounded-xl border px-4 py-3 text-sm font-medium ${styles[tone]}`}>{children}</div>;
}

export function Spinner({ className = 'h-4 w-4' }) {
  return (
    <svg className={`animate-spin ${className}`} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeOpacity=".25" strokeWidth="3" />
      <path d="M22 12a10 10 0 0 0-10-10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

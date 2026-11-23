// Ilustrasi dekoratif informasi layanan.
function Art({ children, className = '' }) {
  return (
    <svg
      viewBox="0 0 96 88"
      className={`service-line-art ${className}`}
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

export const BooksCalendar = (props) => (
  <Art {...props}>
    <path d="m13 29 46-10 24 10-46 11-24-11Z" />
    <path d="M13 29v15l24 10 46-11V29M13 47v13l24 11 46-12V46" />
    <path d="m14 59 23 10 45-11" stroke="#C69B3D" strokeWidth="4" />
  </Art>
);

export const IdCardArt = (props) => (
  <Art {...props}>
    <circle cx="44" cy="27" r="14" />
    <path d="M19 70v-7a25 25 0 0 1 50 0v7H19Z" />
    <circle cx="70" cy="60" r="13" fill="#C69B3D" stroke="#C69B3D" />
    <path d="M70 53v14M63 60h14" stroke="#fff" />
  </Art>
);

export const ReadingDesk = (props) => (
  <Art {...props}>
    <path d="M23 42v32M23 54h33v20M56 53V40M14 74h18M62 39h24M73 39V21" />
    <path d="m60 22 7-15h14l8 15H60Z" stroke="#C69B3D" />
    <path d="M73 23v16M63 39h21" />
  </Art>
);

export const LaptopSearch = (props) => (
  <Art {...props}>
    <circle cx="39" cy="35" r="21" />
    <path d="m55 51 23 24" strokeWidth="3.5" />
  </Art>
);

export const BookCheck = (props) => (
  <Art {...props}>
    <rect x="20" y="13" width="55" height="59" rx="5" />
    <path d="m31 42 11 11 22-25" strokeWidth="3.5" />
  </Art>
);

export const FormPencil = (props) => (
  <Art {...props}>
    <path d="M56 10H23v65h50V27L56 10ZM56 10v17h17M33 37h19M33 48h14" />
    <circle cx="66" cy="63" r="15" fill="#fff" />
    <path d="M66 55v16M58 63h16" stroke="#C69B3D" />
  </Art>
);

export const HandOff = (props) => <BooksCalendar {...props} />;
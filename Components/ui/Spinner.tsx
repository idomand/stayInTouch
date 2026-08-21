// Tailwind replacement for Components/Common/StyledSpinner.tsx.
// Animations (`spin-slow` = rotate, `dash`) are defined in styles/globals.css.

const Spinner = () => (
  <svg
    className="animate-spin-slow -mt-6 -ml-6 h-12.5 w-12.5"
    viewBox="0 0 50 50"
  >
    <circle
      className="animate-dash stroke-blue1 [stroke-linecap:round]"
      cx="25"
      cy="25"
      r="20"
      fill="none"
      strokeWidth="4"
    />
  </svg>
);

export const Result = () => (
  <div className="m-auto flex h-50 items-center justify-center">
    <Spinner />
  </div>
);

export default Spinner;

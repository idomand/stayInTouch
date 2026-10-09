import { twMerge } from "tailwind-merge";

type ErrorWarningProps = {
  errorMessage: string;
  extraClasses?: string;
};

/**
 * The one error style: inline, next to what caused it. role="alert" makes
 * screen readers announce it when it mounts. It has no timer; the caller
 * clears it on the next edit or submit.
 */
export default function ErrorWarning({
  errorMessage,
  extraClasses = "",
}: ErrorWarningProps) {
  return (
    <p
      role="alert"
      className={twMerge(
        "m-0 flex items-center gap-2 text-sm text-red1 wrap-break-word",
        extraClasses,
      )}
    >
      <img src="/Error.svg" alt="" className="h-4 w-4 shrink-0" />
      {errorMessage}
    </p>
  );
}

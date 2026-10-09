import Image from "next/image";
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
        "text-red1 m-0 flex items-center gap-2 text-sm wrap-break-word",
        extraClasses,
      )}
    >
      <Image
        src="/Error.svg"
        alt=""
        width={16}
        height={16}
        className="h-4 w-4 shrink-0"
      />
      {errorMessage}
    </p>
  );
}

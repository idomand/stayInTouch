import { twMerge } from "tailwind-merge";

type CharactersLeftProps = {
  length: number;
  max: number;
  className?: string;
};

/**
 * Characters left in a length-capped input, as "remaining/max", shown inside
 * the input at its right edge. Turns red at the limit. Place it next to the
 * input in a `relative` wrapper, and give the input right padding (`pr-14`) so
 * the text never runs under it. It sits on the wrapper's bottom edge with the
 * input's h-10, so the input's top margin does not shift it.
 */
export default function CharactersLeft({
  length,
  max,
  className = "",
}: CharactersLeftProps) {
  const isAtLimit = length >= max;

  return (
    <span
      className={twMerge(
        "pointer-events-none absolute right-3 bottom-0 flex h-10 items-center text-xs tabular-nums",
        isAtLimit ? "text-red1" : "text-grey3",
        className,
      )}
    >
      {Math.max(0, max - length)}/{max}
    </span>
  );
}

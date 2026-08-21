// Tailwind class-string equivalents of the legacy styled form primitives
// (Components/Common/StyledFormElements.ts). Exported as strings so native
// <form>/<input>/<label> keep free prop pass-through and consumers can extend
// them with twMerge, mirroring the old `styled(BasicInput)` pattern.

export const inputSubmitClasses =
  "cursor-pointer transition-all duration-500 text-white text-sm rounded-lg border-[1.3px] border-white text-center disabled:cursor-not-allowed disabled:bg-[grey] disabled:text-white disabled:border-white";

export const basicFormClasses = "bg-white rounded-[10px]";

export const basicInputClasses =
  "cursor-pointer bg-[lightgrey] text-sm h-10 rounded-[10px] border-none mt-1 focus:border focus:border-solid focus:border-blue1";

export const basicLabelClasses = "flex flex-col m-1 justify-between w-auto";

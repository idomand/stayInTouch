import { H5 } from "@/Components/ui/Text";

interface ErrorWarningProps {
  errorMessage: string | boolean;
}

export default function ErrorWarning({ errorMessage }: ErrorWarningProps) {
  return (
    <div className="border-[3px] border-solid border-red1 bg-red2 shadow-[0px_4px_28px_rgba(0,0,0,0.25)] rounded-[13px] px-5 py-3.5 absolute animate-slide">
      <H5 extraClasses="text-red1 flex items-center capitalize">
        <img src="/Error.svg" className="mr-2.5" />
        {errorMessage}
      </H5>
    </div>
  );
}

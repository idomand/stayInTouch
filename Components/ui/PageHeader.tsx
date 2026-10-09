import NextLink from "next/link";
import { useTranslations } from "next-intl";
import { H1 } from "./Text";
import { FaArrowAltCircleLeft } from "react-icons/fa";

type Props = {
  title: string;
};

export default function PageHeader({ title }: Props) {
  const t = useTranslations();

  return (
    <div className="m-2 flex w-full items-center gap-3">
      <NextLink
        href="/"
        aria-label={t("pageHeader.backToHome")}
        className="hover:text-blue1 text-black transition-colors"
      >
        <FaArrowAltCircleLeft size={30} />
      </NextLink>
      <H1>{title}</H1>
    </div>
  );
}

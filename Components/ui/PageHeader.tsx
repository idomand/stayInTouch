import NextLink from "next/link";
import { useTranslations } from "next-intl";
import { H1 } from "./Text";
import { FaArrowAltCircleLeft } from "react-icons/fa";

type Props = {
  title: string;
};

export default function PageHeader({ title }: Props) {
  const t = useTranslations("PageHeader");

  return (
    <div className="flex items-center gap-3 w-full m-2">
      <NextLink
        href="/"
        aria-label={t("backToHome")}
        className="text-black hover:text-blue1 transition-colors"
      >
        <FaArrowAltCircleLeft size={30} />
      </NextLink>
      <H1>{title}</H1>
    </div>
  );
}

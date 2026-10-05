"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import Button from "./ui/Button";

export default function ScrollToTopButton() {
  const t = useTranslations();
  const [isVisible, setIsVisible] = useState(false);

  const toggleVisibility = () => {
    if (window.pageYOffset > 30) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  useEffect(() => {
    window.addEventListener("scroll", toggleVisibility);
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  return (
    <>
      {isVisible && (
        <Button
          onClick={scrollToTop}
          buttonText={t("scrollToTopButton.top")}
          extraClasses="fixed md:right-15 md:bottom-20 bottom-25 right-2"
        />
      )}
    </>
  );
}

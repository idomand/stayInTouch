import React, { useState, useEffect } from "react";
import { ScrollButton, ScrollButtonWrapper } from "./ScrollToTopButtonStyle";

export default function ScrollToTopButton() {
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
    <ScrollButtonWrapper>
      {isVisible && <ScrollButton onClick={scrollToTop}>Top</ScrollButton>}
    </ScrollButtonWrapper>
  );
}

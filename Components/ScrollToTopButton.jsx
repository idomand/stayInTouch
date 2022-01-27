import React, { useState, useEffect } from "react";
import styled from "styled-components";

const ScrollButtonWrapper = styled.div``;

const ScrollButton = styled.button`
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 3;
`;

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
  }, []);

  return (
    <ScrollButtonWrapper>
      {isVisible && <ScrollButton onClick={scrollToTop}>top</ScrollButton>}
    </ScrollButtonWrapper>
  );
}

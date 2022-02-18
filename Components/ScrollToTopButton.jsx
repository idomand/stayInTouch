import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { BasicButton } from "./Common/StyledButton";

const ScrollButton = styled(BasicButton)`
  background-color: ${({ theme }) => theme.brown1};
  transition: all 0.3s;
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 3;
  display: flex;
  justify-content: center;
  @media (${({ theme }) => theme.devices.break1}) {
    width: 40px;
    bottom: 40px;
  }
`;
const ScrollButtonWrapper = styled.div``;

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

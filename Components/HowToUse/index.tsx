import React from "react";
import { useMedia } from "react-use";
import { useTheme } from "styled-components";
import { HowToUseLink } from "./HowToUseStyle";

export default function HowToUse() {
  const Theme = useTheme();

  const isMobile = useMedia(`(${Theme.devices.break1})`);

  return (
    <>
      {!isMobile && (
        <HowToUseLink href={"/about/#HowToUseSection"}>?</HowToUseLink>
      )}
    </>
  );
}

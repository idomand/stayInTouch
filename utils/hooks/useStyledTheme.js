import { useContext } from "react";
import { ThemeContext } from "styled-components";

export default function useStyledTheme() {
  const Theme = useContext(ThemeContext);
  return Theme || {};
}

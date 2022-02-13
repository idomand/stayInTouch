import { typeScale } from "./typography";

export const defaultTheme = {
  //!========
  blue_1: "#053BBC",
  blue_2: "#2C61E0",
  green_1: "#02CF60",
  green_2: "#00AE50",
  //!========

  black: "#000000",
  white: "#ffffff",
  // grey: "#9a9a9a",
  // blue1: "#597FDB",
  // blue2: "#CFEBFF",
  // blue3: "#6DA7FF",
  // blue4: "#003382",
  // brown1: "#D3A518",
  // green1: "#90EE90",
  // red1: "#d0454c",
  // red2: "#F3BAB8",
  typeScale,
  devices: {
    break1: `max-width: 550px`,
    break2: `min-width: 550px`,
  },
};

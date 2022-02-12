import { typeScale } from "./typography";

export const defaultTheme = {
  //!========
  blue_1: "#053BBC",
  blue_2: "#2C61E0",
  blue_3: "#2c61e01A",

  green_1: "#02CF60",
  green_2: "#00AE50",

  // blueButtonBackground: "linear-gradient(98.64deg, #2c61e0 0%, #053bbc 98.85%)",
  // blueButtonBackground2: "linear-gradient(98.64deg, #2c61e0 0%, #053bbc 98.85%)",

  // greenButtonBackground: "linear-gradient(180deg, #02CF60 0%, #00AE50 100%)",

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

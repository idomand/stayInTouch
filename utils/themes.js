import { typeScale } from "./typography";

export const defaultTheme = {
  //!========
  blue_1: "#2C61E0",
  blue_2: "#053BBC",

  // blueButtonBackground: `linear-gradient(98.64deg, ${blue_1} 0%, ${blue_2} 98.85%)`,
  blueButtonBackground: "linear-gradient(98.64deg, #2c61e0 0%, #053bbc 98.85%)",

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

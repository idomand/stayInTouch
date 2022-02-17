import { typeScale } from "./typography";

export const defaultTheme = {
  black: "#000000",
  white: "#ffffff",
  grey1: "#D3D3D3",
  grey2: "rgba(201, 201, 201, 0.7)",
  grey3: "rgba(0, 0, 0, 0.6);",
  blue1: "#053BBC",
  blue2: "#2C61E0",
  blue3: "rgba(44, 97, 224, 0.1)",
  green1: "#02CF60",
  green2: "#00AE50",
  green3: " rgba(2, 207, 96, 0.1)",

  red1: "#FF0000",
  red2: "#FFD8D8",

  typeScale,
  devices: {
    break1: `max-width: 550px`,
    break2: `min-width: 550px`,
  },
};

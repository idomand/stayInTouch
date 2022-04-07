import "styled-components";
declare module "styled-components" {
  export interface DefaultTheme {
    black: string;
    white: string;
    grey1: string;
    grey2: string;
    grey3: string;
    blue1: string;
    blue2: string;
    blue3: string;
    green1: string;
    green2: string;
    green3: string;
    red1: string;
    red2: string;
    typeScale: {
      header1: string;
      header2: string;
      header3: string;
      header4: string;
      header5: string;
      p_large: string;
      p_normal: string;
      p_small: string;
      copyrightText: string;
    };
    devices: {
      break1: string;
      break2: string;
    };
  }
}

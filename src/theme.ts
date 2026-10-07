import { defaultDarkTheme, defaultLightTheme } from "react-admin";
import type { RaThemeOptions } from "react-admin";

// Open Food Facts design system colors, shared with the other OFF apps (see
// hunger-games) so that moving from one tool to another does not feel like
// changing product.
const latte = "#F6F3F0";
const cappucino = "#EDE0DB";
const latteMacchiato = "#DCC9C0";
const mocha = "#85746C";
const chocolate = "#341100";
const macchiato = "#A08D84";
const cortado = "#52443D";
const ristreto = "#201A17";

const white = "#ffffff";
const black = "#000000";

const success = { main: "#8bc34a", contrastText: white };
const error = { main: "#ff5252", contrastText: white };

// Layered over react-admin's own themes rather than replacing them, to keep
// the layout tweaks (sidebar width, dense inputs...) they come with.
//
// react-admin's AppBar uses the `secondary` color, which is what gives it the
// same beige/brown top bar as the other OFF apps.
export const lightTheme: RaThemeOptions = {
  ...defaultLightTheme,
  palette: {
    ...defaultLightTheme.palette,
    mode: "light",
    success,
    error,
    primary: { dark: ristreto, main: chocolate, light: cortado, contrastText: white },
    secondary: {
      light: latte,
      main: cappucino,
      dark: latteMacchiato,
      contrastText: black,
    },
  },
};

export const darkTheme: RaThemeOptions = {
  ...defaultDarkTheme,
  palette: {
    ...defaultDarkTheme.palette,
    mode: "dark",
    success,
    error,
    primary: { dark: mocha, main: macchiato, light: macchiato, contrastText: white },
    secondary: { dark: chocolate, main: cortado, light: mocha, contrastText: white },
  },
};

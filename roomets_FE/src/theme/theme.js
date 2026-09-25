import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    primary: {
      main: "#3730E8",
    },

    secondary: {
      main: "#0F9D8A",
    },

    background: {
      default: "#FFFFFF",
      paper: "#FFFFFF",
    },

    text: {
      primary: "#17233C",
      secondary: "#667085",
    },
  },

  typography: {
    fontFamily: [
      "Inter",
      "Roboto",
      "Arial",
      "sans-serif",
    ].join(","),
  },

  shape: {
    borderRadius: 10,
  },
});

export default theme;
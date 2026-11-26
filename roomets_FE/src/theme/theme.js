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

  components: {
    MuiCssBaseline: {
      styleOverrides: {
        "*, *::before, *::after": {
          boxSizing: "border-box",
        },
        html: {
          WebkitTapHighlightColor: "transparent",
          WebkitTextSizeAdjust: "100%",
          overscrollBehavior: "none",
        },
        "html, body, #root": {
          width: "100%",
          maxWidth: "100%",
          overflowX: "clip",
        },
        body: {
          margin: 0,
        },
        "input, textarea, select": {
          fontSize: "16px",
        },
        "input.MuiInputBase-input, textarea.MuiInputBase-input, select.MuiInputBase-input": {
          fontSize: "16px",
        },
        "button, a, [role='button']": {
          touchAction: "manipulation",
          WebkitUserSelect: "none",
          WebkitTouchCallout: "none",
          userSelect: "none",
        },
        img: {
          maxWidth: "100%",
          height: "auto",
        },
      },
    },
  },

  shape: {
    borderRadius: 10,
  },
});

export default theme;
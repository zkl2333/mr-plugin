import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

const changeTheme = () => {
  const mrTheme = (window as any).mrTheme?.name;
  const THEMES: {
    [key: string]: string;
  } = {
    DEFAULT: "light",
    DARK: "dark",
    LIGHT: "light",
    BLUE: "light",
    GREEN: "light",
    INDIGO: "light",
    DEEP_DARK: "dark",
  };

  if (mrTheme) {
    document.documentElement.setAttribute("data-theme", THEMES[mrTheme]);
  } else {
    document.documentElement.setAttribute("data-theme", "dark");
  }
};

changeTheme();

// 监听postMessage
window.addEventListener("message", (event) => {
  if (event.data === "injectTheme") {
    changeTheme();
  }
});

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

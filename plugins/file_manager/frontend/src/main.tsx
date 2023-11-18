import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import dayjs from "dayjs";
import "dayjs/locale/zh-cn";
import duration from "dayjs/plugin/duration";
import relativeTime from "dayjs/plugin/relativeTime";
import "./index.css";
import "@radix-ui/themes/styles.css";
import "./theme-config.css";

dayjs.locale("zh-cn"); // 全局使用
dayjs.extend(duration);
dayjs.extend(relativeTime);
ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

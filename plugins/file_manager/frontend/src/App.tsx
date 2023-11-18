import { useState, useEffect } from "react";
import Tabs from "./components/Tabs/Tabs";
import MediaLibrayList from "./components/MediaLibrayList/MediaLibrayList";
import DownloaderInfo from "./components/DownloaderInfo/DownloaderInfo";
import { Theme } from "@radix-ui/themes";
import "./App.css";

const MR_THEMES = {
  DEFAULT: "light",
  DARK: "dark",
  LIGHT: "light",
  BLUE: "light",
  GREEN: "light",
  INDIGO: "light",
  DEEP_DARK: "dark",
} as const;

function App() {
  const currentMrTheme: keyof typeof MR_THEMES = (window as any).mrTheme?.name || "DEEP_DARK";

  const [theme, setTheme] = useState<"dark" | "light">(MR_THEMES[currentMrTheme] as any);

  const changeTheme = (event: { data: string }) => {
    if (event.data === "injectTheme") {
      const currentMrTheme: keyof typeof MR_THEMES = (window as any).mrTheme?.name || "DEEP_DARK";
      setTheme(MR_THEMES[currentMrTheme]);
    }
  };

  useEffect(() => {
    // 监听postMessage
    window.addEventListener("message", changeTheme);
    return () => {
      window.removeEventListener("message", changeTheme);
    };
  }, []);

  const [tabValue, setTabValue] = useState("mediaLibrayList");
  const tabOptions = [
    { label: "媒体库", value: "mediaLibrayList" },
    { label: "下载器", value: "downloader" },
    { label: "文件浏览", value: "fileBrowser" },
    { label: "批量操作", value: "batchOperation" },
  ];

  const renderTab = () => {
    switch (tabValue) {
      case "mediaLibrayList":
        return <MediaLibrayList />;
      case "downloader":
        return <DownloaderInfo />;
      default:
        return <div>TODO</div>;
    }
  };

  document.documentElement.setAttribute("data-theme", theme);

  return (
    <Theme appearance={theme} className={theme === "dark" ? "dark-theme" : ""} radius="large">
      <div className="px-2 md:px-4 pb-4 space-y-4 text-base-content">
        <div className="mb-1 text-2xl font-semibold leading-tight">文件管理</div>
        <Tabs
          value={tabValue}
          options={tabOptions}
          onChange={setTabValue}
          className="sticky top-0 z-10"
        />
        {renderTab()}
      </div>
    </Theme>
  );
}

export default App;

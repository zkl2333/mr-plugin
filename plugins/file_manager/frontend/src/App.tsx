import { useState } from "react";
import "./App.css";
import Tabs from "./components/Tabs/Tabs";
import MediaLibrayList from "./components/MediaLibrayList/MediaLibrayList";
import DownloaderInfo from "./components/DownloaderInfo/DownloaderInfo";

function App() {
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
  return (
    <div className="px-2 md:px-4 pb-4 space-y-4">
      <div className="mb-1 text-2xl font-semibold leading-tight">文件管理</div>
      <Tabs
        value={tabValue}
        options={tabOptions}
        onChange={setTabValue}
        className="sticky top-0 z-10"
      />
      {renderTab()}
    </div>
  );
}

export default App;

import { useEffect, useState } from "react";
import "./App.css";
import FileTree from "./components/FileTree/FileTree";
import { request } from "./request";

function App() {
  const [data, setData] = useState([]);
  const fetchData = async () => {
    const res = await request.post("/api/plugins/file_manager/ls", {
      path: "/mnt/user/appdata/mbot/plugins/file_manager",
    });

    const data = await res.json();
    console.log(data);
    setData(data);
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <>
      <div className="pt-2 pl-2 text-2xl font-bold">文件管理</div>
      <FileTree data={data} />
    </>
  );
}

export default App;

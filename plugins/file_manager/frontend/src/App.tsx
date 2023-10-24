import { useEffect, useState } from "react";
import "./App.css";
import { request } from "./request";
import MediaLibray, { IMediaLibray } from "./components/MediaLibray/MediaLibray";

function App() {
  const [loading, setLoading] = useState(false);
  const [libraryPaths, setLibraryPaths] = useState<IMediaLibray[]>([]);
  const fetchLibraryPaths = async () => {
    if (loading) return;
    setLoading(true);
    const response = await request.get("/api/config/get_media_path");
    setLoading(false);
    const data = await response.json();
    setLibraryPaths(data.data.paths);
  };

  useEffect(() => {
    fetchLibraryPaths();
  }, []);
  return (
    <div className="p-4 space-y-4">
      {libraryPaths.map((libraryPath) => {
        return <MediaLibray {...libraryPath} />;
      })}
    </div>
  );
}

export default App;

import { useEffect, useState } from "react";
import { request } from "../../request";
import MediaLibray, { IMediaLibray } from "../MediaLibray/MediaLibray";

function MediaLibrayList() {
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
    <>
      {libraryPaths.map((libraryPath, index) => {
        return <MediaLibray key={index} {...libraryPath} />;
      })}
    </>
  );
}

export default MediaLibrayList;

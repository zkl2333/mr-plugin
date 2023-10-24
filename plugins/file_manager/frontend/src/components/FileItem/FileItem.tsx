import { useEffect, useState } from "react";
import FileIcon from "../FileIcon/FileIcon";
import { request } from "../../request";

export interface IFileItem {
  type: "folder" | "file";
  name: string;
  path: string;
  size: number;
  mtime: number;
}

const MaxChildren = 500;

const formatSize = (size: number) => {
  if (size < 1024) {
    return `${size}B`;
  }
  if (size < 1024 * 1024) {
    return `${(size / 1024).toFixed(2)}KB`;
  }
  if (size < 1024 * 1024 * 1024) {
    return `${(size / 1024 / 1024).toFixed(2)}MB`;
  }
  return `${(size / 1024 / 1024 / 1024).toFixed(2)}GB`;
};

const FileItem = ({ file }: { file: IFileItem }) => {
  const [show, setShow] = useState(false);
  const [children, setChildren] = useState<IFileItem[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    if (!file.path) return;
    if (loading) return;
    setLoading(true);
    const res = await request.post("/api/plugins/file_manager/ls", {
      path: file.path,
    });
    const data = await res.json();
    setChildren(data);
    setLoading(false);
  };

  useEffect(() => {
    if (show) {
      fetchData();
    }
  }, [show]);

  const renderChildren = () => {
    if (!show) return null;
    if (children.length > MaxChildren) {
      return (
        <>
          <li>
            <span className="text-error">文件夹内文件过多，仅展示前{MaxChildren}个</span>
          </li>
          {children.slice(0, 100).map((file) => {
            return <FileItem file={file} />;
          })}
        </>
      );
    }
    return children.map((file) => {
      return <FileItem file={file} />;
    });
  };

  if (file.type === "folder") {
    return (
      <li>
        <span
          className={["menu-dropdown-toggle", show ? "menu-dropdown-show" : ""].join(" ")}
          onClick={() => {
            setShow(!show);
          }}
        >
          {loading ? (
            <span className="loading loading-spinner loading-xs"></span>
          ) : (
            <FileIcon type={show ? "folderOpen" : "folder"} />
          )}
          {file.name}
        </span>
        <ul className={["menu-dropdown", show ? "menu-dropdown-show" : ""].join(" ")}>
          {renderChildren()}
        </ul>
      </li>
    );
  }

  const fileType = file.name.split(".").pop()?.toLowerCase() || "";
  return (
    <li>
      <a>
        <FileIcon type={fileType} />
        <div className="flex items-center space-x-2">
          <div>{file.name}</div>
          {file.size && (
            <div className="badge badge-ghost border-base-300 badge-xs p-2">{formatSize(file.size)}</div>
          )}
          <div className="badge badge-outline text-green-600 border-green-600 badge-xs p-2">
            做种
          </div>
          <div className="badge badge-outline badge-primary badge-xs p-2">硬链接</div>
        </div>
      </a>
    </li>
  );
};

export default FileItem;

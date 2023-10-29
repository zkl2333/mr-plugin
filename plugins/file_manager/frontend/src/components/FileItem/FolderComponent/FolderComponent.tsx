import { useEffect, useState } from "react";
import FileIcon from "../../FileIcon/FileIcon";
import { request } from "../../../request";
import FileItem, { IFileItem } from "../FileItem";
import classNames from "classnames";

const MaxChildren = 500;

const FolderComponent = ({ file }: { file: IFileItem }) => {
  const [show, setShow] = useState(false);
  const [children, setChildren] = useState<IFileItem[]>([]);
  const [loading, setLoading] = useState(false);

  const findHardLink = async (inodes: String[]) => {
    if (inodes.length === 0) return;
    if (file.libray?.source_dir) {
      const res = await request.post("/api/plugins/file_manager/find_files_by_inodes", {
        target_inodes: inodes,
        start_paths: [file.libray?.target_dir, file.libray?.source_dir].filter(Boolean),
      });
      const data = await res.json();
      if (data.code !== 0) {
        return;
      }
      return data.data;
    }
  };

  const fetchData = async () => {
    if (!file.path) return;
    if (loading) return;
    setLoading(true);
    const res = await request.post("/api/plugins/file_manager/ls", {
      path: file.path,
    });
    const data = await res.json();
    if (data.code !== 0) {
      return;
    }
    if (Array.isArray(data.data)) {
      const inodes: String[] = [];
      for (const file of data.data) {
        if (file.nlink > 1) {
          inodes.push(file.ino);
        }
      }
      setChildren(
        data.data.map((item: IFileItem) => {
          item.libray = file.libray;
          return item;
        })
      );
      const inodesMap = await findHardLink(inodes);
      const newChildren = data.data.map((item: { ino: string | number; hardLinks: any[] }) => {
        if (inodesMap?.[item.ino]) {
          item.hardLinks = inodesMap[item.ino];
        }
        return item;
      });
      setChildren(newChildren);
    }
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
            return <FolderComponent key={file.ino} file={file} />;
          })}
        </>
      );
    }
    return children.map((file) => {
      return <FileItem key={file.ino} file={file} />;
    });
  };

  return (
    <li>
      <span
        className={classNames("!pl-2 menu-dropdown-toggle", {
          "menu-dropdown-show": show,
        })}
        onClick={() => {
          setShow(!show);
        }}
      >
        {loading ? (
          <span className="loading loading-spinner loading-xs"></span>
        ) : (
          <FileIcon type={show ? "folderOpen" : "folder"} />
        )}
        <span className="break-all">{file.name}</span>
      </span>
      <ul className={["!pl-2 !ml-1 menu-dropdown", show ? "menu-dropdown-show" : ""].join(" ")}>
        {renderChildren()}
      </ul>
    </li>
  );
};

export default FolderComponent;

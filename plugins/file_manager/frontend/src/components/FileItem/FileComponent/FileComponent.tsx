import FileIcon from "../../FileIcon/FileIcon";
import { IFileItem } from "../FileItem";
import { useState } from "react";
import classNames from "classnames";

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

const FileComponent = ({ file }: { file: IFileItem }) => {
  const fileType = file.name.split(".").pop()?.toLowerCase() || "";
  const [show, setShow] = useState(false);

  const hasHardLink = file.nlink > 1 && file.hardLinks && file.hardLinks.length > 0;

  return (
    <li>
      <span
        className={classNames("!pl-2", {
          "menu-dropdown-show": show,
          "menu-dropdown-toggle": hasHardLink,
        })}
        onClick={() => {
          setShow(!show);
        }}
      >
        <FileIcon type={fileType} />

        <div className="flex items-center space-x-2">
          <span className="truncate">{file.name}</span>

          {file.size && (
            <div className="whitespace-nowrap badge badge-ghost border-base-300 badge-xs md:p-2">
              {formatSize(file.size)}
            </div>
          )}
          {/* <div className="badge badge-outline text-green-600 border-green-600 badge-xs md:p-2">
            做种
          </div> */}
          {hasHardLink && (
            <div className="whitespace-nowrap badge badge-ghost border-base-300 badge-xs md:p-2">
              硬链接
            </div>
          )}
        </div>
      </span>
      {hasHardLink && (
        <ul
          className={classNames(
            "!pl-2 !ml-1 menu-dropdown space-y-1",
            show ? "menu-dropdown-show" : ""
          )}
        >
          <div className="p-2 md:p-4 border border-base-300  rounded overflow-hidden flex flex-col space-y-2 text-xs">
            <div>文件路径：{file.path}</div>
            <div>
              硬链接：
              <ul>
                {file.hardLinks?.map((path) => (
                  <li key={path} className="whitespace-pre-wrap break-all">
                    {path}
                  </li>
                ))}
              </ul>
            </div>
            <div>文件大小：{formatSize(file.size)}</div>
            <div>创建时间：{new Date(file.ctime * 1000).toLocaleString()}</div>
            <div>修改时间：{new Date(file.mtime * 1000).toLocaleString()}</div>
          </div>
        </ul>
      )}
    </li>
  );
};

export default FileComponent;

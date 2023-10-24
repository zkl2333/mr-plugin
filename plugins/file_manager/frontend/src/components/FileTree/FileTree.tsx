import { useState } from "react";
import FileIcon from "../FileIcon/FileIcon";

interface File {
  name: string;
  type?: "folder" | "file";
  children?: File[];
}

interface FileTreeProps {
  data: File[];
}

const FileItem = ({ file }: { file: File }) => {
  const [show, setShow] = useState(false);
  if (file.type === "folder") {
    return (
      <li>
        <span
          className={["menu-dropdown-toggle", show ? "menu-dropdown-show" : ""].join(" ")}
          onClick={() => {
            setShow(!show);
          }}
        >
          <FileIcon type="folder" />
          {file.name}
        </span>
        <ul className={["menu-dropdown", show ? "menu-dropdown-show" : ""].join(" ")}>
          {file.children?.map((child) => {
            return <FileItem file={child} />;
          })}
        </ul>
      </li>
    );
  }
  const fileType = file.name.split(".").pop() || "";
  return (
    <li>
      <a>
        <FileIcon type={fileType} />
        {file.name}
      </a>
    </li>
  );
};

const FileTree = ({ data }: FileTreeProps) => {
  return (
    <ul className="m-2 menu menu-md rounded-lg">
      {data.map((file) => {
        return <FileItem file={file} />;
      })}
    </ul>
  );
};

export default FileTree;

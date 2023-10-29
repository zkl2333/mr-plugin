import { IMediaLibray } from "../MediaLibray/MediaLibray";
import FileComponent from "./FileComponent/FileComponent";
import FolderComponent from "./FolderComponent/FolderComponent";

export interface IFileItem {
  type: "folder" | "file";
  name: string;
  path: string;
  size: number;
  mtime: number;
  nlink: number;
  uid: number;
  gid: number;
  mode: number;
  ino: number;
  dev: number;
  atime: number;
  ctime: number;
  libray?: IMediaLibray;
  hardLinks?: string[];
}

const FileItem = ({ file }: { file: IFileItem }) => {
  if (file.type === "folder") {
    return <FolderComponent file={file} />;
  } else {
    return <FileComponent file={file} />;
  }
};

export default FileItem;

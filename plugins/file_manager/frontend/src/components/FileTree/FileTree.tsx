import FileItem, { IFileItem } from "../FileItem/FileItem";

interface FileTreeProps {
  data: IFileItem[];
}

const FileTree = ({ data }: FileTreeProps) => {
  return (
    <ul className="p-0 menu menu-md rounded-lg">
      {data.map((file) => {
        return <FileItem file={file} />;
      })}
    </ul>
  );
};

export default FileTree;

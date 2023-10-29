import FileItem, { IFileItem } from "../FileItem/FileItem";

interface FileTreeProps {
  data: IFileItem[];
}

const FileTree = ({ data }: FileTreeProps) => {
  return (
    <ul className="p-0 menu menu-xs md:menu-md rounded-lg overflow-y-auto">
      {data.map((file) => {
        return <FileItem key={file.path} file={file} />;
      })}
    </ul>
  );
};

export default FileTree;

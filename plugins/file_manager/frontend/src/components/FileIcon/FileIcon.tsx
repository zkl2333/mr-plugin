import { Icon } from "@iconify/react";

interface FileIconProps {
  type: string;
}

const fileTypeToIcon: {
  [key: string]: string;
} = {
  pdf: "bi:filetype-pdf",
  folder: "material-symbols:folder",
  mp4: "bi:filetype-mp4",
  psd: "bi:filetype-psd",
  jpeg: "bi:filetype-jpg",
  png: "bi:filetype-png",
  txt: "bi:filetype-txt",
};

const FileIcon = ({ type }: FileIconProps) => {
  const icon = fileTypeToIcon[type] || "mdi:file-outline";
  return (
    <Icon
      icon={icon}
      style={{
        fontSize: "1.5em",
      }}
    />
  );
};

export default FileIcon;

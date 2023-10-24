import { Icon } from "@iconify/react";

interface FileIconProps {
  type: string;
}

// 文件类型对应的图标映射 一个图标对应多个文件类型 一个文件类型对应多个图标
const getIconName = (type: string) => {
  if (type === "folder") return "fa-solid:folder";
  if (type === "folderOpen") return "fa-solid:folder-open";
  if (["jpg", "png", "gif", "jpeg"].includes(type)) return "material-symbols:image";
  if (["mp4", "avi", "rmvb", "mkv"].includes(type)) return "material-symbols:movie";
  if (["mp3", "wav", "flac"].includes(type)) return "fa-solid:music";
  if (["doc", "docx"].includes(type)) return "fa-solid:file-word";
  if (["xls", "xlsx"].includes(type)) return "fa-solid:file-excel";
  if (["ppt", "pptx"].includes(type)) return "fa-solid:file-powerpoint";
  if (["pdf"].includes(type)) return "fa-solid:file-pdf";
  if (["zip", "rar", "7z"].includes(type)) return "fa-solid:file-archive";
  if (["txt"].includes(type)) return "mdi:text";
  if (
    [
      "json",
      "js",
      "ts",
      "jsx",
      "tsx",
      "html",
      "css",
      "less",
      "scss",
      "sass",
      "go",
      "py",
      "java",
      "c",
      "cpp",
      "h",
      "hpp",
      "php",
      "sh",
      "bat",
      "md",
    ].includes(type)
  )
    return "ph:code-fill";
  // 字幕
  if (["srt"].includes(type)) return "solar:subtitles-linear";
  // 字体
  if (["ttf", "woff", "woff2"].includes(type)) return "fa-solid:font";
  // nfo
  if (["nfo"].includes(type)) return "material-symbols:movie-info-outline-rounded";
  // 未知文件
  return "solar:file-bold";
};

const FileIcon = ({ type }: FileIconProps) => {
  return (
    <Icon
      icon={getIconName(type)}
      style={{
        fontSize: "1.5em",
      }}
    />
  );
};

export default FileIcon;

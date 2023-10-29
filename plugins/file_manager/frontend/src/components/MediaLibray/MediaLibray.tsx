import { IFileItem } from "../FileItem/FileItem";
import FileTree from "../FileTree/FileTree";

export interface IMediaLibray {
  download_path: string;
  file_process_mode: string;
  qbit_cate: string;
  source_dir: string;
  target_dir: string;
  type: string;
  use_area_folder: true;
}

const typeMap: any = {
  movie: "电影",
  tv: "剧集",
  xx: "xx",
  other: "其他",
};

const MediaLibray = (props: IMediaLibray) => {
  return (
    <div className="card bg-base-100 shadow-xl">
      <div className="p-4 md:p-6 card-body">
        <h2 className="card-title">{typeMap[props.type]}</h2>
        <p className="text-xs md:text-sm">下载器路径：{props.download_path}</p>
        {props.qbit_cate && <p className="text-xs md:text-sm">下载器分类：{props.qbit_cate}</p>}
        {props.target_dir && (
          <FileTree
            data={
              [
                {
                  type: "folder",
                  name: "整理路径",
                  path: props.target_dir,
                  size: 0,
                  mtime: 0,
                  libray: props,
                },
              ] as IFileItem[]
            }
          />
        )}
        {props.source_dir && (
          <FileTree
            data={
              [
                {
                  type: "folder",
                  name: "装载路径",
                  path: props.source_dir,
                  size: 0,
                  mtime: 0,
                  libray: props,
                },
              ] as IFileItem[]
            }
          />
        )}
        <div className="card-actions justify-end"></div>
      </div>
    </div>
  );
};

export default MediaLibray;

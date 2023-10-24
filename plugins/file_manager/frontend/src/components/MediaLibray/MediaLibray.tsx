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
      <div className="card-body">
        <h2 className="card-title">{typeMap[props.type]}</h2>
        <p className="text-sm">下载器路径：{props.download_path}</p>
        {props.qbit_cate && <p className="text-sm">下载器分类：{props.qbit_cate}</p>}
        <FileTree
          data={
            [
              props.target_dir
                ? {
                    type: "folder",
                    name: "整理路径",
                    path: props.target_dir,
                    size: 0,
                    mtime: 0,
                  }
                : null,
              props.source_dir
                ? {
                    type: "folder",
                    name: "装载路径",
                    path: props.source_dir,
                    size: 0,
                    mtime: 0,
                  }
                : null,
            ].filter(Boolean) as IFileItem[]
          }
        />
        <div className="card-actions justify-end">
          <button className="btn btn-xs btn-primary text-white">扫描下载器</button>
          <button className="btn btn-xs btn-primary text-white">扫描硬链接</button>
          <button className="btn btn-xs btn-error text-white btn-disabled">删除未做种</button>
          <button className="btn btn-xs btn-error text-white btn-disabled">删除未整理</button>
        </div>
      </div>
    </div>
  );
};

export default MediaLibray;

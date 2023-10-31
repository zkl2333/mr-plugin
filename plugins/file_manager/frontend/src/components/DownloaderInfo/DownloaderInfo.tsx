import dayjs from "dayjs";
import DataTable from "../DataTable/DataTable";
import { TableColumn } from "../DataTable/types";
import { DataSource, FileDetail } from "./types";
import useSWR from "swr";
import { request } from "../../request";
import { useState } from "react";
import classNames from "classnames";
import { Icon } from "@iconify/react/dist/iconify.js";

const transformDataSource = (dataSource: DataSource): FileDetail[] => {
  const results: FileDetail[] = [];

  for (const path in dataSource) {
    for (const hash in dataSource[path]) {
      results.push(dataSource[path][hash]);
    }
  }

  return results;
};

const formatTime = (seconds: number) => {
  return `${dayjs.duration(seconds, "seconds").locale("cn").humanize()}`;
};

const getDomain = (url: string) => {
  if (!url) return url;
  const matches = url.match(/^https?\:\/\/([^\/?#]+)(?:[\/?#]|$)/i);
  return matches && matches[1];
};

const hardLinkStateMap = {
  all: "全部",
  include: "包含",
  exclude: "排除",
};

const Downloader = () => {
  const [hardLinkState, setHardLinkState] = useState<keyof typeof hardLinkStateMap>("all");
  const [selectTorrents, setSelectTorrents] = useState<string[]>([]); // 选中的种子hash列表

  const columns: TableColumn[] = [
    {
      key: "hash",
      label: "",
      render: (item: FileDetail) => (
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            className="checkbox checkbox-sm"
            checked={selectTorrents.includes(item.hash)}
            readOnly
          />
        </div>
      ),
    },
    {
      key: "name",
      label: "文件名",
      render: (item: FileDetail) => <span>{item?.name}</span>,
    },
    {
      key: "tracker",
      label: "Tracker",
      render: (item: FileDetail) => (
        <span>{item?.tracker ? getDomain(item?.tracker) : "暂无"}</span>
      ),
    },
    {
      key: "size_str",
      label: "文件大小",
      render: (item: FileDetail) => <span className="whitespace-nowrap">{item?.size_str}</span>,
    },
    {
      key: "uploaded_str",
      label: "已上传",
      render: (item: FileDetail) => <span className="whitespace-nowrap">{item?.uploaded_str}</span>,
    },
    {
      key: "downloaded_str",
      label: "已下载",
      render: (item: FileDetail) => (
        <span className="whitespace-nowrap">{item?.downloaded_str}</span>
      ),
    },
    {
      key: "ratio",
      label: "分享率",
      render: (item: FileDetail) => <>{item?.ratio.toFixed(2)}</>,
    },
    {
      key: "seeding_time",
      label: "做种时间",
      render: (item: FileDetail) => (
        <>{item?.seeding_time ? formatTime(item?.seeding_time) : "暂无"}</>
      ),
    },
  ];

  const [selectDownloadClient, setSelectDownloadClient] = useState<string[]>([]);

  const { data, error, isLoading } = useSWR(
    ["/api/plugins/file_manager/get_torrents", hardLinkState, selectDownloadClient.join(",")],
    async ([url, hardLinkState, selectDownloadClient]) => {
      const res = await request.get(url, {
        hardlink: hardLinkState,
        downloder: selectDownloadClient,
      });
      const { code, data, message } = await res.json();
      if (code !== 0) {
        throw new Error(message);
      }
      return transformDataSource(data);
    }
  );

  const { data: downloadClientData } = useSWR(
    "/api/plugins/file_manager/get_download_client",
    async (url) => {
      const res = await request.get(url);
      const { code, data, message } = await res.json();
      if (code !== 0) {
        throw new Error(message);
      }
      return data;
    }
  );

  const deleteTorrents = async () => {
    const res = await request.post("/api/plugins/file_manager/delete_torrents", {
      hash: selectTorrents.join(","),
    });
    const { code, data, message } = await res.json();
    if (code !== 0) {
      throw new Error(message);
    }
    console.log(data);
  };

  return (
    <div className="card bg-base-100 shadow-xl">
      <div className="p-4 md:p-6 card-body">
        <div className="flex items-center space-x-2">
          <div className="dropdown">
            <label tabIndex={0} className="btn btn-sm">
              <Icon icon="ph:download-duotone" className="w-4 h-4" />
              选择下载器
            </label>
            <div tabIndex={0} className="dropdown-content z-[1] menu bg-base-200 w-56 rounded-box">
              <div className="form-control">
                {downloadClientData.map((name: string) => (
                  <label key={name} className="cursor-pointer label">
                    <span className="label-text">{name}</span>
                    <input
                      type="checkbox"
                      className="checkbox checkbox-sm"
                      checked={selectDownloadClient.includes(name)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectDownloadClient((prev) => [...prev, name]);
                        } else {
                          setSelectDownloadClient((prev) => prev.filter((item) => item !== name));
                        }
                      }}
                    />
                  </label>
                ))}
              </div>
            </div>
          </div>
          <div className="dropdown">
            <label tabIndex={0} className="btn btn-sm">
              <Icon icon="ph:link-bold" className="w-4 h-4" />
              硬链接（{hardLinkStateMap[hardLinkState]}）
            </label>
            <ul tabIndex={0} className="dropdown-content z-[1] bg-base-200 w-56 rounded-box">
              <ul className="menu bg-base-200 w-56 rounded-box">
                {Object.entries(hardLinkStateMap).map(([key, value]) => (
                  <li key={key}>
                    <a
                      className={classNames({
                        active: hardLinkState === key,
                      })}
                      onClick={() => setHardLinkState(key as keyof typeof hardLinkStateMap)}
                    >
                      {value}
                    </a>
                  </li>
                ))}
              </ul>
            </ul>
          </div>
          <div className="flex-1" />
          <div className="flex items-center space-x-2">
            <button className="btn btn-sm" onClick={deleteTorrents}>
              <Icon icon="bi:trash" className="w-4 h-4" />
              删除选择的种子
            </button>
          </div>
        </div>

        {isLoading ? (
          <div>loading...</div>
        ) : (
          <DataTable
            className="h-full"
            columns={columns}
            data={data || []}
            onSelect={(file) => {
              setSelectTorrents((prev) => {
                if (prev.includes(file.hash)) {
                  return prev.filter((hash) => hash !== file.hash);
                } else {
                  return [...prev, file.hash];
                }
              });
            }}
          />
        )}
        {error ? <div>error</div> : null}
      </div>
    </div>
  );
};

export default Downloader;

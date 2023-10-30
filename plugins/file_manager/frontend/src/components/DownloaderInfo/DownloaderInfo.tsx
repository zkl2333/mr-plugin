import dayjs from "dayjs";
import DataTable from "../DataTable/DataTable";
import { TableColumn } from "../DataTable/types";
import { DataSource, FileDetail } from "./types";
import useSWR from "swr";
import { request } from "../../request";
import { useState } from "react";

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

const Downloader = () => {
  const columns: TableColumn[] = [
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
  const [noHardLink, setNoHardLink] = useState(true);

  const { data, error, isLoading } = useSWR(
    noHardLink
      ? "/api/plugins/file_manager/get_completed_but_no_hardLink_torrents"
      : "/api/plugins/file_manager/get_completed_torrents",
    async (url: string) => {
      const res = await request.get(url);
      const { code, data, msg } = await res.json();
      if (code !== 0) {
        throw new Error(msg);
      }
      console.log(data);
      return transformDataSource(data);
    }
  );

  return (
    <div className="card bg-base-100 shadow-xl">
      <div className="p-4 md:p-6 card-body">
        <div className="form-control w-[200px]">
          <label className="label cursor-pointer">
            <span className="label-text">已完成但没有硬链接</span>
            <input
              type="checkbox"
              className="toggle toggle-success toggle-sm"
              checked={noHardLink}
              onChange={(e) => {
                setNoHardLink(e.target.checked);
              }}
            />
          </label>
        </div>
        {isLoading ? <div>loading...</div> : <DataTable columns={columns} data={data || []} />}
        {error ? <div>error</div> : null}
      </div>
    </div>
  );
};

export default Downloader;

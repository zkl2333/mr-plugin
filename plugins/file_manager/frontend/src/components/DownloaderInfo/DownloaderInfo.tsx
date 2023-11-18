import dayjs from "dayjs";
import DataTable from "../DataTable/DataTable";
import { TableColumn } from "../DataTable/types";
import { DataSource, FileDetail } from "./types";
import useSWR from "swr";
import { request } from "../../request";
import { useCallback, useState } from "react";
import classNames from "classnames";
import { Icon } from "@iconify/react/dist/iconify.js";
import { AlertDialog, Button, DropdownMenu, Flex } from "@radix-ui/themes";

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
  const matches = url.match(/^https?:\/\/([^/?#]+)(?:[/?#]|$)/i);
  return matches && matches[1];
};

const hardLinkStateMap = {
  include: "有硬链接",
  exclude: "无硬链接",
};

const Downloader = () => {
  const [hardLinkState, setHardLinkState] = useState<keyof typeof hardLinkStateMap | "all">("all");
  const [selectTorrents, setSelectTorrents] = useState<string[]>([]); // 选中的种子hash列表

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

  const [selectDownloadClient, setSelectDownloadClient] = useState<string[]>([]);

  const {
    data: torrents,
    error,
    isLoading,
    mutate,
  } = useSWR(
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
      setSelectDownloadClient(data);
      return data;
    }
  );

  const deleteTorrents = async () => {
    const res = await request.post("/api/plugins/file_manager/delete_torrents", {
      torrents: selectTorrents,
    });
    const { code, data, message } = await res.json();
    if (code !== 0) {
      throw new Error(message);
    }
    console.log(data);
    mutate(torrents?.filter((torrent) => !selectTorrents.includes(torrent.hash)));
  };

  const handleSelect = useCallback((items: any[]) => {
    setSelectTorrents(items.map((file) => file.hash));
  }, []);

  return (
    <div className="card bg-base-100 shadow-xl">
      <div className="p-4 md:p-6 card-body">
        <div className="flex items-center space-x-2">
          <DropdownMenu.Root>
            <DropdownMenu.Trigger>
              <Button variant="surface">
                <Icon icon="ph:download-duotone" className="w-4 h-4" />
                下载器
              </Button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Content>
              {Array.isArray(downloadClientData) &&
                downloadClientData.map((name: string) => (
                  <DropdownMenu.CheckboxItem
                    key={name}
                    checked={selectDownloadClient.includes(name)}
                    onCheckedChange={() => {
                      setSelectDownloadClient((prev) => {
                        if (prev.includes(name)) {
                          return prev.filter((item) => item !== name);
                        } else {
                          return [...prev, name];
                        }
                      });
                    }}
                  >
                    {name}
                  </DropdownMenu.CheckboxItem>
                ))}
            </DropdownMenu.Content>
          </DropdownMenu.Root>
          <DropdownMenu.Root>
            <DropdownMenu.Trigger>
              <Button variant="surface">
                <Icon icon="ph:link" className="w-4 h-4" />
                硬链接状态
              </Button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Content>
              <DropdownMenu.RadioGroup value={hardLinkState}>
                {Object.entries(hardLinkStateMap).map(([key, value]) => (
                  <DropdownMenu.RadioItem
                    value={key}
                    key={key}
                    className={classNames({
                      active: hardLinkState === key,
                    })}
                    onSelect={() => {
                      if (key === hardLinkState) {
                        setHardLinkState("all");
                      } else {
                        setHardLinkState(key as keyof typeof hardLinkStateMap);
                      }
                    }}
                  >
                    {value}
                  </DropdownMenu.RadioItem>
                ))}
              </DropdownMenu.RadioGroup>
            </DropdownMenu.Content>
          </DropdownMenu.Root>
          <div className="flex-1" />
          <div className="flex items-center space-x-2">
            <AlertDialog.Root>
              <AlertDialog.Trigger>
                <Button variant="solid" color="red" className="cursor-pointer">
                  <Icon icon="bi:trash" className="w-4 h-4" />
                  删除选择的种子
                </Button>
              </AlertDialog.Trigger>
              {selectTorrents.length > 0 ? (
                <AlertDialog.Content style={{ maxWidth: 450 }}>
                  <AlertDialog.Title>删除选择的种子</AlertDialog.Title>
                  <AlertDialog.Description size="2">
                    您确定要删除选中的种子吗？此操作不可逆！
                  </AlertDialog.Description>
                  <Flex gap="3" mt="4" justify="end">
                    <AlertDialog.Cancel>
                      <Button variant="soft" color="gray" className="cursor-pointer">
                        取消
                      </Button>
                    </AlertDialog.Cancel>
                    <AlertDialog.Action>
                      <Button
                        variant="solid"
                        color="red"
                        className="cursor-pointer"
                        onClick={deleteTorrents}
                      >
                        删除
                      </Button>
                    </AlertDialog.Action>
                  </Flex>
                </AlertDialog.Content>
              ) : (
                <AlertDialog.Content style={{ maxWidth: 450 }}>
                  <AlertDialog.Title>删除选择的种子</AlertDialog.Title>
                  <AlertDialog.Description size="2">您还没有选择种子！</AlertDialog.Description>
                  <Flex gap="3" mt="4" justify="end">
                    <AlertDialog.Action>
                      <Button color="indigo" variant="surface" className="cursor-pointer">
                        确定
                      </Button>
                    </AlertDialog.Action>
                  </Flex>
                </AlertDialog.Content>
              )}
            </AlertDialog.Root>
          </div>
        </div>

        {isLoading ? (
          <div>loading...</div>
        ) : (
          <DataTable
            className="h-full"
            columns={columns}
            data={torrents || []}
            rowKey="hash"
            onSelect={handleSelect}
          />
        )}
        {error ? <div>error</div> : null}
      </div>
    </div>
  );
};

export default Downloader;

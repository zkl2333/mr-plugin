import "./App.css";
import { Icon } from "@iconify/react/dist/iconify.js";

const EventList = {
  SubMedia: "订阅影片",
  DeleteSubMedia: "删除订阅影片",
  DownloadStart: "开始下载",
  DownloadCompleted: "下载完成",
  SiteError: "站点异常",
  EmbyPlaybackStart: "Emby 播放开始",
  EmbyPlaybackPause: "Emby 播放暂停",
  EmbyPlaybackUnpause: "Emby 暂停继续",
  EmbyPlaybackStop: "Emby 停止继续",
  EmbvLibrarvNew: "Emby 新增入库",
};

const webhooks = [
  {
    name: "webhook 1",
    url: "https://example.com/webhooks",
    bindEvents: [
      "SubMedia",
      "DeleteSubMedia",
      "DownloadStart",
      "DownloadCompleted",
      "SiteError",
      "EmbyPlaybackStart",
      "EmbyPlaybackPause",
      "EmbyPlaybackUnpause",
      "EmbyPlaybackStop",
      "EmbvLibrarvNew",
    ],
  },
  {
    name: "webhook 2",
    url: "https://example.com/webhooks",
    bindEvents: [
      "SubMedia",
      "DeleteSubMedia",
      "DownloadStart",
      "DownloadCompleted",
      "SiteError",
      "EmbyPlaybackStart",
      "EmbyPlaybackPause",
      "EmbyPlaybackUnpause",
      "EmbyPlaybackStop",
      "EmbvLibrarvNew",
    ],
  },
];

function App() {
  return (
    <div className="px-2 md:px-4 pb-4 space-y-4">
      <div className="mb-1 text-2xl font-semibold leading-tight">Webhooks</div>
      {/* 列表 */}
      {webhooks.map((webhook) => {
        return (
          <div className="rounded-2xl shadow-2xl bg-base-100 p-4 flex justify-between">
            <div className="space-y-2">
              <div className="">{webhook.name}</div>
              <div className="">{webhook.url}</div>
              <div>
                {webhook.bindEvents.map((event) => {
                  return (
                    <span className="badge badge-sm bg-base-300 p-2 mr-2 mb-2">
                      {EventList[event as keyof typeof EventList]}
                    </span>
                  );
                })}
              </div>
            </div>
            <div className="flex items-center">
              <Icon icon="material-symbols:delete" className="w-6 h-6" />
              <Icon icon="material-symbols:edit" className="w-6 h-6" />
            </div>
          </div>
        );
      })}
      {/* 添加按钮 */}
      <div className="flex">
        <button className="btn btn-primary flex-1">添加</button>
      </div>
      {/* webkook 编辑 */}
      <div className="card flex-shrink-0 w-full shadow-2xl bg-base-100">
        <div className="card-body">
          <div className="form-control">
            <label className="label">
              <span className="label-text">名称：</span>
            </label>
            <input type="text" placeholder="webhook" className="input input-bordered" />
            <label className="label">
              <span className="label-text-alt">用于显示的友好名称，供您参考。</span>
            </label>
          </div>
          <div className="form-control">
            <label className="label">
              <span className="label-text">URL：</span>
            </label>
            <input
              type="text"
              placeholder="https://example.com/webhooks"
              className="input input-bordered"
            />
            <label className="label">
              <span className="label-text-alt">将根据以下选定的事件将 POST 请求发送到该 URL。</span>
            </label>
          </div>
          <div className="flex flex-wrap">
            {Object.keys(EventList).map((event) => {
              const eventName = EventList[event as keyof typeof EventList];
              return (
                <label className="cursor-pointer label mr-4">
                  <input type="checkbox" name={event} className="checkbox mr-2" />
                  <span className="label-text">{eventName}</span>
                </label>
              );
            })}
          </div>
          <div className="form-control mt-6">
            <button className="btn btn-primary">保存</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;

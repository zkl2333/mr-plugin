import "./App.css";
import { Icon } from "@iconify/react/dist/iconify.js";
import { useState } from "react";
import DeleteButton from "./components/DeleteButton";
import { EditWebhook } from "./components/EditWebhook";
import { EventList } from "./EventList";
import { IWebhook } from "./types";

const testWebhooks = [
  {
    id: 1,
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
    id: 2,
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

const saveWebhook = (webhook: IWebhook) => {
  const id = webhook.id;
  if (id) {
    const index = testWebhooks.findIndex((item) => item.id === id);
    testWebhooks[index] = { ...webhook, id };
  } else {
    testWebhooks.push({ ...webhook, id: testWebhooks.length + 1 });
  }
};

const deleteWebhook = (id: number) => {
  const index = testWebhooks.findIndex((item) => item.id === id);
  testWebhooks.splice(index, 1);
};

function App() {
  const [webhooks, setWebhooks] = useState(testWebhooks);
  const relodWebhooks = () => {
    setWebhooks([...testWebhooks]);
  };

  return (
    <div className="px-2 md:px-4 pb-4 space-y-4">
      <div className="mb-1 text-2xl font-semibold leading-tight">Webhooks</div>
      {/* 列表 */}
      {webhooks.map((webhook) => {
        return (
          <div
            key={webhook.id}
            className="rounded-2xl shadow-2xl bg-base-100 p-4 flex flex-col justify-between"
          >
            <div className="space-y-1">
              <div className="text-lg font-bold">{webhook.name}</div>
              <div className="opacity-90 text-sm truncate">{webhook.url}</div>
              <div>
                {webhook.bindEvents.map((event) => {
                  return (
                    <span key={event} className="badge badge-sm bg-base-200 p-2 mr-2 mb-2">
                      {EventList[event as keyof typeof EventList] || event}
                    </span>
                  );
                })}
              </div>
            </div>
            <div className="flex items-center space-x-2 mt-2">
              <div className="btn btn-sm btn-circle" title="发送测试">
                <Icon icon="material-symbols:send" className="w-5 h-5" />
              </div>
              <EditWebhook
                trigger={
                  <div className="btn btn-sm btn-circle" title="编辑">
                    <Icon icon="material-symbols:edit" className="w-5 h-5" />
                  </div>
                }
                webhook={webhook}
                onSave={async (webhook: IWebhook) => {
                  await saveWebhook(webhook);
                  relodWebhooks();
                }}
              />
              <DeleteButton
                onDelete={() => {
                  deleteWebhook(webhook.id!);
                  relodWebhooks();
                }}
              >
                <div className="btn btn-sm btn-circle" title="删除">
                  <Icon icon="material-symbols:delete" className="w-5 h-5" />
                </div>
              </DeleteButton>
            </div>
          </div>
        );
      })}
      {/* 添加按钮 */}
      <div className="flex">
        <EditWebhook
          trigger={<button className="btn btn-primary flex-1">添加</button>}
          webhook={{ name: "", url: "", bindEvents: [] }}
          onSave={async (webhook: IWebhook) => {
            await saveWebhook(webhook);
            relodWebhooks();
          }}
        />
      </div>
    </div>
  );
}

export default App;

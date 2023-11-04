import "./App.css";
import { Icon } from "@iconify/react/dist/iconify.js";
import { useEffect, useState } from "react";
import DeleteButton from "./components/DeleteButton";
import { EditWebhook } from "./components/EditWebhook";
import { EventList } from "./EventList";
import { IWebhook } from "./types";
import { getConfig, saveConfig, testUrl } from "./request";

function App() {
  const [webhooks, setWebhooks] = useState<IWebhook[]>([]);

  const fetchWebhooks = async () => {
    const res = await getConfig().then((res) => res.json());
    if (res.code === 0 && res.data.webhooks) {
      const webhooks = res.data;
      setWebhooks(webhooks);
    }
  };

  useEffect(() => {
    fetchWebhooks();
  }, []);

  const relodWebhooks = () => {
    fetchWebhooks();
  };

  const saveWebhook = (webhook: IWebhook) => {
    const id = webhook.id;
    const newWebhooks = [...webhooks];
    if (id) {
      const index = webhooks.findIndex((item) => item.id === id);
      newWebhooks[index] = { ...webhook, id };
    } else {
      newWebhooks.push({ ...webhook, id: webhooks.length + 1 });
    }
    return saveConfig(newWebhooks);
  };

  const deleteWebhook = (id: number) => {
    const newWebhooks = webhooks.filter((item) => item.id !== id);
    return saveConfig(newWebhooks);
  };

  return (
    <div className="px-2 md:px-4 pb-4 space-y-4">
      <div className="mb-1 text-2xl font-semibold leading-tight">Webhooks</div>
      {/* 列表 */}
      {webhooks.length === 0 && (
        // empty
        <div className="rounded-2xl shadow-2xl bg-base-100 p-4 flex flex-col justify-between">
          <div className="text-lg text-center font-bold">铁子，你还没有 Webhook 呢</div>
        </div>
      )}
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
              <div
                className="btn btn-sm btn-circle"
                title="发送测试"
                onClick={() => {
                  testUrl(webhook.url);
                }}
              >
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

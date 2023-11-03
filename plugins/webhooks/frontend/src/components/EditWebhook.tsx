import * as Dialog from "@radix-ui/react-dialog";
import * as Form from "@radix-ui/react-form";
import { ReactNode, useEffect, useState } from "react";
import { IWebhook } from "../types";
import { EventList } from "../EventList";
import { Icon } from "@iconify/react/dist/iconify.js";

export const EditWebhook = (props: {
  webhook: IWebhook;
  trigger: ReactNode;
  onSave: (webhook: IWebhook) => Promise<void>;
}) => {
  const [open, setOpen] = useState(false);
  const [custemEventList, setCustemEventList] = useState<
    {
      name: string;
      checked: boolean;
    }[]
  >([]);

  useEffect(() => {
    if (open) {
      setCustemEventList(
        props.webhook.bindEvents
          .filter((event) => !Object.keys(EventList).includes(event))
          .map((event) => {
            return {
              name: event,
              checked: true,
            };
          })
      );
    } else {
      setCustemEventList([]);
    }
  }, [open]);

  return (
    <Dialog.Root modal open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>{props.trigger}</Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="animate-fade animate-duration-300">
          <div className="bg-gray-950 fixed inset-0 opacity-60" />
        </Dialog.Overlay>
        <Dialog.Content className="card md:w-2/3 max-w-[800px] w-[calc(100vw-2em)] fixed rounded-lg top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex-shrink-0 shadow-2xl bg-base-100">
          <div className="card-body">
            <Dialog.Title>
              <div className="card-title text-center">
                {props.webhook.id ? "编辑 Webhook" : "添加 Webhook"}
              </div>
            </Dialog.Title>

            <Dialog.Close />
            {/* webkook 编辑 */}
            <Form.Root
              onSubmit={(e) => {
                e.preventDefault();
                const form = e.currentTarget;
                const formData = new FormData(form);
                const webhook: IWebhook = {
                  id: props.webhook.id,
                  name: formData.get("name") as string,
                  url: formData.get("url") as string,
                  bindEvents: [
                    ...formData.getAll("bindEvents"),
                    ...custemEventList
                      .filter((event) => event.checked)
                      .map((event) => event.name)
                      .filter(Boolean),
                  ] as string[],
                };
                props.onSave(webhook);
                form.reset();
                setOpen(false);
              }}
            >
              <Form.Field name="name" className="form-control">
                <Form.Label className="label">名称：</Form.Label>
                <Form.ValidityState>
                  {(validity) => (
                    <>
                      <Form.Control asChild>
                        <input
                          type="text"
                          placeholder="webhook"
                          defaultValue={props.webhook.name}
                          className={
                            "input input-sm md:input-md input-bordered" +
                            (validity?.valueMissing ? " input-error" : "")
                          }
                          required // 确保字段是必填的
                        />
                      </Form.Control>
                      <label className="label">
                        {(() => {
                          if (validity?.valueMissing) {
                            return (
                              <label className="label-text-alt text-error">名称是必须的。</label>
                            );
                          } else {
                            return (
                              <label className="label-text-alt">
                                用于显示的友好名称，供您参考。
                              </label>
                            );
                          }
                        })()}
                      </label>
                    </>
                  )}
                </Form.ValidityState>
              </Form.Field>
              <Form.Field name="url" className="form-control">
                <Form.Label className="label">URL：</Form.Label>
                <Form.ValidityState>
                  {(validity) => (
                    <>
                      <Form.Control asChild type="url">
                        <input
                          placeholder="https://example.com/webhooks"
                          defaultValue={props.webhook.url}
                          className={
                            "input input-sm md:input-md input-bordered" +
                            (validity?.valid === false ? " input-error" : "")
                          }
                          required // 确保字段是必填的
                        />
                      </Form.Control>
                      <label className="label">
                        {(() => {
                          if (validity?.valueMissing) {
                            return (
                              <label className="label-text-alt text-error">URL是必须的。</label>
                            );
                          }
                          if (validity?.typeMismatch) {
                            return (
                              <label className="label-text-alt text-error">请输入有效的URL。</label>
                            );
                          } else {
                            return (
                              <label className="label-text-alt">
                                将根据以下选定的事件将 POST 请求发送到该 URL。
                              </label>
                            );
                          }
                        })()}
                      </label>
                    </>
                  )}
                </Form.ValidityState>
              </Form.Field>
              <div className="mt-2">事件：</div>
              <div className="max-h-[20vh] overflow-y-auto">
                <div className="flex flex-wrap">
                  {Object.keys(EventList).map((event) => {
                    const eventName = EventList[event as keyof typeof EventList] || event;
                    return (
                      <label key={eventName} className="cursor-pointer p-0 m-2 label mr-4">
                        <input
                          value={event}
                          type="checkbox"
                          name="bindEvents"
                          className="checkbox-sm md:checkbox-md checkbox mr-2"
                          defaultChecked={props.webhook.bindEvents.includes(event)}
                        />
                        <span className="label-text text-xs md:text-sm">{eventName}</span>
                      </label>
                    );
                  })}
                </div>
                {custemEventList.map((event, index) => {
                  return (
                    <label key={index} className="cursor-pointer p-0 m-2 label mr-4">
                      <input
                        className="checkbox-sm md:checkbox-md checkbox mr-2"
                        type="checkbox"
                        checked={event.checked}
                        onChange={(e) => {
                          const checked = e.target.checked;
                          setCustemEventList((prev) => {
                            prev[index].checked = checked;
                            return [...prev];
                          });
                        }}
                      />
                      <input
                        type="text"
                        className="flex-1 input input-sm input-bordered"
                        placeholder="请输入自定义事件名称"
                        defaultValue={event.name}
                        onChange={(e) => {
                          const name = e.target.value;
                          setCustemEventList((prev) => {
                            prev[index].name = name;
                            return [...prev];
                          });
                        }}
                      />
                    </label>
                  );
                })}
                {/* 添加自定义事件 */}
              </div>
              <button
                className="btn btn-sm btn-primary m-2"
                type="button"
                onClick={() => {
                  setCustemEventList([
                    ...custemEventList,
                    {
                      name: "",
                      checked: true,
                    },
                  ]);
                }}
              >
                <Icon icon="basil:add-outline" className="w-5 h-5" />
                添加自定义事件
              </button>
              <Form.Submit asChild>
                <button className="mt-6 w-full btn btn-primary">保存</button>
              </Form.Submit>
            </Form.Root>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export interface IWebhook {
  id?: number;
  name: string;
  url: string;
  bindEvents: string[];
}

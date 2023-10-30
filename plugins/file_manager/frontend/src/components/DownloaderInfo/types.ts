export interface FileDetail {
  name: string;
  hash: string;
  save_path: string;
  content_path: string;
  progress: number;
  size: number;
  size_str: string;
  dlspeed: number;
  dlspeed_str: string;
  upspeed: number;
  upspeed_str: string;
  uploaded: number;
  uploaded_str: string;
  seeding_time: number;
  downloaded: number;
  downloaded_str: string;
  ratio: number;
  tracker: string;
}

export type DataSource = { [path: string]: { [hash: string]: FileDetail } };

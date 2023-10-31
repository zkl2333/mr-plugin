export interface TableColumn {
  key: string; // 这用于从每行数据中获取对应值
  label: string; // 表头的文本
  render?: (item: any) => JSX.Element; // 用于自定义渲染列的内容
}

export interface TableDataItem {
  [key: string]: any;
}

export interface DataTableProps {
  columns: TableColumn[];
  data: TableDataItem[];
  className?: string;
  onSelect?: (item: TableDataItem) => void;
}

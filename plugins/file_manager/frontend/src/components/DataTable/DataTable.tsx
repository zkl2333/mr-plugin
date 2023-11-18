import React, { useCallback, useEffect, useState } from "react";
import { DataTableProps } from "./types";
import classNames from "classnames";
import { Button, Select } from "@radix-ui/themes";
import { Icon } from "@iconify/react/dist/iconify.js";

const DataTable: React.FC<DataTableProps> = ({
  columns,
  data,
  onSelect,
  className,
  rowKey = "id",
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const totalPages = Math.ceil(data.length / itemsPerPage);
  const [selectedRows, setSelectedRows] = useState<any[]>([]);

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentPageData = data.slice(startIndex, endIndex);

  const setPage = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  const isRowSelected = useCallback(
    (item: { [x: string]: any }) => selectedRows.some((row) => row[rowKey] === item[rowKey]),
    [rowKey, selectedRows]
  );

  const handleRowClick = useCallback(
    (item: { [x: string]: any }) => {
      if (isRowSelected(item)) {
        setSelectedRows(selectedRows.filter((row) => item[rowKey] !== row[rowKey]));
      } else {
        setSelectedRows([...selectedRows, item]);
      }
    },
    [isRowSelected, selectedRows, rowKey]
  );

  const handleSelectAll = useCallback(() => {
    if (selectedRows.length === currentPageData.length) {
      setSelectedRows([]);
    } else {
      setSelectedRows([...currentPageData]);
    }
  }, [currentPageData, selectedRows]);

  useEffect(() => {
    onSelect?.(selectedRows);
  }, [onSelect, selectedRows]);

  return (
    <>
      <div className="overflow-x-auto">
        <table className={classNames("table table-xs", className)}>
          <thead>
            <tr>
              <td>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    className="checkbox checkbox-sm"
                    onChange={handleSelectAll}
                    checked={selectedRows.length === currentPageData.length}
                    readOnly
                  />
                </div>
              </td>
              {columns.map((col) => (
                <th key={col.key}>
                  {typeof col.label === "function" ? col.label(col) : col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {currentPageData.map((item) => (
              <tr
                key={item[rowKey]}
                onClick={() => {
                  handleRowClick(item);
                }}
                className="hover cursor-pointer"
              >
                <td>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      className="checkbox checkbox-sm"
                      checked={isRowSelected(item)}
                      readOnly
                    />
                  </div>
                </td>
                {columns.map((col) => (
                  <td key={col.key}>{col.render ? col.render(item) : item[col.key]}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex items-center mt-2">
        <div className="text-sm text-content">
          {/* 共 {data.length} 条记录，当前选中 {selectedRows.length} 条 */}
          {selectedRows.length} / {data.length}
        </div>
        <div className="flex-1"></div>
        <div className="join">
          {totalPages > 1 &&
            (() => {
              const pages = [];
              // 显示 首尾和当前页的前后两页
              for (let i = 1; i <= totalPages; i++) {
                if (i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) {
                  pages.push(
                    <Button
                      key={i}
                      variant={i === currentPage ? "solid" : "soft"}
                      className={classNames("join-item")}
                      onClick={() => setPage(i)}
                    >
                      {i}
                    </Button>
                  );
                } else if (i === currentPage - 3 || i === currentPage + 3) {
                  pages.push(
                    <Button variant="soft" className="join-item" highContrast>
                      <Icon icon="bi:three-dots" className="w-4 h-4" />
                    </Button>
                  );
                }
              }
              return pages;
            })()}
          <Select.Root
            defaultValue={String(itemsPerPage)}
            onValueChange={(value) => {
              setItemsPerPage(Number(value));
              setCurrentPage(1);
            }}
          >
            <Select.Trigger variant="soft" className="join-item" />
            <Select.Content>
              <Select.Item value={"10"}>每页 10 条</Select.Item>
              <Select.Item value={"20"}>每页 20 条</Select.Item>
              <Select.Item value={"50"}>每页 50 条</Select.Item>
              <Select.Item value={"100"}>每页 100 条</Select.Item>
            </Select.Content>
          </Select.Root>
        </div>
      </div>
    </>
  );
};

export default DataTable;

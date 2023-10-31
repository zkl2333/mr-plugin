import React from "react";
import { DataTableProps } from "./types";
import classNames from "classnames";

const DataTable: React.FC<DataTableProps> = ({ columns, data, onSelect, className }) => {
  return (
    <div className="overflow-x-auto">
      <table className={classNames("table table-xs", className)}>
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={col.key}>{col.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((item, rowIndex) => (
            <tr
              key={rowIndex}
              onClick={() => {
                onSelect && onSelect(item);
              }}
              className="hover cursor-pointer"
            >
              {columns.map((col) => (
                <td key={col.key}>{col.render ? col.render(item) : item[col.key]}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DataTable;

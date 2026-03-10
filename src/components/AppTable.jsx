import React from "react";
import { Table, Empty } from "antd";

export default function AppTable({
  rowKey = "_id",
  columns,
  dataSource,
  loading,
  pagination,
  onChange,
  className = "",
  ...rest
}) {
  return (
    <div className={["rounded-xl border border-[#ece9e4] bg-white", className].join(" ")}>
      <Table
        rowKey={rowKey}
        columns={columns}
        dataSource={dataSource}
        loading={loading}
        pagination={pagination}
        onChange={onChange}
        size="middle"
        locale={{
          emptyText: (
            <div className="py-8">
              <Empty description="No data" />
            </div>
          ),
        }}
        {...rest}
      />
    </div>
  );
}


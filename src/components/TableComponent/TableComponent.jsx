import { Table } from "antd";
import React from "react";
import Loading from "../LoadingComponent/Loading";
import EmptyState from "../ui/states/EmptyState";

const TableComponent = (props) => {
    const {
        selectionType = 'checkbox',
        data = [],
        isPending = false,
        columns = [],
        onSelectRows,
        scroll,
        pagination,
        ...tableProps
    } = props;

    const rowSelection = onSelectRows
        ? {
            onChange: onSelectRows,
            getCheckboxProps: (record) => ({
                disabled: record.name === 'Disabled User',
                name: record.name,
            }),
        }
        : undefined;

    return (
        <Loading isPending={isPending}>
            <Table
                rowSelection={rowSelection ? { type: selectionType, ...rowSelection } : undefined}
                columns={columns}
                dataSource={data}
                scroll={scroll || { x: 960 }}
                pagination={
                    pagination || {
                        pageSize: 10,
                        showSizeChanger: true,
                        pageSizeOptions: ["10", "20", "50"],
                        showTotal: (total, range) => `${range[0]}-${range[1]} / ${total}`,
                    }
                }
                locale={{ emptyText: <EmptyState description="Không có dữ liệu" /> }}
                {...tableProps}
            />
        </Loading>
    );
};

export default TableComponent;

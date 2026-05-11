import { Table } from "antd";
import React from "react";
import Loading from "../LoadingComponent/Loading";

const TableComponent=(props)=>{
    const { selectionType='checkbox', data=[], isPending=false, columns=[], onSelectRows, ...tableProps }= props

    const rowSelection = {
        onChange: onSelectRows,
        getCheckboxProps:(record)=>({
            disabled:record.name==='Disabled User',
            name: record.name,
        })
    };
    return(
        <Loading isPending={isPending}>
            <Table
                rowSelection={{
                    type : selectionType,
                    ...rowSelection,
                }}
                columns={columns}
                dataSource={data}
                {...tableProps}
            />
        </Loading>
    )    
    
}
export default TableComponent

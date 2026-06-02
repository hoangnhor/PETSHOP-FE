import { Spin } from "antd";
import React from "react";

const Loading = ({ children, isPending, delay = 250, tip = "Đang khởi tạo phiên làm việc..." }) => {
    return (
        <div aria-busy={isPending} aria-live="polite">
            <Spin spinning={isPending} delay={delay} tip={isPending ? tip : undefined}>
                {children}
            </Spin>
        </div>
    );
};

export default Loading;

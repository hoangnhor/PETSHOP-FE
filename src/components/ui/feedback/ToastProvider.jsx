import { useEffect } from "react";
import { App } from "antd";
import { bindToastMessageApi } from "./Toast";

const ToastProvider = () => {
  const { message } = App.useApp();

  useEffect(() => {
    bindToastMessageApi(message);
  }, [message]);

  return null;
};

export default ToastProvider;

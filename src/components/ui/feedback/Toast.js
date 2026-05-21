import { message } from "antd";

const Toast = {
  success: (content) => message.success(content),
  error: (content) => message.error(content),
  warning: (content) => message.warning(content),
  info: (content) => message.info(content),
};

export default Toast;

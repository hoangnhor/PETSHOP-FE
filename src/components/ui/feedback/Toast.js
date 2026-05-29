import { message as staticMessage } from "antd";

let messageApi = staticMessage;

export const bindToastMessageApi = (nextMessageApi) => {
  if (nextMessageApi) {
    messageApi = nextMessageApi;
  }
};

const Toast = {
  success: (content) => messageApi.success(content),
  error: (content) => messageApi.error(content),
  warning: (content) => messageApi.warning(content),
  info: (content) => messageApi.info(content),
};

export default Toast;

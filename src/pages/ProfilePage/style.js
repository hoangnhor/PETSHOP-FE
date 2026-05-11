import { Upload } from "antd";
import styled from "styled-components";

export const WrapperHeader = styled.h1`
    color:#000;
    font-size:22px;
    margin:4px 0;
`
export const WrapperContentProfile = styled.div`
    display:flex;
    flex-direction:column;
    border: 1px solid rgba(198,169,105,.24);
    background:rgba(255,255,255,.85);
    width: min(760px, 100%);
    margin: 0 auto;
    padding:32px;
    border-radius:20px;
    gap:18px;
    box-shadow:0 20px 40px rgba(26,26,26,.1);
`

export const WrapperLabel = styled.label`
    color:#1A1A1A;
    font-size:15px;
    line-height:24px;
    font-weight:600;
    width:96px;
    text-align:left;
`
export const WrapperInput = styled.div`
    display:flex;
    align-items:center;
     gap:12px;
`
export const WrapperUploadFile = styled(Upload)`
    & .ant-upload.ant-upload-select.ant-upload-select-picture-card {
        width:60px;
        height: 60px;
        border-radius: 50%;
    }
    & .ant-upload-list-item-info{
        display:none;
    }
`

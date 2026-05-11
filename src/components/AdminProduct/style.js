import { Upload } from "antd";
import styled from "styled-components";

export const WrapperHeader = styled.h1`
    color: #1A1A1A;
    font-size: 34px;
    font-weight:700;
    margin:0 0 14px;

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
    & .ant-upload-list-item{
        display:none; 
    }
`

import { Input } from "antd";
import styled from "styled-components";

export const WrapperInputStyle=styled(Input)`
    height:44px;
    border-radius:12px;
    border:1px solid rgba(198,169,105,.28);
    font-size: 15px;
    outline:none;
    background:rgba(255,255,255,.86);
    box-shadow:none;
    &:hover,
    &:focus,
    &:focus-within{
        border-color:#C6A969;
        box-shadow:0 0 0 3px rgba(198,169,105,.14);
        background:#fff;
    }
    `

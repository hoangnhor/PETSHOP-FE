import  Slider  from "react-slick";
import styled from "styled-components";

export const WrapperSliderStyle=styled(Slider)`
    height:100%;
    border-radius:0;
    overflow:hidden;
    background:#f7f3ed;

    img {
        display:block;
        width:100%;
        height:100% !important;
        object-fit:contain;
        object-position:center center;
        background:#f7f3ed;
    }

    .slick-slider,
    .slick-list,
    .slick-track,
    .slick-slide,
    .slick-slide > div {
        height:100%;
    }

    & .slick-arrow.slick-prev{
        left:18px;
        top:50%;
        z-index:10;
        &::before{
            font-size:32px;
            color:#F8F5F0;
        } 
    }
        & .slick-arrow.slick-next{
        right:28px;
        top:50%;
        z-index:10;
        &::before{
             font-size:32px;
            color:#F8F5F0;
        }
    }
        & .slick-dots{
            z-index:10;
            bottom:8px !important;       
        li{
            button{
                &::before{   
                    color:rgba(255,255,255,0.55);
                }
            }
        }
        li.slick-active{
            button{
                    &::before{
                         color:#F8F5F0;
                }
            }
        }
    }

`

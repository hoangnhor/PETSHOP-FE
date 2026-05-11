import  Slider  from "react-slick";
import styled from "styled-components";

export const WrapperSliderStyle=styled(Slider)`
    border-radius:20px;
    overflow:hidden;
    box-shadow:0 24px 50px rgba(26, 26, 26, 0.16);
    background:#1A1A1A;

    .ant-image {
        display:block;
    }

    img {
        object-fit:cover;
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
            bottom:-2px !important;       
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

    @media (max-width: 768px) {
        .ant-image-img {
            height:280px !important;
        }
    }
`

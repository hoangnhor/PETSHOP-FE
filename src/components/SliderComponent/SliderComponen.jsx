import React from "react";
import { WrapperSliderStyle } from "./style";



//baner
const SliderComponen =({arrImages})=>{
    const settings = {
        dots: true,
        infinite: true,
        speed: 500,
        slidesToShow: 1,
        slidesToScroll: 1,
        autoplay:true,
        autoplaySpeed:1500
      };
    return (
        <WrapperSliderStyle {...settings}>
            {arrImages.map((image)=>{
                return (
                    <img key={image} src={image} alt="slider" />
                )
            })}
        </WrapperSliderStyle>
    )
}
export default SliderComponen;

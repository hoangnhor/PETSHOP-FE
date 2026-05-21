import React from "react";
import { PetshopButton } from "../ui";

const ButtonComponent=( {size, styleButton,styleTextButton,textButton,disabled,...rests})=>{
    const safeStyleButton = styleButton || {};
    return (
        <PetshopButton
        style={{
            ...safeStyleButton,
            background: disabled ? '#ccc': safeStyleButton.background
        }}
        size={size} 
        
        {...rests}
       // icon ={< SearchOutlined  style={{color: colorButton}} />} 
         ><span style={styleTextButton}>{textButton}</span>
    </PetshopButton>
    )
}
export default ButtonComponent;

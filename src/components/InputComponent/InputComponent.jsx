import React from "react";
import { PetshopInput } from "../ui";

const InputComponent =({size,placeholder,bordered,style,...rests})=>{
    return (
            <PetshopInput 
            size={size} 
            placeholder ={placeholder } 
           
            style={style}  
            {...rests}
            />
    
    )
}
export default InputComponent;

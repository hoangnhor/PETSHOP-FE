import Toast from "../ui/feedback/Toast";

const success= (mes = 'Success')=>{
    Toast.success(mes);
};
const error= (mes = 'Error')=>{
    Toast.error(mes);
};
const warning= (mes = 'Warning')=>{
    Toast.warning(mes);
};
export{success,error,warning}

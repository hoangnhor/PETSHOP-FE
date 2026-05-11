import React, { useEffect, useState } from "react";
import { WrapperContainerLeft, WrapperContainerRight, WrapperTextlight } from "./style";
import InputFormComponent from "../../components/InputFormComponent/InputFormComponent";
import ButtonComponent from "../../components/ButtonComponent/ButtonComponent";
import imagelogo from "../../assets/images/signIn.webp";
import { Image } from "antd";
import { EyeFilled, EyeInvisibleFilled } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import * as UserServices from '../../services/UserServices';
import { useMutationHook } from "../../hooks/useMutationHook";
import Loading from "../../components/LoadingComponent/Loading";
import * as message from '../../components/Message/Message';

const SignUpPage = () => {
  const [isShowPassword, setIsShowPassword] = useState(false);
  const [isShowConFirmPassword, setIsShowConFirmPassword] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const navigate = useNavigate();

  const mutation = useMutationHook(
    data => UserServices.SignupUser(data)
  );
  const { data, isPending, isSuccess, isError } = mutation;

  useEffect(() => {
    if (isSuccess && data?.status === 'OK') {
      message.success('Đăng ký thành công!');
      navigate('/sign-in');
    } else if (isError || data?.status === 'ERR') {
      message.error(data?.message || 'Đăng ký thất bại!');
    }
  }, [isSuccess, isError, data, navigate]);

  const handleOnchangeName = (value) => setName(value);
  const handleOnchangeEmail = (value) => setEmail(value);
  const handleOnchangePassword = (value) => setPassword(value);
  const handleOnchangeConfirmPassword = (value) => setConfirmPassword(value);

  const handleSignUp = () => {
    if (!name) {
      message.error('Vui lòng nhập họ và tên');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      message.error('Email không hợp lệ');
      return;
    }
    if (password !== confirmPassword) {
      message.error('Mật khẩu không khớp');
      return;
    }
    mutation.mutate({ name, email, password, confirmPassword });
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg,#f8f5f0,#e7d7be)', minHeight: '100vh', padding: '18px' }}>
      <div style={{ width: '1100px', maxWidth: '100%', minHeight: '540px', borderRadius: '18px', background: 'rgba(255,255,255,.78)', backdropFilter: 'blur(10px)', border: '1px solid rgba(198,169,105,.25)', display: 'flex', overflow: 'hidden', boxShadow: '0 26px 55px rgba(26,26,26,.14)' }}>
        <WrapperContainerLeft>
          <h1 style={{ fontSize: 48, margin: 0, color: '#1A1A1A', fontWeight: 700 }}>Create Account</h1>
          <p style={{ fontSize: 16, color: '#555', margin: '8px 0 18px' }}>Vui lòng nhập thông tin để bắt đầu</p>
          <InputFormComponent style={{ marginBottom: '20px' }} placeholder='Họ và tên' value={name} onChange={handleOnchangeName} />
          <InputFormComponent style={{ marginBottom: '20px' }} placeholder='Email' value={email} onChange={handleOnchangeEmail} />
          <div style={{ position: 'relative' }}>
            <span
              onClick={() => setIsShowPassword(!isShowPassword)}
              style={{ zIndex: 10, position: 'absolute', top: '4px', right: '8px' }}
            >
              {isShowPassword ? <EyeFilled /> : <EyeInvisibleFilled />}
            </span>
            <InputFormComponent
              style={{ marginBottom: '30px' }}
              placeholder='Mật khẩu'
              type={isShowPassword ? "text" : "password"}
              value={password}
              onChange={handleOnchangePassword}
            />
          </div>
          <div style={{ position: 'relative' }}>
            <span
              onClick={() => setIsShowConFirmPassword(!isShowConFirmPassword)}
              style={{ zIndex: 10, position: 'absolute', top: '4px', right: '8px' }}
            >
              {isShowConFirmPassword ? <EyeFilled /> : <EyeInvisibleFilled />}
            </span>
            <InputFormComponent
              placeholder='Nhập lại mật khẩu'
              type={isShowConFirmPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={handleOnchangeConfirmPassword}
            />
          </div>
          {data?.status === 'ERR' && <span style={{ color: 'red' }}>{data?.message}</span>}
          <Loading isPending={isPending}>
            <ButtonComponent
              disabled={!name.length || !email.length || !password.length || !confirmPassword.length}
              onClick={handleSignUp}
              size={30}
              type="primary"
              styleButton={{
                height: '45px',
                width: '200px',
                border: 'none',
                borderRadius: '12px',
                margin: '30px 120px 30px',
                background: '#1A1A1A'
              }}
              textButton={'Đăng Ký'}
              styleTextButton={{ color: '#fff', fontSize: '17px', fontWeight: '700' }}
            />
          </Loading>
          <p style={{ fontSize: '20px' }}>
            Bạn đã có tài khoản? <WrapperTextlight onClick={() => navigate('/sign-in')}>Đăng nhập</WrapperTextlight>
          </p>
        </WrapperContainerLeft>
        <WrapperContainerRight>
          <Image src={imagelogo} preview={false} alt="image-logo" height='203' width='203' />
        </WrapperContainerRight>
      </div>
    </div>
  );
};

export default SignUpPage;  

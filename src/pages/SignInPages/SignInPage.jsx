import React, { useCallback, useEffect, useState } from "react";
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
import { jwtDecode } from "jwt-decode";
import { useDispatch } from "react-redux";
import { updateUser } from "../../redux/slides/userSlider";

const SignInPage = () => {
  const [isShowPassword, setIsShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const mutation = useMutationHook(
    data => UserServices.loginUser(data)
    
  );
  
  const { data, isPending, isSuccess, isError } = mutation;

  const handleGetDetailsUser = useCallback(async (id, token) => {
    try {
      const res = await UserServices.getDetailsUser(id, token);
      if (res?.status === 'OK') {
        dispatch(updateUser({ ...res?.data, access_token: token }));
      }
    } catch (error) {
      message.error('Lỗi khi lấy thông tin người dùng!');
    }
  }, [dispatch]);

  useEffect(() => {
    if (isSuccess && data?.status === 'OK') {
      message.success('Đăng nhập thành công!');
      localStorage.setItem('access_token', JSON.stringify(data?.access_token));
      if (data?.access_token) {
        const decoded = jwtDecode(data?.access_token);
        if (decoded?.id) {
          handleGetDetailsUser(decoded?.id, data?.access_token);
        }
      }
      navigate('/');
    } else if (isError || data?.status === 'ERR') {
      message.error(data?.message || 'Đăng nhập thất bại!');
    }
  }, [isSuccess, isError, data, navigate, handleGetDetailsUser]);

  const handleOnchangeEmail = (value) => setEmail(value);
  const handleOnchangePassword = (value) => setPassword(value);

  const handleSignIn = () => {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      message.error('Email không hợp lệ');
      return;
    }
    mutation.mutate({ email, password });
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg,#f8f5f0,#e7d7be)', minHeight: '100vh', padding: '18px' }}>
      <div style={{ width: '1100px', maxWidth: '100%', minHeight: '540px', borderRadius: '18px', background: 'rgba(255,255,255,.78)', backdropFilter: 'blur(10px)', border: '1px solid rgba(198,169,105,.25)', display: 'flex', overflow: 'hidden', boxShadow: '0 26px 55px rgba(26,26,26,.14)' }}>
        <WrapperContainerLeft>
          <h1 style={{ fontSize: 48, margin: 0, color: '#1A1A1A', fontWeight: 700 }}>Welcome Back</h1>
          <p style={{ fontSize: '16px', color: '#555', margin: '8px 0 22px' }}>Đăng nhập để tiếp tục trải nghiệm mua sắm cao cấp</p>
          <InputFormComponent
            style={{ marginBottom: '20px' }}
            placeholder='Email'
            value={email}
            onChange={handleOnchangeEmail}
          />
          <div style={{ position: 'relative' }}>
            <span
              onClick={() => setIsShowPassword(!isShowPassword)}
              style={{ zIndex: 10, position: 'absolute', top: '4px', right: '8px' }}
            >
              {isShowPassword ? <EyeFilled /> : <EyeInvisibleFilled />}
            </span>
            <InputFormComponent
              placeholder='Mật khẩu'
              type={isShowPassword ? "text" : "password"}
              value={password}
              onChange={handleOnchangePassword}
            />
          </div>
          {data?.status === 'ERR' && <span style={{ color: 'red' }}>{data?.message}</span>}
          <Loading isPending={isPending}>
            <ButtonComponent
              disabled={!email.length || !password.length}
              onClick={handleSignIn}
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
              textButton={'Đăng nhập'}
              styleTextButton={{ color: '#fff', fontSize: '17px', fontWeight: '700' }}
            />
          </Loading>
          <WrapperTextlight>Quên mật khẩu?</WrapperTextlight>
          <p style={{ fontSize: '20px' }}>
            Chưa có tài khoản? <WrapperTextlight onClick={() => navigate('/sign-up')}> Tạo tài khoản</WrapperTextlight>
          </p>
        </WrapperContainerLeft>
        <WrapperContainerRight>
          <Image src={imagelogo} preview={false} alt="image-logo" height='203' width='203' />
        </WrapperContainerRight>
      </div>
    </div>
  );
};

export default SignInPage;

import React, { useCallback, useEffect, useState } from "react";
import { WrapperContentProfile, WrapperInput, WrapperLabel, WrapperUploadFile } from "./style";
import InputFormComponent from "../../components/InputFormComponent/InputFormComponent";
import ButtonComponent from "../../components/ButtonComponent/ButtonComponent";
import { useDispatch, useSelector } from "react-redux";
import * as UserServices from '../../services/UserServices';
import { useMutationHook } from "../../hooks/useMutationHook";
import Loading from "../../components/LoadingComponent/Loading";
import { Button } from "antd";
import { useQuery } from "@tanstack/react-query";
import * as BillServices from "../../services/BillServices";
import { useNavigate } from "react-router-dom";
import { updateUser } from "../../redux/slides/userSlider";
import * as message from '../../components/Message/Message';
import { UploadOutlined } from '@ant-design/icons';
import { getBase64 } from "../../utils";
import FooterComponent from "../../components/FooterComponent/FooterComponent"; // Import FooterComponent

const ProfilePage = () => {
    const user = useSelector((state) => state.user);
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [address, setAddress] = useState('');
    const [avatar, setAvatar] = useState('');

    const mutation = useMutationHook(
        (data) => {
            const { id, access_token, ...rests } = data;
            return UserServices.updateUser(id, rests, access_token);
        }
    );

    const dispatch = useDispatch();
    const { isPending, isSuccess, isError } = mutation;
    const ordersQuery = useQuery({
        queryKey: ["profile-order-count", user?.access_token],
        queryFn: () => BillServices.getAllBill(user?.access_token),
        enabled: Boolean(user?.access_token),
    });
    const wishlistCount = JSON.parse(localStorage.getItem("wishlistItems") || "[]").length;

    const handleGetDetailsUser = useCallback(async (id, token) => {
        const res = await UserServices.getDetailsUser(id, token);
        dispatch(updateUser({ ...res?.data, access_token: token }));
    }, [dispatch]);

    useEffect(() => {
        setEmail(user?.email);
        setName(user?.name);
        setPhone(user?.phone);
        setAddress(user?.address);
        setAvatar(user?.avatar);
    }, [user]);

    useEffect(() => {
        if (isSuccess) {
            message.success('Cập nhật thông tin thành công');
            handleGetDetailsUser(user?.id, user?.access_token);
        } else if (isError) {
            message.error('Cập nhật thông tin thất bại');
        }
    }, [isSuccess, isError, handleGetDetailsUser, user?.id, user?.access_token]);

    const handleOnchangeEmail = (value) => { setEmail(value); };
    const handleOnchangeName = (value) => { setName(value); };
    const handleOnchangePhone = (value) => { setPhone(value); };
    const handleOnchangeAddress = (value) => { setAddress(value); };
    const handleOnchangeAvatar = async ({ fileList }) => {
        const file = fileList[0];
        if (!file) {
            setAvatar('');
            return;
        }
        if (!file.url && !file.preview) {
            file.preview = await getBase64(file.originFileObj);
        }
        setAvatar(file.preview);
    };

    const handleUpdate = () => {
        mutation.mutate({ id: user?.id, email, name, phone, address, avatar, access_token: user?.access_token });
    };

    return (
        <div style={{ width: '100%', background: 'transparent', marginTop: "0" }}>
            <div style={{ width: 'min(1240px, calc(100% - 40px))', margin: '0 auto', minHeight: '500px', padding: "30px 0 40px" }}>
                <Loading isPending={isPending}>
                    <WrapperContentProfile style={{ marginTop: "0" }}>
                        <h2 style={{ margin: 0, color: "#1A1A1A", fontSize: 44 }}>My Profile</h2>
                        <p style={{ margin: "2px 0 8px", color: "#555" }}>Quản lý thông tin tài khoản petshop của bạn</p>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 10 }}>
                            <div style={{ border: "1px solid rgba(198,169,105,.24)", borderRadius: 14, padding: 12, background: "rgba(255,255,255,.84)" }}>
                                <p style={{ margin: 0, color: "#888", fontSize: 12 }}>Orders</p>
                                <strong style={{ color: "#1A1A1A", fontSize: 28 }}>{ordersQuery.data?.data?.length || 0}</strong>
                            </div>
                            <div style={{ border: "1px solid rgba(198,169,105,.24)", borderRadius: 14, padding: 12, background: "rgba(255,255,255,.84)" }}>
                                <p style={{ margin: 0, color: "#888", fontSize: 12 }}>Wishlist</p>
                                <strong style={{ color: "#1A1A1A", fontSize: 28 }}>{wishlistCount}</strong>
                            </div>
                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                <Button onClick={() => navigate("/order-history")} style={{ borderRadius: 999 }}>Order History</Button>
                                <Button onClick={() => navigate("/wishlist")} style={{ borderRadius: 999 }}>Wishlist</Button>
                            </div>
                        </div>
                        <WrapperInput>
                            <WrapperLabel htmlFor="name">Name:</WrapperLabel>
                            <InputFormComponent style={{ width: '300px' }} id="name" value={name} onChange={handleOnchangeName} />
                            <ButtonComponent
                                onClick={handleUpdate}
                                size={30}
                                styleButton={{
                                    height: '45px',
                                    width: 'fit-content',
                                    border: '1px solid rgba(198,169,105,.32)',
                                    borderRadius: '12px',
                                    background: "#1A1A1A"
                                }}
                                textButton={'Cập nhật'}
                                styleTextButton={{ color: '#fff', fontSize: '14px', fontWeight: '600' }}
                            />
                        </WrapperInput>
                        <WrapperInput>
                            <WrapperLabel htmlFor="email">Email:</WrapperLabel>
                            <InputFormComponent style={{ width: '300px' }} id="email" value={email} onChange={handleOnchangeEmail} />
                            <ButtonComponent
                                onClick={handleUpdate}
                                size={30}
                                styleButton={{
                                    height: '45px',
                                    width: 'fit-content',
                                    border: '1px solid rgba(198,169,105,.32)',
                                    borderRadius: '12px',
                                    background: "#1A1A1A"
                                }}
                                textButton={'Cập nhật'}
                                styleTextButton={{ color: '#fff', fontSize: '14px', fontWeight: '600' }}
                            />
                        </WrapperInput>
                        <WrapperInput>
                            <WrapperLabel htmlFor="phone">Phone:</WrapperLabel>
                            <InputFormComponent style={{ width: '300px' }} id="phone" value={phone} onChange={handleOnchangePhone} />
                            <ButtonComponent
                                onClick={handleUpdate}
                                size={30}
                                styleButton={{
                                    height: '45px',
                                    width: 'fit-content',
                                    border: '1px solid rgba(198,169,105,.32)',
                                    borderRadius: '12px',
                                    background: "#1A1A1A"
                                }}
                                textButton={'Cập nhật'}
                                styleTextButton={{ color: '#fff', fontSize: '14px', fontWeight: '600' }}
                            />
                        </WrapperInput>
                        <WrapperInput>
                            <WrapperLabel htmlFor="address">Address:</WrapperLabel>
                            <InputFormComponent style={{ width: '300px' }} id="address" value={address} onChange={handleOnchangeAddress} />
                            <ButtonComponent
                                onClick={handleUpdate}
                                size={30}
                                styleButton={{
                                    height: '45px',
                                    width: 'fit-content',
                                    border: '1px solid rgba(198,169,105,.32)',
                                    borderRadius: '12px',
                                    background: "#1A1A1A"
                                }}
                                textButton={'Cập nhật'}
                                styleTextButton={{ color: '#fff', fontSize: '14px', fontWeight: '600' }}
                            />
                        </WrapperInput>
                        <WrapperInput>
                            <WrapperLabel htmlFor="avatar">Avatar:</WrapperLabel>
                            <WrapperUploadFile beforeUpload={() => false} onChange={handleOnchangeAvatar} maxCount={1}>
                                <Button icon={<UploadOutlined />}> Chọn file</Button>
                            </WrapperUploadFile>
                            {avatar && (
                                <img src={avatar} style={{ height: '60px', width: '60px', borderRadius: '50%', objectFit: 'cover' }} alt="avatar" />
                            )}
                            <ButtonComponent
                                onClick={handleUpdate}
                                size={30}
                                styleButton={{
                                    height: '45px',
                                    width: 'fit-content',
                                    border: '1px solid rgba(198,169,105,.32)',
                                    borderRadius: '12px',
                                    background: "#1A1A1A"
                                }}
                                textButton={'Cập nhật'}
                                styleTextButton={{ color: '#fff', fontSize: '14px', fontWeight: '600' }}
                            />
                        </WrapperInput>
                    </WrapperContentProfile>
                </Loading>
            </div>
            <FooterComponent />
        </div>
    );
};

export default ProfilePage;

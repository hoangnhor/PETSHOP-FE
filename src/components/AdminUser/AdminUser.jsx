import React, { useState } from "react";
import { WrapperHeader } from "./style";
import { Button, Form, Input, Modal, Popconfirm, Space, Switch, Table, Tag } from "antd";
import { DeleteOutlined, EditOutlined, PlusOutlined } from "@ant-design/icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import * as UserServices from "../../services/UserServices";
import * as message from "../Message/Message";

const AdminUser = () => {
    const user = useSelector((state) => state.user);
    const queryClient = useQueryClient();
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [createForm] = Form.useForm();
    const [editForm] = Form.useForm();

    const usersQuery = useQuery({
        queryKey: ["admin-users", user.access_token],
        queryFn: () => UserServices.getAllUser(user.access_token),
        enabled: Boolean(user.access_token),
    });

    const refreshUsers = () => queryClient.invalidateQueries({ queryKey: ["admin-users"] });

    const createMutation = useMutation({
        mutationFn: (values) => UserServices.createUser(values, user.access_token),
        onSuccess: (res) => {
            if (res?.status === "OK") {
                message.success("Tạo người dùng thành công");
                createForm.resetFields();
                setIsCreateOpen(false);
                refreshUsers();
            } else {
                message.error(res?.message || "Tạo người dùng thất bại");
            }
        },
        onError: (error) => message.error(error?.message || "Tạo người dùng thất bại"),
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, values }) => UserServices.updateUser(id, values, user.access_token),
        onSuccess: (res) => {
            if (res?.status === "OK") {
                message.success("Cập nhật người dùng thành công");
                setEditingUser(null);
                refreshUsers();
            } else {
                message.error(res?.message || "Cập nhật thất bại");
            }
        },
        onError: (error) => message.error(error?.message || "Cập nhật thất bại"),
    });

    const deleteMutation = useMutation({
        mutationFn: (id) => UserServices.deleteUser(id, user.access_token),
        onSuccess: (res) => {
            if (res?.status === "OK") {
                message.success("Xóa người dùng thành công");
                refreshUsers();
            } else {
                message.error(res?.message || "Xóa người dùng thất bại");
            }
        },
        onError: (error) => message.error(error?.message || "Xóa người dùng thất bại"),
    });

    const openEdit = (record) => {
        setEditingUser(record);
        editForm.setFieldsValue({
            name: record.name,
            email: record.email,
            phone: record.phone,
            address: record.address,
            isAdmin: Boolean(record.isAdmin),
        });
    };

    const handleUpdate = (values) => {
        const payload = { ...values };
        if (!payload.password) delete payload.password;
        updateMutation.mutate({ id: editingUser._id, values: payload });
    };

    const columns = [
        {
            title: "Tên",
            dataIndex: "name",
        },
        {
            title: "Email",
            dataIndex: "email",
        },
        {
            title: "Số điện thoại",
            dataIndex: "phone",
        },
        {
            title: "Vai trò",
            dataIndex: "isAdmin",
            render: (isAdmin) => (
                <Tag color={isAdmin ? "red" : "blue"}>{isAdmin ? "Admin" : "Khách hàng"}</Tag>
            ),
        },
        {
            title: "Ngày tạo",
            dataIndex: "createdAt",
            render: (value) => (value ? new Date(value).toLocaleString("vi-VN") : ""),
        },
        {
            title: "Thao tác",
            render: (_, record) => (
                <Space>
                    <Button icon={<EditOutlined />} onClick={() => openEdit(record)} />
                    <Popconfirm
                        title="Xóa người dùng này?"
                        okText="Xóa"
                        cancelText="Hủy"
                        disabled={record._id === user.id}
                        onConfirm={() => deleteMutation.mutate(record._id)}
                    >
                        <Button icon={<DeleteOutlined />} disabled={record._id === user.id} style={{ borderColor: "rgba(138,61,61,.35)", color: "#8a3d3d" }} />
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    return (
        <div>
            <WrapperHeader>Quản Lý Người Dùng</WrapperHeader>
            <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => setIsCreateOpen(true)}
                style={{ margin: "16px 0", background: "#1A1A1A", borderColor: "#1A1A1A" }}
            >
                Thêm người dùng
            </Button>
            <Table
                rowKey="_id"
                loading={usersQuery.isLoading || deleteMutation.isPending}
                columns={columns}
                dataSource={usersQuery.data?.data || []}
            />

            <Modal
                title="Thêm người dùng"
                open={isCreateOpen}
                onCancel={() => setIsCreateOpen(false)}
                onOk={() => createForm.submit()}
                confirmLoading={createMutation.isPending}
                okText="Tạo"
                cancelText="Hủy"
            >
                <Form form={createForm} layout="vertical" onFinish={createMutation.mutate} initialValues={{ isAdmin: false }}>
                    <Form.Item name="name" label="Họ tên" rules={[{ required: true, message: "Vui lòng nhập họ tên" }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item name="email" label="Email" rules={[{ required: true, type: "email", message: "Email không hợp lệ" }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item name="password" label="Mật khẩu" rules={[{ required: true, message: "Vui lòng nhập mật khẩu" }]}>
                        <Input.Password />
                    </Form.Item>
                    <Form.Item name="phone" label="Số điện thoại">
                        <Input />
                    </Form.Item>
                    <Form.Item name="address" label="Địa chỉ">
                        <Input />
                    </Form.Item>
                    <Form.Item name="isAdmin" label="Quyền admin" valuePropName="checked">
                        <Switch />
                    </Form.Item>
                </Form>
            </Modal>

            <Modal
                title="Cập nhật người dùng"
                open={Boolean(editingUser)}
                onCancel={() => setEditingUser(null)}
                onOk={() => editForm.submit()}
                confirmLoading={updateMutation.isPending}
                okText="Lưu"
                cancelText="Hủy"
            >
                <Form form={editForm} layout="vertical" onFinish={handleUpdate}>
                    <Form.Item name="name" label="Họ tên" rules={[{ required: true, message: "Vui lòng nhập họ tên" }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item name="email" label="Email" rules={[{ required: true, type: "email", message: "Email không hợp lệ" }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item name="password" label="Mật khẩu mới">
                        <Input.Password placeholder="Bỏ trống nếu không đổi mật khẩu" />
                    </Form.Item>
                    <Form.Item name="phone" label="Số điện thoại">
                        <Input />
                    </Form.Item>
                    <Form.Item name="address" label="Địa chỉ">
                        <Input />
                    </Form.Item>
                    <Form.Item name="isAdmin" label="Quyền admin" valuePropName="checked">
                        <Switch disabled={editingUser?._id === user.id} />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default AdminUser;

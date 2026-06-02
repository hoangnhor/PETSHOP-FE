import React, { useMemo, useState } from "react";
import { WrapperHeader } from "./style";
import { Form, Input, Switch, Tag } from "antd";
import { EditOutlined, PlusOutlined } from "@ant-design/icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import * as UserServices from "../../services/UserServices";
import { ConfirmDialog, ErrorState, PetshopButton, PetshopInput, PetshopModal, PetshopSelect, PetshopTable, StatsCard } from "../ui";
import * as message from "../Message/Message";

const AdminUser = () => {
    const user = useSelector((state) => state.user);
    const queryClient = useQueryClient();
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [pendingDeleteUser, setPendingDeleteUser] = useState(null);
    const [searchText, setSearchText] = useState("");
    const [roleFilter, setRoleFilter] = useState("all");
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [createForm] = Form.useForm();
    const [editForm] = Form.useForm();

    const usersQuery = useQuery({
        queryKey: ["admin-users", user.access_token, currentPage, pageSize],
        queryFn: () => UserServices.getAllUser(user.access_token, { page: currentPage - 1, limit: pageSize }),
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
            } else message.error(res?.message || "Tạo người dùng thất bại");
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
            } else message.error(res?.message || "Cập nhật thất bại");
        },
        onError: (error) => message.error(error?.message || "Cập nhật thất bại"),
    });
    const deleteMutation = useMutation({
        mutationFn: (id) => UserServices.deleteUser(id, user.access_token),
        onSuccess: (res) => {
            if (res?.status === "OK") {
                message.success("Xóa người dùng thành công");
                refreshUsers();
            } else message.error(res?.message || "Xóa người dùng thất bại");
        },
        onError: (error) => message.error(error?.message || "Xóa người dùng thất bại"),
    });

    const openEdit = (record) => {
        setEditingUser(record);
        editForm.setFieldsValue({ name: record.name, email: record.email, phone: record.phone, address: record.address, isAdmin: Boolean(record.isAdmin) });
    };

    const handleUpdate = (values) => {
        const payload = { ...values };
        if (!payload.password) delete payload.password;
        updateMutation.mutate({ id: editingUser._id, values: payload });
    };

    const normalizePhone = (phone) => {
        const digits = String(phone || "").replace(/\D/g, "");
        return digits.length >= 9 ? phone : "Chưa có dữ liệu";
    };

    const filteredUsers = useMemo(() => {
        return (usersQuery.data?.data || []).filter((u) => {
            const matchesSearch = !searchText || `${u.name || ""} ${u.email || ""}`.toLowerCase().includes(searchText.toLowerCase());
            const matchesRole = roleFilter === "all" || (roleFilter === "admin" ? u.isAdmin : !u.isAdmin);
            return matchesSearch && matchesRole;
        });
    }, [usersQuery.data?.data, searchText, roleFilter]);

    const columns = [
        { title: "Tên", dataIndex: "name" },
        { title: "Email", dataIndex: "email" },
        { title: "Số điện thoại", dataIndex: "phone", render: normalizePhone },
        { title: "Vai trò", dataIndex: "isAdmin", render: (isAdmin) => <Tag color={isAdmin ? "red" : "blue"}>{isAdmin ? "Admin" : "Khách hàng"}</Tag> },
        { title: "Ngày tạo", dataIndex: "createdAt", render: (value) => (value ? new Date(value).toLocaleString("vi-VN") : "") },
        {
            title: "Thao tác",
            render: (_, record) => (
                <div className="admin-actions">
                    <PetshopButton variant="secondary" icon={<EditOutlined />} aria-label="Chỉnh sửa người dùng" onClick={() => openEdit(record)} />
                    <PetshopButton variant="secondary" disabled={record._id === user.id} onClick={() => setPendingDeleteUser(record)}>Xóa</PetshopButton>
                </div>
            ),
        },
    ];

    return (
        <div className="admin-page-section">
            <WrapperHeader className="admin-panel-title">Quản Lý Người Dùng</WrapperHeader>
            {usersQuery.isError ? <ErrorState message="Không thể tải danh sách người dùng." onRetry={() => usersQuery.refetch()} /> : null}
            <div className="admin-stats-grid">
                <StatsCard label="Tổng người dùng" value={(usersQuery.data?.data || []).length} />
                <StatsCard label="Admin" value={(usersQuery.data?.data || []).filter((u) => u.isAdmin).length} />
                <StatsCard label="Khách hàng" value={(usersQuery.data?.data || []).filter((u) => !u.isAdmin).length} />
            </div>
            <div className="admin-toolbar">
                <div className="admin-toolbar-left">
                    <PetshopButton icon={<PlusOutlined />} onClick={() => setIsCreateOpen(true)}>Thêm người dùng</PetshopButton>
                </div>
                <div className="admin-toolbar-end">
                    <PetshopInput className="admin-input admin-input--search" placeholder="Tìm theo tên/email" value={searchText} onChange={(e) => setSearchText(e.target.value)} />
                    <PetshopSelect className="admin-select admin-select--filter" value={roleFilter} onChange={setRoleFilter} options={[{ value: "all", label: "Tất cả vai trò" }, { value: "admin", label: "Admin" }, { value: "customer", label: "Khách hàng" }]} />
                </div>
            </div>
            <div className="admin-table-wrap">
                <PetshopTable
                    rowKey="_id"
                    isPending={usersQuery.isLoading || deleteMutation.isPending}
                    columns={columns}
                    data={filteredUsers}
                    scroll={{ x: 880 }}
                    pagination={{
                        current: currentPage,
                        pageSize,
                        total: usersQuery.data?.total || 0,
                        showSizeChanger: true,
                        pageSizeOptions: ["10", "20", "50"],
                        showTotal: (total, range) => `${range[0]}-${range[1]} / ${total}`,
                        onChange: (page, nextSize) => {
                            if (nextSize !== pageSize) {
                                setPageSize(nextSize);
                                setCurrentPage(1);
                                return;
                            }
                            setCurrentPage(page);
                        },
                    }}
                />
            </div>

            <PetshopModal title="Thêm người dùng" open={isCreateOpen} onCancel={() => setIsCreateOpen(false)} onOk={() => createForm.submit()} confirmLoading={createMutation.isPending} okText="Tạo" cancelText="Hủy">
                <Form form={createForm} layout="vertical" onFinish={createMutation.mutate} initialValues={{ isAdmin: false }}>
                    <Form.Item name="name" label="Họ tên" rules={[{ required: true, message: "Vui lòng nhập họ tên" }]}><Input /></Form.Item>
                    <Form.Item name="email" label="Email" rules={[{ required: true, type: "email", message: "Email không hợp lệ" }]}><Input /></Form.Item>
                    <Form.Item name="password" label="Mật khẩu" rules={[{ required: true, message: "Vui lòng nhập mật khẩu" }]}><Input.Password /></Form.Item>
                    <Form.Item name="phone" label="Số điện thoại"><Input /></Form.Item>
                    <Form.Item name="address" label="Địa chỉ"><Input /></Form.Item>
                    <Form.Item name="isAdmin" label="Quyền admin" valuePropName="checked"><Switch /></Form.Item>
                </Form>
            </PetshopModal>

            <PetshopModal title="Cập nhật người dùng" open={Boolean(editingUser)} onCancel={() => setEditingUser(null)} onOk={() => editForm.submit()} confirmLoading={updateMutation.isPending} okText="Lưu" cancelText="Hủy">
                <Form form={editForm} layout="vertical" onFinish={handleUpdate}>
                    <Form.Item name="name" label="Họ tên" rules={[{ required: true, message: "Vui lòng nhập họ tên" }]}><Input /></Form.Item>
                    <Form.Item name="email" label="Email" rules={[{ required: true, type: "email", message: "Email không hợp lệ" }]}><Input /></Form.Item>
                    <Form.Item name="password" label="Mật khẩu mới"><Input.Password placeholder="Bỏ trống nếu không đổi mật khẩu" /></Form.Item>
                    <Form.Item name="phone" label="Số điện thoại"><Input /></Form.Item>
                    <Form.Item name="address" label="Địa chỉ"><Input /></Form.Item>
                    <Form.Item name="isAdmin" label="Quyền admin" valuePropName="checked"><Switch disabled={editingUser?._id === user.id} /></Form.Item>
                </Form>
            </PetshopModal>

            <ConfirmDialog
                open={Boolean(pendingDeleteUser)}
                title="Xóa người dùng"
                content={`Bạn có chắc chắn muốn xóa người dùng ${pendingDeleteUser?.name || ""}?`}
                confirmLoading={deleteMutation.isPending}
                onCancel={() => setPendingDeleteUser(null)}
                onOk={() => {
                    if (!pendingDeleteUser?._id) return;
                    deleteMutation.mutate(pendingDeleteUser._id);
                    setPendingDeleteUser(null);
                }}
            />
        </div>
    );
};

export default AdminUser;

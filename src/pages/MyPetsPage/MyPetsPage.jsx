import React, { useMemo, useState } from "react";
import { Form, Input } from "antd";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import * as PetServices from "../../services/PetServices";
import * as message from "../../components/Message/Message";
import { ConfirmDialog, EmptyState, ErrorState, LoadingState, PetshopButton, PetshopInput, PetshopModal, PetshopSelect, PetshopTable } from "../../components/ui";
import "./MyPetsPage.css";

const speciesOptions = [
  { value: "dog", label: "Chó" },
  { value: "cat", label: "Mèo" },
  { value: "other", label: "Khác" },
];

const genderOptions = [
  { value: "male", label: "Đực" },
  { value: "female", label: "Cái" },
  { value: "unknown", label: "Chưa rõ" },
];

const MyPetsPage = () => {
  const user = useSelector((state) => state.user);
  const navigate = useNavigate();
  const [createOpen, setCreateOpen] = useState(false);
  const [editingPet, setEditingPet] = useState(null);
  const [pendingDelete, setPendingDelete] = useState(null);
  const [search, setSearch] = useState("");
  const [createForm] = Form.useForm();
  const [editForm] = Form.useForm();

  const petsQuery = useQuery({
    queryKey: ["my-pets", user.access_token],
    queryFn: () => PetServices.getMyPets(user.access_token),
    enabled: Boolean(user.access_token),
  });

  const refresh = () => petsQuery.refetch();

  const createMutation = useMutation({
    mutationFn: (payload) => PetServices.createPet(payload, user.access_token),
    onSuccess: (res) => {
      if (res?.status === "OK") {
        message.success("Thêm thú cưng thành công");
        setCreateOpen(false);
        createForm.resetFields();
        refresh();
      } else {
        message.error(res?.message || "Thêm thú cưng thất bại");
      }
    },
    onError: (error) => message.error(error?.message || "Thêm thú cưng thất bại"),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }) => PetServices.updatePet(id, payload, user.access_token),
    onSuccess: (res) => {
      if (res?.status === "OK") {
        message.success("Cập nhật thú cưng thành công");
        setEditingPet(null);
        editForm.resetFields();
        refresh();
      } else {
        message.error(res?.message || "Cập nhật thú cưng thất bại");
      }
    },
    onError: (error) => message.error(error?.message || "Cập nhật thú cưng thất bại"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => PetServices.deletePet(id, user.access_token),
    onSuccess: (res) => {
      if (res?.status === "OK") {
        message.success("Xóa thú cưng thành công");
        refresh();
      } else {
        message.error(res?.message || "Xóa thú cưng thất bại");
      }
    },
    onError: (error) => message.error(error?.message || "Xóa thú cưng thất bại"),
  });

  const rows = useMemo(() => {
    const source = petsQuery.data?.data || [];
    if (!search.trim()) return source;
    const q = search.trim().toLowerCase();
    return source.filter((item) => `${item.name || ""} ${item.breed || ""}`.toLowerCase().includes(q));
  }, [petsQuery.data?.data, search]);

  const openEdit = (record) => {
    setEditingPet(record);
    editForm.setFieldsValue({
      name: record.name || "",
      species: record.species || "dog",
      breed: record.breed || "",
      gender: record.gender || "unknown",
      weightKg: Number(record.weightKg || 0),
      notes: record.notes || "",
      medicalNotes: record.medicalNotes || "",
    });
  };

  const columns = [
    { title: "Tên thú cưng", dataIndex: "name", render: (value) => <strong>{value}</strong> },
    { title: "Loài", dataIndex: "species", render: (value) => speciesOptions.find((item) => item.value === value)?.label || value },
    { title: "Giống", dataIndex: "breed", render: (value) => value || "-" },
    { title: "Giới tính", dataIndex: "gender", render: (value) => genderOptions.find((item) => item.value === value)?.label || "-" },
    { title: "Cân nặng", dataIndex: "weightKg", render: (value) => `${Number(value || 0)} kg` },
    {
      title: "Thao tác",
      render: (_, record) => (
        <div className="pet-actions">
          <PetshopButton
            variant="secondary"
            onClick={() => {
              const params = new URLSearchParams({
                petId: record._id,
                petName: record.name || "",
                petType: record.species || "dog",
              });
              navigate(`/services?${params.toString()}`);
            }}
          >
            Đặt lịch
          </PetshopButton>
          <PetshopButton variant="secondary" onClick={() => openEdit(record)}>Sửa</PetshopButton>
          <PetshopButton variant="secondary" onClick={() => setPendingDelete(record)}>Xóa</PetshopButton>
        </div>
      ),
    },
  ];

  return (
    <div className="my-pets-view">
      <main className="container page">
        <div className="breadcrumb">
          <span>petshop</span>
          <svg className="icon-sm arrow" viewBox="0 0 24 24"><path d="M9 18l6-6-6-6"></path></svg>
          <strong>Thú cưng của tôi</strong>
        </div>

        <div className="pet-head">
          <div>
            <h1 className="page-title">Thú cưng của tôi</h1>
            <p className="sub">Quản lý hồ sơ thú cưng để đặt lịch dịch vụ nhanh và chính xác hơn.</p>
          </div>
          <div className="pet-head-actions">
            <PetshopInput placeholder="Tìm theo tên/giống" value={search} onChange={(event) => setSearch(event.target.value)} style={{ width: 220 }} />
            <PetshopButton onClick={() => setCreateOpen(true)}>Thêm thú cưng</PetshopButton>
          </div>
        </div>

        <section className="card">
          {petsQuery.isLoading ? <LoadingState text="Đang tải danh sách thú cưng..." /> : null}
          {petsQuery.isError ? <ErrorState message="Không thể tải danh sách thú cưng." onRetry={refresh} /> : null}
          {!petsQuery.isLoading && !petsQuery.isError && rows.length === 0 ? (
            <EmptyState description="Bạn chưa thêm thú cưng nào." />
          ) : null}
          {!petsQuery.isLoading && !petsQuery.isError && rows.length > 0 ? (
            <PetshopTable rowKey="_id" columns={columns} data={rows} isPending={deleteMutation.isPending} scroll={{ x: 860 }} />
          ) : null}
        </section>
      </main>

      <PetshopModal
        title="Thêm thú cưng"
        open={createOpen}
        onCancel={() => setCreateOpen(false)}
        onOk={() => createForm.submit()}
        confirmLoading={createMutation.isPending}
      >
        <Form form={createForm} layout="vertical" onFinish={createMutation.mutate} initialValues={{ species: "dog", gender: "unknown", weightKg: 0 }}>
          <Form.Item name="name" label="Tên thú cưng" rules={[{ required: true, message: "Nhập tên thú cưng" }]}>
            <Input />
          </Form.Item>
          <Form.Item name="species" label="Loài" rules={[{ required: true, message: "Chọn loài" }]}>
            <PetshopSelect options={speciesOptions} />
          </Form.Item>
          <Form.Item name="breed" label="Giống">
            <Input />
          </Form.Item>
          <Form.Item name="gender" label="Giới tính">
            <PetshopSelect options={genderOptions} />
          </Form.Item>
          <Form.Item name="weightKg" label="Cân nặng (kg)">
            <Input type="number" min={0} />
          </Form.Item>
          <Form.Item name="notes" label="Ghi chú">
            <Input.TextArea rows={2} />
          </Form.Item>
          <Form.Item name="medicalNotes" label="Lưu ý y tế">
            <Input.TextArea rows={2} />
          </Form.Item>
        </Form>
      </PetshopModal>

      <PetshopModal
        title="Cập nhật thú cưng"
        open={Boolean(editingPet)}
        onCancel={() => setEditingPet(null)}
        onOk={() => editForm.submit()}
        confirmLoading={updateMutation.isPending}
      >
        <Form form={editForm} layout="vertical" onFinish={(payload) => updateMutation.mutate({ id: editingPet._id, payload })}>
          <Form.Item name="name" label="Tên thú cưng" rules={[{ required: true, message: "Nhập tên thú cưng" }]}>
            <Input />
          </Form.Item>
          <Form.Item name="species" label="Loài" rules={[{ required: true, message: "Chọn loài" }]}>
            <PetshopSelect options={speciesOptions} />
          </Form.Item>
          <Form.Item name="breed" label="Giống">
            <Input />
          </Form.Item>
          <Form.Item name="gender" label="Giới tính">
            <PetshopSelect options={genderOptions} />
          </Form.Item>
          <Form.Item name="weightKg" label="Cân nặng (kg)">
            <Input type="number" min={0} />
          </Form.Item>
          <Form.Item name="notes" label="Ghi chú">
            <Input.TextArea rows={2} />
          </Form.Item>
          <Form.Item name="medicalNotes" label="Lưu ý y tế">
            <Input.TextArea rows={2} />
          </Form.Item>
        </Form>
      </PetshopModal>

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title="Xóa thú cưng"
        content={`Bạn có chắc chắn muốn xóa ${pendingDelete?.name || "thú cưng"}?`}
        confirmLoading={deleteMutation.isPending}
        onCancel={() => setPendingDelete(null)}
        onOk={() => {
          if (!pendingDelete?._id) return;
          deleteMutation.mutate(pendingDelete._id);
          setPendingDelete(null);
        }}
      />
    </div>
  );
};

export default MyPetsPage;

import React, { useState } from "react";
import { WrapperHeader, WrapperUploadFile } from "./style";
import { Button, Form, Input, InputNumber, Modal, Popconfirm, Select, Space, Table } from "antd";
import { DeleteOutlined, EditOutlined, PlusOutlined } from "@ant-design/icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import * as ProductServices from "../../services/ProductServices";
import * as TypeServices from "../../services/TypeServices";
import * as message from "../Message/Message";
import DrawerComponent from "../../DrawerComponent/DrawerComponent";
import { getBase64 } from "../../utils";

const emptyProduct = {
  name: "",
  price: 0,
  description: "",
  image: "",
  type: "",
  countInStock: 0,
  discount: 0,
};

const AdminProduct = () => {
  const user = useSelector((state) => state.user);
  const queryClient = useQueryClient();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [newTypeName, setNewTypeName] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [createForm] = Form.useForm();
  const [editForm] = Form.useForm();

  const productsQuery = useQuery({
    queryKey: ["products-admin", currentPage, pageSize],
    queryFn: () => ProductServices.getAllProduct({ limit: pageSize, page: currentPage - 1 }),
  });

  const typesQuery = useQuery({
    queryKey: ["types"],
    queryFn: TypeServices.getAllType,
  });

  const typeOptions = typesQuery.data?.data?.map((type) => ({
    value: type._id,
    label: type.name,
  })) || [];

  const refreshProducts = () => queryClient.invalidateQueries({ queryKey: ["products-admin"] });
  const refreshTypes = () => queryClient.invalidateQueries({ queryKey: ["types"] });

  const normalizeProduct = (values) => ({
    ...values,
    price: Number(values.price || 0),
    countInStock: Number(values.countInStock || 0),
    discount: Number(values.discount || 0),
  });

  const createProductMutation = useMutation({
    mutationFn: (values) => ProductServices.createProduct(normalizeProduct(values), user.access_token),
    onSuccess: (res) => {
      if (res?.status === "OK") {
        message.success("Tạo sản phẩm thành công");
        createForm.resetFields();
        setIsCreateOpen(false);
        refreshProducts();
      } else {
        message.error(res?.message || "Tạo sản phẩm thất bại");
      }
    },
    onError: (error) => message.error(error?.message || "Tạo sản phẩm thất bại"),
  });

  const updateProductMutation = useMutation({
    mutationFn: ({ id, values }) => ProductServices.updateProduct(id, normalizeProduct(values), user.access_token),
    onSuccess: (res) => {
      if (res?.status === "OK") {
        message.success("Cập nhật sản phẩm thành công");
        setIsEditOpen(false);
        setEditingProduct(null);
        refreshProducts();
      } else {
        message.error(res?.message || "Cập nhật sản phẩm thất bại");
      }
    },
    onError: (error) => message.error(error?.message || "Cập nhật sản phẩm thất bại"),
  });

  const deleteProductMutation = useMutation({
    mutationFn: (id) => ProductServices.deleteProduct(id, user.access_token),
    onSuccess: (res) => {
      if (res?.status === "OK") {
        message.success("Xóa sản phẩm thành công");
        refreshProducts();
      } else {
        message.error(res?.message || "Xóa sản phẩm thất bại");
      }
    },
    onError: (error) => message.error(error?.message || "Xóa sản phẩm thất bại"),
  });

  const createTypeMutation = useMutation({
    mutationFn: (name) => TypeServices.createType({ name }, user.access_token),
    onSuccess: (res) => {
      if (res?.status === "OK") {
        message.success("Tạo loại sản phẩm thành công");
        setNewTypeName("");
        refreshTypes();
      } else {
        message.error(res?.message || "Tạo loại sản phẩm thất bại");
      }
    },
    onError: (error) => message.error(error?.message || "Tạo loại sản phẩm thất bại"),
  });

  const deleteTypeMutation = useMutation({
    mutationFn: (id) => TypeServices.deleteType(id, user.access_token),
    onSuccess: (res) => {
      if (res?.status === "OK") {
        message.success("Xóa loại sản phẩm thành công");
        refreshTypes();
      } else {
        message.error(res?.message || "Xóa loại sản phẩm thất bại");
      }
    },
    onError: (error) => message.error(error?.message || "Xóa loại sản phẩm thất bại"),
  });

  const handleUpload = async ({ fileList }, form, fieldName = "image") => {
    const file = fileList[0];
    if (!file) {
      form.setFieldValue(fieldName, "");
      return;
    }
    const preview = file.url || file.preview || await getBase64(file.originFileObj);
    form.setFieldValue(fieldName, preview);
  };

  const openEditProduct = async (record) => {
    const res = await ProductServices.getDetailsProduct(record._id);
    const product = res?.data || record;
    setEditingProduct(product);
    editForm.setFieldsValue({
      name: product.name,
      price: product.price,
      description: product.description,
      image: product.image,
      type: product.type?._id || product.type,
      countInStock: product.countInStock,
      discount: product.discount || 0,
    });
    setIsEditOpen(true);
  };

  const productForm = (form) => (
    <>
      <Form.Item name="name" label="Tên" rules={[{ required: true, message: "Vui lòng nhập tên sản phẩm" }]}>
        <Input />
      </Form.Item>
      <Form.Item name="type" label="Loại sản phẩm" rules={[{ required: true, message: "Vui lòng chọn loại sản phẩm" }]}>
        <Select options={typeOptions} placeholder="Chọn loại sản phẩm" />
      </Form.Item>
      <Form.Item name="countInStock" label="Tồn kho" rules={[{ required: true, message: "Vui lòng nhập tồn kho" }]}>
        <InputNumber min={0} style={{ width: "100%" }} />
      </Form.Item>
      <Form.Item name="price" label="Giá" rules={[{ required: true, message: "Vui lòng nhập giá" }]}>
        <InputNumber min={0} style={{ width: "100%" }} />
      </Form.Item>
      <Form.Item name="discount" label="Giảm giá (%)">
        <InputNumber min={0} max={100} style={{ width: "100%" }} />
      </Form.Item>
      <Form.Item name="description" label="Mô tả" rules={[{ required: true, message: "Vui lòng nhập mô tả" }]}>
        <Input.TextArea rows={3} />
      </Form.Item>
      <Form.Item name="image" label="Hình ảnh" rules={[{ required: true, message: "Vui lòng chọn hình ảnh" }]}>
        <Input.TextArea rows={2} placeholder="URL hoặc base64 hình ảnh" />
      </Form.Item>
      <Form.Item noStyle shouldUpdate={(prev, current) => prev.image !== current.image}>
        {() => (
          <Space align="start">
            <WrapperUploadFile beforeUpload={() => false} onChange={(info) => handleUpload(info, form)} maxCount={1}>
              <Button>Chọn file</Button>
            </WrapperUploadFile>
            {form.getFieldValue("image") && (
              <img
                src={form.getFieldValue("image")}
                alt="product"
                style={{ height: 64, width: 64, borderRadius: 6, objectFit: "cover" }}
              />
            )}
          </Space>
        )}
      </Form.Item>
    </>
  );

  const columns = [
    {
      title: "Tên",
      dataIndex: "name",
      render: (text) => <strong>{text}</strong>,
    },
    {
      title: "Giá",
      dataIndex: "price",
      render: (value) => Number(value || 0).toLocaleString("vi-VN") + "đ",
    },
    {
      title: "Giảm",
      dataIndex: "discount",
      render: (value) => `${Number(value || 0)}%`,
    },
    {
      title: "Loại sản phẩm",
      dataIndex: "type",
      render: (type) => type?.name || type || "Chưa phân loại",
    },
    {
      title: "Tồn kho",
      dataIndex: "countInStock",
    },
    {
      title: "Đã bán",
      dataIndex: "selled",
    },
    {
      title: "Thao tác",
      render: (_, record) => (
        <Space>
          <Button icon={<EditOutlined />} onClick={() => openEditProduct(record)} />
          <Popconfirm
            title="Xóa sản phẩm này?"
            okText="Xóa"
            cancelText="Hủy"
            onConfirm={() => deleteProductMutation.mutate(record._id)}
          >
            <Button icon={<DeleteOutlined />} style={{ borderColor: "rgba(138,61,61,.35)", color: "#8a3d3d" }} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <WrapperHeader>Quản Lý Sản Phẩm</WrapperHeader>

      <Space align="start" style={{ margin: "16px 0" }}>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => {
            createForm.setFieldsValue(emptyProduct);
            setIsCreateOpen(true);
          }}
          style={{ background: "#1A1A1A", borderColor: "#1A1A1A" }}
        >
          Thêm sản phẩm
        </Button>
        <Space.Compact>
          <Input
            placeholder="Loại sản phẩm mới"
            value={newTypeName}
            onChange={(event) => setNewTypeName(event.target.value)}
            onPressEnter={() => newTypeName.trim() && createTypeMutation.mutate(newTypeName)}
          />
          <Button
            loading={createTypeMutation.isPending}
            onClick={() => newTypeName.trim() && createTypeMutation.mutate(newTypeName)}
          >
            Thêm loại
          </Button>
        </Space.Compact>
      </Space>

      <Space wrap style={{ display: "flex", marginBottom: 16 }}>
        {typesQuery.data?.data?.map((type) => (
          <Popconfirm
            key={type._id}
            title="Xóa loại sản phẩm này?"
            okText="Xóa"
            cancelText="Hủy"
            onConfirm={() => deleteTypeMutation.mutate(type._id)}
          >
            <Button size="small">
              {type.name} <DeleteOutlined />
            </Button>
          </Popconfirm>
        ))}
      </Space>

      <Table
        rowKey="_id"
        loading={productsQuery.isLoading || deleteProductMutation.isPending}
        columns={columns}
        dataSource={productsQuery.data?.data || []}
        pagination={{
          current: currentPage,
          pageSize,
          total: productsQuery.data?.total || 0,
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

      <Modal
        title="Tạo sản phẩm"
        open={isCreateOpen}
        onCancel={() => setIsCreateOpen(false)}
        onOk={() => createForm.submit()}
        confirmLoading={createProductMutation.isPending}
        okText="Tạo"
        cancelText="Hủy"
        width={720}
      >
        <Form form={createForm} layout="vertical" onFinish={createProductMutation.mutate} initialValues={emptyProduct}>
          {productForm(createForm)}
        </Form>
      </Modal>

      <DrawerComponent
        title="Chi tiết sản phẩm"
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        width="50%"
      >
        <Form
          form={editForm}
          layout="vertical"
          onFinish={(values) => updateProductMutation.mutate({ id: editingProduct._id, values })}
        >
          {productForm(editForm)}
          <Button
            type="primary"
            htmlType="submit"
            loading={updateProductMutation.isPending}
            style={{ marginTop: 16, background: "#1A1A1A", borderColor: "#1A1A1A" }}
          >
            Lưu thay đổi
          </Button>
        </Form>
      </DrawerComponent>
    </div>
  );
};

export default AdminProduct;

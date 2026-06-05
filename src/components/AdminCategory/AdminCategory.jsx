import React, { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import { PlusOutlined } from "@ant-design/icons";
import * as TypeServices from "../../services/TypeServices";
import * as ProductServices from "../../services/ProductServices";
import * as message from "../Message/Message";
import { WrapperHeader } from "../AdminProduct/style";
import { ConfirmDialog, EmptyState, ErrorState, LoadingState, PetshopButton, PetshopInput, StatsCard } from "../ui";

const AdminCategory = () => {
  const user = useSelector((state) => state.user);
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const [pendingDeleteType, setPendingDeleteType] = useState(null);

  const typesQuery = useQuery({ queryKey: ["types"], queryFn: TypeServices.getAllType });
  const productsQuery = useQuery({ queryKey: ["products-admin-categories"], queryFn: () => ProductServices.getAllProductsUnlimited() });

  const refreshTypes = () => queryClient.invalidateQueries({ queryKey: ["types"] });

  const createTypeMutation = useMutation({
    mutationFn: (nextName) => TypeServices.createType({ name: nextName }, user.access_token),
    onSuccess: (res) => {
      if (res?.status === "OK") {
        message.success("Tạo danh mục thành công");
        setName("");
        refreshTypes();
      } else message.error(res?.message || "Tạo danh mục thất bại");
    },
    onError: (error) => message.error(error?.message || "Tạo danh mục thất bại"),
  });

  const deleteTypeMutation = useMutation({
    mutationFn: (id) => TypeServices.deleteType(id, user.access_token),
    onSuccess: (res) => {
      if (res?.status === "OK") {
        message.success("Xóa danh mục thành công");
        refreshTypes();
      } else message.error(res?.message || "Xóa danh mục thất bại");
    },
    onError: (error) => message.error(error?.message || "Xóa danh mục thất bại"),
  });

  const countByType = useMemo(() => {
    const map = {};
    (productsQuery.data?.data || []).forEach((product) => {
      const typeId = product?.type?._id || product?.type;
      if (!typeId) return;
      map[typeId] = (map[typeId] || 0) + 1;
    });
    return map;
  }, [productsQuery.data?.data]);

  return (
    <div className="admin-page-section">
      <WrapperHeader className="admin-panel-title">Quản Lý Danh Mục</WrapperHeader>
      {typesQuery.isLoading || productsQuery.isLoading ? <LoadingState text="Đang tải dữ liệu danh mục..." /> : null}
      {typesQuery.isError || productsQuery.isError ? (
        <ErrorState
          message="Không thể tải dữ liệu danh mục."
          onRetry={() => {
            typesQuery.refetch();
            productsQuery.refetch();
          }}
        />
      ) : null}
      <div className="admin-stats-grid admin-stats-grid--3">
        <StatsCard label="Tổng danh mục" value={(typesQuery.data?.data || []).length} />
        <StatsCard label="Sản phẩm đã gán" value={Object.values(countByType).reduce((sum, item) => sum + item, 0)} />
        <StatsCard label="Danh mục rỗng" value={(typesQuery.data?.data || []).filter((type) => !countByType[type._id]).length} />
      </div>

      <div className="admin-toolbar">
        <div className="admin-toolbar-left">
          <PetshopButton icon={<PlusOutlined />} onClick={() => name.trim() && createTypeMutation.mutate(name.trim())} disabled={createTypeMutation.isPending}>Thêm danh mục</PetshopButton>
        </div>
        <div className="admin-toolbar-end">
          <PetshopInput className="admin-input admin-input--search" placeholder="Nhập tên danh mục mới" value={name} onChange={(event) => setName(event.target.value)} onPressEnter={() => name.trim() && createTypeMutation.mutate(name.trim())} />
        </div>
      </div>

      <div className="admin-table-wrap admin-table-wrap--cards">
        {!(typesQuery.isLoading || productsQuery.isLoading) && (typesQuery.data?.data || []).length === 0 ? (
          <EmptyState title="Chưa có danh mục" description="Hãy thêm danh mục mới để bắt đầu quản lý sản phẩm." />
        ) : (
          <div className="admin-category-grid">
            {(typesQuery.data?.data || []).map((type) => (
              <article key={type._id} className="admin-category-card">
                <h3>{type.name}</h3>
                <p>{countByType[type._id] || 0} sản phẩm</p>
                <PetshopButton variant="secondary" onClick={() => setPendingDeleteType(type)}>Xóa</PetshopButton>
              </article>
            ))}
          </div>
        )}
      </div>

      <ConfirmDialog
        open={Boolean(pendingDeleteType)}
        title="Xóa danh mục"
        content={`Bạn có chắc chắn muốn xóa danh mục ${pendingDeleteType?.name || ""}?`}
        confirmLoading={deleteTypeMutation.isPending}
        onCancel={() => setPendingDeleteType(null)}
        onOk={() => {
          if (!pendingDeleteType?._id) return;
          deleteTypeMutation.mutate(pendingDeleteType._id);
          setPendingDeleteType(null);
        }}
      />
    </div>
  );
};

export default AdminCategory;

import React from "react";
import PageContainer from "../../components/PageContainer/PageContainer";
import { SurfaceCard } from "../../components/PageContainer/style";
import { Breadcrumb } from "../../components/ui";

const sectionTitleStyle = { margin: "0 0 10px", color: "#1A1A1A", fontSize: 34 };
const listStyle = { margin: 0, paddingLeft: 18, color: "#444", lineHeight: 1.8 };

const PolicyPage = () => {
    return (
        <>
            <PageContainer title="Chính sách đổi trả & vận chuyển" subtitle="Minh bạch điều kiện xử lý để bạn yên tâm mua sắm.">
                <Breadcrumb items={[{ label: "petshop", to: "/" }, { label: "Chính sách" }]} />
                <div style={{ display: "grid", gap: 18 }}>
                    <SurfaceCard id="returns">
                        <h2 style={sectionTitleStyle}>1. Chính sách đổi trả</h2>
                        <ul style={listStyle}>
                            <li>Áp dụng đổi trả trong vòng 7 ngày kể từ ngày nhận hàng.</li>
                            <li>Sản phẩm còn tem, nhãn, chưa qua sử dụng và còn đầy đủ phụ kiện đi kèm.</li>
                            <li>Hỗ trợ đổi ngay nếu giao sai mẫu, sai loại, sản phẩm lỗi từ nhà sản xuất.</li>
                            <li>Không áp dụng đổi trả với sản phẩm giảm giá sâu hoặc hàng đặt riêng theo yêu cầu.</li>
                            <li>Thời gian xử lý yêu cầu đổi trả: 24-48 giờ làm việc sau khi tiếp nhận đầy đủ thông tin.</li>
                            <li>Hoàn tiền được thực hiện trong 3-7 ngày làm việc tùy phương thức thanh toán ban đầu.</li>
                        </ul>
                    </SurfaceCard>

                    <SurfaceCard id="shipping">
                        <h2 style={sectionTitleStyle}>2. Chính sách vận chuyển</h2>
                        <ul style={listStyle}>
                            <li>Nội thành TP.HCM: giao trong 2-24 giờ tùy khu vực.</li>
                            <li>Các tỉnh thành khác: giao từ 2-5 ngày làm việc.</li>
                            <li>Miễn phí vận chuyển cho đơn từ 499.000đ, dưới mức này áp dụng phí theo đơn vị vận chuyển.</li>
                            <li>Cho phép đồng kiểm ngoại quan khi nhận hàng trước khi thanh toán (với đơn COD).</li>
                            <li>Đơn bị hoàn do không liên hệ được sẽ cần xác nhận lại trước khi gửi lần 2.</li>
                            <li>Với sản phẩm cồng kềnh (chuồng, balo lớn), thời gian giao có thể cộng thêm 1-2 ngày.</li>
                            <li>Trong thời tiết xấu hoặc cao điểm lễ/tết, thời gian giao có thể thay đổi và sẽ được thông báo trước.</li>
                        </ul>
                    </SurfaceCard>

                    <SurfaceCard>
                        <h2 style={sectionTitleStyle}>3. Quy trình xử lý khiếu nại</h2>
                        <ul style={listStyle}>
                            <li>Bước 1: Gửi mã đơn hàng + hình ảnh/video sản phẩm qua hotline hoặc email.</li>
                            <li>Bước 2: petshop xác nhận thông tin trong vòng 24 giờ làm việc.</li>
                            <li>Bước 3: Thống nhất phương án đổi/trả/hoàn tiền và hẹn thời gian xử lý.</li>
                            <li>Bước 4: Hoàn tất xử lý và cập nhật trạng thái cho khách hàng.</li>
                        </ul>
                    </SurfaceCard>

                    <SurfaceCard>
                        <h2 style={sectionTitleStyle}>4. Liên hệ hỗ trợ</h2>
                        <ul style={listStyle}>
                            <li>Hotline: 0900 000 000 (08:00 - 21:00 mỗi ngày)</li>
                            <li>Email: contact@petshop.com</li>
                            <li>Fanpage: facebook.com/petshop</li>
                        </ul>
                    </SurfaceCard>
                </div>
            </PageContainer>
        </>
    );
};

export default PolicyPage;

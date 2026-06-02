export const serviceCatalog = [
  {
    slug: "khach-san-thu-cung",
    title: "Khách sạn thú cưng",
    price: "Từ 320.000đ",
    image: "/service-images/service-khach-san-thu-cung.jpg",
    shortDescription: "Lưu trú cơ bản với theo dõi hằng ngày.",
    description:
      "Không gian lưu trú ấm cúng, có khu vực nghỉ ngơi và vận động nhẹ, phù hợp khi bạn cần gửi thú cưng ngắn hạn.",
    duration: "Theo ngày",
    species: "Chó / Mèo",
    includes: ["Phòng nghỉ", "Cho ăn theo lịch", "Theo dõi cơ bản hằng ngày"],
    subServices: [
      { name: "Phòng tiêu chuẩn", price: "199.000đ / đêm", duration: "Theo ngày" },
      { name: "Phòng riêng", price: "269.000đ / đêm", duration: "Theo ngày" },
      { name: "Phòng premium", price: "329.000đ / đêm", duration: "Theo ngày" },
    ],
  },
  {
    slug: "grooming-cat-tia-long-thu-cung",
    title: "Grooming cắt tỉa lông",
    price: "Từ 350.000đ",
    image: "/service-images/service-grooming-cat-tia.jpg",
    shortDescription: "Cắt tỉa lông theo tiêu chuẩn dịch vụ.",
    description:
      "Cắt tỉa lông theo dáng phù hợp từng giống, xử lý vùng lông rối và làm gọn tổng thể để thú cưng thoải mái hơn.",
    duration: "75 phút",
    species: "Chó",
    includes: ["Cắt tỉa theo form", "Tỉa vệ sinh chân/bụng", "Chỉnh gọn mặt"],
    subServices: [
      { name: "Cắt tỉa cơ bản", price: "299.000đ", duration: "60 phút" },
      { name: "Tạo kiểu theo giống", price: "359.000đ", duration: "75 phút" },
      { name: "Gỡ rối + cắt form", price: "389.000đ", duration: "90 phút" },
    ],
  },
  {
    slug: "ve-sinh-meo-chuyen-sau",
    title: "Vệ sinh mèo chuyên sâu",
    price: "Từ 250.000đ",
    image: "/service-images/service-spa-thu-cung.jpg",
    shortDescription: "Vệ sinh và chăm sóc làm sạch chuyên sâu cho mèo.",
    description:
      "Quy trình vệ sinh nhẹ nhàng cho mèo, hỗ trợ làm sạch da lông, khử mùi và giữ thú cưng thoải mái trong suốt buổi dịch vụ.",
    duration: "45 - 60 phút",
    species: "Mèo",
    includes: ["Tắm gội", "Sấy khô", "Vệ sinh tai cơ bản"],
    subServices: [
      { name: "Vệ sinh cơ bản", price: "250.000đ", duration: "45 phút" },
      { name: "Vệ sinh + dưỡng lông", price: "289.000đ", duration: "60 phút" },
      { name: "Khử mùi chuyên sâu", price: "319.000đ", duration: "60 phút" },
    ],
  },
  {
    slug: "kham-suc-khoe-thu-y",
    title: "Khám sức khỏe thú y",
    price: "Từ 250.000đ",
    image: "/service-images/service-kham-suc-khoe-thu-y.jpg",
    shortDescription: "Khám tổng quát và tư vấn chăm sóc thú cưng.",
    description:
      "Bác sĩ thú y thăm khám tổng quát, đánh giá tình trạng hiện tại và tư vấn chế độ chăm sóc phù hợp cho thú cưng.",
    duration: "30 - 45 phút",
    species: "Chó / Mèo",
    includes: ["Khám lâm sàng", "Tư vấn dinh dưỡng cơ bản", "Định hướng theo dõi sức khỏe"],
    subServices: [
      { name: "Khám tổng quát", price: "249.000đ", duration: "30 phút" },
      { name: "Khám + tư vấn dinh dưỡng", price: "299.000đ", duration: "40 phút" },
      { name: "Khám định kỳ chuyên sâu", price: "349.000đ", duration: "45 phút" },
    ],
  },
];

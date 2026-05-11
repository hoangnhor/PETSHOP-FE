# petshop Frontend (ReactJS)

Frontend cho hệ thống thương mại điện tử `petshop`, tập trung vào trải nghiệm mua hàng online cho khách hàng và trang quản trị cho admin.

## 1) Thông tin dự án

- Project: `petshop`
- Domain nghiệp vụ: E-commerce sản phẩm thú cưng
- Người dùng mục tiêu:
  - Khách hàng mua sản phẩm online
  - Admin quản lý sản phẩm, danh mục, đơn hàng, người dùng

## 2) Vai trò thực hiện

- Vai trò: **Fullstack Developer** (trong repo này là phần **Frontend**)
- Thực hiện:
  - Thiết kế luồng UI/UX mua hàng và quản trị
  - Kết nối API, xử lý state, auth flow, error/loading state
  - Tối ưu behavior production (query cache/retry, chuẩn hóa API URL)

## 3) Tính năng chính

- Authentication UI:
  - Đăng ký, đăng nhập, đăng xuất
  - Tự refresh access token khi token hết hạn
- Trang khách hàng:
  - Trang chủ, danh sách sản phẩm, tìm kiếm/lọc
  - Chi tiết sản phẩm, related products
  - Giỏ hàng, checkout, lịch sử đơn hàng
  - Wishlist
- Trang người dùng:
  - Quản lý hồ sơ
- Trang quản trị:
  - Quản lý User / Product / Order
- UX kỹ thuật:
  - Loading/error state rõ ràng
  - React Query cache + retry strategy cho production
  - Chuẩn hóa `REACT_APP_API_URL` để tránh lỗi sai URL khi deploy

## 4) Công nghệ và thư viện

- Core:
  - `react`, `react-dom`, `react-router-dom`
- State/Data:
  - `redux`, `@reduxjs/toolkit`, `react-redux`
  - `@tanstack/react-query`, `@tanstack/react-query-devtools`
- UI:
  - `antd`
  - `styled-components`
  - `react-slick`, `slick-carousel`
- Networking/Auth:
  - `axios`
  - `jwt-decode`
- Khác:
  - `dotenv`, `web-vitals`
- Test/CRA tooling:
  - `react-scripts`
  - `@testing-library/react`, `@testing-library/jest-dom`, `@testing-library/user-event`

## 5) Cấu trúc thư mục chính

```text
FE/src
├── components/          # UI components dùng lại
├── pages/               # Các page chính
├── services/            # API clients
├── redux/               # Redux store/slices
├── routes/              # Route config
├── App.js               # App shell + protected routes
└── index.js             # Entry + QueryClient/Provider
```

## 6) Cài đặt và chạy local

```bash
cd FE
npm install
npm start
```

Frontend mặc định chạy tại: `http://localhost:3000`

## 7) Environment variables

Tạo file `.env` trong thư mục `FE`:

```env
REACT_APP_API_URL=http://localhost:3030/api
```

Lưu ý:
- Ở production có thể dùng:
  - `REACT_APP_API_URL=https://petshopbe.onrender.com/api`

## 8) Build production

```bash
npm run build
```

## 9) Danh sách route chính

- `/`
- `/products`
- `/product-detail/:id`
- `/cart`
- `/checkout`
- `/order-history`
- `/wishlist`
- `/profile`
- `/admin`

## 10) Deploy

- Frontend production: Vercel
- URL: `https://petshop-fe.vercel.app`

## 11) Liên kết liên quan

- Backend repo: `https://github.com/hoangnhor/petshopBE`
- Frontend repo: `https://github.com/hoangnhor/petshopFE`

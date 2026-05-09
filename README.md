# Petshop.vn Frontend

Frontend cho website thương mại điện tử bán sản phẩm thú cưng. Ứng dụng được xây bằng React, kết nối REST API từ backend Node.js/Express.

## Tính năng chính

- Trang chủ với banner, danh mục nổi bật và danh sách sản phẩm.
- <img width="1920" height="1032" alt="image" src="https://github.com/user-attachments/assets/4d2b7cac-d52f-4621-a08f-cbf0d5c963a9" />
- Trang danh sách sản phẩm, tìm kiếm theo từ khóa, lọc theo danh mục, sắp xếp giá.
- <img width="1920" height="1032" alt="image" src="https://github.com/user-attachments/assets/c70b9cf4-2b2b-4c36-a0e5-a6252a8233d6" />
- Trang chi tiết sản phẩm, chọn số lượng, thêm vào giỏ hàng, mua ngay.
- <img width="1920" height="1032" alt="image" src="https://github.com/user-attachments/assets/e8c0672e-847b-4050-a5a8-9a9837d5c4cf" />
- Giỏ hàng và đặt hàng.
- <img width="1920" height="1032" alt="image" src="https://github.com/user-attachments/assets/f6dc0753-f5cc-465b-953e-c8c26cf0398f" />
- Đăng ký, đăng nhập, đăng xuất, tự làm mới token.
- <img width="1920" height="1032" alt="image" src="https://github.com/user-attachments/assets/40fbb959-8501-47b4-8544-7cb38f2504a8" />
  <img width="1920" height="1032" alt="image" src="https://github.com/user-attachments/assets/b2bb94cb-1345-46b9-b9dc-4df2ba964272" />
- Trang hồ sơ người dùng.
- <img width="1920" height="1032" alt="image" src="https://github.com/user-attachments/assets/8015eba5-d784-409c-aea7-6550a81a7c28" />
- Trang quản trị cho admin: quản lý sản phẩm, người dùng, đơn hàng, danh mục.
- <img width="1920" height="1032" alt="image" src="https://github.com/user-attachments/assets/ec0903cf-42fd-4695-95d1-42ec36b8c4d5" />
<img width="1920" height="1032" alt="image" src="https://github.com/user-attachments/assets/c82d4ded-6e7c-4371-8e84-1ea965744cab" />
<img width="1920" height="1032" alt="image" src="https://github.com/user-attachments/assets/ad58e5d0-03cb-4d8d-b6e4-a3c5a0678f1f" />
- Giao diện responsive, dùng Ant Design và styled-components.

## Công nghệ

- React 18
- React Router DOM
- Redux Toolkit, React Redux
- TanStack React Query
- Ant Design
- Axios
- Styled Components
- React Slick
- Create React App

## Yêu cầu môi trường

- Node.js 18 trở lên
- npm
- Backend chạy tại `http://localhost:3030`

## Cài đặt

```bash
cd FE
npm install
```

## Cấu hình môi trường

Tạo file `.env` trong thư mục `FE`:

```env
REACT_APP_API_URL=http://localhost:3030/api
```

Ghi chú:

- `REACT_APP_API_URL` là URL API backend.
- Nếu không khai báo biến này, frontend mặc định gọi `http://localhost:3030/api`.
- File `package.json` cũng có proxy về `http://localhost:3030` cho môi trường dev.

## Chạy dự án

```bash
npm start
```

Mở trình duyệt:

```text
http://localhost:3000
```

## Build production

```bash
npm run build
```

Kết quả build nằm trong thư mục:

```text
FE/build
```

## Kiểm thử

```bash
npm test
```

## Cấu trúc thư mục

```text
FE/
├── public/
├── src/
│   ├── assets/                 # Hình ảnh, tài nguyên tĩnh
│   ├── components/             # Component dùng chung
│   ├── DrawerComponent/        # Drawer dùng trong admin/form
│   ├── hooks/                  # Custom hooks
│   ├── pages/                  # Các trang chính
│   ├── redux/                  # Redux store và slice
│   ├── routes/                 # Khai báo route
│   ├── services/               # Hàm gọi API
│   ├── App.js
│   └── index.js
├── .env
├── package.json
└── README.md
```

## Routes chính

| Đường dẫn | Chức năng |
|---|---|
| `/` | Trang chủ |
| `/products` | Danh sách sản phẩm |
| `/products?keyword=...` | Tìm kiếm sản phẩm |
| `/products?type=...` | Lọc sản phẩm theo danh mục |
| `/product-detail/:id` | Chi tiết sản phẩm |
| `/order` | Giỏ hàng/đặt hàng, yêu cầu đăng nhập |
| `/profile` | Hồ sơ người dùng, yêu cầu đăng nhập |
| `/sign-in` | Đăng nhập |
| `/sign-up` | Đăng ký |
| `/services` | Dịch vụ |
| `/contact` | Liên hệ |
| `/admin` | Quản trị, yêu cầu tài khoản admin |

## Kết nối API

Các file service nằm trong:

```text
src/services/
```

Service chính:

- `UserServices.js`: đăng nhập, đăng ký, refresh token, hồ sơ, quản lý user.
- `ProductServices.js`: danh sách, chi tiết, tạo, sửa, xóa, tìm kiếm sản phẩm.
- `TypeServices.js`: danh sách, tạo, sửa, xóa danh mục.
- `BillServices.js`: tạo đơn, xem đơn, cập nhật trạng thái, hủy đơn.

Token đăng nhập được lưu trong `localStorage` với key:

```text
access_token
```

Giỏ hàng được lưu local với key:

```text
cartItems
```

## Quy trình chạy fullstack

Mở 2 terminal riêng:

Terminal backend:

```bash
cd BE
npm run dev
```

Terminal frontend:

```bash
cd FE
npm start
```

Sau đó truy cập:

```text
Frontend: http://localhost:3000
Backend:  http://localhost:3030
```

## Lỗi thường gặp

### Frontend không gọi được API

Kiểm tra backend đã chạy chưa:

```text
http://localhost:3030
```

Kiểm tra `.env`:

```env
REACT_APP_API_URL=http://localhost:3030/api
```

### Không đăng nhập được hoặc bị văng phiên

- Kiểm tra backend có đủ `ACCESS_TOKEN` và `REFRESH_TOKEN`.
- Xóa token cũ trong trình duyệt rồi đăng nhập lại.
- Kiểm tra CORS backend có cho phép `http://localhost:3000`.

### Port 3000 đã được dùng

CRA sẽ hỏi chạy port khác. Có thể chọn `Y`, hoặc tắt tiến trình đang dùng port 3000.

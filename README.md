# Petshop.vn Frontend

Frontend cho website thương mại điện tử bán sản phẩm thú cưng, xây dựng bằng React và kết nối REST API backend Node.js/Express.

## Tính năng chính

- Luxury homepage: hero, category cards, flash sale, featured products.
- Trang sản phẩm: tìm kiếm, lọc theo danh mục, sắp xếp giá.
- Trang chi tiết sản phẩm: số lượng, thêm giỏ, mua ngay, related products, tabs.
- Cart, Checkout, Order History tách riêng.
- Wishlist cho người dùng đăng nhập.
- Đăng ký, đăng nhập, refresh token, hồ sơ người dùng.
- Admin quản lý user, sản phẩm, đơn hàng, danh mục.

## Công nghệ

- React 18
- React Router DOM
- Redux Toolkit, React Redux
- TanStack React Query
- Ant Design
- Axios
- Styled Components

## Chạy dự án

```bash
cd FE
npm install
npm start
```

Mặc định frontend chạy tại `http://localhost:3000`.

## Cấu hình môi trường

Tạo `.env` trong thư mục `FE`:

```env
REACT_APP_API_URL=http://localhost:3030/api
```

## Build production

```bash
npm run build
```

## Routes chính

- `/`
- `/products`
- `/product-detail/:id`
- `/cart`
- `/checkout`
- `/order-history`
- `/wishlist`
- `/profile`
- `/admin`

## Fullstack local run

Terminal 1:

```bash
cd BE
npm run dev
```

Terminal 2:

```bash
cd FE
npm start
```

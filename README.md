# PetShop Frontend (FE)

Frontend cho hệ thống thương mại điện tử thú cưng PetShop.

## Tech Stack
- React 18
- React Router DOM 6
- Redux Toolkit
- Axios
- Ant Design 5
- Styled Components

## Liên kết
- Demo: https://htpetshop.vercel.app/
- Frontend Repo: https://github.com/hoangnhor/PETSHOP-FE
- Backend Repo: https://github.com/hoangnhor/PETSHOP-BE

## Tính năng chính
- Catalog sản phẩm theo nhóm/type/sub-type.
- Giỏ hàng và wishlist cho user.
- Checkout và theo dõi đơn hàng.
- Trang hồ sơ người dùng, lịch sử đơn, chi tiết đơn.
- Khu vực admin: dashboard, user, product, category, order, appointment.
- Đăng nhập JWT access token + tự refresh session qua refresh token cookie.

## Cấu trúc thư mục
```text
src/
  components/
  pages/
  services/
  redux/
  routes/
  constants/
  utils/
```

## Cài đặt và chạy local
```bash
cd FE
npm install
npm start
```

Frontend mặc định chạy ở `http://localhost:3000`.

## Biến môi trường
Tạo file `.env` trong thư mục `FE`:

```env
REACT_APP_API_URL=http://localhost:3030/api
```

Ghi chú:
- Nếu thiếu `REACT_APP_API_URL`, app sẽ fallback về `http://localhost:3030/api`.

## Scripts
```bash
npm start       # chạy dev
npm run build   # build production
npm test        # chạy test
npm run test:ci # test non-watch, runInBand
npm run lint    # lint src/**/*.{js,jsx}
```

## Auth flow (FE)
- Access token lưu trong memory store (`authToken.js`).
- Refresh token lưu httpOnly cookie ở backend.
- Axios interceptor tự gọi `/api/user/refresh-token` khi gặp 401 và retry request.

## Build & Deploy
```bash
npm run build
```
Deploy static build lên Vercel/hosting bất kỳ, đảm bảo `REACT_APP_API_URL` trỏ đúng BE.

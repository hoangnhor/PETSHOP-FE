# 🚀 petshop FE — React E-commerce Experience Layer

![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white)
![React Router](https://img.shields.io/badge/React_Router-6-CA4245?logo=reactrouter&logoColor=white)
![Redux Toolkit](https://img.shields.io/badge/Redux_Toolkit-2.x-764ABC?logo=redux&logoColor=white)
![TanStack Query](https://img.shields.io/badge/TanStack_Query-5.x-FF4154?logo=reactquery&logoColor=white)
![Ant Design](https://img.shields.io/badge/Ant_Design-5.x-1677FF?logo=antdesign&logoColor=white)
![Axios](https://img.shields.io/badge/Axios-1.x-5A29E4?logo=axios&logoColor=white)
![Styled Components](https://img.shields.io/badge/Styled_Components-6.x-DB7093?logo=styledcomponents&logoColor=white)

> “petshop FE” là lớp trải nghiệm khách hàng và vận hành admin cho hệ thống e-commerce thú cưng, tập trung vào tốc độ phản hồi UI, tính ổn định phiên đăng nhập và khả năng mở rộng product flows.

- 🌐 Live Demo: `https://htpetshop.vercel.app/`
- 🔗 Frontend Repo: `https://github.com/hoangnhor/petshopFE`
- 🔗 Backend Repo: `https://github.com/hoangnhor/petshopBE`

---

## 🔥 Điểm sáng Kỹ thuật (Technical Highlights)

1. **Session Resilience với Access/Refresh Token Lifecycle**
- Tự động làm mới access token qua interceptor.
- Duy trì trải nghiệm đăng nhập mượt, giảm logout đột ngột khi token hết hạn.

2. **Data Fetching Strategy theo chuẩn production**
- Dùng TanStack Query với cache/retry/stale time hợp lý.
- Giảm over-fetching và tránh spam request khi tab refocus.

3. **Global State tách biệt domain rõ ràng**
- Redux Toolkit quản lý user/session state.
- UI state + server state được phân vai (Redux vs Query) để giữ kiến trúc sạch.

4. **API Config hardening cho đa môi trường deploy**
- Chuẩn hóa `REACT_APP_API_URL`, chống lỗi double-slash và thiếu `/api`.
- Giảm rủi ro lỗi cấu hình khi promote từ local -> staging -> production.

---

## 📦 Cấu trúc State / Luồng dữ liệu

| Layer | Công cụ | Trách nhiệm | Output |
|---|---|---|---|
| Global App State | Redux Toolkit | User profile, auth metadata, shared app flags | UI nhất quán giữa route |
| Server State | TanStack Query | Fetch/cache/retry dữ liệu API (product/type/bill/user) | Data hydration nhanh, ít refetch |
| API Client | Axios + interceptor | Gắn token, refresh token flow, chuẩn hóa lỗi | Request ổn định, error contract rõ |
| View Layer | React + AntD + Styled Components | Render nghiệp vụ theo role/user journey | UX mua hàng + admin dashboard |

---

## 🔄 Luồng nghiệp vụ cốt lõi (Core Flow)

```text
User opens app
  -> App bootstrap reads access_token
     -> Token valid? fetch profile
     -> Token expired? refresh-token -> retry profile
        -> Route guard checks isPrivate / isAdmin
           -> Render page
              -> Query fetches data (cache/retry policy)
                 -> User action (add cart / checkout / admin ops)
                    -> API mutation -> cache update / refetch
```

---

## 🚀 Cài đặt & Khởi chạy (Local Development)

```bash
cd FE
npm install
npm start
```

`.env`
```env
REACT_APP_API_URL=
```

Build:
```bash
npm run build
```

---

## 📂 Cấu trúc mã nguồn (Folder Structure)

```text
src/
├── assets/                      # Ảnh và static assets cho UI/branding
├── components/                  # Reusable components (header, footer, cards, admin blocks...)
├── hooks/                       # Custom hooks tái sử dụng logic UI/data
├── pages/                       # Route-level pages theo user journey và admin journey
├── redux/                       # Store + slices cho global state
├── routes/                      # Route config + private/admin gating metadata
├── services/                    # API clients, auth/session helpers, endpoint config
├── App.js                       # App shell, protected route control, token bootstrap
└── index.js                     # Entry point, providers (Redux/Query), runtime config
```

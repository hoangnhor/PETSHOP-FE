import HomePage from "../pages/HomePage/HomePage";
import NotFoundPage from "../pages/NotFoundPage/NotFoundPage";
import OderPage from "../pages/OderPage/OderPage";
import ProductDetailsPage from "../pages/ProductDetailsPage/ProductDetailsPage";
import ProductsPage from "../pages/ProductsPage/ProductsPage";
import ProfilePage from "../pages/ProfilePage/ProfilePage";
import SignInPage from "../pages/SignInPages/SignInPage";
import SignUpPage from "../pages/SignUpPages/SignUpPage";
import ServicesPage from "../pages/ServicesPage/ServicesPage";
import ContactPage from "../pages/ContactPage/ContactPage";
import TypeProductPage from "../pages/TypeProductPage/TypeProductPage";
import AdminPage from "../pages/AdminPage/AdminPage";
import WishlistPage from "../pages/WishlistPage/WishlistPage";
import OrderHistoryPage from "../pages/OrderHistoryPage/OrderHistoryPage";
import CartPage from "../pages/CartPage/CartPage";
import CheckoutPage from "../pages/CheckoutPage/CheckoutPage";

export const routes = [
  { path: "/", page: HomePage, isShowHeader: true },
  { path: "/order", page: OderPage, isShowHeader: true, isPrivate: true },
  { path: "/cart", page: CartPage, isShowHeader: true, isPrivate: true },
  { path: "/checkout", page: CheckoutPage, isShowHeader: true, isPrivate: true },
  { path: "/products", page: ProductsPage, isShowHeader: true },
  { path: "/type", page: TypeProductPage, isShowHeader: true },
  { path: "/services", page: ServicesPage, isShowHeader: true },
  { path: "/contact", page: ContactPage, isShowHeader: true },
  { path: "/sign-in", page: SignInPage, isShowHeader: false },
  { path: "/sign-up", page: SignUpPage, isShowHeader: false },
  { path: "/product-detail/:id", page: ProductDetailsPage, isShowHeader: true },
  { path: "/profile", page: ProfilePage, isShowHeader: true, isPrivate: true },
  { path: "/wishlist", page: WishlistPage, isShowHeader: true, isPrivate: true },
  { path: "/order-history", page: OrderHistoryPage, isShowHeader: true, isPrivate: true },
  { path: "/admin", page: AdminPage, isShowHeader: false, isPrivate: true, isAdmin: true },
  { path: "*", page: NotFoundPage }
];

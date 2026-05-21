import HomePage from "../pages/HomePage/HomePage";
import NotFoundPage from "../pages/NotFoundPage/NotFoundPage";
import OderPage from "../pages/OderPage/OderPage";
import ProductDetailsPage from "../pages/ProductDetailsPage/ProductDetailsPage";
import ProductsPage from "../pages/ProductsPage/ProductsPage";
import ProfilePage from "../pages/ProfilePage/ProfilePage";
import ServicesPage from "../pages/ServicesPage/ServicesPage";
import ServiceDetailPage from "../pages/ServiceDetailPage/ServiceDetailPage";
import ContactPage from "../pages/ContactPage/ContactPage";
import TypeProductPage from "../pages/TypeProductPage/TypeProductPage";
import AdminPage from "../pages/AdminPage/AdminPage";
import WishlistPage from "../pages/WishlistPage/WishlistPage";
import OrderHistoryPage from "../pages/OrderHistoryPage/OrderHistoryPage";
import CartPage from "../pages/CartPage/CartPage";
import CheckoutPage from "../pages/CheckoutPage/CheckoutPage";
import PolicyPage from "../pages/PolicyPage/PolicyPage";
import OrderSuccessPage from "../pages/OrderSuccessPage/OrderSuccessPage";
import OrderDetailPage from "../pages/OrderDetailPage/OrderDetailPage";
import SearchResultsPage from "../pages/SearchResultsPage/SearchResultsPage";
import AuthRedirectPage from "../pages/AuthRedirectPage/AuthRedirectPage";
import StyleGuidePage from "../pages/StyleGuidePage/StyleGuidePage";
import UiStatesPage from "../pages/UiStatesPage/UiStatesPage";
import MyAppointmentsPage from "../pages/MyAppointmentsPage/MyAppointmentsPage";
import MyPetsPage from "../pages/MyPetsPage/MyPetsPage";

export const routes = [
  { path: "/", page: HomePage, isShowHeader: true },
  { path: "/order", page: OderPage, isShowHeader: true },
  { path: "/cart", page: CartPage, isShowHeader: true },
  { path: "/checkout", page: CheckoutPage, isShowHeader: true, isPrivate: true },
  { path: "/order-success", page: OrderSuccessPage, isShowHeader: true, isPrivate: true },
  { path: "/products", page: ProductsPage, isShowHeader: true },
  { path: "/login", page: AuthRedirectPage, isShowHeader: true },
  { path: "/register", page: AuthRedirectPage, isShowHeader: true },
  { path: "/forgot-password", page: AuthRedirectPage, isShowHeader: true },
  { path: "/products/:speciesSlug/:typeSlug/:subSlug", page: ProductsPage, isShowHeader: true },
  { path: "/search", page: SearchResultsPage, isShowHeader: true },
  { path: "/search-results", page: SearchResultsPage, isShowHeader: true },
  { path: "/style-guide", page: StyleGuidePage, isShowHeader: true },
  { path: "/ui-states", page: UiStatesPage, isShowHeader: true },
  { path: "/type", page: TypeProductPage, isShowHeader: true },
  { path: "/services", page: ServicesPage, isShowHeader: true },
  { path: "/services/:slug", page: ServiceDetailPage, isShowHeader: true },
  { path: "/contact", page: ContactPage, isShowHeader: true },
  { path: "/policies", page: PolicyPage, isShowHeader: true },
  { path: "/product-detail/:id", page: ProductDetailsPage, isShowHeader: true },
  { path: "/profile", page: ProfilePage, isShowHeader: true, isPrivate: true },
  { path: "/wishlist", page: WishlistPage, isShowHeader: true },
  { path: "/order-history", page: OrderHistoryPage, isShowHeader: true, isPrivate: true },
  { path: "/my-appointments", page: MyAppointmentsPage, isShowHeader: true, isPrivate: true },
  { path: "/my-pets", page: MyPetsPage, isShowHeader: true, isPrivate: true },
  { path: "/order-detail/:id", page: OrderDetailPage, isShowHeader: true, isPrivate: true },
  { path: "/admin", page: AdminPage, isShowHeader: false, isPrivate: true, isAdmin: true },
  { path: "*", page: NotFoundPage }
];

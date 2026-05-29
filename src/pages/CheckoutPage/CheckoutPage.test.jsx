import React from "react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import CheckoutPage from "./CheckoutPage";
import userReducer from "../../redux/slides/userSlider";
import * as BillServices from "../../services/BillServices";
import * as CartServices from "../../services/CartServices";
import * as CouponServices from "../../services/CouponServices";
import * as Message from "../../components/Message/Message";

const mockNavigate = jest.fn();

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));

jest.mock("../../services/BillServices", () => ({
  createBill: jest.fn(),
}));

jest.mock("../../services/CartServices", () => ({
  getMyCart: jest.fn(),
  updateMyCart: jest.fn(),
  clearMyCart: jest.fn(),
}));

jest.mock("../../services/CouponServices", () => ({
  validateCoupon: jest.fn(),
}));

jest.mock("../../components/Message/Message", () => ({
  success: jest.fn(),
  error: jest.fn(),
  warning: jest.fn(),
}));

jest.mock("../../components/ui", () => ({
  EmptyState: ({ description }) => <div>{description}</div>,
  PetshopIcon: () => null,
}));

const cartSeed = [
  {
    idsp: "p1",
    name: "Product 1",
    image: "",
    price: 120000,
    discount: 0,
    countInStock: 5,
    quantity: 1,
    category: "Food",
  },
];

const renderPage = (userState) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false, refetchOnWindowFocus: false },
      mutations: { retry: false },
    },
  });
  const store = configureStore({
    reducer: { user: userReducer },
    preloadedState: { user: userState },
  });
  return render(
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <CheckoutPage />
      </QueryClientProvider>
    </Provider>
  );
};

describe("CheckoutPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    localStorage.setItem("cartItems", JSON.stringify(cartSeed));
    CartServices.getMyCart.mockResolvedValue({ data: { items: [] } });
    CartServices.updateMyCart.mockResolvedValue({ status: "OK" });
    CartServices.clearMyCart.mockResolvedValue({ status: "OK" });
    CouponServices.validateCoupon.mockResolvedValue({ status: "ERR" });
  });

  test("redirects to login when user submits order without auth", async () => {
    renderPage({
      name: "",
      email: "",
      phone: "",
      address: "",
      avatar: "",
      access_token: "",
      id: "",
      isAdmin: false,
    });

    const submitBtn = screen.getByRole("button", { name: "Đặt hàng" });
    expect(submitBtn).toBeDisabled();
  });

  test("creates order successfully and navigates to order success page", async () => {
    CartServices.getMyCart.mockResolvedValue({
      data: {
        items: [
          {
            productId: "p1",
            name: "Product 1",
            image: "",
            price: 120000,
            discount: 0,
            countInStock: 5,
            quantity: 1,
            category: "Food",
          },
        ],
      },
    });
    BillServices.createBill.mockResolvedValue({
      status: "OK",
      data: { _id: "bill-1" },
    });

    renderPage({
      name: "Tester",
      email: "test@example.com",
      phone: "0912345678",
      address: "123 Nguyen Trai",
      avatar: "",
      access_token: "access-token",
      id: "u1",
      isAdmin: false,
    });

    await waitFor(() => {
      expect(screen.getByRole("button", { name: "Đặt hàng" })).not.toBeDisabled();
    });

    const submitBtn = screen.getByRole("button", { name: "Đặt hàng" });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(BillServices.createBill).toHaveBeenCalled();
    });
    await waitFor(() => {
      expect(Message.success).toHaveBeenCalledWith("Đặt hàng thành công");
    });

    expect(CartServices.clearMyCart).toHaveBeenCalledWith("access-token");
    expect(mockNavigate).toHaveBeenCalledWith("/order-success?orderId=bill-1");
  });
});

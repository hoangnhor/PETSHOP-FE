import React from "react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import WishlistPage from "./WishlistPage";
import userReducer from "../../redux/slides/userSlider";
import * as ProductServices from "../../services/ProductServices";
import * as WishlistServices from "../../services/WishlistServices";
import * as Message from "../../components/Message/Message";

const mockNavigate = jest.fn();

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));

jest.mock("../../services/ProductServices", () => ({
  getAllProduct: jest.fn(),
}));

jest.mock("../../services/WishlistServices", () => ({
  getMyWishlist: jest.fn(),
  removeWishlistItem: jest.fn(),
  clearMyWishlist: jest.fn(),
  addWishlistItem: jest.fn(),
}));

jest.mock("../../services/CartServices", () => ({
  updateMyCart: jest.fn(),
}));

jest.mock("../../components/Message/Message", () => ({
  success: jest.fn(),
  error: jest.fn(),
  warning: jest.fn(),
}));

jest.mock("../../components/ui", () => ({
  ConfirmDialog: ({ open, onOk, onCancel }) =>
    open ? (
      <div>
        <button type="button" onClick={onOk}>OK</button>
        <button type="button" onClick={onCancel}>Cancel</button>
      </div>
    ) : null,
  EmptyState: ({ description }) => <div>{description}</div>,
  PetshopIcon: () => null,
}));

const renderPage = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false, refetchOnWindowFocus: false },
      mutations: { retry: false },
    },
  });
  const store = configureStore({
    reducer: { user: userReducer },
    preloadedState: {
      user: {
        name: "Tester",
        email: "test@example.com",
        phone: "",
        address: "",
        avatar: "",
        access_token: "access-token",
        id: "u1",
        isAdmin: false,
      },
    },
  });

  return render(
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <WishlistPage />
      </QueryClientProvider>
    </Provider>
  );
};

describe("WishlistPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    localStorage.setItem(
      "wishlistItems",
      JSON.stringify([
        {
          idsp: "p1",
          name: "Product 1",
          image: "",
          price: 120000,
          discount: 0,
          countInStock: 3,
          category: "Food",
        },
      ])
    );
    ProductServices.getAllProduct.mockResolvedValue({ data: [] });
    WishlistServices.getMyWishlist.mockResolvedValue({
      data: {
        productIds: [
          {
            _id: "p1",
            name: "Product 1",
            image: "",
            price: 120000,
            discount: 0,
            countInStock: 3,
            type: { name: "Food" },
          },
        ],
      },
    });
  });

  test("does not show success when remove wishlist item API fails", async () => {
    WishlistServices.removeWishlistItem.mockRejectedValueOnce(new Error("sync failed"));

    renderPage();
    const removeBtn = await screen.findByLabelText("Xóa khỏi yêu thích");
    fireEvent.click(removeBtn);

    await waitFor(() => {
      expect(Message.error).toHaveBeenCalledWith("Không thể cập nhật yêu thích trên hệ thống");
    });
    expect(Message.success).not.toHaveBeenCalledWith("Đã xóa khỏi yêu thích");
  });
});

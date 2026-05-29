import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { jwtDecode } from "jwt-decode";
import LoginPage from "./LoginPage";
import userReducer from "../../redux/slides/userSlider";
import * as UserServices from "../../services/UserServices";
import * as CartServices from "../../services/CartServices";
import * as WishlistServices from "../../services/WishlistServices";
import * as Message from "../../components/Message/Message";
import { CART_MERGE_MARKER, WISHLIST_MERGE_MARKER } from "../../constants/authSync";

const mockNavigate = jest.fn();

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));

jest.mock("jwt-decode", () => ({
  jwtDecode: jest.fn(),
}));

jest.mock("../../services/UserServices", () => ({
  loginUser: jest.fn(),
  getDetailsUser: jest.fn(),
}));
jest.mock("../../services/CartServices", () => ({
  getMyCart: jest.fn(),
  updateMyCart: jest.fn(),
}));
jest.mock("../../services/WishlistServices", () => ({
  getMyWishlist: jest.fn(),
  addWishlistItem: jest.fn(),
}));
jest.mock("../../components/Message/Message", () => ({
  success: jest.fn(),
  error: jest.fn(),
  warning: jest.fn(),
}));

const renderPage = () => {
  const store = configureStore({
    reducer: {
      user: userReducer,
    },
  });
  return render(
    <Provider store={store}>
      <LoginPage />
    </Provider>
  );
};

describe("LoginPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    jwtDecode.mockReturnValue({
      id: "u1",
      email: "test@example.com",
      isAdmin: false,
    });
    UserServices.loginUser.mockResolvedValue({
      access_token: "access-token",
    });
    UserServices.getDetailsUser.mockResolvedValue({
      data: { _id: "u1", name: "Tester", email: "test@example.com" },
    });
    CartServices.getMyCart.mockResolvedValue({
      data: { items: [] },
    });
    CartServices.updateMyCart.mockResolvedValue({
      status: "OK",
    });
    WishlistServices.getMyWishlist.mockResolvedValue({
      data: { productIds: [] },
    });
    WishlistServices.addWishlistItem.mockResolvedValue({
      status: "OK",
    });
  });

  test("keeps login successful when wishlist merge has partial failure", async () => {
    localStorage.setItem(
      "wishlistItems",
      JSON.stringify([{ idsp: "p1", name: "Wishlist item" }])
    );
    WishlistServices.addWishlistItem.mockRejectedValueOnce(new Error("sync error"));

    renderPage();
    fireEvent.change(screen.getByPlaceholderText("Nhập email"), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("Nhập mật khẩu"), {
      target: { value: "Password@123" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Đăng nhập" }));

    await waitFor(() => {
      expect(Message.success).toHaveBeenCalledWith("Đăng nhập thành công");
    });
    expect(Message.warning).toHaveBeenCalledWith(
      "Đăng nhập thành công, nhưng một phần dữ liệu chưa đồng bộ"
    );
    expect(Message.error).not.toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledWith("/profile");
  });

  test("writes merge markers for cart and wishlist after successful sync", async () => {
    localStorage.setItem(
      "cartItems",
      JSON.stringify([{ idsp: "p1", quantity: 2, name: "Cart item" }])
    );
    localStorage.setItem(
      "wishlistItems",
      JSON.stringify([{ idsp: "p2", name: "Wishlist item" }])
    );

    renderPage();
    fireEvent.change(screen.getByPlaceholderText("Nhập email"), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("Nhập mật khẩu"), {
      target: { value: "Password@123" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Đăng nhập" }));

    await waitFor(() => {
      expect(Message.success).toHaveBeenCalledWith("Đăng nhập thành công");
    });

    expect(localStorage.getItem(CART_MERGE_MARKER)).toBe("u1");
    expect(localStorage.getItem(WISHLIST_MERGE_MARKER)).toBe("u1");
    expect(mockNavigate).toHaveBeenCalledWith("/profile");
  });
});

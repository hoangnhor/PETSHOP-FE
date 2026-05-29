import * as UserServices from "./UserServices";
import { getAccessToken, setAccessToken } from "./authToken";

jest.mock("axios", () => {
  const createInstance = () => ({
    defaults: {},
    interceptors: {
      request: { use: jest.fn(), eject: jest.fn() },
      response: { use: jest.fn(), eject: jest.fn() },
    },
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  });
  const instance = createInstance();
  instance.create = jest.fn(() => createInstance());
  return instance;
});

describe("UserServices auth failure handling", () => {
  afterEach(() => {
    UserServices.setAuthFailureHandler(null);
    setAccessToken("");
  });

  test("getDetailsUser triggers auth failure handler on 401", async () => {
    const originalGet = UserServices.axiosJWT.get;
    const onAuthFail = jest.fn();
    UserServices.setAuthFailureHandler(onAuthFail);
    setAccessToken("token-before-failure");
    try {
      UserServices.axiosJWT.get = jest.fn().mockRejectedValue({
        response: { status: 401, data: { message: "Unauthorized" } },
      });

      await expect(UserServices.getDetailsUser("user-id", "token-before-failure")).rejects.toThrow();
      expect(onAuthFail).toHaveBeenCalledWith("get-details-auth-failed");
      expect(getAccessToken()).toBe("");
    } finally {
      UserServices.axiosJWT.get = originalGet;
    }
  });

  test("getDetailsUser keeps session on 403 permission error", async () => {
    const originalGet = UserServices.axiosJWT.get;
    const onAuthFail = jest.fn();
    UserServices.setAuthFailureHandler(onAuthFail);
    setAccessToken("token-still-valid");
    try {
      UserServices.axiosJWT.get = jest.fn().mockRejectedValue({
        response: { status: 403, data: { message: "Chỉ admin mới có quyền truy cập" } },
      });

      await expect(UserServices.getDetailsUser("user-id", "token-still-valid")).rejects.toThrow();
      expect(onAuthFail).not.toHaveBeenCalled();
      expect(getAccessToken()).toBe("token-still-valid");
    } finally {
      UserServices.axiosJWT.get = originalGet;
    }
  });
});

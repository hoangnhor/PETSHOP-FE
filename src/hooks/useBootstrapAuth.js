import { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { jwtDecode } from "jwt-decode";
import * as UserServices from "../services/UserServices";
import { resetUser, updateUser } from "../redux/slides/userSlider";
import { clearAccessToken, getAccessToken, hasAuthSessionMarker, setAccessToken } from "../services/authToken";
import { clearAuthMergeMarkers } from "../constants/authSync";
import { syncAuthAfterLogin } from "../services/authMergeServices";

export const useBootstrapAuth = () => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user);
  const [isPending, setIsLoading] = useState(false);
  const [authReady, setAuthReady] = useState(false);

  const decodeToken = useCallback((token) => {
    try {
      if (!token) return null;
      return jwtDecode(token);
    } catch (error) {
      return null;
    }
  }, []);

  const reportMergeError = useCallback((scope, error) => {
    const message = error?.message || `Không thể đồng bộ ${scope}`;
    console.warn(`[auth-merge:${scope}]`, message, error);
  }, []);

  const syncUserToken = useCallback(
    (token, decoded = null) => {
      const parsedDecoded = decoded || decodeToken(token);
      dispatch(
        updateUser({
          id: parsedDecoded?.id || user?.id || "",
          name: user?.name || (parsedDecoded?.email ? "Tài khoản" : ""),
          email: parsedDecoded?.email || user?.email || "",
          phone: user?.phone || "",
          address: user?.address || "",
          avatar: user?.avatar || "",
          access_token: token || "",
          isAdmin: Boolean(parsedDecoded?.isAdmin),
        })
      );
    },
    [decodeToken, dispatch, user]
  );

  const handleGetDetailsUser = useCallback(
    async (id, token) => {
      const res = await UserServices.getDetailsUser(id, token);
      dispatch(updateUser({ ...res?.data, access_token: token }));
    },
    [dispatch]
  );

  useEffect(() => {
    const bootstrapAuth = async () => {
      setIsLoading(true);
      try {
        let token = getAccessToken();
        const decoded = decodeToken(token);
        const now = Date.now() / 1000;

        const shouldTryRefresh = hasAuthSessionMarker();
        if ((!token || !decoded?.exp || decoded.exp <= now) && shouldTryRefresh) {
          const refreshRes = await UserServices.refreshToken();
          token = refreshRes?.access_token || "";
        }

        if (!token) throw new Error("Không có access token hợp lệ");

        setAccessToken(token);
        const parsedDecoded = decodeToken(token);
        const syncResult = await syncAuthAfterLogin(token, (payload) => dispatch(updateUser(payload)));
        if (syncResult.failedCount > 0) {
          reportMergeError("auth-sync", new Error(`Đồng bộ chưa hoàn tất (${syncResult.failedCount} lỗi)`));
        }

        if (parsedDecoded?.id) {
          await handleGetDetailsUser(parsedDecoded.id, token);
        } else {
          dispatch(
            updateUser({
              access_token: token,
              name: "Tài khoản",
              email: parsedDecoded?.email || "",
              id: parsedDecoded?.id || "",
              isAdmin: Boolean(parsedDecoded?.isAdmin),
            })
          );
        }
      } catch (error) {
        clearAuthMergeMarkers();
        clearAccessToken();
        dispatch(resetUser());
      } finally {
        setAuthReady(true);
        setIsLoading(false);
      }
    };

    bootstrapAuth();
  }, [decodeToken, dispatch, handleGetDetailsUser, reportMergeError]);

  useEffect(() => {
    const syncFromTokenEvent = (event) => {
      const nextToken = String(event?.detail || "");
      if (!nextToken) {
        clearAuthMergeMarkers();
        dispatch(resetUser());
        return;
      }
      syncUserToken(nextToken, decodeToken(nextToken));
    };

    window.addEventListener("petshop-access-token-changed", syncFromTokenEvent);
    return () => window.removeEventListener("petshop-access-token-changed", syncFromTokenEvent);
  }, [decodeToken, dispatch, syncUserToken]);

  useEffect(() => {
    UserServices.setAuthFailureHandler(() => {
      clearAuthMergeMarkers();
      dispatch(resetUser());
    });
    return () => {
      UserServices.setAuthFailureHandler(null);
    };
  }, [dispatch]);

  return { isPending, authReady };
};

import {
  createApi,
  fetchBaseQuery,
  type BaseQueryFn,
  type FetchArgs,
  type FetchBaseQueryError,
} from "@reduxjs/toolkit/query/react";
import type { CafeLoginRequest } from "@contracts/auth.types";
import type { DesktopSession } from "@/types";

const configuredApiBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim() ?? "";
const apiBaseUrl =
  configuredApiBaseUrl ||
  (import.meta.env.DEV ? "http://localhost:3000/api/v1" : "");

export const isDesktopApiConfigured = apiBaseUrl.length > 0;

const rawBaseQuery = fetchBaseQuery({
  baseUrl: apiBaseUrl,
  prepareHeaders: (headers, { getState }) => {
    const state = getState() as { auth?: { session?: DesktopSession | null } };
    const token = state.auth?.session?.accessToken;
    if (token) headers.set("authorization", `Bearer ${token}`);
    return headers;
  },
});

const guardedBaseQuery: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  if (!apiBaseUrl)
    return {
      error: {
        status: "CUSTOM_ERROR",
        error: "API_BASE_URL_NOT_CONFIGURED",
      },
    };
  return rawBaseQuery(args, api, extraOptions);
};

type CafeLoginResponse = {
  success: true;
  data: DesktopSession & { accessToken: string; expiresIn: number };
};

export const backendApi = createApi({
  reducerPath: "backendApi",
  baseQuery: guardedBaseQuery,
  endpoints: (builder) => ({
    cafeLogin: builder.mutation<DesktopSession, CafeLoginRequest>({
      query: (body) => ({
        url: "/auth/cafe/login",
        method: "POST",
        body,
      }),
      transformResponse: (response: CafeLoginResponse) => response.data,
    }),
  }),
});

export const { useCafeLoginMutation } = backendApi;

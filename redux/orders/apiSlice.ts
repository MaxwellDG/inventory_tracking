import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQuery } from "../api";
import { productsApi } from "../products/apiSlice";
import { PaginationFilters } from "../types";
import { API_SLICE_NAME, URL_ORDERS } from "./const";
import {
  CreateOrderRequest,
  Order,
  PaginatedOrdersResponse,
  UpdateOrderRequest,
} from "./types";

export const ordersApi = createApi({
  reducerPath: API_SLICE_NAME,
  baseQuery: baseQuery(),
  tagTypes: ["orders"],
  endpoints: (builder) => ({
    getOrder: builder.query<Order, string>({
      query(uuid) {
        return {
          url: URL_ORDERS + `/${uuid}`,
        };
      },
      providesTags: (result, error, uuid) => [{ type: "orders", id: uuid }],
    }),
    getOrders: builder.query<PaginatedOrdersResponse, PaginationFilters>({
      query(params) {
        const queryParams = new URLSearchParams();
        if (params.page !== undefined) {
          queryParams.append("page", params.page.toString());
        }
        if (params.startDate !== undefined) {
          queryParams.append("start_date", params.startDate.toString());
        }
        if (params.endDate !== undefined) {
          queryParams.append("end_date", params.endDate.toString());
        }
        if (params.status !== undefined) {
          queryParams.append("status", params.status);
        }
        const queryString = queryParams.toString();

        return {
          url: URL_ORDERS + (queryString ? `?${queryString}` : ""),
        };
      },
      providesTags: (result) =>
        result
          ? [
              ...result.data.map(({ uuid }) => ({
                type: "orders" as const,
                id: uuid,
              })),
              { type: "orders", id: "LIST" },
            ]
          : [{ type: "orders", id: "LIST" }],
    }),
    createOrder: builder.mutation<Order, CreateOrderRequest>({
      query(body) {
        return {
          method: "POST",
          url: URL_ORDERS,
          body,
        };
      },
      invalidatesTags: ["orders"],
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          // Invalidate inventory cache after successful order creation
          dispatch(productsApi.util.invalidateTags(["inventory"]));
        } catch {
          // Do nothing on error
        }
      },
    }),
    updateOrder: builder.mutation<Order, UpdateOrderRequest>({
      query(body) {
        const { order_uuid, ...updateData } = body;
        return {
          method: "PATCH",
          url: `${URL_ORDERS}/${order_uuid}`,
          body: updateData,
        };
      },
      invalidatesTags: (result, error, { order_uuid }) => [
        "orders",
        { type: "orders", id: order_uuid },
      ],
    }),
    deleteOrder: builder.mutation<Order, string>({
      query(uuid) {
        return {
          method: "DELETE",
          url: URL_ORDERS + `/${uuid}`,
        };
      },
      invalidatesTags: ["orders"],
    }),
  }),
});

export const {
  useGetOrderQuery,
  useGetOrdersQuery,
  useCreateOrderMutation,
  useUpdateOrderMutation,
  useDeleteOrderMutation,
} = ordersApi;

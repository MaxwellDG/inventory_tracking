import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQuery } from "../api";
import { Item } from "../products/types";
import { PaginationFilters } from "../types";
import { API_SLICE_NAME, URL_ORDERS } from "./const";
import { Order } from "./types";

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
    }),
    getOrders: builder.query<Order[], PaginationFilters>({
      query(params) {
        const queryParams = new URLSearchParams();
        if (params.page !== undefined) {
          queryParams.append("page", params.page.toString());
        }
        if (params.startDate !== undefined) {
          queryParams.append("startDate", params.startDate.toString());
        }
        if (params.endDate !== undefined) {
          queryParams.append("endDate", params.endDate.toString());
        }
        const queryString = queryParams.toString();
        return {
          url: URL_ORDERS + (queryString ? `?${queryString}` : ""),
        };
      },
    }),
    createOrder: builder.mutation<Order, Item[]>({
      query(body) {
        return {
          method: "POST",
          url: URL_ORDERS,
          body,
        };
      },
      invalidatesTags: ["orders"],
    }),
    updateOrder: builder.mutation<Order, { order_uuid: string; items: Item[] }>(
      {
        query(body) {
          return {
            method: "PATCH",
            url: `${URL_ORDERS}/${body.order_uuid}`,
            body,
          };
        },
        invalidatesTags: ["orders"],
      }
    ),
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

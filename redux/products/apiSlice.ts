import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQuery } from "../api";
import {
  API_SLICE_NAME,
  URL_PRODUCTS_CATEGORIES,
  URL_PRODUCTS_INVENTORY,
  URL_PRODUCTS_ITEMS,
} from "./const";
import { Category, InventoryResponse, Item } from "./types";

export const productsApi = createApi({
  reducerPath: API_SLICE_NAME,
  baseQuery: baseQuery(),
  tagTypes: ["inventory"],
  endpoints: (builder) => ({
    getInventory: builder.query<InventoryResponse, void>({
      query() {
        return {
          url: URL_PRODUCTS_INVENTORY,
        };
      },
      providesTags: ["inventory"],
    }),
    createCategory: builder.mutation<Category, Omit<Category, "id">>({
      query(body) {
        return {
          method: "POST",
          url: URL_PRODUCTS_CATEGORIES,
          body,
        };
      },
      invalidatesTags: ["inventory"],
    }),
    updateCategory: builder.mutation<Category, Category>({
      query(body) {
        return {
          method: "PATCH",
          url: URL_PRODUCTS_CATEGORIES,
          body,
        };
      },
      invalidatesTags: ["inventory"],
    }),
    deleteCategory: builder.mutation<Category, number>({
      query(id) {
        return {
          method: "DELETE",
          url: URL_PRODUCTS_CATEGORIES + `/${id}`,
        };
      },
      invalidatesTags: ["inventory"],
    }),
    createItem: builder.mutation<Item, Omit<Item, "id">>({
      query(body) {
        return {
          method: "POST",
          url: URL_PRODUCTS_ITEMS,
          body,
        };
      },
      invalidatesTags: ["inventory"],
    }),
    updateItem: builder.mutation<Item, Item>({
      query(body) {
        return {
          method: "PATCH",
          url: `${URL_PRODUCTS_ITEMS}/${body.id}`,
          body,
        };
      },
      invalidatesTags: ["inventory"],
    }),
    deleteItem: builder.mutation<Item, number>({
      query(id) {
        return {
          method: "DELETE",
          url: URL_PRODUCTS_ITEMS + `/${id}`,
        };
      },
      invalidatesTags: ["inventory"],
    }),
  }),
});

export const {
  useGetInventoryQuery,
  useCreateCategoryMutation,
  useCreateItemMutation,
  useDeleteCategoryMutation,
  useDeleteItemMutation,
  useUpdateCategoryMutation,
  useUpdateItemMutation,
} = productsApi;

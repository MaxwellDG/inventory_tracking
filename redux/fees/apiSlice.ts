import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQuery } from "../api";
import { API_SLICE_NAME, URL_FEES } from "./const";
import { CreateFeeRequest, Fee, FeeResponse, UpdateFeeRequest } from "./types";

export const feesApi = createApi({
  reducerPath: API_SLICE_NAME,
  baseQuery: baseQuery(),
  tagTypes: ["fees"],
  endpoints: (builder) => ({
    // Get all fees
    getFees: builder.query<FeeResponse, void>({
      query() {
        return {
          url: URL_FEES,
        };
      },
      providesTags: ["fees"],
    }),
    // Get a single fee by ID
    getFee: builder.query<Fee, number>({
      query(id) {
        return {
          url: `${URL_FEES}/${id}`,
        };
      },
      providesTags: ["fees"],
    }),
    // Create a new fee
    createFee: builder.mutation<Fee, CreateFeeRequest>({
      query(body) {
        return {
          method: "POST",
          url: URL_FEES,
          body,
        };
      },
      invalidatesTags: ["fees"],
    }),
    // Update an existing fee
    updateFee: builder.mutation<Fee, UpdateFeeRequest>({
      query(body) {
        return {
          method: "PATCH",
          url: `${URL_FEES}/${body.id}`,
          body,
        };
      },
      invalidatesTags: ["fees"],
    }),
    // Delete a fee
    deleteFee: builder.mutation<Fee, number>({
      query(id) {
        return {
          method: "DELETE",
          url: `${URL_FEES}/${id}`,
        };
      },
      invalidatesTags: ["fees"],
    }),
  }),
});

export const {
  useGetFeesQuery,
  useGetFeeQuery,
  useCreateFeeMutation,
  useUpdateFeeMutation,
  useDeleteFeeMutation,
} = feesApi;


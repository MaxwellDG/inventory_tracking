import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQuery } from "../api";
import { API_SLICE_NAME, URL_LABELS } from "./const";
import {
  CreateLabelRequest,
  Label,
  LabelResponse,
  UpdateLabelRequest,
} from "./types";

export const labelsApi = createApi({
  reducerPath: API_SLICE_NAME,
  baseQuery: baseQuery(),
  tagTypes: ["labels"],
  endpoints: (builder) => ({
    // Get all labels
    getLabels: builder.query<LabelResponse, void>({
      query() {
        return {
          url: URL_LABELS,
        };
      },
      providesTags: ["labels"],
    }),
    // Get a single label by ID
    getLabel: builder.query<Label, number>({
      query(id) {
        return {
          url: `${URL_LABELS}/${id}`,
        };
      },
      providesTags: ["labels"],
    }),
    // Create a new label
    createLabel: builder.mutation<Label, CreateLabelRequest>({
      query(body) {
        return {
          method: "POST",
          url: URL_LABELS,
          body,
        };
      },
      invalidatesTags: ["labels"],
    }),
    // Update an existing label
    updateLabel: builder.mutation<Label, UpdateLabelRequest>({
      query(body) {
        return {
          method: "PATCH",
          url: `${URL_LABELS}/${body.id}`,
          body,
        };
      },
      invalidatesTags: ["labels"],
    }),
    // Delete a label
    deleteLabel: builder.mutation<Label, number>({
      query(id) {
        return {
          method: "DELETE",
          url: `${URL_LABELS}/${id}`,
        };
      },
      invalidatesTags: ["labels"],
    }),
  }),
});

export const {
  useGetLabelsQuery,
  useGetLabelQuery,
  useCreateLabelMutation,
  useUpdateLabelMutation,
  useDeleteLabelMutation,
} = labelsApi;


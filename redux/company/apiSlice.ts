import { createApi } from "@reduxjs/toolkit/query/react";
import { Company, JoinCompanyResponse, UserCompany } from "./types";
import { baseQuery } from "../api";

export const companiesApi = createApi({
  reducerPath: "companies",
  baseQuery: baseQuery(),
  endpoints: (builder) => ({
    getCompany: builder.query<{ data: UserCompany | Company }, number>({
      query: (id) => `/companies/${id}`,
      transformResponse: (response: any) => {
        return response;
      },
    }),
    createCompany: builder.mutation<{ data: Company }, { name: string }>({
      query: ({ name }) => ({
        url: "/companies",
        method: "POST",
        body: { name }
      }),
    }),
    joinCompany: builder.mutation<JoinCompanyResponse, { company_id: number }>({
      query: ({ company_id }) => ({
        url: "/companies/join",
        method: "POST",
        body: { company_id }
      }),
    }),
  }),
});

export const { useGetCompanyQuery, useCreateCompanyMutation, useJoinCompanyMutation } = companiesApi;
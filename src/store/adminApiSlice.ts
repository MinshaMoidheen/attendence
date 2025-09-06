import { ADMINS_URL } from "@/constants";
import { apiSlice } from "./apiSlice";

export const adminApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({

        createAdmin: builder.mutation({
            query: (data) => ({
              url: ADMINS_URL,
              method: "POST",
              body: data,
            }),
          }),
      
          getAllAdmin: builder.query({
            query: ({ page, limit }) => ({
              url: ADMINS_URL,
              method: "GET",
              params: { page, limit },
            }),
          }),
      
          getAdminById: builder.query({
            query: (adminId) => ({
              url: `${ADMINS_URL}/${adminId}`,
              method: "GET",
            }),
          }),
      
          updateAdmin: builder.mutation({
            query: ({ adminId, body }) => ({
              url: `${ADMINS_URL}/${adminId}`,
              method: "PUT",
              body,
            }),
          }),
      
          deleteAdmin: builder.mutation({
            query: (adminId) => ({
              url: `${ADMINS_URL}/${adminId}`,
              method: "DELETE",
            }),
          }),

    })
})

export const {
   useCreateAdminMutation,
   useGetAllAdminQuery,
   useGetAdminByIdQuery,
   useUpdateAdminMutation,
   useDeleteAdminMutation,
  } = adminApiSlice; 
import { USERS_URL } from "@/constants";
import { apiSlice } from "./apiSlice";

export const userApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({

        createUser: builder.mutation({
            query: (data) => ({
              url: USERS_URL,
              method: "POST",
              body: data,
            }),
          }),
      
          getAllUser: builder.query({
            query: ({ page, limit }) => ({
              url: USERS_URL,
              method: "GET",
              params: { 
                limit, 
                offset: (page - 1) * limit 
              },
            }),
          }),
      
          getUserById: builder.query({
            query: (userId) => ({
              url: `${USERS_URL}/${userId}`,
              method: "GET",
            }),
          }),
      
          updateUser: builder.mutation({
            query: ({ userId, body }) => ({
              url: `${USERS_URL}/${userId}`,
              method: "PUT",
              body,
            }),
          }),
      
          deleteUser: builder.mutation({
            query: (userId) => ({
              url: `${USERS_URL}/${userId}`,
              method: "DELETE",
            }),
          }),

    })
})

export const {
   useCreateUserMutation,
   useGetAllUserQuery,
   useGetUserByIdQuery,
   useUpdateUserMutation,
   useDeleteUserMutation,
  } = userApiSlice; 
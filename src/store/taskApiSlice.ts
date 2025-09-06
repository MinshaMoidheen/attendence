import { TASKS_URL } from "@/constants";
import { apiSlice } from "./apiSlice";

export interface Task {
  _id: string;
  fromUserId: string;
  toUserId: string;
  description: string;
  shortDesc: string;
  timeAndDate: string;
  tracking: {
    status: 'planned' | 'inprogress' | 'completed';
    date: string;
  }[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateTaskRequest {
  fromUserId: string;
  toUserId: string;
  description: string;
  shortDesc: string;
  timeAndDate: string;
}

export interface UpdateTaskRequest {
  taskId: string;
  toUserId?: string;
  description?: string;
  shortDesc?: string;
  timeAndDate?: string;
  tracking?: {
    status: 'planned' | 'inprogress' | 'completed';
    date: string;
  }[];
}

export const taskApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Create task
    createTask: builder.mutation<
      {
        message: string;
        task: Task;
      },
      CreateTaskRequest
    >({
      query: (taskData) => ({
        url: TASKS_URL,
        method: "POST",
        body: taskData,
      }),
      invalidatesTags: ['Task'],
    }),

    // Get all tasks
    getAllTasks: builder.query<
      {
        tasks: Task[];
        total: number;
        limit: number;
        offset: number;
        pagination: {
          currentPage: number;
          totalPages: number;
          hasMore: boolean;
          totalItems: number;
        };
      },
      {
        page?: number;
        limit?: number;
        fromUserId?: string;
        toUserId?: string;
      }
    >({
      query: ({ page = 1, limit = 20, fromUserId, toUserId }) => ({
        url: TASKS_URL,
        method: "GET",
        params: {
          limit,
          offset: (page - 1) * limit,
          ...(fromUserId && { fromUserId }),
          ...(toUserId && { toUserId }),
        },
      }),
      providesTags: ['Task'],
    }),

    // Get task by ID
    getTaskById: builder.query<
      {
        task: Task;
      },
      string
    >({
      query: (taskId) => ({
        url: `${TASKS_URL}/${taskId}`,
        method: "GET",
      }),
      providesTags: (result, error, taskId) => [
        { type: 'Task', id: taskId },
      ],
    }),

    // Update task
    updateTask: builder.mutation<
      {
        message: string;
        task: Task;
      },
      UpdateTaskRequest
    >({
      query: ({ taskId, ...updateData }) => ({
        url: `${TASKS_URL}/${taskId}`,
        method: "PUT",
        body: updateData,
      }),
      invalidatesTags: (result, error, { taskId }) => [
        { type: 'Task', id: taskId },
        'Task',
      ],
    }),

    // Delete task
    deleteTask: builder.mutation<
      {
        message: string;
      },
      string
    >({
      query: (taskId) => ({
        url: `${TASKS_URL}/${taskId}`,
        method: "DELETE",
      }),
      invalidatesTags: ['Task'],
    }),

    // Update task status
    updateTaskStatus: builder.mutation<
      {
        message: string;
        task: Task;
      },
      {
        taskId: string;
        status: 'planned' | 'inprogress' | 'completed';
      }
    >({
      query: ({ taskId, status }) => ({
        url: `${TASKS_URL}/${taskId}/status`,
        method: "PUT",
        body: { status },
      }),
      invalidatesTags: (result, error, { taskId }) => [
        { type: 'Task', id: taskId },
        'Task',
      ],
    }),
  }),
});

export const {
  useCreateTaskMutation,
  useGetAllTasksQuery,
  useGetTaskByIdQuery,
  useUpdateTaskMutation,
  useDeleteTaskMutation,
  useUpdateTaskStatusMutation,
} = taskApiSlice;

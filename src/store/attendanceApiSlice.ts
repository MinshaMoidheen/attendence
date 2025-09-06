import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { RootState } from './store';
import { logout, refreshTokenSuccess, refreshTokenFailure } from './authentication';
import { BASE_URL } from '@/constants';

// Define the base query with authentication
const baseQuery = fetchBaseQuery({
  baseUrl: BASE_URL,
  prepareHeaders: (headers, { getState }) => {
    // Add authentication token if available
    const token = (getState() as RootState).auth?.accessToken;
    if (token) {
      headers.set('authorization', `Bearer ${token}`);
    }
    headers.set('Content-Type', 'application/json');
    return headers;
  },
  credentials: 'include',
});

// Enhanced base query with token refresh logic
const baseQueryWithReauth = async (args: any, api: any, extraOptions: any) => {
  let result = await baseQuery(args, api, extraOptions);

  // If we get a 401, try to refresh the token
  if (result.error && result.error.status === 401) {
    const refreshToken = (api.getState() as RootState).auth?.refreshToken;
    
    if (refreshToken) {
      // Try to refresh the token
      const refreshResult = await baseQuery(
        {
          url: '/api/v1/auth/refresh-token',
          method: 'POST',
          body: { refreshToken },
        },
        api,
        extraOptions
      );

      if (refreshResult.data) {
        // Store the new token
        const { accessToken, expiresIn } = refreshResult.data as any;
        api.dispatch(refreshTokenSuccess({ accessToken, expiresIn }));
        
        // Retry the original query with new token
        result = await baseQuery(args, api, extraOptions);
      } else {
        // Refresh failed, logout user
        api.dispatch(refreshTokenFailure('Token refresh failed'));
        api.dispatch(logout());
      }
    } else {
      // No refresh token, logout user
      api.dispatch(logout());
    }
  }

  return result;
};

// Types for attendance data
export interface LocationData {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: number;
}

export interface AttendanceCoordinate {
  _id: string;
  desc: string;
  latitude: number;
  longitude: number;
  radius: number;
  adminId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PunchAttendanceRequest {
  userId: string;
  attendanceCoordinateId: string;
  faceImage: string; // Base64 encoded image
  userLocation: {
    latitude: number;
    longitude: number;
  };
  punchType: 'punchin' | 'punchout';
}

export interface AttendanceRecord {
  _id: string;
  userId: string;
  punchIn?: {
    timestamp: Date;
    location: LocationData;
    photo?: string;
    notes?: string;
  };
  punchOut?: {
    timestamp: Date;
    location: LocationData;
    photo?: string;
    notes?: string;
  };
  totalHours?: number;
  status: 'present' | 'absent' | 'late' | 'half_day';
  createdAt: Date;
  updatedAt: Date;
}

export interface AttendanceStats {
  totalDays: number;
  presentDays: number;
  absentDays: number;
  lateDays: number;
  halfDays: number;
  totalHours: number;
  averageHours: number;
  currentMonthStats: {
    present: number;
    absent: number;
    late: number;
    halfDay: number;
  };
}

export interface AttendanceQuery {
  limit?: number;
  offset?: number;
  startDate?: string;
  endDate?: string;
  status?: string;
  userId?: string;
}

export interface AttendanceStatsQuery {
  startDate?: string;
  endDate?: string;
  userId?: string;
}

// Create the attendance API slice
export const attendanceApiSlice = createApi({
  reducerPath: 'attendanceApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Attendance', 'AttendanceStats', 'AttendanceCoordinate'],
  endpoints: (builder) => ({
    // Punch attendance - users can punch their own attendance
    punchAttendance: builder.mutation<
      {
        message: string;
        attendance: AttendanceRecord;
      },
      PunchAttendanceRequest
    >({
      query: (punchData) => ({
        url: '/api/v1/attendances/punch',
        method: 'POST',
        body: punchData,
      }),
      invalidatesTags: ['Attendance', 'AttendanceStats'],
    }),

    // Get all attendance records
    getAllAttendance: builder.query<
      {
        attendances: AttendanceRecord[];
        total: number;
        limit: number;
        offset: number;
      },
      AttendanceQuery
    >({
      query: (params) => ({
        url: '/api/v1/attendances',
        method: 'GET',
        params,
      }),
      providesTags: ['Attendance'],
    }),

    // Get attendance by ID
    getAttendanceById: builder.query<
      {
        attendance: AttendanceRecord;
      },
      string
    >({
      query: (attendanceId) => ({
        url: `/api/v1/attendances/${attendanceId}`,
        method: 'GET',
      }),
      providesTags: (result, error, attendanceId) => [
        { type: 'Attendance', id: attendanceId },
      ],
    }),

    // Get attendance statistics
    getAttendanceStats: builder.query<
      {
        stats: AttendanceStats;
      },
      AttendanceStatsQuery
    >({
      query: (params) => ({
        url: '/api/v1/attendances/stats',
        method: 'GET',
        params,
      }),
      providesTags: ['AttendanceStats'],
    }),

    // Create attendance record (admin only)
    createAttendance: builder.mutation<
      {
        message: string;
        attendance: AttendanceRecord;
      },
      {
        userId: string;
        punchIn?: {
          timestamp: Date;
          location: LocationData;
          photo?: string;
          notes?: string;
        };
        punchOut?: {
          timestamp: Date;
          location: LocationData;
          photo?: string;
          notes?: string;
        };
        status: 'present' | 'absent' | 'late' | 'half_day';
        notes?: string;
      }
    >({
      query: (attendanceData) => ({
        url: '/api/v1/attendances',
        method: 'POST',
        body: attendanceData,
      }),
      invalidatesTags: ['Attendance', 'AttendanceStats'],
    }),

    // Update attendance record (admin only)
    updateAttendance: builder.mutation<
      {
        message: string;
        attendance: AttendanceRecord;
      },
      {
        attendanceId: string;
        punchIn?: {
          timestamp: Date;
          location: LocationData;
          photo?: string;
          notes?: string;
        };
        punchOut?: {
          timestamp: Date;
          location: LocationData;
          photo?: string;
          notes?: string;
        };
        status?: 'present' | 'absent' | 'late' | 'half_day';
        notes?: string;
      }
    >({
      query: ({ attendanceId, ...updateData }) => ({
        url: `/api/v1/attendances/${attendanceId}`,
        method: 'PUT',
        body: updateData,
      }),
      invalidatesTags: (result, error, { attendanceId }) => [
        { type: 'Attendance', id: attendanceId },
        'AttendanceStats',
      ],
    }),

    // Delete attendance record (admin only)
    deleteAttendance: builder.mutation<
      {
        message: string;
      },
      string
    >({
      query: (attendanceId) => ({
        url: `/api/v1/attendances/${attendanceId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Attendance', 'AttendanceStats'],
    }),

    // Get attendance coordinates
    getAttendanceCoordinates: builder.query<
      {
        attendanceCoordinates: AttendanceCoordinate[];
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
      void
    >({
      query: () => ({
        url: '/api/v1/attendance-coordinates',
        method: 'GET',
      }),
      providesTags: ['AttendanceCoordinate'],
    }),

    // Create attendance coordinate (admin only)
    createAttendanceCoordinate: builder.mutation<
      {
        message: string;
        coordinate: AttendanceCoordinate;
      },
      {
        desc: string;
        latitude: number;
        longitude: number;
        radius: number;
        adminId: string;
      }
    >({
      query: (coordinateData) => ({
        url: '/api/v1/attendance-coordinates',
        method: 'POST',
        body: coordinateData,
      }),
      invalidatesTags: ['AttendanceCoordinate'],
    }),

    // Update attendance coordinate (admin only)
    updateAttendanceCoordinate: builder.mutation<
      {
        message: string;
        coordinate: AttendanceCoordinate;
      },
      {
        coordinateId: string;
        desc?: string;
        latitude?: number;
        longitude?: number;
        radius?: number;
      }
    >({
      query: ({ coordinateId, ...updateData }) => ({
        url: `/api/v1/attendance-coordinates/${coordinateId}`,
        method: 'PUT',
        body: updateData,
      }),
      invalidatesTags: (result, error, { coordinateId }) => [
        { type: 'AttendanceCoordinate', id: coordinateId },
        'AttendanceCoordinate',
      ],
    }),

    // Delete attendance coordinate (admin only)
    deleteAttendanceCoordinate: builder.mutation<
      {
        message: string;
      },
      string
    >({
      query: (coordinateId) => ({
        url: `/api/v1/attendance-coordinates/${coordinateId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['AttendanceCoordinate'],
    }),
  }),
});

// Export hooks for usage in functional components
export const {
  usePunchAttendanceMutation,
  useGetAllAttendanceQuery,
  useGetAttendanceByIdQuery,
  useGetAttendanceStatsQuery,
  useCreateAttendanceMutation,
  useUpdateAttendanceMutation,
  useDeleteAttendanceMutation,
  useGetAttendanceCoordinatesQuery,
  useCreateAttendanceCoordinateMutation,
  useUpdateAttendanceCoordinateMutation,
  useDeleteAttendanceCoordinateMutation,
} = attendanceApiSlice;

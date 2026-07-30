import axios, { AxiosError } from 'axios';
import {
  LeetCodeProfile,
  ProblemsResponse,
  ContestStats,
  CalendarActivity,
  RecentSubmission,
} from '@/types';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

export const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
});

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

function unwrap<T>(promise: Promise<{ data: T }>): Promise<T> {
  return promise
    .then((res) => res.data)
    .catch((err: AxiosError<{ message?: string }>) => {
      const status = err.response?.status || 0;
      const message =
        err.response?.data?.message ||
        (status === 0 ? 'Network error — please check your connection.' : 'Something went wrong.');
      throw new ApiError(message, status);
    });
}

export const verifyUsername = (username: string) =>
  unwrap<{ exists: boolean }>(api.get(`/profile/verify/${encodeURIComponent(username)}`));

export const getProfile = (username: string) =>
  unwrap<LeetCodeProfile>(api.get(`/profile/${encodeURIComponent(username)}`));

export const getProblems = (username: string) =>
  unwrap<ProblemsResponse>(api.get(`/problems/${encodeURIComponent(username)}`));

export const getContests = (username: string) =>
  unwrap<ContestStats>(api.get(`/contests/${encodeURIComponent(username)}`));

export const getActivity = (username: string) =>
  unwrap<CalendarActivity>(api.get(`/activity/${encodeURIComponent(username)}`));

export const getSubmissions = (username: string) =>
  unwrap<RecentSubmission[]>(api.get(`/submissions/${encodeURIComponent(username)}`));

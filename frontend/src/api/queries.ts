import { useQuery } from '@tanstack/react-query';
import {
  getProfile,
  getProblems,
  getContests,
  getActivity,
  getSubmissions,
} from './client';

const STALE_TIME = 60_000; // 1 minute — paired with backend caching

export function useProfile(username: string | undefined) {
  return useQuery({
    queryKey: ['profile', username],
    queryFn: () => getProfile(username as string),
    enabled: Boolean(username),
    staleTime: STALE_TIME,
    retry: 1,
  });
}

export function useProblems(username: string | undefined) {
  return useQuery({
    queryKey: ['problems', username],
    queryFn: () => getProblems(username as string),
    enabled: Boolean(username),
    staleTime: STALE_TIME,
    retry: 1,
  });
}

export function useContests(username: string | undefined) {
  return useQuery({
    queryKey: ['contests', username],
    queryFn: () => getContests(username as string),
    enabled: Boolean(username),
    staleTime: STALE_TIME,
    retry: 1,
  });
}

export function useActivity(username: string | undefined) {
  return useQuery({
    queryKey: ['activity', username],
    queryFn: () => getActivity(username as string),
    enabled: Boolean(username),
    staleTime: STALE_TIME,
    retry: 1,
  });
}

export function useSubmissions(username: string | undefined) {
  return useQuery({
    queryKey: ['submissions', username],
    queryFn: () => getSubmissions(username as string),
    enabled: Boolean(username),
    staleTime: STALE_TIME,
    retry: 1,
  });
}

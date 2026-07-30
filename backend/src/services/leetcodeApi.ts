import axios from 'axios';
import NodeCache from 'node-cache';
import {
  LeetCodeProfile,
  ProblemsSummary,
  TopicTag,
  RecentSubmission,
  ContestStats,
  CalendarActivity,
} from '../types';

// Trim any trailing slash so we control the exact final URL below instead of
// relying on axios's baseURL + path joining, which was a source of subtle
// double-slash / missing-slash issues against leetcode.com/graphql.
const LEETCODE_GRAPHQL_URL = (
  process.env.LEETCODE_GRAPHQL_URL || 'https://leetcode.com/graphql'
).replace(/\/+$/, '');

const CACHE_TTL = Number(process.env.CACHE_TTL_SECONDS || 120);
const cache = new NodeCache({ stdTTL: CACHE_TTL, checkperiod: CACHE_TTL * 0.5 });

const client = axios.create({
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    Origin: 'https://leetcode.com',
    Referer: 'https://leetcode.com',
    // A realistic desktop UA reduces the chance of being bucketed with bot
    // traffic by LeetCode's edge protection.
    'User-Agent':
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  },
});

/**
 * Generic GraphQL executor with error normalization.
 * Distinguishes three failure modes so the frontend can show something
 * more useful than a single blanket "something went wrong":
 *   - the network/DNS/timeout failed before we got a response
 *   - LeetCode's edge responded but blocked us (403/429 etc.)
 *   - LeetCode responded normally but the GraphQL layer returned errors
 */
async function gql<T>(
  query: string,
  variables: Record<string, unknown>,
  operationName?: string
): Promise<T> {
  try {
    const { data } = await client.post(LEETCODE_GRAPHQL_URL, {
      query,
      variables,
      ...(operationName ? { operationName } : {}),
    });

    if (data?.errors && data.errors.length > 0) {
      const message = data.errors[0]?.message || 'LeetCode GraphQL error';
      throw new LeetCodeApiError(message, 502);
    }
    return data.data as T;
  } catch (err) {
    if (err instanceof LeetCodeApiError) throw err;
    if (axios.isAxiosError(err)) {
      if (err.response) {
        // LeetCode's edge answered but rejected the request (rate limiting,
        // a Cloudflare challenge, etc.) — surface the real status so it's
        // distinguishable from "user not found".
        throw new LeetCodeApiError(
          `LeetCode API responded with ${err.response.status}. It may be rate-limiting or blocking this server's IP.`,
          err.response.status === 429 ? 429 : 502
        );
      }
      // No response at all — DNS failure, connection refused, timeout, or
      // this environment's outbound network is blocked entirely.
      throw new LeetCodeApiError(
        "Could not reach the LeetCode API from the server. Check the server's network/internet access.",
        503
      );
    }
    throw new LeetCodeApiError('Unexpected error while contacting the LeetCode API.', 500);
  }
}

export class LeetCodeApiError extends Error {
  status: number;
  constructor(message: string, status = 502) {
    super(message);
    this.status = status;
  }
}

export class UserNotFoundError extends LeetCodeApiError {
  constructor(username: string) {
    super(`LeetCode username "${username}" not found`, 404);
  }
}

function withCache<T>(key: string, fetcher: () => Promise<T>): Promise<T> {
  const cached = cache.get<T>(key);
  if (cached) return Promise.resolve(cached);
  return fetcher().then((result) => {
    cache.set(key, result);
    return result;
  });
}

/** Verifies a username exists and returns their public profile. */
export async function fetchProfile(username: string): Promise<LeetCodeProfile> {
  return withCache(`profile:${username}`, async () => {
    const query = `
      query userPublicProfile($username: String!) {
        matchedUser(username: $username) {
          username
          profile {
            realName
            userAvatar
            countryName
            ranking
            reputation
            aboutMe
          }
        }
      }
    `;
    const data = await gql<{ matchedUser: any }>(query, { username }, 'userPublicProfile');
    if (!data.matchedUser) {
      throw new UserNotFoundError(username);
    }
    const u = data.matchedUser;
    return {
      username: u.username,
      realName: u.profile?.realName || null,
      avatar: u.profile?.userAvatar || null,
      country: u.profile?.countryName || null,
      ranking: u.profile?.ranking ?? null,
      reputation: u.profile?.reputation ?? null,
      aboutMe: u.profile?.aboutMe || null,
     starRating: null,
     badge: null,
    };
  });
}

/** Solved-problem counts by difficulty, plus topic tag breakdown. */
export async function fetchProblemsSummary(
  username: string
): Promise<{ summary: ProblemsSummary; topics: TopicTag[] }> {
  return withCache(`problems:${username}`, async () => {
    const query = `
      query userProblemsSolved($username: String!) {
        allQuestionsCount {
          difficulty
          count
        }
        matchedUser(username: $username) {
          submitStatsGlobal {
            acSubmissionNum {
              difficulty
              count
              submissions
            }
          }
          tagProblemCounts {
            advanced { tagName tagSlug problemsSolved }
            intermediate { tagName tagSlug problemsSolved }
            fundamental { tagName tagSlug problemsSolved }
          }
        }
      }
    `;
    const data = await gql<{ allQuestionsCount: any[]; matchedUser: any }>(
      query,
      { username },
      'userProblemsSolved'
    );
    if (!data.matchedUser) {
      throw new UserNotFoundError(username);
    }

    const totals: Record<string, number> = {};
    data.allQuestionsCount.forEach((d) => {
      totals[d.difficulty] = d.count;
    });

    const ac = data.matchedUser.submitStatsGlobal.acSubmissionNum as {
      difficulty: string;
      count: number;
      submissions: number;
    }[];

    const find = (diff: string) => ac.find((x) => x.difficulty === diff)?.count || 0;
    const totalSolved = find('All');
    const totalSubmissions =
      ac.find((x) => x.difficulty === 'All')?.submissions || 0;

    const summary: ProblemsSummary = {
      totalSolved,
      totalQuestions: totals['All'] || 0,
      easySolved: find('Easy'),
      easyTotal: totals['Easy'] || 0,
      mediumSolved: find('Medium'),
      mediumTotal: totals['Medium'] || 0,
      hardSolved: find('Hard'),
      hardTotal: totals['Hard'] || 0,
      acceptanceRate:
        totalSubmissions > 0
          ? Math.round((totalSolved / totalSubmissions) * 1000) / 10
          : 0,
      breakdown: ac.map((a) => ({
        difficulty: a.difficulty as any,
        count: a.count,
        submissions: a.submissions,
      })),
    };

    const tagGroups = data.matchedUser.tagProblemCounts || {};
    const topics: TopicTag[] = [
      ...(tagGroups.fundamental || []),
      ...(tagGroups.intermediate || []),
      ...(tagGroups.advanced || []),
    ]
      .map((t: any) => ({
        tagName: t.tagName,
        tagSlug: t.tagSlug,
        problemsSolved: t.problemsSolved,
      }))
      .sort((a, b) => b.problemsSolved - a.problemsSolved);

    return { summary, topics };
  });
}

/** Recent accepted submissions (public feed, capped by LeetCode to ~20). */
export async function fetchRecentSubmissions(
  username: string
): Promise<RecentSubmission[]> {
  return withCache(`submissions:${username}`, async () => {
    const query = `
      query recentAcSubmissions($username: String!, $limit: Int!) {
        recentAcSubmissionList(username: $username, limit: $limit) {
          title
          titleSlug
          timestamp
          statusDisplay
          lang
        }
      }
    `;
    const data = await gql<{ recentAcSubmissionList: RecentSubmission[] | null }>(
      query,
      { username, limit: 20 },
      'recentAcSubmissions'
    );
    return data.recentAcSubmissionList || [];
  });
}

/** Contest rating, ranking, and history. */
export async function fetchContestStats(username: string): Promise<ContestStats> {
  return withCache(`contests:${username}`, async () => {
    const query = `
      query userContestRankingInfo($username: String!) {
        userContestRanking(username: $username) {
          attendedContestsCount
          rating
          globalRanking
          totalParticipants
          topPercentage
        }
        userContestRankingHistory(username: $username) {
          attended
          rating
          ranking
          trendDirection
          problemsSolved
          totalProblems
          contest {
            title
            startTime
          }
        }
      }
    `;
    const data = await gql<{
      userContestRanking: any;
      userContestRankingHistory: any[];
    }>(query, { username }, 'userContestRankingInfo');

    const history = (data.userContestRankingHistory || []).filter((h) => h.attended);
    const highestRating = history.length
      ? Math.round(Math.max(...history.map((h) => h.rating)))
      : null;

    return {
      currentRating: data.userContestRanking?.rating ?? null,
      highestRating,
      globalRanking: data.userContestRanking?.globalRanking ?? null,
      totalParticipants: data.userContestRanking?.totalParticipants ?? null,
      attendedContestsCount: data.userContestRanking?.attendedContestsCount ?? null,
      topPercentage: data.userContestRanking?.topPercentage ?? null,
      history,
    };
  });
}

/** Submission calendar heatmap + streak info. */
export async function fetchActivity(username: string): Promise<CalendarActivity> {
  return withCache(`activity:${username}`, async () => {
    const query = `
      query userProfileCalendar($username: String!) {
        matchedUser(username: $username) {
          userCalendar {
            activeYears
            streak
            totalActiveDays
            submissionCalendar
          }
        }
      }
    `;
    const data = await gql<{ matchedUser: any }>(query, { username }, 'userProfileCalendar');
    if (!data.matchedUser) {
      throw new UserNotFoundError(username);
    }
    const cal = data.matchedUser.userCalendar;
    let submissionCalendar: Record<string, number> = {};
    try {
      submissionCalendar = JSON.parse(cal.submissionCalendar || '{}');
    } catch {
      submissionCalendar = {};
    }
    return {
      activeYears: cal.activeYears || [],
      streak: cal.streak || 0,
      totalActiveDays: cal.totalActiveDays || 0,
      submissionCalendar,
    };
  });
}

/** Lightweight existence check, used by the landing page before routing to the dashboard. */
export async function verifyUsername(username: string): Promise<boolean> {
  try {
    await fetchProfile(username);
    return true;
  } catch (err) {
    if (err instanceof UserNotFoundError) return false;
    throw err;
  }
}

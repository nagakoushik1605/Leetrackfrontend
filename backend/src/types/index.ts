export interface LeetCodeProfile {
  username: string;
  realName: string | null;
  avatar: string | null;
  country: string | null;
  ranking: number | null;
  reputation: number | null;
  aboutMe: string | null;
  starRating: number | null;
  badge: string | null;
}

export interface DifficultyCount {
  difficulty: 'Easy' | 'Medium' | 'Hard' | 'All';
  count: number;
  submissions: number;
}

export interface ProblemsSummary {
  totalSolved: number;
  totalQuestions: number;
  easySolved: number;
  easyTotal: number;
  mediumSolved: number;
  mediumTotal: number;
  hardSolved: number;
  hardTotal: number;
  acceptanceRate: number;
  breakdown: DifficultyCount[];
}

export interface TopicTag {
  tagName: string;
  tagSlug: string;
  problemsSolved: number;
}

export interface RecentSubmission {
  title: string;
  titleSlug: string;
  timestamp: string;
  statusDisplay: string;
  lang: string;
}

export interface ContestBadge {
  attended: boolean;
  rating: number;
  ranking: number;
  trendDirection: string;
  problemsSolved: number;
  totalProblems: number;
  contest: {
    title: string;
    startTime: number;
  };
}

export interface ContestStats {
  currentRating: number | null;
  highestRating: number | null;
  globalRanking: number | null;
  totalParticipants: number | null;
  attendedContestsCount: number | null;
  topPercentage: number | null;
  history: ContestBadge[];
}

export interface CalendarActivity {
  activeYears: number[];
  streak: number;
  totalActiveDays: number;
  submissionCalendar: Record<string, number>;
}

export interface ApiErrorBody {
  error: string;
  message: string;
}

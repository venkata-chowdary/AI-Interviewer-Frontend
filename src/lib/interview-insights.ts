export interface RecentInterviewRecord {
  id: string;
  role: string;
  difficulty_level: string;
  status: string;
  score: number | null;
  selected_status: string | null;
  time_taken: number | null;
  created_at: string;
  questions_total: number;
  questions_answered: number;
  progress_percent: number;
}

export interface RoleAverageScore {
  role: string;
  averageScore: number;
  sessions: number;
}

export interface DifficultyBreakdownItem {
  difficulty: string;
  count: number;
}

export interface InterviewInsights {
  totalInterviews: number;
  completedInterviews: number;
  completedWithScores: number;
  selectedInterviews: number;
  averageScore: number | null;
  latestScore: number | null;
  latestRole: string | null;
  bestScore: number | null;
  bestRole: string | null;
  completionRate: number | null;
  selectionRate: number | null;
  averageTimeTakenSeconds: number | null;
  totalQuestions: number;
  totalQuestionsAnswered: number;
  answerRate: number | null;
  thisWeekCount: number;
  activeDayStreak: number;
  mostPracticedRole: { role: string; count: number } | null;
  scoreChangePercent: number | null;
  progressData: Array<{ date: string; score: number }>;
  roleAverageScores: RoleAverageScore[];
  difficultyBreakdown: DifficultyBreakdownItem[];
}

const DAY_MS = 24 * 60 * 60 * 1000;

const round1 = (value: number): number => Math.round(value * 10) / 10;

const average = (values: number[]): number | null => {
  if (values.length === 0) return null;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
};

const toLocalDayKey = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const parseLocalDayKey = (key: string): Date => {
  const [year, month, day] = key.split("-").map(Number);
  return new Date(year, (month ?? 1) - 1, day ?? 1);
};

const calculateActiveDayStreak = (items: RecentInterviewRecord[]): number => {
  const uniqueDays = Array.from(
    new Set(items.map((item) => toLocalDayKey(new Date(item.created_at))))
  )
    .filter((key) => key.length > 0)
    .sort(
      (a, b) =>
        parseLocalDayKey(b).getTime() - parseLocalDayKey(a).getTime()
    );

  if (uniqueDays.length === 0) return 0;

  let streak = 1;
  for (let i = 1; i < uniqueDays.length; i += 1) {
    const previousDate = parseLocalDayKey(uniqueDays[i - 1]).getTime();
    const currentDate = parseLocalDayKey(uniqueDays[i]).getTime();
    const dayGap = Math.round((previousDate - currentDate) / DAY_MS);
    if (dayGap === 1) {
      streak += 1;
    } else {
      break;
    }
  }
  return streak;
};

export const buildInterviewInsights = (
  interviews: RecentInterviewRecord[]
): InterviewInsights => {
  const sortedByCreatedDesc = interviews
    .slice()
    .sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

  const completed = interviews.filter((item) => item.status === "completed");
  const completedWithScores = completed.filter(
    (item): item is RecentInterviewRecord & { score: number } =>
      typeof item.score === "number"
  );

  const latestCompleted = completedWithScores
    .slice()
    .sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )[0];

  const bestCompleted = completedWithScores
    .slice()
    .sort((a, b) => b.score - a.score)[0];

  const totalQuestions = interviews.reduce(
    (sum, item) => sum + (item.questions_total ?? 0),
    0
  );
  const totalQuestionsAnswered = interviews.reduce(
    (sum, item) => sum + (item.questions_answered ?? 0),
    0
  );

  const now = Date.now();
  const thisWeekCount = interviews.filter((item) => {
    const timestamp = new Date(item.created_at).getTime();
    return now - timestamp <= 7 * DAY_MS;
  }).length;

  const selectedCount = completed.filter(
    (item) => item.selected_status?.toLowerCase() === "selected"
  ).length;

  const avgTimeTakenSeconds = average(
    completed
      .map((item) => item.time_taken)
      .filter((value): value is number => typeof value === "number")
  );

  const scoredSortedAsc = completedWithScores
    .slice()
    .sort(
      (a, b) =>
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );

  let scoreChangePercent: number | null = null;
  if (scoredSortedAsc.length >= 2) {
    const midpoint = Math.floor(scoredSortedAsc.length / 2);
    const older = scoredSortedAsc.slice(0, midpoint);
    const newer = scoredSortedAsc.slice(midpoint);

    const olderAvg = average(older.map((item) => item.score));
    const newerAvg = average(newer.map((item) => item.score));

    if (
      olderAvg !== null &&
      newerAvg !== null &&
      Number.isFinite(olderAvg) &&
      olderAvg > 0
    ) {
      scoreChangePercent = round1(((newerAvg - olderAvg) / olderAvg) * 100);
    }
  }

  const roleBuckets = new Map<string, { count: number; totalScore: number; scoredCount: number }>();
  const roleVolume = new Map<string, number>();
  interviews.forEach((item) => {
    const roleKey = item.role?.trim() || "unknown";

    roleVolume.set(roleKey, (roleVolume.get(roleKey) ?? 0) + 1);

    if (typeof item.score === "number" && item.status === "completed") {
      const existing = roleBuckets.get(roleKey) ?? {
        count: 0,
        totalScore: 0,
        scoredCount: 0,
      };
      existing.count += 1;
      existing.scoredCount += 1;
      existing.totalScore += item.score;
      roleBuckets.set(roleKey, existing);
    }
  });

  const roleAverageScores: RoleAverageScore[] = Array.from(roleBuckets.entries())
    .map(([role, values]) => ({
      role,
      averageScore: values.scoredCount > 0 ? round1(values.totalScore / values.scoredCount) : 0,
      sessions: values.count,
    }))
    .sort((a, b) => {
      if (b.sessions !== a.sessions) return b.sessions - a.sessions;
      return b.averageScore - a.averageScore;
    });

  const difficultyCounts = new Map<string, number>();
  interviews.forEach((item) => {
    const difficultyKey = item.difficulty_level?.trim() || "unknown";
    difficultyCounts.set(
      difficultyKey,
      (difficultyCounts.get(difficultyKey) ?? 0) + 1
    );
  });

  const difficultyBreakdown: DifficultyBreakdownItem[] = Array.from(
    difficultyCounts.entries()
  )
    .map(([difficulty, count]) => ({ difficulty, count }))
    .sort((a, b) => b.count - a.count);

  const mostPracticedRole = Array.from(roleVolume.entries())
    .map(([role, count]) => ({ role, count }))
    .sort((a, b) => b.count - a.count)[0] ?? null;

  return {
    totalInterviews: interviews.length,
    completedInterviews: completed.length,
    completedWithScores: completedWithScores.length,
    selectedInterviews: selectedCount,
    averageScore:
      completedWithScores.length > 0
        ? round1(
            completedWithScores.reduce((sum, item) => sum + item.score, 0) /
              completedWithScores.length
          )
        : null,
    latestScore: latestCompleted?.score ?? null,
    latestRole: latestCompleted?.role ?? null,
    bestScore: bestCompleted?.score ?? null,
    bestRole: bestCompleted?.role ?? null,
    completionRate:
      interviews.length > 0
        ? round1((completed.length / interviews.length) * 100)
        : null,
    selectionRate:
      completed.length > 0 ? round1((selectedCount / completed.length) * 100) : null,
    averageTimeTakenSeconds:
      avgTimeTakenSeconds !== null ? round1(avgTimeTakenSeconds) : null,
    totalQuestions,
    totalQuestionsAnswered,
    answerRate:
      totalQuestions > 0
        ? round1((totalQuestionsAnswered / totalQuestions) * 100)
        : null,
    thisWeekCount,
    activeDayStreak: calculateActiveDayStreak(sortedByCreatedDesc),
    mostPracticedRole,
    scoreChangePercent,
    progressData: scoredSortedAsc.map((item) => ({
      date: new Date(item.created_at).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
      }),
      score: item.score,
    })),
    roleAverageScores,
    difficultyBreakdown,
  };
};

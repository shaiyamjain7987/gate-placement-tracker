export function getTodayStr(): string {
  const now = new Date();
  return formatDateStr(now);
}

export function formatDateStr(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function parseDateStr(str: string): Date {
  const [y, m, d] = str.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function formatDisplayDate(dateStr: string): string {
  if (!dateStr) return '';
  const date = parseDateStr(dateStr);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function formatHours(hours: number): string {
  if (hours === 0.5) return '30 mins';
  if (hours === 1) return '1.0 hr';
  if (hours % 1 === 0) return `${hours}.0 hrs`;
  return `${hours} hrs`;
}

export interface HeatmapDay {
  date: string; // YYYY-MM-DD
  dayOfWeek: number; // 0=Sun, 6=Sat
  hours: number;
  level: number; // 0 to 4 intensity
  count: number; // number of sessions
  subjects: { name: string; hours: number; color: string }[];
  notes?: string[];
}

export interface HeatmapWeek {
  days: (HeatmapDay | null)[];
  monthLabel?: string;
}

/**
 * Generates weeks matrix for LeetCode-style contribution graph
 * @param logs Array of logs
 * @param weeksCount Number of weeks to display (default 26 ~ 6 months, can be 52 for 1 year)
 * @param subjectFilter Optional subjectId filter
 * @param subjectsMap Map of subject id to Subject
 */
export function generateContributionMatrix(
  logs: { date: string; hours: number; subjectId: string; notes?: string }[],
  weeksCount: number = 26,
  subjectsMap: Record<string, { name: string; color: string }>,
  subjectFilter?: string
): { weeks: HeatmapWeek[]; monthLabels: { label: string; index: number }[] } {
  // Aggregate hours by date
  const dateMap: Record<
    string,
    {
      hours: number;
      count: number;
      subjects: { name: string; hours: number; color: string }[];
      notes: string[];
    }
  > = {};

  logs.forEach((log) => {
    if (subjectFilter && log.subjectId !== subjectFilter) return;

    if (!dateMap[log.date]) {
      dateMap[log.date] = { hours: 0, count: 0, subjects: [], notes: [] };
    }
    dateMap[log.date].hours += log.hours;
    dateMap[log.date].count += 1;

    const sub = subjectsMap[log.subjectId];
    if (sub) {
      const existing = dateMap[log.date].subjects.find((s) => s.name === sub.name);
      if (existing) {
        existing.hours += log.hours;
      } else {
        dateMap[log.date].subjects.push({
          name: sub.name,
          hours: log.hours,
          color: sub.color,
        });
      }
    }

    if (log.notes && log.notes.trim()) {
      dateMap[log.date].notes.push(log.notes);
    }
  });

  // Calculate start date: ended at the end of current week (Saturday)
  const today = new Date();
  const dayOfWeekToday = today.getDay(); // 0 is Sun, 6 is Sat
  const endDate = new Date(today);
  endDate.setDate(today.getDate() + (6 - dayOfWeekToday)); // Move to upcoming Saturday

  const startDate = new Date(endDate);
  startDate.setDate(endDate.getDate() - (weeksCount * 7 - 1)); // Start on Sunday

  const weeks: HeatmapWeek[] = [];
  const monthLabels: { label: string; index: number }[] = [];
  let currentMonth = -1;

  let iterDate = new Date(startDate);

  for (let w = 0; w < weeksCount; w++) {
    const weekDays: (HeatmapDay | null)[] = [];
    let weekMonthName = '';

    for (let d = 0; d < 7; d++) {
      const dateStr = formatDateStr(iterDate);
      const dayOfWeek = iterDate.getDay();
      const month = iterDate.getMonth();

      // Check month label
      if (month !== currentMonth && iterDate.getDate() <= 7) {
        currentMonth = month;
        weekMonthName = iterDate.toLocaleDateString('en-US', { month: 'short' });
        monthLabels.push({ label: weekMonthName, index: w });
      }

      const dayData = dateMap[dateStr];
      const hours = dayData ? dayData.hours : 0;

      // Determine intensity level (0 to 4)
      let level = 0;
      if (hours > 0 && hours < 1) level = 1;
      else if (hours >= 1 && hours < 2) level = 2;
      else if (hours >= 2 && hours < 3) level = 3;
      else if (hours >= 3) level = 4;

      // Don't show future dates with active styling if past today
      const isFuture = iterDate > today;

      weekDays.push({
        date: dateStr,
        dayOfWeek,
        hours: isFuture ? 0 : hours,
        level: isFuture ? 0 : level,
        count: isFuture ? 0 : dayData?.count || 0,
        subjects: isFuture ? [] : dayData?.subjects || [],
        notes: isFuture ? [] : dayData?.notes || [],
      });

      iterDate.setDate(iterDate.getDate() + 1);
    }

    weeks.push({
      days: weekDays,
      monthLabel: weekMonthName || undefined,
    });
  }

  return { weeks, monthLabels };
}

/**
 * Calculates current streak, max streak, total hours, and active days
 */
export function calculateStudyStats(
  logs: { date: string; hours: number; subjectId?: string }[],
  subjectFilter?: string
) {
  const filtered = subjectFilter
    ? logs.filter((l) => l.subjectId === subjectFilter)
    : logs;

  const dateHoursMap: Record<string, number> = {};
  let totalHours = 0;

  filtered.forEach((log) => {
    dateHoursMap[log.date] = (dateHoursMap[log.date] || 0) + log.hours;
    totalHours += log.hours;
  });

  const activeDates = Object.keys(dateHoursMap).filter((d) => dateHoursMap[d] > 0);
  activeDates.sort();

  const totalActiveDays = activeDates.length;

  // Streak calculations
  const todayStr = getTodayStr();
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = formatDateStr(yesterday);

  let currentStreak = 0;
  let checkDate = (dateHoursMap[todayStr] && dateHoursMap[todayStr] > 0)
    ? new Date()
    : (dateHoursMap[yesterdayStr] && dateHoursMap[yesterdayStr] > 0)
    ? yesterday
    : null;

  if (checkDate) {
    const cur = new Date(checkDate);
    while (true) {
      const curStr = formatDateStr(cur);
      if (dateHoursMap[curStr] && dateHoursMap[curStr] > 0) {
        currentStreak++;
        cur.setDate(cur.getDate() - 1);
      } else {
        break;
      }
    }
  }

  // Max streak
  let maxStreak = 0;
  if (activeDates.length > 0) {
    let tempStreak = 1;
    for (let i = 1; i < activeDates.length; i++) {
      const prev = parseDateStr(activeDates[i - 1]);
      const curr = parseDateStr(activeDates[i]);
      const diffTime = Math.abs(curr.getTime() - prev.getTime());
      const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        tempStreak++;
      } else if (diffDays > 1) {
        maxStreak = Math.max(maxStreak, tempStreak);
        tempStreak = 1;
      }
    }
    maxStreak = Math.max(maxStreak, tempStreak);
  }

  const todayHours = dateHoursMap[todayStr] || 0;

  return {
    totalHours: Number(totalHours.toFixed(1)),
    todayHours: Number(todayHours.toFixed(1)),
    totalActiveDays,
    currentStreak,
    maxStreak,
  };
}

export interface SupplementHeatmapDay {
  date: string;
  dayOfWeek: number;
  level: number; // 0 to 4
  takenCount: number;
  totalCount: number;
  percentage: number;
  takenNames: string[];
  missedNames: string[];
  waterGlasses: number;
  sleepHours: number;
}

export interface SupplementHeatmapWeek {
  days: (SupplementHeatmapDay | null)[];
  monthLabel?: string;
}

/**
 * Generates calendar weeks matrix for Vitamin / Supplement adherence heatmap
 */
export function generateSupplementMatrix(
  logs: Record<string, { date: string; takenSupplementIds: string[]; waterGlasses: number; sleepHours: number }>,
  supplements: { id: string; name: string }[],
  weeksCount: number = 26,
  filterSupplementId?: string
): { weeks: SupplementHeatmapWeek[]; monthLabels: { label: string; index: number }[] } {
  const today = new Date();
  const dayOfWeekToday = today.getDay();
  const endDate = new Date(today);
  endDate.setDate(today.getDate() + (6 - dayOfWeekToday));

  const startDate = new Date(endDate);
  startDate.setDate(endDate.getDate() - (weeksCount * 7 - 1));

  const weeks: SupplementHeatmapWeek[] = [];
  const monthLabels: { label: string; index: number }[] = [];
  let currentMonth = -1;

  let iterDate = new Date(startDate);
  const totalSups = supplements.length;

  for (let w = 0; w < weeksCount; w++) {
    const weekDays: (SupplementHeatmapDay | null)[] = [];
    let weekMonthName = '';

    for (let d = 0; d < 7; d++) {
      const dateStr = formatDateStr(iterDate);
      const dayOfWeek = iterDate.getDay();
      const month = iterDate.getMonth();

      if (month !== currentMonth && iterDate.getDate() <= 7) {
        currentMonth = month;
        weekMonthName = iterDate.toLocaleDateString('en-US', { month: 'short' });
        monthLabels.push({ label: weekMonthName, index: w });
      }

      const log = logs[dateStr];
      const isFuture = iterDate > today;

      const takenIds = log ? log.takenSupplementIds || [] : [];
      const water = log ? log.waterGlasses || 0 : 0;
      const sleep = log ? log.sleepHours || 0 : 0;

      let level = 0;
      let percentage = 0;
      let takenCount = 0;

      if (filterSupplementId) {
        // Individual supplement tracking
        const tookIt = takenIds.includes(filterSupplementId);
        level = tookIt ? 4 : 0;
        percentage = tookIt ? 100 : 0;
        takenCount = tookIt ? 1 : 0;
      } else {
        // Overall compliance across all vitamins
        takenCount = takenIds.length;
        percentage = totalSups > 0 ? Math.round((takenCount / totalSups) * 100) : 0;

        if (percentage > 0 && percentage <= 30) level = 1;
        else if (percentage > 30 && percentage <= 60) level = 2;
        else if (percentage > 60 && percentage < 100) level = 3;
        else if (percentage === 100 && totalSups > 0) level = 4;
      }

      const takenNames = supplements.filter((s) => takenIds.includes(s.id)).map((s) => s.name);
      const missedNames = supplements.filter((s) => !takenIds.includes(s.id)).map((s) => s.name);

      weekDays.push({
        date: dateStr,
        dayOfWeek,
        level: isFuture ? 0 : level,
        takenCount: isFuture ? 0 : takenCount,
        totalCount: filterSupplementId ? 1 : totalSups,
        percentage: isFuture ? 0 : percentage,
        takenNames: isFuture ? [] : takenNames,
        missedNames: isFuture ? [] : missedNames,
        waterGlasses: isFuture ? 0 : water,
        sleepHours: isFuture ? 0 : sleep,
      });

      iterDate.setDate(iterDate.getDate() + 1);
    }

    weeks.push({
      days: weekDays,
      monthLabel: weekMonthName || undefined,
    });
  }

  return { weeks, monthLabels };
}


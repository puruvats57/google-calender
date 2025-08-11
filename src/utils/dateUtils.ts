import { format, startOfMonth, endOfMonth, addDays, differenceInCalendarDays, isSameDay, parseISO } from 'date-fns'

export const formatYMD = (d: Date) => format(d, 'yyyy-MM-dd')
export const parseYMD = (s: string) => parseISO(s)

export function monthGridDates(year: number, monthIndex: number) {
  // returns array of Date objects for the full weeks covering the month (start sunday)
  const start = startOfMonth(new Date(year, monthIndex));
  const end = endOfMonth(new Date(year, monthIndex));
  // find sunday before/at start
  const startDayIndex = start.getDay(); // 0-6
  const gridStart = addDays(start, -startDayIndex);
  const days: Date[] = [];
  const total = differenceInCalendarDays(addDays(end, (6 - end.getDay())), gridStart) + 1;
  for (let i = 0; i < total; i++) days.push(addDays(gridStart, i));
  return days;
}

export function daysBetweenInclusive(a: string, b: string) {
  const A = parseISO(a), B = parseISO(b);
  return differenceInCalendarDays(B, A) + 1;
}

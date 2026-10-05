const MILLISECONDS_PER_DAY = 24 * 60 * 60 * 1000;

interface DateTimeChoices {
  year?: "numeric";
  month?: "2-digit" | "short";
  day?: "2-digit" | "numeric";
  hour?: "2-digit";
  minute?: "2-digit";
}

export interface ActivityTimeContext {
  formatDateTime: (date: Date, options: DateTimeChoices) => string;
  translate: (key: string, values: { time: string }) => string;
}

const CALENDAR_DAY: DateTimeChoices = {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
};
const TIME_OF_DAY: DateTimeChoices = { hour: "2-digit", minute: "2-digit" };
const DAY_AND_TIME: DateTimeChoices = {
  day: "numeric",
  month: "short",
  ...TIME_OF_DAY,
};

export function formatActivityTime(
  createdAt: Date,
  now: Date,
  { formatDateTime, translate }: ActivityTimeContext,
) {
  const time = formatDateTime(createdAt, TIME_OF_DAY);
  const createdDay = formatDateTime(createdAt, CALENDAR_DAY);

  if (createdDay === formatDateTime(now, CALENDAR_DAY)) {
    return translate("audit.time.today", { time });
  }

  const yesterday = new Date(now.getTime() - MILLISECONDS_PER_DAY);
  if (createdDay === formatDateTime(yesterday, CALENDAR_DAY)) {
    return translate("audit.time.yesterday", { time });
  }

  return formatDateTime(createdAt, DAY_AND_TIME);
}

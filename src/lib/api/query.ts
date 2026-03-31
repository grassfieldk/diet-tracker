interface DateDaysLimitQuery {
  date: string | null;
  days: number | null;
  limit: number | null;
}

export function parseDateDaysLimitQuery(
  searchParams: URLSearchParams,
): { value: DateDaysLimitQuery } | { response: Response } {
  const date = searchParams.get("date");
  const daysParam = searchParams.get("days");
  const limitParam = searchParams.get("limit");

  if (date && daysParam) {
    return {
      response: Response.json(
        { error: "date and days cannot be used together" },
        { status: 400 },
      ),
    };
  }

  const limit = limitParam ? Number.parseInt(limitParam, 10) : null;
  if (limitParam && (limit == null || !Number.isInteger(limit) || limit <= 0)) {
    return {
      response: Response.json(
        { error: "limit must be a positive integer" },
        { status: 400 },
      ),
    };
  }

  const days = daysParam ? Number.parseInt(daysParam, 10) : null;
  if (
    daysParam &&
    (days == null || !Number.isInteger(days) || days <= 0 || days > 3650)
  ) {
    return {
      response: Response.json(
        { error: "days must be a positive integer up to 3650" },
        { status: 400 },
      ),
    };
  }

  if (date && !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return {
      response: Response.json(
        { error: "date must be YYYY-MM-DD" },
        { status: 400 },
      ),
    };
  }

  if (date) {
    const startDate = new Date(`${date}T00:00:00.000Z`);
    if (Number.isNaN(startDate.getTime())) {
      return {
        response: Response.json({ error: "date is invalid" }, { status: 400 }),
      };
    }
  }

  return { value: { date, days, limit } };
}

export function buildRecordedDateFilter(params: {
  date: string | null;
  days: number | null;
}): { gte?: Date; lt?: Date } | undefined {
  const { date, days } = params;

  if (date) {
    const startDate = new Date(`${date}T00:00:00.000Z`);
    const endDate = new Date(startDate);
    endDate.setUTCDate(endDate.getUTCDate() + 1);
    return { gte: startDate, lt: endDate };
  }

  if (days) {
    const sinceDate = new Date();
    sinceDate.setUTCHours(0, 0, 0, 0);
    sinceDate.setUTCDate(sinceDate.getUTCDate() - (days - 1));
    return { gte: sinceDate };
  }

  return undefined;
}

export function parsePositiveIntParam(
  searchParams: URLSearchParams,
  key: string,
  max: number,
): { value: number | null } | { response: Response } {
  const raw = searchParams.get(key);
  const parsed = raw ? Number.parseInt(raw, 10) : null;

  if (
    raw &&
    (parsed == null || !Number.isInteger(parsed) || parsed <= 0 || parsed > max)
  ) {
    return {
      response: Response.json(
        { error: `${key} must be a positive integer up to ${max}` },
        { status: 400 },
      ),
    };
  }

  return { value: parsed };
}

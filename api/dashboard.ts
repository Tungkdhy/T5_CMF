import api from "./base";
export async function getOverview() {
  const res = await api.get("/dashboard/overview");
  return res.data;
}
export async function getTaskStatistics({
  start_date,
  end_date,
  group_by,
}: {
  start_date?: string | null;
  end_date?: string | null;
  group_by?: string | null;
}) {
  const params: Record<string, string> = {};

  if (start_date) params.start_date = start_date;
  if (end_date) params.end_date = end_date;
  if (group_by) params.group_by = group_by;

  const res = await api.get("/dashboard/tasks/statistics", { params });
  return res.data;
}
export async function getDeviceStatistics({
  start_date,
  end_date,
//   group_by,
}: {
  start_date?: string | null;
  end_date?: string | null;
//   group_by?: string | null;
}) {
  const params: Record<string, string> = {};

  if (start_date) params.start_date = start_date;
  if (end_date) params.end_date = end_date;
//   if (group_by) params.group_by = group_by;

  const res = await api.get("/dashboard/devices/statistics", { params });
  return res.data;
}
"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type TimelinePoint = {
  day: string;
  events: number;
  pageviews: number;
};

type Props = {
  data: TimelinePoint[];
};

export function TimelineChart({ data }: Props) {
  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ left: 0, right: 0, top: 8, bottom: 0 }}>
          <defs>
            <linearGradient id="eventsFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--chart-a)" stopOpacity={0.35} />
              <stop offset="95%" stopColor="var(--chart-a)" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="pageviewsFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--chart-b)" stopOpacity={0.35} />
              <stop offset="95%" stopColor="var(--chart-b)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="var(--chart-grid)" strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="day" tick={{ fill: "var(--text-faint)", fontSize: 12 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: "var(--text-faint)", fontSize: 12 }} axisLine={false} tickLine={false} width={36} />
          <Tooltip
            cursor={{ stroke: "var(--border)" }}
            contentStyle={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: "0.75rem",
              color: "var(--text)",
            }}
          />
          <Area type="monotone" dataKey="events" stroke="var(--chart-a)" fill="url(#eventsFill)" strokeWidth={2} />
          <Area type="monotone" dataKey="pageviews" stroke="var(--chart-b)" fill="url(#pageviewsFill)" strokeWidth={2} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

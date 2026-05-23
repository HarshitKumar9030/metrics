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
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ left: 0, right: 0, top: 8, bottom: 0 }}>
          <defs>
            <linearGradient id="eventsFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#22c55e" stopOpacity={0.2} />
              <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="pageviewsFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="rgba(255,255,255,0.03)" strokeDasharray="4 4" vertical={false} />
          <XAxis 
            dataKey="day" 
            tick={{ fill: "#52525b", fontSize: 11, fontFamily: "monospace" }} 
            axisLine={false} 
            tickLine={false} 
            dy={10}
            minTickGap={20}
          />
          <YAxis 
            tick={{ fill: "#52525b", fontSize: 11, fontFamily: "monospace" }} 
            axisLine={false} 
            tickLine={false} 
            width={40}
            dx={-10}
            tickFormatter={(value) => value.toLocaleString()}
          />
          <Tooltip
            cursor={{ stroke: "rgba(255,255,255,0.1)", strokeWidth: 1, strokeDasharray: "4 4" }}
            contentStyle={{
              background: "rgba(10, 10, 10, 0.8)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: "8px",
              color: "#f4f4f5",
              fontSize: "12px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.5)",
              backdropFilter: "blur(8px)"
            }}
            itemStyle={{ color: "#f4f4f5", fontSize: "12px", padding: "2px 0" }}
            labelStyle={{ color: "#a1a1aa", fontSize: "11px", marginBottom: "4px", fontFamily: "monospace" }}
          />
          <Area type="monotone" dataKey="events" stroke="#22c55e" fill="url(#eventsFill)" strokeWidth={1.5} activeDot={{ r: 4, strokeWidth: 0, fill: "#22c55e" }} />
          <Area type="monotone" dataKey="pageviews" stroke="#3b82f6" fill="url(#pageviewsFill)" strokeWidth={1.5} activeDot={{ r: 4, strokeWidth: 0, fill: "#3b82f6" }} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}


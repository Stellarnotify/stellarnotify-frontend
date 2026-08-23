"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import type { NotificationRow } from "@/lib/api";

interface Props {
  notifications: NotificationRow[];
}

interface DataPoint {
  time: string;
  delivered: number;
  failed: number;
  pending: number;
}

/** Bucket notifications into hourly slots for the chart. */
function buildChartData(notifications: NotificationRow[]): DataPoint[] {
  if (notifications.length === 0) return [];

  const buckets = new Map<string, DataPoint>();

  for (const n of notifications) {
    const d = new Date(n.created_at);
    // Round down to the nearest hour
    const key = `${d.getMonth() + 1}/${d.getDate()} ${d.getHours()}:00`;

    if (!buckets.has(key)) {
      buckets.set(key, { time: key, delivered: 0, failed: 0, pending: 0 });
    }
    const slot = buckets.get(key)!;
    if (n.status === "delivered") slot.delivered++;
    else if (n.status === "failed") slot.failed++;
    else slot.pending++;
  }

  return Array.from(buckets.values()).sort((a, b) =>
    a.time.localeCompare(b.time)
  );
}

export function NotificationChart({ notifications }: Props) {
  const data = buildChartData(notifications);

  if (data.length === 0) {
    return (
      <p className="text-sm text-gray-500 text-center py-8">
        Not enough data to display a chart.
      </p>
    );
  }

  return (
    <div className="w-full h-56">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 4, right: 16, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
          <XAxis
            dataKey="time"
            tick={{ fontSize: 10, fill: "#6b7280" }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            allowDecimals={false}
            tick={{ fontSize: 10, fill: "#6b7280" }}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#111827",
              border: "1px solid #374151",
              borderRadius: "0.5rem",
              fontSize: "0.75rem",
            }}
            labelStyle={{ color: "#d1d5db" }}
          />
          <Legend
            wrapperStyle={{ fontSize: "0.75rem", paddingTop: "8px" }}
            formatter={(value) =>
              value.charAt(0).toUpperCase() + value.slice(1)
            }
          />
          <Line
            type="monotone"
            dataKey="delivered"
            stroke="#34d399"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4 }}
          />
          <Line
            type="monotone"
            dataKey="failed"
            stroke="#f87171"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4 }}
          />
          <Line
            type="monotone"
            dataKey="pending"
            stroke="#fbbf24"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

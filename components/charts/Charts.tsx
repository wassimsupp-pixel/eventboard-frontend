'use client';

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, LineChart,
  Line, Legend
} from 'recharts';

const COLORS = ['#3B82F6', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444', '#06B6D4', '#EC4899'];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-bg-card border border-border-default rounded-lg px-3 py-2 shadow-xl text-sm">
        {label && <p className="text-text-secondary text-xs mb-1">{label}</p>}
        {payload.map((p: any, i: number) => (
          <p key={i} className="text-text-primary font-medium">
            <span style={{ color: p.color }}>■ </span>
            {p.name}: <span className="font-bold">{p.value}</span>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

interface MonthlyHistogramProps {
  data: { month: string; count: number }[];
}

export function MonthlyHistogram({ data }: MonthlyHistogramProps) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#21262D" vertical={false} />
        <XAxis
          dataKey="month"
          tick={{ fill: '#8B949E', fontSize: 11 }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fill: '#8B949E', fontSize: 11 }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: '#21262D' }} />
        <Bar dataKey="count" name="Événements" fill="#3B82F6" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

interface CategoryPieProps {
  data: { category: string; count: number }[];
}

const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
  if (percent < 0.05) return null;
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={11} fontWeight="600">
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

export function CategoryPie({ data }: CategoryPieProps) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={renderCustomLabel}
          outerRadius={90}
          innerRadius={40}
          dataKey="count"
          nameKey="category"
        >
          {data.map((_, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip
          content={<CustomTooltip />}
          formatter={(value, name) => [value, name || 'Non renseigné']}
        />
        <Legend
          formatter={(value) => <span style={{ color: '#8B949E', fontSize: 12 }}>{value || 'Non renseigné'}</span>}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}

interface TimelineLineProps {
  data: { month: string; count: number }[];
}

export function TimelineLine({ data }: TimelineLineProps) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={data} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#21262D" vertical={false} />
        <XAxis
          dataKey="month"
          tick={{ fill: '#8B949E', fontSize: 11 }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fill: '#8B949E', fontSize: 11 }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip content={<CustomTooltip />} />
        <Line
          type="monotone"
          dataKey="count"
          name="Événements"
          stroke="#8B5CF6"
          strokeWidth={2.5}
          dot={{ fill: '#8B5CF6', r: 4, strokeWidth: 0 }}
          activeDot={{ r: 6, fill: '#8B5CF6' }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

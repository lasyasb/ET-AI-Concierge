import React from "react";
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  AreaChart, 
  Area,
  BarChart,
  Bar
} from "recharts";
import { UserProfile } from "../services/gemini";

interface FinancialChartsProps {
  profile: UserProfile;
}

export function FinancialCharts({ profile }: FinancialChartsProps) {
  // Mock data based on profile
  const portfolioData = [
    { name: "Equity", value: profile.riskLevel === "High" ? 70 : profile.riskLevel === "Medium" ? 50 : 30 },
    { name: "Debt", value: profile.riskLevel === "High" ? 20 : profile.riskLevel === "Medium" ? 30 : 50 },
    { name: "Gold", value: 10 },
    { name: "Cash", value: 10 },
  ];

  const COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#6b7280"];

  const savingsTrendData = [
    { month: "Jan", amount: 10000 },
    { month: "Feb", amount: 15000 },
    { month: "Mar", amount: 12000 },
    { month: "Apr", amount: 20000 },
    { month: "May", amount: 25000 },
    { month: "Jun", amount: 32000 },
  ];

  const scoreTrendData = [
    { month: "Jan", score: 45 },
    { month: "Feb", score: 52 },
    { month: "Mar", score: 58 },
    { month: "Apr", score: 65 },
    { month: "May", score: 72 },
    { month: "Jun", score: 78 },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {/* Portfolio Allocation */}
      <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-xl space-y-6">
        <h3 className="text-xl font-black text-gray-900 tracking-tight">Portfolio Allocation</h3>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={portfolioData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {portfolioData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {portfolioData.map((item, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i] }} />
              <span className="text-xs font-bold text-gray-500">{item.name}</span>
              <span className="text-xs font-black text-gray-900 ml-auto">{item.value}%</span>
            </div>
          ))}
        </div>
      </div>

      {/* Savings Growth */}
      <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-xl space-y-6">
        <h3 className="text-xl font-black text-gray-900 tracking-tight">Savings Growth</h3>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={savingsTrendData}>
              <defs>
                <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
              <XAxis 
                dataKey="month" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 10, fontWeight: 700, fill: '#9ca3af' }}
              />
              <YAxis 
                hide 
              />
              <Tooltip 
                contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
              />
              <Area 
                type="monotone" 
                dataKey="amount" 
                stroke="#10b981" 
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#colorAmount)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="flex items-center justify-between">
          <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">Total Savings</div>
          <div className="text-2xl font-black text-emerald-600">₹{savingsTrendData[savingsTrendData.length - 1].amount.toLocaleString()}</div>
        </div>
      </div>

      {/* Financial Score Trend */}
      <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-xl space-y-6 md:col-span-2">
        <h3 className="text-xl font-black text-gray-900 tracking-tight">Financial Score Trend</h3>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={scoreTrendData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
              <XAxis 
                dataKey="month" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 10, fontWeight: 700, fill: '#9ca3af' }}
              />
              <YAxis 
                domain={[0, 100]}
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 10, fontWeight: 700, fill: '#9ca3af' }}
              />
              <Tooltip 
                contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
              />
              <Line 
                type="monotone" 
                dataKey="score" 
                stroke="#3b82f6" 
                strokeWidth={4}
                dot={{ r: 6, fill: '#3b82f6', strokeWidth: 2, stroke: '#fff' }}
                activeDot={{ r: 8 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

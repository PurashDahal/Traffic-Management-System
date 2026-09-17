import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { BarChart3, Sparkles, Send, FileText, CheckCircle2, AlertCircle, Database, HelpCircle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const ReportsAnalyticsPage = () => {
  const [analytics, setAnalytics] = useState(null);
  const [nlQuestion, setNlQuestion] = useState('');
  const [nlResult, setNlResult] = useState(null);
  const [querying, setQuerying] = useState(false);

  useEffect(() => {
    api.get('/ai/analytics-summary')
      .then(res => setAnalytics(res.data))
      .catch(err => console.error(err));
  }, []);

  const handleNlQuery = async (e) => {
    e.preventDefault();
    if (!nlQuestion.trim()) return;

    setQuerying(true);
    setNlResult(null);

    try {
      const res = await api.post('/ai/natural-language-query', { question: nlQuestion.trim() });
      setNlResult(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setQuerying(false);
    }
  };

  const chartData = analytics?.violationsByCategory
    ? Object.entries(analytics.violationsByCategory).map(([key, val]) => ({ name: key, count: val }))
    : [];

  const COLORS = ['#0284c7', '#0369a1', '#075985', '#0f766e', '#059669', '#d97706', '#dc2626', '#4f46e5'];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-purple-600" /> Database Reports & AI Analytics
        </h1>
        <p className="text-xs text-slate-500">PostgreSQL data analytics paired with natural language AI query insights</p>
      </div>

      {/* AI Natural Language Query Widget */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-xl border border-indigo-950">
        <div className="flex items-center gap-2 text-amber-400 font-bold text-sm mb-2">
          <Sparkles className="w-5 h-5" />
          <span>Ask AI Assistant (Natural Language Database Query)</span>
        </div>
        <p className="text-xs text-slate-300 mb-4">
          Ask questions about violation trends, common tickets, or unpaid fines. The system executes safe SQL aggregation queries and AI returns natural language summaries.
        </p>

        <form onSubmit={handleNlQuery} className="flex gap-2">
          <div className="relative flex-1">
            <HelpCircle className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="e.g. What is the most common traffic violation this month?"
              value={nlQuestion}
              onChange={(e) => setNlQuestion(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-800 border border-slate-700 text-white rounded-xl text-xs focus:ring-2 focus:ring-amber-400 focus:outline-none placeholder-slate-400"
            />
          </div>
          <button
            type="submit"
            disabled={querying || !nlQuestion.trim()}
            className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl shadow flex items-center gap-1.5 transition-all disabled:opacity-50"
          >
            <Send className="w-4 h-4" /> {querying ? 'Analyzing...' : 'Ask AI'}
          </button>
        </form>

        {nlResult && (
          <div className="mt-4 bg-slate-800/90 border border-amber-500/30 rounded-xl p-4 space-y-2">
            <span className="text-[10px] font-bold uppercase text-amber-400 block tracking-wider">AI Summary Response</span>
            <p className="text-sm font-semibold text-white leading-relaxed">{nlResult.answer}</p>
          </div>
        )}
      </div>

      {/* Database Statistics Summary */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
        <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
          <Database className="w-5 h-5 text-sky-600" /> PostgreSQL Breakdown by Violation Category
        </h3>

        {chartData.length === 0 ? (
          <p className="text-xs text-slate-400 py-8 text-center">No recorded violations in database to render analytics.</p>
        ) : (
          <div className="h-64 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <XAxis dataKey="name" tick={{ fontSize: 10 }} interval={0} angle={-15} textAnchor="end" />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip contentStyle={{ borderRadius: '12px', fontSize: '12px' }} />
                <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReportsAnalyticsPage;

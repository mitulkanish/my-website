import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
    TrendingUp,
    Users,
    BookOpen,
    Award,
    AlertTriangle,
    CheckCircle2
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

const mockHealthData = [
    { week: 'W1', score: 72 },
    { week: 'W2', score: 75 },
    { week: 'W3', score: 74 },
    { week: 'W4', score: 78 },
    { week: 'W5', score: 81 },
    { week: 'W6', score: 84 },
];

const mockAttendanceData = [
    { subject: 'Math', rate: 92 },
    { subject: 'Physics', rate: 85 },
    { subject: 'CS', rate: 98 },
    { subject: 'English', rate: 70 },
];

const StatCard = ({ title, value, icon, trend, type }) => (
    <div className="glass-panel" style={{ padding: '1.5rem' }}>
        <div className="flex-between" style={{ marginBottom: '1rem' }}>
            <div style={{ padding: '0.75rem', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '12px' }}>
                {icon}
            </div>
            <div className={`glass-pill`} style={{ color: type === 'positive' ? 'var(--success)' : type === 'negative' ? 'var(--danger)' : 'var(--text-muted)' }}>
                {trend}
            </div>
        </div>
        <h3 style={{ fontSize: '2rem', marginBottom: '0.25rem' }}>{value}</h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>{title}</p>
    </div>
);

const Dashboard = () => {
    const { user } = useAuth();
    const [insights, setInsights] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchInsights = async () => {
            if (!user || !user.data) return;

            try {
                const response = await fetch(import.meta.env.VITE_API_BASE_URL + '/predict', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        maths_att: user.data.MATHS_ATT,
                        ct_att: user.data.CT_ATT,
                        de_att: user.data.DE_ATT,
                        cpp_att: user.data.CPP_ATT,
                        coe_att: user.data.COE_ATT,
                        maths_score: user.data.MATHS_SCORE,
                        ct_score: user.data.CT_SCORE,
                        de_score: user.data.DE_SCORE,
                        cpp_score: user.data.CPP_SCORE
                    })
                });

                if (response.ok) {
                    const data = await response.json();
                    setInsights(data);
                }
            } catch (error) {
                console.error("Failed to fetch ML insights", error);
            } finally {
                setLoading(false);
            }
        };

        fetchInsights();
    }, [user]);

    if (!user || !user.data) {
        return <div>Please log in to view your dashboard.</div>;
    }

    const avgAtt = ((user.data.MATHS_ATT + user.data.CT_ATT + user.data.DE_ATT + user.data.CPP_ATT) / 4).toFixed(1);
    const avgScore = ((user.data.MATHS_SCORE + user.data.CT_SCORE + user.data.DE_SCORE + user.data.CPP_SCORE) / 4).toFixed(1);

    return (
        <div className="page-header">
            <div className="flex-between" style={{ marginBottom: '2rem' }}>
                <div>
                    <h1 className="page-title text-gradient">Welcome back, {user.name}</h1>
                    <p className="page-description">Your real-time Success Intelligence dashboard.</p>
                </div>
                <button className="btn-primary">
                    <TrendingUp size={18} />
                    <span>Generate Report</span>
                </button>
            </div>

            <div className="grid-dashboard" style={{ marginBottom: '2rem' }}>
                <StatCard
                    title="Avg Test Score"
                    value={`${avgScore}%`}
                    icon={<Award color="var(--primary)" />}
                    trend={avgScore >= 75 ? "Good" : "Needs Work"}
                    type={avgScore >= 75 ? "positive" : "negative"}
                />
                <StatCard
                    title="Theory Attendance"
                    value={`${avgAtt}%`}
                    icon={<Users color="var(--accent)" />}
                    trend={avgAtt >= 75 ? "On Track" : "Low"}
                    type={avgAtt >= 75 ? "positive" : "negative"}
                />
                <StatCard
                    title="COE Attendance"
                    value={`${user.data.COE_ATT}%`}
                    icon={<BookOpen color="var(--secondary)" />}
                    trend={user.data.COE_ATT >= 75 ? "Excellent" : "Action Needed"}
                    type={user.data.COE_ATT >= 75 ? "positive" : "negative"}
                />
                <StatCard
                    title="Profile Classification"
                    value={loading ? "..." : (insights?.profile || "Unknown")}
                    icon={<AlertTriangle color="var(--warning)" />}
                    trend="AI Prediction"
                    type="neutral"
                />
            </div>

            <div className="grid-cols-1-2" style={{ marginBottom: '2rem' }}>
                <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
                    <h3 style={{ marginBottom: '1rem', fontSize: '1.25rem' }}>AI-Generated Insights</h3>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', flex: 1 }}>
                        {loading ? (
                            <p style={{ color: 'var(--text-muted)' }}>Analyzing your academic profile...</p>
                        ) : (
                            <>
                                {insights?.insights?.improvement_areas && (
                                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', padding: '1rem', background: 'rgba(245, 158, 11, 0.05)', borderLeft: '3px solid var(--warning)', borderRadius: '0 8px 8px 0' }}>
                                        <AlertTriangle size={20} color="var(--warning)" style={{ flexShrink: 0, marginTop: '2px' }} />
                                        <div>
                                            <h4 style={{ fontSize: '0.875rem', marginBottom: '0.25rem' }}>Area for Improvement</h4>
                                            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{insights.insights.improvement_areas}</p>
                                        </div>
                                    </div>
                                )}

                                {insights?.insights?.correct_procedure && (
                                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', padding: '1rem', background: 'rgba(16, 185, 129, 0.05)', borderLeft: '3px solid var(--success)', borderRadius: '0 8px 8px 0' }}>
                                        <CheckCircle2 size={20} color="var(--success)" style={{ flexShrink: 0, marginTop: '2px' }} />
                                        <div>
                                            <h4 style={{ fontSize: '0.875rem', marginBottom: '0.25rem' }}>On the Right Track</h4>
                                            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{insights.insights.correct_procedure}</p>
                                        </div>
                                    </div>
                                )}

                                {insights?.insights?.academic_performance && (
                                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', padding: '1rem', background: 'rgba(99, 102, 241, 0.05)', borderLeft: '3px solid var(--primary)', borderRadius: '0 8px 8px 0' }}>
                                        <Award size={20} color="var(--primary)" style={{ flexShrink: 0, marginTop: '2px' }} />
                                        <div>
                                            <h4 style={{ fontSize: '0.875rem', marginBottom: '0.25rem' }}>Academic Review</h4>
                                            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{insights.insights.academic_performance}</p>
                                        </div>
                                    </div>
                                )}

                                {insights?.insights?.coe_performance && (
                                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', padding: '1rem', background: 'rgba(16, 185, 129, 0.05)', borderLeft: '3px solid var(--secondary)', borderRadius: '0 8px 8px 0' }}>
                                        <BookOpen size={20} color="var(--secondary)" style={{ flexShrink: 0, marginTop: '2px' }} />
                                        <div>
                                            <h4 style={{ fontSize: '0.875rem', marginBottom: '0.25rem' }}>Practical Review</h4>
                                            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{insights.insights.coe_performance}</p>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    <div className="glass-panel" style={{ padding: '1.5rem', flex: '0 0 auto', background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(16, 185, 129, 0.1))', border: '1px solid rgba(99, 102, 241, 0.2)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <Award size={24} color="var(--primary)" />
                                    Current Academic Health
                                </h3>
                                <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Calculated from latest test scores, theory, and COE attendance.</p>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <div className="text-gradient-primary" style={{ fontSize: '3.5rem', fontWeight: 800, lineHeight: 1 }}>{Math.round((parseFloat(avgScore) + parseFloat(avgAtt)) / 2)}</div>
                                <div style={{ fontSize: '0.875rem', color: 'var(--success)', fontWeight: 500, marginTop: '0.25rem' }}>+2.4% vs last term</div>
                            </div>
                        </div>
                    </div>

                    <div className="glass-panel" style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                        <div className="flex-between" style={{ marginBottom: '1.5rem' }}>
                            <h3 style={{ fontSize: '1.25rem' }}>Academic Health Growth</h3>
                            <select style={{ background: 'rgba(255, 255, 255, 0.05)', border: '1px solid var(--border-glass)', color: 'white', padding: '0.5rem', borderRadius: '8px', outline: 'none' }}>
                                <option value="6w">Last 6 Weeks</option>
                                <option value="3m">Last 3 Months</option>
                            </select>
                        </div>
                        <div style={{ height: '250px', width: '100%' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart
                                    data={[
                                        ...mockHealthData.slice(0, 5),
                                        { week: 'Current', score: Math.round((parseFloat(avgScore) + parseFloat(avgAtt)) / 2) }
                                    ]}
                                    margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                                >
                                    <defs>
                                        <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.8} />
                                            <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                    <XAxis dataKey="week" stroke="var(--text-muted)" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                                    <YAxis stroke="var(--text-muted)" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} domain={['dataMin - 5', 'dataMax + 5']} />
                                    <Tooltip
                                        contentStyle={{ background: 'rgba(15, 17, 26, 0.9)', border: '1px solid var(--border-glass)', borderRadius: '8px' }}
                                        itemStyle={{ color: 'var(--text-main)' }}
                                    />
                                    <Area type="monotone" dataKey="score" stroke="var(--primary)" strokeWidth={3} fillOpacity={1} fill="url(#colorScore)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;

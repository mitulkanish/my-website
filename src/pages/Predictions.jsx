import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { BrainCircuit, AlertOctagon, TrendingUp, Zap, Activity } from 'lucide-react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

const mockRadarData = [
    { subject: 'Attendance', A: 85, fullMark: 100 },
    { subject: 'Test Performance', A: 78, fullMark: 100 },
    { subject: 'Skills', A: 92, fullMark: 100 },
    { subject: 'Practical Knowledge', A: 88, fullMark: 100 },
    { subject: 'Consistency', A: 70, fullMark: 100 },
];

const mockHealthData = [
    { week: 'W1', score: 72 },
    { week: 'W2', score: 75 },
    { week: 'W3', score: 74 },
    { week: 'W4', score: 78 },
    { week: 'W5', score: 81 },
    { week: 'W6', score: 84 },
];

const Predictions = () => {
    const { user } = useAuth();
    const [healthScore, setHealthScore] = useState(0);

    useEffect(() => {
        if (user?.data) {
            const avgAttPercent = (user.data.MATHS_ATT + user.data.CT_ATT + user.data.DE_ATT + user.data.CPP_ATT) / 4;
            const avgScorePercent = (user.data.MATHS_SCORE + user.data.CT_SCORE + user.data.DE_SCORE + user.data.CPP_SCORE) / 4;
            const currentHealth = Math.round((avgScorePercent + avgAttPercent) / 2);
            setHealthScore(currentHealth);
        }
    }, [user]);

    if (!user) {
        return <div>Please log in to view intelligence.</div>;
    }

    return (
        <div>
            <h1 className="page-title text-gradient">Success Intelligence & Predictions</h1>
            <p className="page-description">ML-powered analysis of your academic trajectory and risk factors.</p>

            <div className="grid-cols-1-2" style={{ marginTop: '2rem' }}>
                {/* Radar Chart for Academic Health Components */}
                <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
                    <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <BrainCircuit color="var(--primary)" />
                        Academic Dimension Analysis
                    </h3>
                    <div style={{ height: '300px', width: '100%' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <RadarChart cx="50%" cy="50%" outerRadius="70%" data={mockRadarData}>
                                <PolarGrid stroke="rgba(255,255,255,0.1)" />
                                <PolarAngleAxis dataKey="subject" tick={{ fill: 'var(--text-muted)', fontSize: 12 }} />
                                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                                <Radar name="Student" dataKey="A" stroke="var(--primary)" fill="var(--primary)" fillOpacity={0.5} />
                            </RadarChart>
                        </ResponsiveContainer>
                    </div>
                    <p style={{ textAlign: 'center', fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '1rem' }}>
                        Strong practical skills detected. Consider attending more consistently.
                    </p>
                </div>

                {/* Academic Health Growth Chart for Student */}
                <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
                    <div className="flex-between" style={{ marginBottom: '1.5rem' }}>
                        <h3 style={{ fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Activity color="var(--accent)" />
                            My Academic Health Growth
                        </h3>
                    </div>
                    <div style={{ height: '300px', width: '100%' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart
                                data={[
                                    ...mockHealthData.slice(0, 5),
                                    { week: 'Current', score: healthScore || 85 }
                                ]}
                                margin={{ top: 10, right: 10, left: -30, bottom: 0 }}
                            >
                                <defs>
                                    <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="var(--accent)" stopOpacity={0.8} />
                                        <stop offset="95%" stopColor="var(--accent)" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                <XAxis dataKey="week" stroke="var(--text-muted)" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                                <YAxis stroke="var(--text-muted)" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} domain={['dataMin - 5', 'dataMax + 5']} />
                                <Tooltip
                                    contentStyle={{ background: 'rgba(15, 17, 26, 0.9)', border: '1px solid var(--border-glass)', borderRadius: '8px' }}
                                    itemStyle={{ color: 'var(--text-main)' }}
                                />
                                <Area type="monotone" dataKey="score" stroke="var(--accent)" strokeWidth={3} fillOpacity={1} fill="url(#colorScore)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Predictive Insights */}
                <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', gridColumn: '1 / -1' }}>
                    <h3 style={{ fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Zap color="var(--warning)" />
                        Predictive Insights
                    </h3>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                        <div style={{ background: 'rgba(16, 185, 129, 0.05)', border: '1px solid rgba(16, 185, 129, 0.2)', padding: '1.5rem', borderRadius: '12px' }}>
                            <h4 style={{ color: 'var(--success)', marginBottom: '0.5rem', fontSize: '1.1rem' }}>High Probability of Success</h4>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', lineHeight: 1.5 }}>
                                Based on your recent 95% score in Data Structures and completion of the React Portfolio project,
                                our model predicts a <strong style={{ color: 'white' }}>92% chance</strong> of scoring an A grade in the upcoming Advanced Web Dev exam.
                            </p>
                        </div>

                        <div style={{ background: 'rgba(244, 63, 94, 0.05)', border: '1px solid rgba(244, 63, 94, 0.2)', padding: '1.5rem', borderRadius: '12px' }}>
                            <h4 style={{ color: 'var(--danger)', marginBottom: '0.5rem', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <AlertOctagon size={18} />
                                Risk Warning Detected
                            </h4>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', lineHeight: 1.5 }}>
                                English attendance has dropped below the 75% threshold. Pattern analysis indicates similar drops
                                historically lead to a 15% decrease in monthly exam performance.
                            </p>
                            <div style={{ marginTop: '1rem' }}>
                                <button className="btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}>
                                    Schedule Catch-up Session
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Predictions;

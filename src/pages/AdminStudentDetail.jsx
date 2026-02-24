import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    ArrowLeft,
    TrendingUp,
    Users,
    BookOpen,
    Award,
    AlertTriangle,
    CheckCircle2
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const mockHealthData = [
    { week: 'Week 1', score: 72 },
    { week: 'Week 2', score: 74 },
    { week: 'Week 3', score: 71 },
    { week: 'Week 4', score: 78 },
    { week: 'Week 5', score: 82 },
    { week: 'Week 6', score: 84 },
];

const StatCard = ({ title, value, icon, trend, type }) => (
    <div className="glass-panel" style={{ padding: '1.5rem' }}>
        <div className="flex-between" style={{ marginBottom: '1rem' }}>
            <div style={{ padding: '0.75rem', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '12px' }}>
                {icon}
            </div>
            {trend && (
                <div className={`glass-pill`} style={{ color: type === 'positive' ? 'var(--success)' : type === 'negative' ? 'var(--danger)' : 'var(--text-muted)' }}>
                    {trend}
                </div>
            )}
        </div>
        <h3 style={{ fontSize: '2rem', marginBottom: '0.25rem' }}>{value}</h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>{title}</p>
    </div>
);

const AdminStudentDetail = () => {
    const { id } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [studentData, setStudentData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStudentDetails = async () => {
            try {
                const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/admin/student/${id}`);
                if (response.ok) {
                    const data = await response.json();
                    if (data.success) {
                        setStudentData(data.student);
                    }
                }
            } catch (error) {
                console.error("Failed to fetch specific student details", error);
            } finally {
                setLoading(false);
            }
        };

        if (user?.role === 'admin') {
            fetchStudentDetails();
        }
    }, [id, user]);

    if (!user || user.role !== 'admin') {
        return <div style={{ color: 'var(--danger)', padding: '2rem' }}>Unauthorized access.</div>;
    }

    if (loading) {
        return <div style={{ padding: '2rem', color: 'var(--text-muted)' }}>Loading student profile...</div>;
    }

    if (!studentData) {
        return <div style={{ padding: '2rem', color: 'var(--danger)' }}>Student not found.</div>;
    }

    const { data, prediction, name } = studentData;
    const avgAtt = ((data.MATHS_ATT + data.CT_ATT + data.DE_ATT + data.CPP_ATT) / 4).toFixed(1);
    const avgScore = ((data.MATHS_SCORE + data.CT_SCORE + data.DE_SCORE + data.CPP_SCORE) / 4).toFixed(1);
    const insights = prediction?.insights;

    return (
        <div className="page-header">
            <button
                onClick={() => navigate('/admin/students')}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', marginBottom: '1.5rem', padding: 0 }}
            >
                <ArrowLeft size={16} /> Back to Student List
            </button>

            <div className="flex-between" style={{ marginBottom: '2rem' }}>
                <div>
                    <h1 className="page-title text-gradient">{name}'s Academic Profile</h1>
                    <p className="page-description">Deep dive into attendance, scores, and calculated AI health.</p>
                </div>
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
                    value={`${data.COE_ATT}%`}
                    icon={<BookOpen color="var(--secondary)" />}
                    trend={data.COE_ATT >= 75 ? "Excellent" : "Action Needed"}
                    type={data.COE_ATT >= 75 ? "positive" : "negative"}
                />
                <StatCard
                    title="Profile Classification"
                    value={prediction?.profile || "Unknown"}
                    icon={<AlertTriangle color={prediction?.profile === 'At-Risk' ? "var(--danger)" : "var(--primary)"} />}
                    trend="AI Prediction"
                    type="neutral"
                />
            </div>

            <div style={{ marginBottom: '2rem' }}>
                <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Detailed Block Attendance</h3>
                <div className="grid-dashboard">
                    <div className="glass-panel" style={{ padding: '1.25rem' }}>
                        <div className="flex-between" style={{ marginBottom: '0.5rem' }}>
                            <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Mathematics</span>
                            <span style={{ color: data.MATHS_ATT >= 75 ? 'var(--success)' : 'var(--danger)', fontWeight: 600 }}>{data.MATHS_ATT}%</span>
                        </div>
                        <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden' }}>
                            <div style={{ width: `${data.MATHS_ATT}%`, height: '100%', background: data.MATHS_ATT >= 75 ? 'var(--success)' : 'var(--danger)' }} />
                        </div>
                    </div>
                    <div className="glass-panel" style={{ padding: '1.25rem' }}>
                        <div className="flex-between" style={{ marginBottom: '0.5rem' }}>
                            <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Computer Theory</span>
                            <span style={{ color: data.CT_ATT >= 75 ? 'var(--success)' : 'var(--danger)', fontWeight: 600 }}>{data.CT_ATT}%</span>
                        </div>
                        <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden' }}>
                            <div style={{ width: `${data.CT_ATT}%`, height: '100%', background: data.CT_ATT >= 75 ? 'var(--success)' : 'var(--danger)' }} />
                        </div>
                    </div>
                    <div className="glass-panel" style={{ padding: '1.25rem' }}>
                        <div className="flex-between" style={{ marginBottom: '0.5rem' }}>
                            <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Design Engineering</span>
                            <span style={{ color: data.DE_ATT >= 75 ? 'var(--success)' : 'var(--danger)', fontWeight: 600 }}>{data.DE_ATT}%</span>
                        </div>
                        <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden' }}>
                            <div style={{ width: `${data.DE_ATT}%`, height: '100%', background: data.DE_ATT >= 75 ? 'var(--success)' : 'var(--danger)' }} />
                        </div>
                    </div>
                    <div className="glass-panel" style={{ padding: '1.25rem' }}>
                        <div className="flex-between" style={{ marginBottom: '0.5rem' }}>
                            <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>C++ Programming</span>
                            <span style={{ color: data.CPP_ATT >= 75 ? 'var(--success)' : 'var(--danger)', fontWeight: 600 }}>{data.CPP_ATT}%</span>
                        </div>
                        <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden' }}>
                            <div style={{ width: `${data.CPP_ATT}%`, height: '100%', background: data.CPP_ATT >= 75 ? 'var(--success)' : 'var(--danger)' }} />
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid-cols-1-2" style={{ marginBottom: '2rem' }}>

                {/* AI Insights specific for this student */}
                <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
                    <h3 style={{ marginBottom: '1rem', fontSize: '1.25rem' }}>AI-Generated Insights</h3>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', flex: 1 }}>
                        {insights?.improvement_areas && (
                            <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', padding: '1rem', background: 'rgba(245, 158, 11, 0.05)', borderLeft: '3px solid var(--warning)', borderRadius: '0 8px 8px 0' }}>
                                <AlertTriangle size={20} color="var(--warning)" style={{ flexShrink: 0, marginTop: '2px' }} />
                                <div>
                                    <h4 style={{ fontSize: '0.875rem', marginBottom: '0.25rem' }}>Area for Improvement</h4>
                                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{insights.improvement_areas}</p>
                                </div>
                            </div>
                        )}

                        {insights?.correct_procedure && (
                            <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', padding: '1rem', background: 'rgba(16, 185, 129, 0.05)', borderLeft: '3px solid var(--success)', borderRadius: '0 8px 8px 0' }}>
                                <CheckCircle2 size={20} color="var(--success)" style={{ flexShrink: 0, marginTop: '2px' }} />
                                <div>
                                    <h4 style={{ fontSize: '0.875rem', marginBottom: '0.25rem' }}>On the Right Track</h4>
                                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{insights.correct_procedure}</p>
                                </div>
                            </div>
                        )}

                        {insights?.academic_performance && (
                            <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', padding: '1rem', background: 'rgba(99, 102, 241, 0.05)', borderLeft: '3px solid var(--primary)', borderRadius: '0 8px 8px 0' }}>
                                <Award size={20} color="var(--primary)" style={{ flexShrink: 0, marginTop: '2px' }} />
                                <div>
                                    <h4 style={{ fontSize: '0.875rem', marginBottom: '0.25rem' }}>Academic Review</h4>
                                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{insights.academic_performance}</p>
                                </div>
                            </div>
                        )}

                        {insights?.coe_performance && (
                            <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', padding: '1rem', background: 'rgba(16, 185, 129, 0.05)', borderLeft: '3px solid var(--secondary)', borderRadius: '0 8px 8px 0' }}>
                                <BookOpen size={20} color="var(--secondary)" style={{ flexShrink: 0, marginTop: '2px' }} />
                                <div>
                                    <h4 style={{ fontSize: '0.875rem', marginBottom: '0.25rem' }}>Practical Review</h4>
                                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{insights.coe_performance}</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="glass-panel" style={{ padding: '1.5rem' }}>
                    <div className="flex-between" style={{ marginBottom: '1.5rem' }}>
                        <h3 style={{ fontSize: '1.25rem' }}>Estimated Academic Health Trend</h3>
                    </div>
                    <div style={{ height: '300px', width: '100%' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={[
                                ...mockHealthData.slice(0, 5),
                                { week: 'Current', score: Math.round((parseFloat(avgScore) + parseFloat(avgAtt)) / 2) }
                            ]} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
    );
};

export default AdminStudentDetail;

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
    TrendingUp,
    Users,
    BookOpen,
    Award,
    AlertTriangle,
    CheckCircle2,
    BarChart3,
    Star,
    MessageSquare
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Link } from 'react-router-dom';

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

const AdminDashboard = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await fetch(import.meta.env.VITE_API_BASE_URL + '/admin/stats');
                if (response.ok) {
                    const data = await response.json();
                    if (data.success) {
                        setStats(data.metrics);
                    }
                }
            } catch (error) {
                console.error("Failed to fetch admin stats", error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    if (loading) {
        return <div style={{ padding: '2rem', color: 'white' }}>Loading classroom metrics...</div>;
    }

    if (!stats) {
        return <div style={{ padding: '2rem', color: 'var(--danger)' }}>Failed to load dashboard metrics. Check your ML backend.</div>;
    }

    const {
        total_students,
        overall_avg_score,
        overall_avg_attendance,
        profile_distribution,
        at_risk_students,
        top_students
    } = stats;

    // Convert distribution object mapping to an array for Recharts
    const chartData = Object.entries(profile_distribution).map(([key, value]) => ({
        name: key,
        students: value
    }));

    const handleExport = () => {
        if (!stats) return;

        let csvContent = "data:text/csv;charset=utf-8,";

        // 1. Global Metrics
        csvContent += "Batch Metrics\n";
        csvContent += "Metric,Value\n";
        csvContent += `Total Students Tracked,${total_students}\n`;
        csvContent += `Global Average Score,${overall_avg_score}%\n`;
        csvContent += `Global Average Attendance,${overall_avg_attendance}%\n`;
        csvContent += "\n";

        // 2. Profile Distribution
        csvContent += "AI Profile Classification,Student Count\n";
        chartData.forEach(row => {
            csvContent += `"${row.name}",${row.students}\n`;
        });
        csvContent += "\n";

        // 3. At-Risk Students
        csvContent += "Top 10 At-Risk Students\n";
        csvContent += "Rank,Name,AI Profile,Average Score\n";
        at_risk_students.forEach((student, idx) => {
            csvContent += `${idx + 1},"${student.name}","${student.profile}",${student.avg_score}%\n`;
        });
        csvContent += "\n";

        // 4. Top Performing Students
        csvContent += "Top 10 Excellent Students\n";
        csvContent += "Rank,Name,AI Profile,Average Score\n";
        top_students.forEach((student, idx) => {
            csvContent += `${idx + 1},"${student.name}","${student.profile}",${student.avg_score}%\n`;
        });

        // Trigger Download
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `academic_batch_report_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };



    return (
        <div className="page-header">
            <div className="flex-between" style={{ marginBottom: '2rem' }}>
                <div>
                    <h1 className="page-title text-gradient">
                        {user?.role === 'teacher' ? `${user?.subject?.toUpperCase()} Teacher Dashboard` :
                            user?.role === 'coordinator' ? 'System Coordinator Dashboard' :
                                'Administrator Dashboard'}
                    </h1>
                    <p className="page-description">Overview of the entire student dataset and learning performance.</p>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>

                    <button className="btn-primary" onClick={handleExport}>
                        <TrendingUp size={18} />
                        <span>Export Batch Report</span>
                    </button>
                </div>
            </div>


            <div className="grid-dashboard" style={{ marginBottom: '2rem' }}>
                <Link to="/admin/students" style={{ textDecoration: 'none', color: 'inherit', display: 'block', transition: 'transform 0.2s', cursor: 'pointer' }} onMouseOver={e => e.currentTarget.style.transform = 'translateY(-4px)'} onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}>
                    <StatCard
                        title="Total Students Tracked"
                        value={total_students}
                        icon={<Users color="var(--primary)" />}
                        trend="Dataset Loaded ->"
                        type="positive"
                    />
                </Link>
                <StatCard
                    title="Global Average Score"
                    value={`${overall_avg_score}%`}
                    icon={<Award color="var(--accent)" />}
                    trend="Test Averages"
                    type="neutral"
                />
                <StatCard
                    title="Global Avg Attendance"
                    value={`${overall_avg_attendance}%`}
                    icon={<BookOpen color="var(--secondary)" />}
                    trend="Theory Classes"
                    type="neutral"
                />
                <StatCard
                    title="At-Risk Alerts"
                    value={at_risk_students.length}
                    icon={<AlertTriangle color="var(--warning)" />}
                    trend="Attention Needed"
                    type="negative"
                />
                <Link to="/complaints" style={{ textDecoration: 'none', color: 'inherit', display: 'block', transition: 'transform 0.2s', cursor: 'pointer' }} onMouseOver={e => e.currentTarget.style.transform = 'translateY(-4px)'} onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}>
                    <StatCard
                        title="Complaints & Questions"
                        value="Communication"
                        icon={<MessageSquare color="var(--primary)" />}
                        trend="Open Channel"
                        type="neutral"
                    />
                </Link>
            </div>

            <div className="grid-cols-1-2" style={{ marginBottom: '2rem' }}>

                {/* Left Side: At Risk Students Panel */}
                <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
                    <h3 style={{ marginBottom: '1rem', fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <AlertTriangle size={20} color="var(--warning)" />
                        Identify At-Risk Students
                    </h3>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
                        These students have the lowest composite ML scores across all subjects and need direct administrative intervention.
                    </p>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', flex: 1, overflowY: 'auto' }}>
                        {at_risk_students.map((student, idx) => (
                            <div key={student.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-glass)', borderRadius: '8px' }}>
                                <div>
                                    <h4 style={{ fontSize: '1rem', marginBottom: '0.25rem' }}>{idx + 1}. {student.name}</h4>
                                    <span style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', borderRadius: '99px' }}>
                                        {student.profile}
                                    </span>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--danger)' }}>{student.avg_score}%</div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Avg Score</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right Side: Graph Breakdown */}
                <div className="glass-panel" style={{ padding: '1.5rem' }}>
                    <div className="flex-between" style={{ marginBottom: '1.5rem' }}>
                        <h3 style={{ fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <BarChart3 size={20} color="var(--primary)" />
                            Batch Profile Distribution
                        </h3>
                    </div>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                        Below is the comprehensive distribution of ML classifications across all {total_students} students in this dataset.
                    </p>

                    <div style={{ height: '350px', width: '100%', marginTop: '2rem' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 40 }} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
                                <XAxis type="number" stroke="var(--text-muted)" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                                <YAxis type="category" dataKey="name" stroke="var(--text-muted)" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} width={120} />
                                <Tooltip
                                    cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                                    contentStyle={{ background: 'rgba(15, 17, 26, 0.9)', border: '1px solid var(--border-glass)', borderRadius: '8px' }}
                                    itemStyle={{ color: 'var(--text-main)' }}
                                />
                                <Bar dataKey="students" fill="url(#colorBar)" radius={[0, 4, 4, 0]}>
                                </Bar>
                                <defs>
                                    <linearGradient id="colorBar" x1="0" y1="0" x2="1" y2="0">
                                        <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.8} />
                                        <stop offset="100%" stopColor="var(--secondary)" stopOpacity={1} />
                                    </linearGradient>
                                </defs>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Bottom Row: Top Performing Students */}
            <div className="grid-cols-1" style={{ marginBottom: '2rem' }}>
                <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
                    <h3 style={{ marginBottom: '1rem', fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Star size={20} color="var(--success)" />
                        Excellent Performing Students
                    </h3>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
                        These students have the highest composite ML scores and are excelling academically across all subjects.
                    </p>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
                        {top_students.map((student, idx) => (
                            <div key={student.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: 'rgba(16, 185, 129, 0.05)', border: '1px solid rgba(16, 185, 129, 0.2)', borderRadius: '8px' }}>
                                <div>
                                    <h4 style={{ fontSize: '1rem', marginBottom: '0.25rem', color: 'var(--text-main)' }}>{idx + 1}. {student.name}</h4>
                                    <span style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)', borderRadius: '99px' }}>
                                        {student.profile}
                                    </span>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--success)' }}>{student.avg_score}%</div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Avg Score</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;

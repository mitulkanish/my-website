import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { CalendarCheck, CalendarX, BarChart as BarChartIcon, Activity } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const mockHealthData = [
    { week: 'W1', score: 72 },
    { week: 'W2', score: 75 },
    { week: 'W3', score: 74 },
    { week: 'W4', score: 78 },
    { week: 'W5', score: 81 },
    { week: 'W6', score: 84 },
];

const Attendance = () => {
    const { user } = useAuth();
    const [calendarDays, setCalendarDays] = useState([]);
    const [totals, setTotals] = useState({ present: 0, absent: 0 });
    const [healthScore, setHealthScore] = useState(0);

    useEffect(() => {
        if (user?.data) {
            const avgAttPercent = (user.data.MATHS_ATT + user.data.CT_ATT + user.data.DE_ATT + user.data.CPP_ATT) / 4;
            const avgScorePercent = (user.data.MATHS_SCORE + user.data.CT_SCORE + user.data.DE_SCORE + user.data.CPP_SCORE) / 4;
            const currentHealth = Math.round((avgScorePercent + avgAttPercent) / 2);
            setHealthScore(currentHealth);

            // Generate current month calendar
            const date = new Date();
            const year = date.getFullYear();
            const month = date.getMonth();
            const daysInMonth = new Date(year, month + 1, 0).getDate();

            let generatedDays = [];
            let totalPresent = 0;
            let totalAbsent = 0;
            const presentProb = avgAttPercent / 100;

            // Simple deterministic PRNG
            const mulberry32 = (a) => {
                return function () {
                    var t = a += 0x6D2B79F5;
                    t = Math.imul(t ^ t >>> 15, t | 1);
                    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
                    return ((t ^ t >>> 14) >>> 0) / 4294967296;
                };
            };

            // Create a seed based on student identifier, year, and month
            const seedString = `${user.id || user.name}-${year}-${month}`;
            let hash = 0;
            for (let i = 0; i < seedString.length; i++) {
                hash = Math.imul(31, hash) + seedString.charCodeAt(i) | 0;
            }
            const seededRandom = mulberry32(hash);

            for (let i = 1; i <= daysInMonth; i++) {
                const dateObj = new Date(year, month, i);
                const isWeekend = dateObj.getDay() === 0 || dateObj.getDay() === 6;
                let status = 'none';

                if (!isWeekend) {
                    // Bias the deterministic random based on their actual average
                    const isPresent = seededRandom() < presentProb;
                    status = isPresent ? 'present' : 'absent';
                    if (isPresent) totalPresent++;
                    else totalAbsent++;
                }

                generatedDays.push({
                    date: i,
                    status, // 'present', 'absent', 'none'
                });
            }

            setCalendarDays(generatedDays);
            setTotals({ present: totalPresent, absent: totalAbsent });
        }
    }, [user]);

    if (!user) {
        return <div>Please log in to view attendance.</div>;
    }

    const currentMonthName = new Date().toLocaleString('default', { month: 'long', year: 'numeric' });
    const firstDayIndex = new Date(new Date().getFullYear(), new Date().getMonth(), 1).getDay();

    return (
        <div className="page-header">
            <div className="flex-between" style={{ marginBottom: '2rem' }}>
                <div>
                    <h1 className="page-title text-gradient" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <CalendarCheck size={28} />
                        My Attendance & Health
                    </h1>
                    <p className="page-description">Daily attendance calendar and Academic Health trend.</p>
                </div>
            </div>

            <div className="grid-dashboard" style={{ marginBottom: '2rem' }}>
                <div className="glass-panel" style={{ padding: '1.5rem' }}>
                    <div className="flex-between" style={{ marginBottom: '1rem' }}>
                        <div style={{ padding: '0.75rem', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '12px' }}>
                            <CalendarCheck color="var(--success)" />
                        </div>
                    </div>
                    <h3 style={{ fontSize: '2rem', marginBottom: '0.25rem', color: 'var(--success)' }}>{totals.present}</h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Total Days Present</p>
                </div>

                <div className="glass-panel" style={{ padding: '1.5rem' }}>
                    <div className="flex-between" style={{ marginBottom: '1rem' }}>
                        <div style={{ padding: '0.75rem', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '12px' }}>
                            <CalendarX color="var(--danger)" />
                        </div>
                    </div>
                    <h3 style={{ fontSize: '2rem', marginBottom: '0.25rem', color: 'var(--danger)' }}>{totals.absent}</h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Total Days Absent</p>
                </div>

                <div className="glass-panel" style={{ padding: '1.5rem' }}>
                    <div className="flex-between" style={{ marginBottom: '1rem' }}>
                        <div style={{ padding: '0.75rem', background: 'rgba(99, 102, 241, 0.1)', borderRadius: '12px' }}>
                            <BarChartIcon color="var(--primary)" />
                        </div>
                    </div>
                    <h3 style={{ fontSize: '2rem', marginBottom: '0.25rem', color: 'var(--primary)' }}>
                        {((totals.present / (totals.present + totals.absent || 1)) * 100).toFixed(1)}%
                    </h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Overall Attendance Rate</p>
                </div>
            </div>

            <div className="grid-cols-1-2">
                <div className="glass-panel" style={{ padding: '2rem' }}>
                    <h3 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <CalendarCheck size={20} color="var(--primary)" />
                        Daily Attendance - {currentMonthName}
                    </h3>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '0.5rem', textAlign: 'center', marginBottom: '0.5rem' }}>
                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                            <div key={day} style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>{day}</div>
                        ))}
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '0.5rem' }}>
                        {/* Placeholder for first day offset */}
                        {Array.from({ length: firstDayIndex }).map((_, i) => (
                            <div key={`empty-${i}`} style={{ padding: '0.75rem 0.25rem', background: 'rgba(255,255,255,0.02)', borderRadius: '8px' }}></div>
                        ))}

                        {calendarDays.map((dayObj) => {
                            let bgColor = 'rgba(255,255,255,0.02)';
                            let borderColor = 'transparent';
                            let textColor = 'var(--text-muted)';
                            let opacity = 0.5;

                            if (dayObj.status === 'present') {
                                bgColor = 'rgba(16, 185, 129, 0.15)';
                                borderColor = 'rgba(16, 185, 129, 0.5)';
                                textColor = 'var(--success)';
                                opacity = 1;
                            } else if (dayObj.status === 'absent') {
                                bgColor = 'rgba(239, 68, 68, 0.15)';
                                borderColor = 'rgba(239, 68, 68, 0.5)';
                                textColor = 'var(--danger)';
                                opacity = 1;
                            }

                            return (
                                <div
                                    key={dayObj.date}
                                    style={{
                                        padding: '0.75rem 0.25rem',
                                        background: bgColor,
                                        border: `1px solid ${borderColor}`,
                                        borderRadius: '8px',
                                        textAlign: 'center',
                                        fontSize: '1rem',
                                        fontWeight: 600,
                                        color: textColor,
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: '0.25rem',
                                        opacity: opacity
                                    }}
                                >
                                    <span>{dayObj.date}</span>
                                    {dayObj.status !== 'none' && (
                                        <div style={{ fontSize: '0.55rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                            {dayObj.status === 'present' ? 'PRESENT' : 'ABSENT'}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="glass-panel" style={{ padding: '2rem', display: 'flex', flexDirection: 'column' }}>
                    <div className="flex-between" style={{ marginBottom: '1.5rem' }}>
                        <h3 style={{ fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Activity size={20} color="var(--primary)" />
                            Academic Health Growth
                        </h3>
                    </div>
                    <div style={{ height: '300px', width: '100%' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart
                                data={[
                                    ...mockHealthData.slice(0, 5),
                                    { week: 'Current', score: healthScore }
                                ]}
                                margin={{ top: 10, right: 10, left: -30, bottom: 0 }}
                            >
                                <defs>
                                    <linearGradient id="colorScoreAtt" x1="0" y1="0" x2="0" y2="1">
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
                                <Area type="monotone" dataKey="score" stroke="var(--primary)" strokeWidth={3} fillOpacity={1} fill="url(#colorScoreAtt)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Attendance;

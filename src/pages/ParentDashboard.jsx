import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Award, Users, BookOpen, Calendar as CalendarIcon, BarChart3, TrendingUp } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';

const ParentDashboard = () => {
    const { user } = useAuth();

    if (!user || user.role !== 'parent' || !user.data) {
        return <div>Access Denied. You must be logged in as a parent to view this page.</div>;
    }

    const studentData = user.data;
    
    // Derived Data
    const avgAtt = ((studentData.MATHS_ATT + studentData.CT_ATT + studentData.DE_ATT + studentData.CPP_ATT) / 4).toFixed(1);
    const avgScore = ((studentData.MATHS_SCORE + studentData.CT_SCORE + studentData.DE_SCORE + studentData.CPP_SCORE) / 4).toFixed(1);
    
    const performanceData = [
        { subject: 'Maths', score: studentData.MATHS_SCORE, att: studentData.MATHS_ATT },
        { subject: 'CT', score: studentData.CT_SCORE, att: studentData.CT_ATT },
        { subject: 'DE', score: studentData.DE_SCORE, att: studentData.DE_ATT },
        { subject: 'C++', score: studentData.CPP_SCORE, att: studentData.CPP_ATT },
    ];

    const radarData = [
         { subject: 'Maths', A: studentData.MATHS_SCORE, fullMark: 100 },
         { subject: 'CT', A: studentData.CT_SCORE, fullMark: 100 },
         { subject: 'DE', A: studentData.DE_SCORE, fullMark: 100 },
         { subject: 'C++', A: studentData.CPP_SCORE, fullMark: 100 },
         { subject: 'COE', A: studentData.COE_ATT, fullMark: 100 },
    ];

    // Generate mock calendar data for the current month based on the student's overall attendance rate
    const generateCalendarData = (attendanceRate) => {
        const daysInMonth = 31;
        const data = [];
        let presentCount = 0;
        let absentCount = 0;

        // Start on a Sunday (0 = Sun, 1 = Mon, etc.) for visual spacing
        const startDayOffset = 0; 
        
        for (let i = 1; i <= daysInMonth; i++) {
            // Assume weekends (Sun/Sat) are usually not class days, but we'll fill Mon-Fri
            const dayOfWeek = (startDayOffset + i - 1) % 7;
            const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
            
            let status = 'none';
            if (!isWeekend) {
                // Randomly assign present/absent weighted by their actual attendance percentage
                const isPresent = Math.random() * 100 <= attendanceRate;
                status = isPresent ? 'present' : 'absent';
                
                if (isPresent) presentCount++;
                else absentCount++;
            }
            
            data.push({ day: i, status, isWeekend });
        }
        
        return { calendarDays: data, presentCount, absentCount };
    };

    const { calendarDays, presentCount, absentCount } = React.useMemo(() => generateCalendarData(avgAtt), [avgAtt]);

    return (
        <div className="page-header">
            <div className="flex-between" style={{ marginBottom: '2rem' }}>
                <div>
                    <h1 className="page-title text-gradient" style={{ marginBottom: '0.5rem' }}>Welcome, {user.name}</h1>
                    <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', marginBottom: '0.5rem' }}>
                        <span className="glass-pill" style={{ background: 'rgba(14, 165, 233, 0.1)', color: 'var(--primary)', border: '1px solid rgba(14, 165, 233, 0.2)' }}>
                            {studentData.DEPARTMENT || 'Engineering'}
                        </span>
                        <span className="glass-pill" style={{ background: 'rgba(255, 255, 255, 0.05)', color: 'var(--text-muted)' }}>
                            Year 1
                        </span>
                    </div>
                    <p className="page-description" style={{ marginTop: '0.5rem' }}>Here is the academic profile and progress for your child: <strong>{studentData.NAME}</strong>.</p>
                </div>
            </div>

            {/* Top Level Cards */}
            <div className="grid-dashboard" style={{ marginBottom: '2rem' }}>
                <div className="glass-panel" style={{ padding: '1.5rem' }}>
                    <div className="flex-between" style={{ marginBottom: '1rem' }}>
                        <div style={{ padding: '0.75rem', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '12px' }}>
                            <Award color="var(--primary)" />
                        </div>
                    </div>
                    <h3 style={{ fontSize: '2rem', marginBottom: '0.25rem' }}>{avgScore}%</h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Overall Average Score</p>
                </div>

                <div className="glass-panel" style={{ padding: '1.5rem' }}>
                     <div className="flex-between" style={{ marginBottom: '1rem' }}>
                        <div style={{ padding: '0.75rem', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '12px' }}>
                            <Users color="var(--accent)" />
                        </div>
                    </div>
                    <h3 style={{ fontSize: '2rem', marginBottom: '0.25rem' }}>{avgAtt}%</h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Overall Attendance</p>
                </div>

                <div className="glass-panel" style={{ padding: '1.5rem' }}>
                    <div className="flex-between" style={{ marginBottom: '1rem' }}>
                        <div style={{ padding: '0.75rem', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '12px' }}>
                            <BookOpen color="var(--secondary)" />
                        </div>
                    </div>
                    <h3 style={{ fontSize: '2rem', marginBottom: '0.25rem' }}>{studentData.COE_ATT}%</h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>COE (Practical) Attendance</p>
                </div>
            </div>

            {/* Subject-Wise Marks Section */}
            <div style={{ marginBottom: '2rem' }}>
                <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <TrendingUp color="var(--primary)" size={20} />
                    Subject-Wise Test Scores
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
                    {performanceData.map((subjectData, index) => (
                        <div key={index} className="glass-panel" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                            <div style={{ padding: '0.5rem 1rem', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '1rem' }}>
                                {subjectData.subject}
                            </div>
                            <h4 style={{ fontSize: '1.75rem', margin: 0, color: subjectData.score >= 80 ? 'var(--success)' : subjectData.score >= 60 ? 'var(--primary)' : 'var(--warning)' }}>
                                {subjectData.score}%
                            </h4>
                            <div style={{ width: '100%', height: '4px', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '2px', marginTop: '1rem', overflow: 'hidden' }}>
                                <div style={{ 
                                    height: '100%', 
                                    width: `${subjectData.score}%`, 
                                    background: subjectData.score >= 80 ? 'var(--success)' : subjectData.score >= 60 ? 'var(--primary)' : 'var(--warning)'
                                }} />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Daily Attendance Calendar Section */}
            <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
                <div className="flex-between" style={{ marginBottom: '1.5rem' }}>
                    <h3 style={{ fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <CalendarIcon color="var(--primary)" />
                        Daily Attendance - March 2026
                    </h3>
                </div>

                {/* Calendar Summary Stats */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
                     <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '1rem', borderRadius: '12px', border: '1px solid var(--border-glass)' }}>
                        <div style={{ color: 'var(--success)', marginBottom: '0.5rem' }}><CalendarIcon size={20} /></div>
                        <h4 style={{ fontSize: '1.5rem', color: 'var(--success)', margin: 0 }}>{presentCount}</h4>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', margin: 0 }}>Total Days Present</p>
                    </div>
                    <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '1rem', borderRadius: '12px', border: '1px solid var(--border-glass)' }}>
                        <div style={{ color: 'var(--danger)', marginBottom: '0.5rem' }}><CalendarIcon size={20} /></div>
                        <h4 style={{ fontSize: '1.5rem', color: 'var(--danger)', margin: 0 }}>{absentCount}</h4>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', margin: 0 }}>Total Days Absent</p>
                    </div>
                    <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '1rem', borderRadius: '12px', border: '1px solid var(--border-glass)' }}>
                        <div style={{ color: 'var(--primary)', marginBottom: '0.5rem' }}><BarChart3 size={20} /></div>
                        <h4 style={{ fontSize: '1.5rem', color: 'var(--primary)', margin: 0 }}>{Math.round((presentCount / (presentCount + absentCount)) * 100 || 0)}%</h4>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', margin: 0 }}>Monthly Rate</p>
                    </div>
                </div>

                {/* Calendar Grid */}
                <div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '0.5rem', marginBottom: '0.5rem', textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                        <div>Sun</div><div>Mon</div><div>Tue</div><div>Wed</div><div>Thu</div><div>Fri</div><div>Sat</div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '0.5rem' }}>
                        {calendarDays.map((dayObj, index) => {
                            let bgColor = 'rgba(255, 255, 255, 0.02)';
                            let borderColor = 'transparent';
                            let textColor = 'var(--text-muted)';
                            let subText = '';

                            if (dayObj.status === 'present') {
                                bgColor = 'rgba(16, 185, 129, 0.1)'; // Emerald/Success
                                borderColor = 'rgba(16, 185, 129, 0.3)';
                                textColor = 'var(--success)';
                                subText = 'PRESENT';
                            } else if (dayObj.status === 'absent') {
                                bgColor = 'rgba(239, 68, 68, 0.1)'; // Red/Danger
                                borderColor = 'rgba(239, 68, 68, 0.3)';
                                textColor = 'var(--danger)';
                                subText = 'ABSENT';
                            }

                            return (
                                <div key={index} style={{ 
                                    aspectRatio: '1.5 / 1',
                                    background: bgColor,
                                    border: `1px solid ${borderColor}`,
                                    borderRadius: '8px',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    padding: '0.5rem'
                                }}>
                                    <span style={{ fontSize: '1rem', fontWeight: dayObj.status !== 'none' ? 600 : 400, color: dayObj.status !== 'none' ? textColor : 'var(--text-muted)' }}>
                                        {dayObj.day}
                                    </span>
                                    {subText && (
                                        <span style={{ fontSize: '0.5rem', fontWeight: 600, color: textColor, marginTop: '2px', letterSpacing: '0.5px' }}>
                                            {subText}
                                        </span>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Charts Section */}
            <div className="grid-cols-1-2" style={{ marginBottom: '2rem' }}>
                <div className="glass-panel" style={{ padding: '1.5rem' }}>
                    <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Subject Mastery (Radar)</h3>
                    <div style={{ height: '300px', width: '100%' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                                <PolarGrid stroke="rgba(255,255,255,0.1)" />
                                <PolarAngleAxis dataKey="subject" tick={{ fill: 'var(--text-muted)', fontSize: 12 }} />
                                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                                <Radar name={studentData.NAME} dataKey="A" stroke="var(--primary)" fill="var(--primary)" fillOpacity={0.5} />
                            </RadarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="glass-panel" style={{ padding: '1.5rem' }}>
                    <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Test Scores & Attendance per Subject</h3>
                    <div style={{ height: '300px', width: '100%' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={performanceData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                <XAxis dataKey="subject" stroke="var(--text-muted)" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                                <YAxis yAxisId="left" stroke="var(--text-muted)" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} domain={[0, 100]} />
                                <YAxis yAxisId="right" orientation="right" stroke="var(--text-muted)" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} domain={[0, 100]} />
                                <Tooltip
                                    contentStyle={{ background: 'rgba(15, 17, 26, 0.9)', border: '1px solid var(--border-glass)', borderRadius: '8px' }}
                                    itemStyle={{ color: 'var(--text-main)' }}
                                />
                                <Line yAxisId="left" type="monotone" dataKey="score" name="Test Score (%)" stroke="var(--primary)" strokeWidth={3} dot={{ r: 4, fill: 'var(--bg-main)', strokeWidth: 2 }} activeDot={{ r: 6 }} />
                                <Line yAxisId="right" type="monotone" dataKey="att" name="Attendance (%)" stroke="var(--secondary)" strokeWidth={3} dot={{ r: 4, fill: 'var(--bg-main)', strokeWidth: 2 }} activeDot={{ r: 6 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
            
            <div className="glass-panel" style={{ padding: '1.5rem', background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.05), rgba(16, 185, 129, 0.05))' }}>
                <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Overall AI Profile</h3>
                <p style={{ color: 'var(--text-muted)' }}>
                    Based on recent performance metrics, {studentData.NAME}'s current profile assessment is: <br/><br/>
                    <strong style={{ fontSize: '1.2rem', color: 'var(--text-main)', padding: '0.5rem 1rem', background: 'var(--bg-darker)', borderRadius: '8px', display: 'inline-block' }}>
                        {studentData.STUDENT_PROFILE}
                    </strong>
                </p>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '1rem' }}>
                    If you have concerns about these metrics, please feel free to reach out to the assigned subject teacher or the class coordinator.
                </p>
            </div>
        </div>
    );
};

export default ParentDashboard;

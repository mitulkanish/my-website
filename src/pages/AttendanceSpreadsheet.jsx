import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Table, Calendar, Download, Search, Filter } from 'lucide-react';

export default function AttendanceSpreadsheet() {
    const { user } = useAuth();
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(true);

    // Filters
    const today = new Date().toISOString().split('T')[0];
    const [selectedDate, setSelectedDate] = useState(today);
    const [subjectFilter, setSubjectFilter] = useState('all');

    const fetchDailyAttendance = async () => {
        setLoading(true);
        try {
            let url = `${import.meta.env.VITE_API_BASE_URL}/attendance/daily?date=${selectedDate}`;

            // If the user is a subject teacher, force the subject filter to their subject
            const activeSubject = user?.role === 'teacher' ? user.subject : subjectFilter;

            if (activeSubject !== 'all') {
                url += `&subject=${activeSubject}`;
            }

            const res = await fetch(url);
            const data = await res.json();

            if (data.success) {
                setRecords(data.records);
            }
        } catch (err) {
            console.error("Failed to fetch daily attendance", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDailyAttendance();
    }, [selectedDate, subjectFilter, user]);

    const handleExport = () => {
        if (records.length === 0) return;

        let csv = "Date,Time Marked,Student ID,Student Name,Subject,Teacher ID\n";
        records.forEach(r => {
            const time = new Date(r.time_marked).toLocaleTimeString();
            csv += `"${r.date}","${time}","${r.user_id}","${r.student_name}","${r.subject}","${r.teacher_id}"\n`;
        });

        const encodedUri = encodeURI("data:text/csv;charset=utf-8," + csv);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `attendance_export_${selectedDate}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="page-header">
            <div className="flex-between" style={{ marginBottom: '2rem' }}>
                <div>
                    <h1 className="page-title text-gradient" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <Table size={28} />
                        Daily Attendance Grid
                    </h1>
                    <p className="page-description">
                        {user?.role === 'teacher'
                            ? `Reviewing live ${user.subject?.toUpperCase()} attendance logs.`
                            : `Reviewing system-wide live attendance logs.`
                        }
                    </p>
                </div>

                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button className="btn-secondary" onClick={handleExport} disabled={records.length === 0} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Download size={18} />
                        <span>Export CSV</span>
                    </button>
                    <button className="btn-primary" onClick={fetchDailyAttendance} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Search size={18} />
                        <span>Refresh Grid</span>
                    </button>
                </div>
            </div>

            <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '1.5rem', display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <Calendar size={18} color="var(--text-muted)" />
                    <input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        style={{ background: 'var(--bg-darker)', border: '1px solid var(--border-glass)', padding: '0.5rem 1rem', borderRadius: '8px', color: 'white', outline: 'none' }}
                    />
                </div>

                {user?.role !== 'teacher' && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <Filter size={18} color="var(--text-muted)" />
                        <select
                            value={subjectFilter}
                            onChange={(e) => setSubjectFilter(e.target.value)}
                            style={{ background: 'var(--bg-darker)', border: '1px solid var(--border-glass)', padding: '0.5rem 1rem', borderRadius: '8px', color: 'white', outline: 'none' }}
                        >
                            <option value="all">All Subjects</option>
                            <option value="maths">Mathematics</option>
                            <option value="ct">Comp. Thinking</option>
                            <option value="de">Digital Electronics</option>
                            <option value="cpp">C++ Programming</option>
                            <option value="coe">COE Sessions</option>
                        </select>
                    </div>
                )}

                <div style={{ marginLeft: 'auto', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                    Total Present: <span style={{ color: 'var(--success)', fontWeight: 600, fontSize: '1rem' }}>{records.length}</span> records
                </div>
            </div>

            <div className="glass-panel" style={{ borderRadius: '12px', overflow: 'hidden' }}>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead>
                            <tr style={{ background: 'rgba(255,255,255,0.05)', borderBottom: '1px solid var(--border-glass)' }}>
                                <th style={{ padding: '1rem', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.875rem' }}>Date</th>
                                <th style={{ padding: '1rem', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.875rem' }}>Time</th>
                                <th style={{ padding: '1rem', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.875rem' }}>Student ID</th>
                                <th style={{ padding: '1rem', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.875rem' }}>Name</th>
                                <th style={{ padding: '1rem', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.875rem' }}>Subject</th>
                                <th style={{ padding: '1rem', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.875rem' }}>Teacher ID</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="6" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading grid data...</td>
                                </tr>
                            ) : records.length === 0 ? (
                                <tr>
                                    <td colSpan="6" style={{ padding: '2rem', textAlign: 'center', color: 'var(--warning)' }}>No attendance records found for this date.</td>
                                </tr>
                            ) : (
                                records.map((record, index) => (
                                    <tr key={record.id} style={{
                                        borderBottom: '1px solid var(--border-glass)',
                                        background: index % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)',
                                        transition: 'background 0.2s'
                                    }}
                                        onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                                        onMouseOut={(e) => e.currentTarget.style.background = index % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)'}
                                    >
                                        <td style={{ padding: '1rem', fontSize: '0.875rem' }}>{record.date}</td>
                                        <td style={{ padding: '1rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>{new Date(record.time_marked).toLocaleTimeString()}</td>
                                        <td style={{ padding: '1rem', fontSize: '0.875rem', fontFamily: 'monospace' }}>{record.user_id}</td>
                                        <td style={{ padding: '1rem', fontWeight: 500, color: 'var(--primary-light)' }}>{record.student_name}</td>
                                        <td style={{ padding: '1rem', fontSize: '0.875rem' }}>
                                            <span style={{
                                                padding: '0.25rem 0.5rem',
                                                background: 'rgba(99, 102, 241, 0.1)',
                                                color: 'var(--primary)',
                                                borderRadius: '99px',
                                                textTransform: 'uppercase',
                                                fontSize: '0.75rem'
                                            }}>
                                                {record.subject}
                                            </span>
                                        </td>
                                        <td style={{ padding: '1rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>{record.teacher_id}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

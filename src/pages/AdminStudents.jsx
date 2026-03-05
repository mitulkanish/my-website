import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Users, Search, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AdminStudents = () => {
    const { user } = useAuth();
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        const fetchStudents = async () => {
            try {
                const response = await fetch(import.meta.env.VITE_API_BASE_URL + '/admin/students');
                if (response.ok) {
                    const data = await response.json();
                    if (data.success) {
                        const processedStudents = data.students.map(student => {
                            let detailedProfile, type;
                            const att = user?.role === 'teacher' ? student[`${user.subject}_att`] : student.avg_att;

                            if (att >= 90) { detailedProfile = "Elite Attendee"; type = "success"; }
                            else if (att >= 80) { detailedProfile = "Consistent Learner"; type = "good"; }
                            else if (att >= 70) { detailedProfile = "Regular Student"; type = "adequate"; }
                            else if (att >= 60) { detailedProfile = "Moderate Attendee"; type = "moderate"; }
                            else if (att >= 50) { detailedProfile = "Average Attendee"; type = "average"; }
                            else if (att >= 40) { detailedProfile = "Inconsistent Learner"; type = "warning"; }
                            else if (att >= 30) { detailedProfile = "At-Risk Student"; type = "danger"; }
                            else if (att >= 20) { detailedProfile = "High-Risk Student"; type = "severe"; }
                            else if (att >= 10) { detailedProfile = "Critical Risk"; type = "critical"; }
                            else { detailedProfile = "Severe Disengagement"; type = "extreme"; }

                            return { ...student, profile: detailedProfile, profileType: type, displayAtt: att };
                        });
                        setStudents(processedStudents);
                    }
                }
            } catch (error) {
                console.error("Failed to fetch student list", error);
            } finally {
                setLoading(false);
            }
        };

        if (user?.role === 'admin' || user?.role === 'teacher' || user?.role === 'coordinator') {
            fetchStudents();
        }
    }, [user]);

    if (!user || (user.role !== 'admin' && user.role !== 'teacher' && user.role !== 'coordinator')) {
        return <div style={{ color: 'var(--danger)', padding: '2rem' }}>Unauthorized access. Administrator privileges required.</div>;
    }

    const filteredStudents = students.filter(student =>
        student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.profile.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="page-header">
            <div className="flex-between" style={{ marginBottom: '2rem' }}>
                <div>
                    <h1 className="page-title text-gradient" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <Users size={28} />
                        Student Directory
                    </h1>
                    <p className="page-description">Complete list of all tracked students. Click on any student to view their individual ML profile.</p>
                </div>
            </div>

            <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
                <div style={{ position: 'relative', marginBottom: '1.5rem' }}>
                    <Search color="var(--text-muted)" size={20} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
                    <input
                        type="text"
                        placeholder="Search students by name or profile type..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '1rem 1rem 1rem 3rem',
                            background: 'rgba(255, 255, 255, 0.05)',
                            border: '1px solid var(--border-glass)',
                            borderRadius: '8px',
                            color: 'white',
                            fontSize: '1rem',
                            outline: 'none'
                        }}
                    />
                </div>

                {loading ? (
                    <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading student records...</div>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid var(--border-glass)', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                                    <th style={{ padding: '1rem' }}>ID</th>
                                    <th style={{ padding: '1rem' }}>Student Name</th>
                                    <th style={{ padding: '1rem' }}>ML Profile</th>
                                    <th style={{ padding: '1rem' }}>
                                        {user?.role === 'teacher' ? `${user.subject.toUpperCase()} Attendance` : 'Avg Attendance'}
                                    </th>
                                    <th style={{ padding: '1rem' }}></th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredStudents.map((student) => (
                                    <tr
                                        key={student.id}
                                        style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', cursor: 'pointer', transition: 'background 0.2s' }}
                                        onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                                        onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
                                        onClick={() => navigate(`/admin/student/${student.id}`)}
                                    >
                                        <td style={{ padding: '1rem', color: 'var(--text-muted)' }}>#{student.id}</td>
                                        <td style={{ padding: '1rem', fontWeight: 500 }}>{student.name}</td>
                                        <td style={{ padding: '1rem' }}>
                                            {(() => {
                                                let bg, color;
                                                switch (student.profileType) {
                                                    case 'success': bg = 'rgba(16, 185, 129, 0.1)'; color = 'var(--success)'; break; // Emerald
                                                    case 'good': bg = 'rgba(34, 197, 94, 0.1)'; color = '#22c55e'; break; // Green
                                                    case 'adequate': bg = 'rgba(56, 189, 248, 0.1)'; color = '#38bdf8'; break; // Sky Blue
                                                    case 'moderate': bg = 'rgba(99, 102, 241, 0.1)'; color = 'var(--primary)'; break; // Indigo
                                                    case 'average': bg = 'rgba(234, 179, 8, 0.1)'; color = '#eab308'; break; // Yellow
                                                    case 'warning': bg = 'rgba(245, 158, 11, 0.1)'; color = '#f59e0b'; break; // Amber
                                                    case 'danger': bg = 'rgba(249, 115, 22, 0.1)'; color = '#f97316'; break; // Orange
                                                    case 'severe': bg = 'rgba(239, 68, 68, 0.1)'; color = 'var(--danger)'; break; // Red
                                                    case 'critical': bg = 'rgba(185, 28, 28, 0.1)'; color = '#b91c1c'; break; // Dark Red
                                                    case 'extreme': bg = 'rgba(127, 29, 29, 0.1)'; color = '#7f1d1d'; break; // Very Dark Red
                                                    default: bg = 'rgba(99, 102, 241, 0.1)'; color = 'var(--primary)';
                                                }
                                                return (
                                                    <span style={{
                                                        fontSize: '0.75rem',
                                                        padding: '0.25rem 0.75rem',
                                                        background: bg,
                                                        color: color,
                                                        borderRadius: '99px',
                                                        fontWeight: 500
                                                    }}>
                                                        {student.profile}
                                                    </span>
                                                );
                                            })()}
                                        </td>
                                        <td style={{ padding: '1rem', color: student.displayAtt <= 75 ? 'var(--warning)' : 'var(--text-main)' }}>{student.displayAtt}%</td>
                                        <td style={{ padding: '1rem', textAlign: 'right', color: 'var(--text-muted)' }}>
                                            <ChevronRight size={18} />
                                        </td>
                                    </tr>
                                ))}
                                {filteredStudents.length === 0 && (
                                    <tr>
                                        <td colSpan="5" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                                            No students found matching your search.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminStudents;

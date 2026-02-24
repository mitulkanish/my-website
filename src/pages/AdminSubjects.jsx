import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { BookOpen, Search } from 'lucide-react';

const AdminSubjects = () => {
    const { user } = useAuth();
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        const fetchStudents = async () => {
            try {
                // We can reuse the /admin/students endpoint since it includes the detailed score breakdowns
                const response = await fetch(import.meta.env.VITE_API_BASE_URL + '/admin/students');
                if (response.ok) {
                    const data = await response.json();
                    if (data.success) {
                        setStudents(data.students);
                    }
                }
            } catch (error) {
                console.error("Failed to fetch subject list", error);
            } finally {
                setLoading(false);
            }
        };

        if (user?.role === 'admin') {
            fetchStudents();
        }
    }, [user]);

    if (!user || user.role !== 'admin') {
        return <div style={{ color: 'var(--danger)', padding: '2rem' }}>Unauthorized access. Administrator privileges required.</div>;
    }

    const filteredStudents = students.filter(student =>
        student.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="page-header">
            <div className="flex-between" style={{ marginBottom: '2rem' }}>
                <div>
                    <h1 className="page-title text-gradient" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <BookOpen size={28} />
                        Subject Analysis
                    </h1>
                    <p className="page-description">Classroom tracker for individual subject-level performance.</p>
                </div>
            </div>

            <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
                <div style={{ position: 'relative', marginBottom: '1.5rem' }}>
                    <Search color="var(--text-muted)" size={20} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
                    <input
                        type="text"
                        placeholder="Search student by name..."
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
                    <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading subject records...</div>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid var(--border-glass)', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                                    <th style={{ padding: '1rem' }}>Rank (Overall)</th>
                                    <th style={{ padding: '1rem' }}>Student Name</th>
                                    <th style={{ padding: '1rem' }}>Mathematics</th>
                                    <th style={{ padding: '1rem', borderLeft: '1px solid rgba(255,255,255,0.02)' }}>Computer Theory</th>
                                    <th style={{ padding: '1rem', borderLeft: '1px solid rgba(255,255,255,0.02)' }}>Design Eng.</th>
                                    <th style={{ padding: '1rem', borderLeft: '1px solid rgba(255,255,255,0.02)' }}>C++ Prog.</th>
                                    <th style={{ padding: '1rem', borderLeft: '1px solid rgba(255,255,255,0.02)' }}>Composite</th>
                                </tr>
                            </thead>
                            <tbody>
                                {/* Sort by composite score before mapping to show rank */}
                                {filteredStudents
                                    .sort((a, b) => b.avg_score - a.avg_score)
                                    .map((student, idx) => (
                                        <tr
                                            key={student.id}
                                            style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', transition: 'background 0.2s' }}
                                            onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                                            onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
                                        >
                                            <td style={{ padding: '1rem', color: 'var(--text-muted)' }}>#{idx + 1}</td>
                                            <td style={{ padding: '1rem', fontWeight: 500 }}>{student.name}</td>
                                            <td style={{ padding: '1rem', color: student.maths_score <= 55 ? 'var(--danger)' : 'var(--text-main)' }}>{student.maths_score}%</td>
                                            <td style={{ padding: '1rem', borderLeft: '1px solid rgba(255,255,255,0.02)', color: student.ct_score <= 55 ? 'var(--danger)' : 'var(--text-main)' }}>{student.ct_score}%</td>
                                            <td style={{ padding: '1rem', borderLeft: '1px solid rgba(255,255,255,0.02)', color: student.de_score <= 55 ? 'var(--danger)' : 'var(--text-main)' }}>{student.de_score}%</td>
                                            <td style={{ padding: '1rem', borderLeft: '1px solid rgba(255,255,255,0.02)', color: student.cpp_score <= 55 ? 'var(--danger)' : 'var(--text-main)' }}>{student.cpp_score}%</td>
                                            <td style={{ padding: '1rem', borderLeft: '1px solid rgba(255,255,255,0.02)' }}>
                                                <span style={{ color: student.avg_score >= 80 ? 'var(--success)' : student.avg_score <= 55 ? 'var(--danger)' : 'var(--text-muted)', fontWeight: 600 }}>
                                                    {student.avg_score}%
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                {filteredStudents.length === 0 && (
                                    <tr>
                                        <td colSpan="7" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
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

export default AdminSubjects;

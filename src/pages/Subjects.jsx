import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { BookOpen } from 'lucide-react';

const Subjects = () => {
    const { user } = useAuth();
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStudents = async () => {
            try {
                // Fetching all students from the admin endpoint just to display class rankings for the student view.
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

        if (user) {
            fetchStudents();
        }
    }, [user]);

    if (!user) {
        return <div>Please log in to view subjects.</div>;
    }

    return (
        <div className="page-header">
            <div className="flex-between" style={{ marginBottom: '2rem' }}>
                <div>
                    <h1 className="page-title text-gradient" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <BookOpen size={28} />
                        My Subject Analysis
                    </h1>
                    <p className="page-description">Your detailed performance breakdown across all subjects, charted against the class.</p>
                </div>
            </div>

            <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
                {loading ? (
                    <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading subject records...</div>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid var(--border-glass)', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                                    <th style={{ padding: '1rem' }}>Class Rank</th>
                                    <th style={{ padding: '1rem' }}>Student Name</th>
                                    <th style={{ padding: '1rem' }}>Mathematics</th>
                                    <th style={{ padding: '1rem', borderLeft: '1px solid rgba(255,255,255,0.02)' }}>Computer Theory</th>
                                    <th style={{ padding: '1rem', borderLeft: '1px solid rgba(255,255,255,0.02)' }}>Design Eng.</th>
                                    <th style={{ padding: '1rem', borderLeft: '1px solid rgba(255,255,255,0.02)' }}>C++ Prog.</th>
                                    <th style={{ padding: '1rem', borderLeft: '1px solid rgba(255,255,255,0.02)' }}>Composite View</th>
                                </tr>
                            </thead>
                            <tbody>
                                {/* Sort by composite score before mapping to show rank */}
                                {students
                                    .sort((a, b) => b.avg_score - a.avg_score)
                                    .map((student, idx) => {
                                        const isCurrentUser = String(student.id) === String(user.id) || student.name === user.name;

                                        // Only render the row if it's the current user to protect privacy
                                        if (!isCurrentUser) return null;

                                        return (
                                            <tr
                                                key={student.id}
                                                style={{
                                                    borderBottom: '1px solid rgba(255,255,255,0.05)',
                                                    transition: 'background 0.2s',
                                                    background: 'rgba(99, 102, 241, 0.1)'
                                                }}
                                            >
                                                <td style={{ padding: '1rem', color: 'var(--primary)', fontWeight: 'bold' }}>#{idx + 1}</td>
                                                <td style={{ padding: '1rem', fontWeight: 'bold', color: 'var(--text-main)' }}>
                                                    {student.name} <span style={{ fontSize: '0.75rem', background: 'var(--primary)', color: 'white', padding: '0.1rem 0.4rem', borderRadius: '4px', marginLeft: '0.5rem' }}>YOU</span>
                                                </td>
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
                                        );
                                    })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Subjects;

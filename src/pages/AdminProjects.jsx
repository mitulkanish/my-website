import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Lightbulb, Search, Code, Cpu, Target, ExternalLink, ChevronDown, ChevronUp } from 'lucide-react';

const AdminProjects = () => {
    const { user } = useAuth();
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [expandedRows, setExpandedRows] = useState(new Set());
    const [uploadedProjectsData, setUploadedProjectsData] = useState({});

    useEffect(() => {
        const fetchStudents = async () => {
            try {
                const response = await fetch(import.meta.env.VITE_API_BASE_URL + '/admin/students');
                if (response.ok) {
                    const data = await response.json();
                    if (data.success) {
                        setStudents(data.students);

                        // Load uploaded projects for all fetched students from local storage
                        const projectData = {};

                        const defaultProjectsPool = [
                            { title: 'Matrix Solver Engine', url: 'https://github.com/student/math-solver', date: new Date().toLocaleDateString(), subject: 'Matrices and Calculus', status: 'Verified' },
                            { title: 'Digital Circuit Simulator', url: 'https://github.com/student/de-simulator', date: new Date().toLocaleDateString(), subject: 'Electronic Devices', status: 'In Review' },
                            { title: 'Sorting Vislualizer', url: 'https://github.com/student/algo-visualizer', date: new Date().toLocaleDateString(), subject: 'Circuit Theory', status: 'Verified' },
                            { title: 'Library Management System', url: 'https://github.com/student/cpp-library', date: new Date().toLocaleDateString(), subject: 'C Programming', status: 'Needs Revision' },
                            { title: 'Facial Attendance Model', url: 'https://github.com/student/smart-attendance', date: new Date().toLocaleDateString(), subject: 'Center of Excellence', status: 'In Review' },
                            { title: 'E-Commerce Backend API', url: 'https://github.com/student/ecommerce-api', date: new Date().toLocaleDateString(), subject: 'C Programming', status: 'Verified' },
                            { title: 'Pathfinding Visualizer', url: 'https://github.com/student/pathfinding', date: new Date().toLocaleDateString(), subject: 'Circuit Theory', status: 'Verified' },
                            { title: 'Stock Price Predictor', url: 'https://github.com/student/stock-predictor', date: new Date().toLocaleDateString(), subject: 'Matrices and Calculus', status: 'Pending' }
                        ];

                        const subjectMap = {
                            'maths': 'Matrices and Calculus',
                            'cpp': 'C Programming',
                            'de': 'Electronic Devices',
                            'ct': 'Circuit Theory',
                            'coe': 'Center of Excellence'
                        };

                        const shouldFilter = (proj) => {
                            if (user?.role === 'teacher') return proj.subject === subjectMap[user.subject];
                            return true;
                        };

                        data.students.forEach((student, index) => {
                            const savedProjects = localStorage.getItem(`uploaded_projects_${student.id}`);
                            if (savedProjects) {
                                // Add default status for backward compatibility
                                let parsed = JSON.parse(savedProjects).map(p => ({
                                    ...p,
                                    status: p.status || 'Pending'
                                }));
                                parsed = parsed.filter(shouldFilter);
                                projectData[student.id] = parsed;
                            } else {
                                // Provide fake projects for demo if local storage is empty
                                // varying combinations of projects per student
                                const numId = parseInt(String(student.id).replace(/\D/g, '') || '0', 10);
                                const projCount = (index % 4) === 0 ? 1 : ((index % 3) === 0 ? 3 : 2);

                                let stProjects = [];
                                for (let i = 0; i < projCount; i++) {
                                    stProjects.push({
                                        ...defaultProjectsPool[(numId + i) % defaultProjectsPool.length],
                                        id: `demo-${student.id}-${i}`
                                    });
                                }
                                stProjects = stProjects.filter(shouldFilter);
                                projectData[student.id] = stProjects;
                            }
                        });

                        // Also check the global index for any uploaded projects from students not in the main DB yet
                        const userIndexKey = 'admin_uploaded_projects_index';
                        const globalIndex = JSON.parse(localStorage.getItem(userIndexKey) || '{}');

                        Object.keys(globalIndex).forEach(studentId => {
                            // Only add if not already present from the DB fetch
                            if (!projectData[studentId]) {
                                const savedProjects = localStorage.getItem(`uploaded_projects_${studentId}`);
                                if (savedProjects) {
                                    let parsed = JSON.parse(savedProjects);
                                    parsed = parsed.filter(shouldFilter);
                                    projectData[studentId] = parsed;

                                    // Optionally append this student to the standard list if they are totally new (MVP behavior)
                                    if (!data.students.find(s => String(s.id) === String(studentId))) {
                                        setStudents(prev => [...prev, {
                                            id: studentId,
                                            name: globalIndex[studentId].name,
                                            profile: globalIndex[studentId].profile,
                                            // Mocking averages since they aren't in the DB
                                            avg_score: 0,
                                            avg_att: 0
                                        }]);
                                    }
                                }
                            }
                        });

                        setUploadedProjectsData(projectData);
                    }
                }
            } catch (error) {
                console.error("Failed to fetch students projects", error);
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
        student.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const toggleRow = (studentId) => {
        const newExpandedRows = new Set(expandedRows);
        if (newExpandedRows.has(studentId)) {
            newExpandedRows.delete(studentId);
        } else {
            newExpandedRows.add(studentId);
        }
        setExpandedRows(newExpandedRows);
    };

    const getProjectPerformance = (profile) => {
        if (profile === 'Practical Learner' || profile === 'Excellent All-Rounder') {
            return {
                status: "Excelling",
                detail: "Demonstrates strong hands-on capability. Ready for complex, Full-Stack applications.",
                icon: <Code size={16} color="var(--success)" />,
                pillColor: "rgba(16, 185, 129, 0.1)",
                textColor: "var(--success)"
            };
        }
        if (profile === 'Theoretical Learner') {
            return {
                status: "Needs Practice",
                detail: "Strong theoretical knowledge but struggles with implementation. Needs guided tutorials.",
                icon: <Cpu size={16} color="var(--warning)" />,
                pillColor: "rgba(245, 158, 11, 0.1)",
                textColor: "var(--warning)"
            };
        }
        if (profile === 'Inconsistent Learner') {
            return {
                status: "On Track",
                detail: "Solid grasp of fundamentals. Capable of executing standard level project briefs.",
                icon: <Target size={16} color="var(--primary)" />,
                pillColor: "rgba(99, 102, 241, 0.1)",
                textColor: "var(--primary)"
            };
        }
        return {
            status: "Action Required",
            detail: "Missing core competencies. Needs fundamental review before attempting major projects.",
            icon: <Target size={16} color="var(--danger)" />,
            pillColor: "rgba(239, 68, 68, 0.1)",
            textColor: "var(--danger)"
        };
    };

    return (
        <div className="page-header">
            <div className="flex-between" style={{ marginBottom: '2rem' }}>
                <div>
                    <h1 className="page-title text-gradient" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <Lightbulb size={28} />
                        Skill Projects Performance
                    </h1>
                    <p className="page-description">Overview of student capabilities and uploaded project links.</p>
                </div>
            </div>

            <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
                <div style={{ position: 'relative', marginBottom: '1.5rem' }}>
                    <Search color="var(--text-muted)" size={20} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
                    <input
                        type="text"
                        placeholder="Search student..."
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
                    <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading project records...</div>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid var(--border-glass)', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                                    <th style={{ padding: '1rem', width: '20%' }}>Student Name</th>
                                    <th style={{ padding: '1rem', width: '20%' }}>Project Status</th>
                                    <th style={{ padding: '1rem', width: '45%' }}>Performance Detail</th>
                                    <th style={{ padding: '1rem', width: '15%', textAlign: 'center' }}>Uploaded Projects</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredStudents.map((student) => {
                                    const perf = getProjectPerformance(student.profile);
                                    const isExpanded = expandedRows.has(student.id);
                                    const stuProjects = uploadedProjectsData[student.id] || [];

                                    return (
                                        <React.Fragment key={student.id}>
                                            <tr
                                                style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', transition: 'background 0.2s', cursor: stuProjects.length > 0 ? 'pointer' : 'default' }}
                                                onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                                                onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
                                                onClick={() => stuProjects.length > 0 && toggleRow(student.id)}
                                            >
                                                <td style={{ padding: '1rem', fontWeight: 500 }}>{student.name}</td>
                                                <td style={{ padding: '1rem' }}>
                                                    <span style={{
                                                        fontSize: '0.75rem',
                                                        padding: '0.25rem 0.75rem',
                                                        background: perf.pillColor,
                                                        color: perf.textColor,
                                                        borderRadius: '99px',
                                                        display: 'inline-flex',
                                                        alignItems: 'center',
                                                        gap: '0.25rem'
                                                    }}>
                                                        {perf.icon}
                                                        {perf.status}
                                                    </span>
                                                </td>
                                                <td style={{ padding: '1rem', color: 'var(--text-muted)', fontSize: '0.875rem', lineHeight: 1.5 }}>
                                                    {perf.detail}
                                                </td>
                                                <td style={{ padding: '1rem', textAlign: 'center' }}>
                                                    {stuProjects.length > 0 ? (
                                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', color: 'var(--primary)' }}>
                                                            {stuProjects.length} Project{stuProjects.length !== 1 ? 's' : ''}
                                                            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                                        </div>
                                                    ) : (
                                                        <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>None</span>
                                                    )}
                                                </td>
                                            </tr>
                                            {isExpanded && stuProjects.length > 0 && (
                                                <tr style={{ background: 'rgba(0, 0, 0, 0.2)' }}>
                                                    <td colSpan="4" style={{ padding: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
                                                            {stuProjects.map(proj => (
                                                                <div key={proj.id} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-glass)', borderRadius: '8px', padding: '1rem' }}>
                                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                                                                        <h4 style={{ margin: 0, fontSize: '1rem', color: 'var(--text-main)', paddingRight: '1rem' }}>{proj.title}
                                                                            {proj.status === 'Verified' && <span className="glass-pill" style={{ marginLeft: '0.5rem', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)', padding: '0.15rem 0.5rem', fontSize: '0.65rem' }}>Verified</span>}
                                                                            {proj.status === 'In Review' && <span className="glass-pill" style={{ marginLeft: '0.5rem', background: 'rgba(56, 189, 248, 0.1)', color: '#38bdf8', padding: '0.15rem 0.5rem', fontSize: '0.65rem' }}>In Review</span>}
                                                                            {proj.status === 'Needs Revision' && <span className="glass-pill" style={{ marginLeft: '0.5rem', background: 'rgba(245, 158, 11, 0.1)', color: 'var(--warning)', padding: '0.15rem 0.5rem', fontSize: '0.65rem' }}>Needs Revision</span>}
                                                                            {(!proj.status || proj.status === 'Pending') && <span className="glass-pill" style={{ marginLeft: '0.5rem', background: 'rgba(255, 255, 255, 0.1)', padding: '0.15rem 0.5rem', fontSize: '0.65rem' }}>Pending</span>}
                                                                        </h4>
                                                                        <a href={proj.url} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary)', display: 'inline-flex' }}>
                                                                            <ExternalLink size={16} />
                                                                        </a>
                                                                    </div>
                                                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Submitted on {proj.date}</div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </td>
                                                </tr>
                                            )}
                                        </React.Fragment>
                                    );
                                })}
                                {filteredStudents.length === 0 && (
                                    <tr>
                                        <td colSpan="4" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                                            No project records found.
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

export default AdminProjects;

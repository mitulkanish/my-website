import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Users, Search, ChevronRight, Plus, Edit, Trash2, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AdminStudents = () => {
    const { user } = useAuth();
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [filterDepartment, setFilterDepartment] = useState("All");
    const [sortBy, setSortBy] = useState("name");
    const [sortOrder, setSortOrder] = useState("asc");
    const navigate = useNavigate();

    // Modal States
    const [showModal, setShowModal] = useState(false);
    const [modalMode, setModalMode] = useState('add'); // 'add' or 'edit'
    const [currentForm, setCurrentForm] = useState(null);
    const [selectedMockStudent, setSelectedMockStudent] = useState('');

    const MOCK_ROSTER = [
        { id: '1', name: 'John Doe', department: 'Computer Science Engineering', maths_att: 85, ct_att: 90, de_att: 78, cpp_att: 88, coe_att: 92, maths_score: 75, ct_score: 82, de_score: 70, cpp_score: 80 },
        { id: '2', name: 'Jane Smith', department: 'Electronics and Communication Engineering', maths_att: 95, ct_att: 95, de_att: 92, cpp_att: 98, coe_att: 96, maths_score: 90, ct_score: 91, de_score: 88, cpp_score: 94 },
        { id: '3', name: 'Robert Brown', department: 'Mechanical and Mechatronics Engineering', maths_att: 45, ct_att: 50, de_att: 60, cpp_att: 55, coe_att: 40, maths_score: 55, ct_score: 60, de_score: 58, cpp_score: 50 },
        { id: '4', name: 'Emily Davis', department: 'Biomedical Engineering', maths_att: 70, ct_att: 75, de_att: 80, cpp_att: 72, coe_att: 85, maths_score: 85, ct_score: 88, de_score: 82, cpp_score: 86 },
        { id: '5', name: 'Michael Wilson', department: 'Computer Science Engineering', maths_att: 10, ct_att: 15, de_att: 20, cpp_att: 12, coe_att: 5, maths_score: 30, ct_score: 25, de_score: 35, cpp_score: 20 }
    ];

    const emptyForm = {
        name: '',
        department: 'Computer Science Engineering',
        maths_att: 0,
        ct_att: 0,
        de_att: 0,
        cpp_att: 0,
        coe_att: 0,
        maths_score: 0,
        ct_score: 0,
        de_score: 0,
        cpp_score: 0
    };

    const fetchStudents = async () => {
        setLoading(true);
        try {
            const response = await fetch(import.meta.env.VITE_API_BASE_URL + '/admin/students', {
                cache: 'no-store',
                headers: {
                    'Pragma': 'no-cache',
                    'Cache-Control': 'no-cache' // Prevent stale data on deletion
                }
            });
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

    useEffect(() => {
        if (user?.role === 'admin' || user?.role === 'teacher' || user?.role === 'coordinator') {
            fetchStudents();
        }
    }, [user]);

    if (!user || (user.role !== 'admin' && user.role !== 'teacher' && user.role !== 'coordinator')) {
        return <div style={{ color: 'var(--danger)', padding: '2rem' }}>Unauthorized access. Administrator privileges required.</div>;
    }

    const filteredStudents = students.filter(student => {
        const matchesSearch = student.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                              student.profile.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesDept = filterDepartment === "All" || student.department === filterDepartment;
        return matchesSearch && matchesDept;
    }).sort((a, b) => {
        let valA, valB;
        if (sortBy === 'name') {
            valA = a.name.toLowerCase();
            valB = b.name.toLowerCase();
        } else if (sortBy === 'attendance') {
            valA = a.displayAtt;
            valB = b.displayAtt;
        } else if (sortBy === 'grade') {
            valA = a.avg_score || 0;
            valB = b.avg_score || 0;
        } else if (sortBy === 'department') {
            valA = (a.department || '').toLowerCase();
            valB = (b.department || '').toLowerCase();
        }

        if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
        if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
        return 0;
    });

    const handleAddClick = () => {
        setModalMode('add');
        setSelectedMockStudent('');
        setCurrentForm({ ...emptyForm });
        setShowModal(true);
    };

    const handleMockStudentSelect = (e) => {
        const studentId = e.target.value;
        setSelectedMockStudent(studentId);
        
        if (studentId === '') {
            setCurrentForm({ ...emptyForm });
        } else {
            const student = MOCK_ROSTER.find(s => s.id === studentId);
            if (student) {
                // Omit the 'id' field from being copied into the form
                const { id, ...formData } = student;
                setCurrentForm(formData);
            }
        }
    };

    const handleEditClick = (e, student) => {
        e.stopPropagation();
        setModalMode('edit');
        setCurrentForm({
            id: student.id,
            name: student.name,
            department: student.department || 'Computer Science Engineering',
            maths_att: student.maths_att || 0,
            ct_att: student.ct_att || 0,
            de_att: student.de_att || 0,
            cpp_att: student.cpp_att || 0,
            coe_att: student.coe_att || 0,
            maths_score: student.maths_score || 0,
            ct_score: student.ct_score || 0,
            de_score: student.de_score || 0,
            cpp_score: student.cpp_score || 0
        });
        setShowModal(true);
    };

    const handleDeleteClick = async (e, id) => {
        e.stopPropagation();
        if (window.confirm('Are you sure you want to delete this student?')) {
            try {
                const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/admin/student/${id}`, {
                    method: 'DELETE'
                });
                const data = await res.json();
                if (data.success) {
                    fetchStudents();
                } else {
                    alert('Failed to delete student: ' + data.error);
                }
            } catch (err) {
                console.error(err);
            }
        }
    };

    const handleModalSubmit = async (e) => {
        e.preventDefault();
        const url = modalMode === 'add' 
            ? `${import.meta.env.VITE_API_BASE_URL}/admin/student`
            : `${import.meta.env.VITE_API_BASE_URL}/admin/student/${currentForm.id}`;
        
        const method = modalMode === 'add' ? 'POST' : 'PUT';

        try {
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(currentForm)
            });
            const data = await res.json();
            if (data.success) {
                setShowModal(false);
                fetchStudents();
            } else {
                alert('Error: ' + data.error);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleFormChange = (e) => {
        const { name, value, type } = e.target;
        setCurrentForm(prev => ({
            ...prev,
            [name]: type === 'number' ? Number(value) : value
        }));
    };

    return (
        <div className="page-header" style={{ position: 'relative' }}>
            <div className="flex-between" style={{ marginBottom: '2rem' }}>
                <div>
                    <h1 className="page-title text-gradient" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <Users size={28} />
                        Student Directory
                    </h1>
                    <p className="page-description">Complete list of all tracked students. Click on any student to view their individual ML profile.</p>
                </div>
                {user.role === 'admin' && (
                    <button onClick={handleAddClick} style={{
                        display: 'flex', alignItems: 'center', gap: '0.5rem',
                        padding: '0.75rem 1.5rem', borderRadius: '8px',
                        background: 'var(--primary)', color: 'white',
                        border: 'none', cursor: 'pointer', fontWeight: 600
                    }}>
                        <Plus size={20} />
                        Add Student
                    </button>
                )}
            </div>

            <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
                <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
                    <div style={{ position: 'relative', flex: '1', minWidth: '250px' }}>
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
                    
                    <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
                        <select 
                            value={filterDepartment} 
                            onChange={(e) => setFilterDepartment(e.target.value)}
                            style={{ colorScheme: 'dark', padding: '0.75rem', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid var(--border-glass)', borderRadius: '8px', color: 'white', outline: 'none', cursor: 'pointer' }}
                        >
                            <option value="All" style={{ background: 'var(--bg-dark)', color: 'white' }}>All Departments</option>
                            <option value="Computer Science Engineering" style={{ background: 'var(--bg-dark)', color: 'white' }}>CS Engineering</option>
                            <option value="Electronics and Communication Engineering" style={{ background: 'var(--bg-dark)', color: 'white' }}>EC Engineering</option>
                            <option value="Mechanical and Mechatronics Engineering" style={{ background: 'var(--bg-dark)', color: 'white' }}>MM Engineering</option>
                            <option value="Biomedical Engineering" style={{ background: 'var(--bg-dark)', color: 'white' }}>Biomedical Engineering</option>
                        </select>
                        
                        <select 
                            value={sortBy} 
                            onChange={(e) => setSortBy(e.target.value)}
                            style={{ colorScheme: 'dark', padding: '0.75rem', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid var(--border-glass)', borderRadius: '8px', color: 'white', outline: 'none', cursor: 'pointer' }}
                        >
                            <option value="name" style={{ background: 'var(--bg-dark)', color: 'white' }}>Sort by Name</option>
                            <option value="attendance" style={{ background: 'var(--bg-dark)', color: 'white' }}>Sort by Attendance</option>
                            <option value="grade" style={{ background: 'var(--bg-dark)', color: 'white' }}>Sort by Grade</option>
                            <option value="department" style={{ background: 'var(--bg-dark)', color: 'white' }}>Sort by Department</option>
                        </select>
                        
                        <button 
                            onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
                            style={{ padding: '0.75rem 1rem', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid var(--border-glass)', borderRadius: '8px', color: 'var(--text-muted)', cursor: 'pointer', fontWeight: 600 }}
                        >
                            {sortOrder === 'asc' ? '↑ Asc' : '↓ Desc'}
                        </button>
                    </div>
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
                                    <th style={{ padding: '1rem', textAlign: 'right' }}>Actions</th>
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
                                            {user.role === 'admin' ? (
                                                <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                                                    <button onClick={(e) => handleEditClick(e, student)} style={{ background: 'transparent', border: 'none', color: 'var(--primary)', cursor: 'pointer', padding: '4px' }}>
                                                        <Edit size={18} />
                                                    </button>
                                                    <button onClick={(e) => handleDeleteClick(e, student.id)} style={{ background: 'transparent', border: 'none', color: 'var(--danger)', cursor: 'pointer', padding: '4px' }}>
                                                        <Trash2 size={18} />
                                                    </button>
                                                </div>
                                            ) : (
                                                <ChevronRight size={18} />
                                            )}
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

            {/* Form Modal */}
            {showModal && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.7)', zIndex: 1000,
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                    <div className="glass-panel" style={{
                        width: '100%', maxWidth: '600px', padding: '2rem',
                        maxHeight: '90vh', overflowY: 'auto'
                    }}>
                        <div className="flex-between" style={{ marginBottom: '1.5rem' }}>
                            <h2 style={{ fontSize: '1.5rem' }}>{modalMode === 'add' ? 'Add New Student' : 'Edit Student'}</h2>
                            <button onClick={() => setShowModal(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleModalSubmit}>
                            {modalMode === 'add' && (
                                <div style={{ marginBottom: '1.5rem', padding: '1rem', background: 'rgba(56, 189, 248, 0.1)', border: '1px solid rgba(56, 189, 248, 0.3)', borderRadius: '8px' }}>
                                    <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.5rem', color: '#38bdf8', fontWeight: 600 }}>Enroll Mock Student (Optional)</label>
                                    <select 
                                        value={selectedMockStudent} 
                                        onChange={handleMockStudentSelect}
                                        style={{ width: '100%', colorScheme: 'dark', padding: '0.75rem', background: 'var(--bg-dark)', border: '1px solid var(--border-glass)', borderRadius: '8px', color: 'white', outline: 'none' }}
                                    >
                                        <option value="" style={{ background: 'var(--bg-dark)', color: 'white' }}>-- Create from Scratch --</option>
                                        {MOCK_ROSTER.map((student) => (
                                            <option key={student.id} value={student.id} style={{ background: 'var(--bg-dark)', color: 'white' }}>{student.name} ({student.department})</option>
                                        ))}
                                    </select>
                                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>Select a student above to auto-fill their academic profile.</p>
                                </div>
                            )}

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                                <div style={{ gridColumn: 'span 2' }}>
                                    <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Name</label>
                                    <input required type="text" name="name" value={currentForm.name} onChange={handleFormChange} style={{ width: '100%', colorScheme: 'dark', padding: '0.75rem', background: 'var(--bg-dark)', border: '1px solid var(--border-glass)', borderRadius: '8px', color: 'white', outline: 'none' }} />
                                </div>
                                <div style={{ gridColumn: 'span 2' }}>
                                    <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Department</label>
                                    <select name="department" value={currentForm.department} onChange={handleFormChange} style={{ width: '100%', colorScheme: 'dark', padding: '0.75rem', background: 'var(--bg-dark)', border: '1px solid var(--border-glass)', borderRadius: '8px', color: 'white', outline: 'none' }}>
                                        <option value="Computer Science Engineering" style={{ background: 'var(--bg-dark)', color: 'white' }}>Computer Science Engineering</option>
                                        <option value="Electronics and Communication Engineering" style={{ background: 'var(--bg-dark)', color: 'white' }}>Electronics and Communication Engineering</option>
                                        <option value="Mechanical and Mechatronics Engineering" style={{ background: 'var(--bg-dark)', color: 'white' }}>Mechanical and Mechatronics Engineering</option>
                                        <option value="Biomedical Engineering" style={{ background: 'var(--bg-dark)', color: 'white' }}>Biomedical Engineering</option>
                                    </select>
                                </div>

                                {/* Attendance Inputs */}
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Maths Att (%)</label>
                                    <input required type="number" min="0" max="100" name="maths_att" value={currentForm.maths_att} onChange={handleFormChange} style={{ width: '100%', colorScheme: 'dark', padding: '0.75rem', background: 'var(--bg-dark)', border: '1px solid var(--border-glass)', borderRadius: '8px', color: 'white' }} />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>CT Att (%)</label>
                                    <input required type="number" min="0" max="100" name="ct_att" value={currentForm.ct_att} onChange={handleFormChange} style={{ width: '100%', colorScheme: 'dark', padding: '0.75rem', background: 'var(--bg-dark)', border: '1px solid var(--border-glass)', borderRadius: '8px', color: 'white' }} />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>DE Att (%)</label>
                                    <input required type="number" min="0" max="100" name="de_att" value={currentForm.de_att} onChange={handleFormChange} style={{ width: '100%', colorScheme: 'dark', padding: '0.75rem', background: 'var(--bg-dark)', border: '1px solid var(--border-glass)', borderRadius: '8px', color: 'white' }} />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>C++ Att (%)</label>
                                    <input required type="number" min="0" max="100" name="cpp_att" value={currentForm.cpp_att} onChange={handleFormChange} style={{ width: '100%', colorScheme: 'dark', padding: '0.75rem', background: 'var(--bg-dark)', border: '1px solid var(--border-glass)', borderRadius: '8px', color: 'white' }} />
                                </div>

                                {/* Score Inputs */}
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Maths Score (%)</label>
                                    <input required type="number" min="0" max="100" name="maths_score" value={currentForm.maths_score} onChange={handleFormChange} style={{ width: '100%', colorScheme: 'dark', padding: '0.75rem', background: 'var(--bg-dark)', border: '1px solid var(--border-glass)', borderRadius: '8px', color: 'white' }} />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>CT Score (%)</label>
                                    <input required type="number" min="0" max="100" name="ct_score" value={currentForm.ct_score} onChange={handleFormChange} style={{ width: '100%', colorScheme: 'dark', padding: '0.75rem', background: 'var(--bg-dark)', border: '1px solid var(--border-glass)', borderRadius: '8px', color: 'white' }} />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>DE Score (%)</label>
                                    <input required type="number" min="0" max="100" name="de_score" value={currentForm.de_score} onChange={handleFormChange} style={{ width: '100%', colorScheme: 'dark', padding: '0.75rem', background: 'var(--bg-dark)', border: '1px solid var(--border-glass)', borderRadius: '8px', color: 'white' }} />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>C++ Score (%)</label>
                                    <input required type="number" min="0" max="100" name="cpp_score" value={currentForm.cpp_score} onChange={handleFormChange} style={{ width: '100%', colorScheme: 'dark', padding: '0.75rem', background: 'var(--bg-dark)', border: '1px solid var(--border-glass)', borderRadius: '8px', color: 'white' }} />
                                </div>
                                
                                <div style={{ gridColumn: 'span 2' }}>
                                    <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>COE Attendance (%)</label>
                                    <input required type="number" min="0" max="100" name="coe_att" value={currentForm.coe_att} onChange={handleFormChange} style={{ width: '100%', colorScheme: 'dark', padding: '0.75rem', background: 'var(--bg-dark)', border: '1px solid var(--border-glass)', borderRadius: '8px', color: 'white' }} />
                                </div>
                            </div>

                            <button type="submit" style={{ width: '100%', padding: '1rem', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '8px', fontSize: '1rem', fontWeight: 600, cursor: 'pointer' }}>
                                {modalMode === 'add' ? 'Create Student' : 'Save Changes'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminStudents;

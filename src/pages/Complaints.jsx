import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { MessageSquare, Send, User, ChevronRight, AlertCircle, CheckCircle2, History, MessageCircleQuestion } from 'lucide-react';

const Complaints = () => {
    const { user } = useAuth();
    const [students, setStudents] = useState([]);
    const [complaints, setComplaints] = useState([]);
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [status, setStatus] = useState({ type: '', msg: '' });

    // Form State
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [message, setMessage] = useState('');
    const [activeTab, setActiveTab] = useState('new'); // 'new' or 'history'

    const API_BASE = "http://127.0.0.1:8000";

    useEffect(() => {
        fetchComplaints();
        if (user?.role === 'teacher' || user?.role === 'admin') {
            fetchStudents();
        }
    }, [user]);

    const fetchStudents = async () => {
        try {
            const res = await fetch(`${API_BASE}/admin/students`);
            const data = await res.json();
            if (data.success) {
                // For teachers, they might only want to see students in their subject, 
                // but the prompt says "each subject teachers... can complain about their students".
                // We'll show all students for now or filter if we had a class list.
                setStudents(data.students);
            }
        } catch (err) {
            console.error("Failed to fetch students:", err);
        }
    };

    const fetchComplaints = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE}/complaints?user_id=${user.id}&role=${user.role}`);
            const data = await res.json();
            if (data.success) {
                setComplaints(data.complaints);
            }
        } catch (err) {
            console.error("Failed to fetch complaints:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!message.trim()) return;
        if ((user.role === 'teacher' || user.role === 'admin') && !selectedStudent) return;

        setSending(true);
        setStatus({ type: '', msg: '' });

        const payload = {
            sender_id: user.id,
            sender_name: user.name,
            sender_role: user.role,
            receiver_id: user.role === 'parent' ? `teacher_${user.data?.DEPARTMENT?.toLowerCase() || 'general'}` : selectedStudent.parent_id || `p_${selectedStudent.name.toLowerCase().replace(/\s/g, '')}`,
            receiver_role: user.role === 'parent' ? 'teacher' : 'parent',
            student_id: user.role === 'parent' ? user.data?.S_NO?.toString() : selectedStudent.id.toString(),
            student_name: user.role === 'parent' ? user.data?.NAME : selectedStudent.name,
            subject: user.role === 'teacher' ? user.subject : 'General',
            message: message
        };

        try {
            const res = await fetch(`${API_BASE}/complaints`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const data = await res.json();
            if (data.success) {
                setStatus({ type: 'success', msg: 'Message sent successfully!' });
                setMessage('');
                setSelectedStudent(null);
                fetchComplaints();
                setTimeout(() => setActiveTab('history'), 1500);
            } else {
                setStatus({ type: 'error', msg: data.error || 'Failed to send message.' });
            }
        } catch (err) {
            setStatus({ type: 'error', msg: 'Network error. Please try again.' });
        } finally {
            setSending(false);
        }
    };

    const renderTeacherAdminView = () => (
        <div className="grid-cols-1-2" style={{ gap: '2rem' }}>
            <div className="glass-panel" style={{ padding: '1.5rem', maxHeight: '70vh', overflowY: 'auto' }}>
                <h3 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <User size={20} color="var(--primary)" />
                    Select Student
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {students.map(s => (
                        <div
                            key={s.id}
                            onClick={() => setSelectedStudent(s)}
                            className={`glass-panel clickable ${selectedStudent?.id === s.id ? 'active' : ''}`}
                            style={{
                                padding: '1rem',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                background: selectedStudent?.id === s.id ? 'var(--primary-glow)' : 'rgba(255,255,255,0.02)',
                                border: selectedStudent?.id === s.id ? '1px solid var(--primary)' : '1px solid var(--border-glass)'
                            }}
                        >
                            <div>
                                <p style={{ fontWeight: 600, fontSize: '0.9rem' }}>{s.name}</p>
                                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{s.department} | ID: {s.id}</p>
                            </div>
                            <ChevronRight size={16} color={selectedStudent?.id === s.id ? 'var(--primary)' : 'var(--text-muted)'} />
                        </div>
                    ))}
                </div>
            </div>

            <div className="glass-panel" style={{ padding: '2rem' }}>
                {selectedStudent ? (
                    <>
                        <div style={{ marginBottom: '2rem' }}>
                            <h2 className="text-gradient" style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>
                                Send Complaint to Parent
                            </h2>
                            <p style={{ color: 'var(--text-muted)' }}>
                                You are writing about <strong>{selectedStudent.name}</strong>. This message will be visible to their parent/guardian.
                            </p>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div style={{ marginBottom: '1.5rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.75rem', fontSize: '0.875rem', fontWeight: 600 }}>Message Body</label>
                                <textarea
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    placeholder="Describe the issue or feedback regarding the student's performance, behavior, or attendance..."
                                    style={{
                                        width: '100%',
                                        minHeight: '200px',
                                        padding: '1rem',
                                        background: 'rgba(0,0,0,0.2)',
                                        border: '1px solid var(--border-glass)',
                                        borderRadius: '12px',
                                        color: 'var(--text-main)',
                                        outline: 'none',
                                        resize: 'vertical'
                                    }}
                                />
                            </div>

                            {status.msg && (
                                <div style={{
                                    padding: '1rem',
                                    borderRadius: '8px',
                                    marginBottom: '1.5rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.75rem',
                                    background: status.type === 'success' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                                    color: status.type === 'success' ? 'var(--success)' : 'var(--danger)',
                                    border: `1px solid ${status.type === 'success' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)'}`
                                }}>
                                    {status.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                                    <span style={{ fontSize: '0.875rem' }}>{status.msg}</span>
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={sending || !message.trim()}
                                className="btn-primary"
                                style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.75rem' }}
                            >
                                {sending ? 'Sending...' : (
                                    <>
                                        <Send size={18} />
                                        Submit Complaint
                                    </>
                                )}
                            </button>
                        </form>
                    </>
                ) : (
                    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', textAlign: 'center' }}>
                        <MessageSquare size={64} style={{ marginBottom: '1.5rem', opacity: 0.2 }} />
                        <h3>Select a student from the list to begin</h3>
                        <p style={{ maxWidth: '300px', marginTop: '0.5rem' }}>You can send formal complaints or performance updates directly to parents.</p>
                    </div>
                )}
            </div>
        </div>
    );

    const renderParentView = () => (
        <div className="glass-panel" style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
            <div style={{ marginBottom: '2rem' }}>
                <h2 className="text-gradient" style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>
                    Raise Complaint or Question
                </h2>
                <p style={{ color: 'var(--text-muted)' }}>
                    Have a concern? You can send a message directly to your child's teachers or the academic coordinator.
                </p>
            </div>

            <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.75rem', fontSize: '0.875rem', fontWeight: 600 }}>Message</label>
                    <textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Type your question or concern here..."
                        style={{
                            width: '100%',
                            minHeight: '200px',
                            padding: '1rem',
                            background: 'rgba(0,0,0,0.2)',
                            border: '1px solid var(--border-glass)',
                            borderRadius: '12px',
                            color: 'var(--text-main)',
                            outline: 'none',
                            resize: 'vertical'
                        }}
                    />
                </div>

                {status.msg && (
                    <div style={{
                        padding: '1rem',
                        borderRadius: '8px',
                        marginBottom: '1.5rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        background: status.type === 'success' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                        color: status.type === 'success' ? 'var(--success)' : 'var(--danger)',
                        border: `1px solid ${status.type === 'success' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)'}`
                    }}>
                        {status.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                        <span style={{ fontSize: '0.875rem' }}>{status.msg}</span>
                    </div>
                )}

                <button
                    type="submit"
                    disabled={sending || !message.trim()}
                    className="btn-primary"
                    style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.75rem' }}
                >
                    {sending ? 'Sending...' : (
                        <>
                            <Send size={18} />
                            Send Message
                        </>
                    )}
                </button>
            </form>
        </div>
    );

    const renderHistory = () => (
        <div className="glass-panel" style={{ padding: '2rem' }}>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <History size={20} color="var(--primary)" />
                Communication Logs
            </h3>

            {loading ? (
                <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading logs...</div>
            ) : complaints.length === 0 ? (
                <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                    <MessageSquare size={48} style={{ marginBottom: '1rem', opacity: 0.1, margin: '0 auto' }} />
                    <p>No complaints or questions on record.</p>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {complaints.map(c => (
                        <div key={c.id} className="glass-panel" style={{ padding: '1.25rem', borderLeft: `4px solid ${c.sender_id === user.id ? 'var(--primary)' : 'var(--accent)'}` }}>
                            <div className="flex-between" style={{ marginBottom: '0.75rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    <span style={{
                                        padding: '0.25rem 0.75rem',
                                        borderRadius: '99px',
                                        fontSize: '0.7rem',
                                        fontWeight: 600,
                                        background: c.sender_id === user.id ? 'var(--primary-glow)' : 'var(--accent-glow)',
                                        color: c.sender_id === user.id ? 'var(--primary)' : 'var(--accent)'
                                    }}>
                                        {c.sender_id === user.id ? 'SENT' : 'RECEIVED'}
                                    </span>
                                    <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>
                                        {c.sender_id === user.id ? `To ${c.receiver_role === 'parent' ? 'Parent' : 'Teacher'}` : `From ${c.sender_name}`}
                                    </span>
                                </div>
                                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                    {new Date(c.timestamp).toLocaleString()}
                                </span>
                            </div>
                            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                                For Student: <strong>{c.student_name}</strong> | Subject: {c.subject}
                            </p>
                            <p style={{ fontSize: '0.95rem', lineHeight: '1.5' }}>{c.message}</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );

    return (
        <div className="page-container">
            <div className="page-header" style={{ marginBottom: '2rem' }}>
                <h1 className="page-title text-gradient">Complaints & Questions</h1>
                <p className="page-description">Direct communication channel between faculty, administration, and parents.</p>
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
                <button
                    onClick={() => setActiveTab('new')}
                    style={{
                        padding: '0.75rem 1.5rem',
                        borderRadius: '99px',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '0.9rem',
                        fontWeight: 600,
                        background: activeTab === 'new' ? 'var(--primary)' : 'rgba(255,255,255,0.05)',
                        color: activeTab === 'new' ? 'white' : 'var(--text-muted)',
                        transition: '0.3s'
                    }}
                >
                    {user.role === 'parent' ? 'Raise Question' : 'Send New Complaint'}
                </button>
                <button
                    onClick={() => setActiveTab('history')}
                    style={{
                        padding: '0.75rem 1.5rem',
                        borderRadius: '99px',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '0.9rem',
                        fontWeight: 600,
                        background: activeTab === 'history' ? 'var(--primary)' : 'rgba(255,255,255,0.05)',
                        color: activeTab === 'history' ? 'white' : 'var(--text-muted)',
                        transition: '0.3s'
                    }}
                >
                    Communication History
                </button>
            </div>

            {activeTab === 'new' ? (
                user.role === 'parent' ? renderParentView() : renderTeacherAdminView()
            ) : (
                renderHistory()
            )}
        </div>
    );
};

export default Complaints;

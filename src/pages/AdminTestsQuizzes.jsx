import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { CheckSquare, Search, MessageSquare, PlusCircle, PenTool, Database, Cpu, Plus, X, UploadCloud } from 'lucide-react';

const subjectsTopics = {
    "Matrices and Calculus": [
        "Eigenvalues and Eigenvectors",
        "Multiple Integrals",
        "Differential Equations",
        "Vector Calculus",
        "Functions of Several Variables",
        "Laplace Transforms",
        "Fourier Series",
        "Complex Integration"
    ],
    "C Programming": [
        "Data Types, Operators and Expressions",
        "Control Flow Statements",
        "Arrays and Strings",
        "Functions and Pointers",
        "Structures and Unions",
        "File Processing",
        "Dynamic Memory Allocation",
        "Preprocessor Directives"
    ],
    "Electronic Devices": [
        "Semiconductor Physics",
        "PN Junction Diodes",
        "Bipolar Junction Transistors (BJT)",
        "Field Effect Transistors (JFET & MOSFET)",
        "Special Purpose Diodes",
        "Power Devices",
        "Transistor Biasing",
        "Small Signal Models"
    ],
    "Circuit Theory": [
        "Basic Circuit Concepts and Laws",
        "Network Theorems",
        "Transient Analysis (RL, RC, RLC)",
        "AC Circuit Analysis",
        "Resonance and Coupled Circuits",
        "Three Phase Circuits",
        "Two Port Networks",
        "Network Topology"
    ]
};

const AdminTestsQuizzes = () => {
    const { user } = useAuth();
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [activeTab, setActiveTab] = useState("generate");

    // Modal state
    const [showGenerateModal, setShowGenerateModal] = useState(false);
    const [selectedTopicData, setSelectedTopicData] = useState(null);
    const [testConfig, setTestConfig] = useState({ type: 'Weekly Test', questions: 10 });

    // Upload state
    const [selectedFile, setSelectedFile] = useState(null);
    const [isExtracting, setIsExtracting] = useState(false);

    useEffect(() => {
        const fetchStudents = async () => {
            try {
                const response = await fetch(import.meta.env.VITE_API_BASE_URL + '/admin/students');
                if (response.ok) {
                    const data = await response.json();
                    if (data.success) {
                        setStudents(data.students);
                    }
                }
            } catch (error) {
                console.error("Failed to fetch students tests", error);
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

    const getFeedbackCommand = (score) => {
        if (score >= 85) return { text: "Outstanding performance. Keep it up!", color: "var(--success)" };
        if (score >= 70) return { text: "Good progress. Can improve consistency.", color: "var(--primary)" };
        if (score >= 55) return { text: "Needs focus and revision on core topics.", color: "var(--warning)" };
        return { text: "Critical: Remedial sessions recommended.", color: "var(--danger)" };
    };

    const handleGenerateClick = (subject, topic) => {
        setSelectedTopicData({ subject, topic });
        setShowGenerateModal(true);
    };

    const handleConfirmGenerate = () => {
        if (!selectedTopicData) return;

        const newTest = {
            id: Date.now().toString(),
            subject: selectedTopicData.subject,
            topic: selectedTopicData.topic,
            type: testConfig.type,
            questions: parseInt(testConfig.questions, 10),
            duration: parseInt(testConfig.questions, 10) * 2, // 2 mins per question
            dateAssigned: new Date().toLocaleDateString(),
            createdAt: Date.now()
        };

        const existingTests = JSON.parse(localStorage.getItem('adminAssignedTests') || '[]');
        localStorage.setItem('adminAssignedTests', JSON.stringify([...existingTests, newTest]));
        window.dispatchEvent(new Event('local-storage-update'));

        setShowGenerateModal(false);
        setTestConfig({ type: 'Weekly Test', questions: 10 });
        setSelectedTopicData(null);
        alert(`Test "${newTest.topic}" successfully dispatched to students!`);
    };

    const handleFileUpload = (e) => {
        if (e.target.files && e.target.files.length > 0) {
            setSelectedFile(e.target.files[0]);
        }
    };

    const handleExtractAndGenerate = async () => {
        if (!selectedFile) return;
        setIsExtracting(true);

        const formData = new FormData();
        formData.append('file', selectedFile);

        try {
            const response = await fetch(import.meta.env.VITE_API_BASE_URL + '/upload-pdf', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                throw new Error('Server error');
            }

            const data = await response.json();

            if (!data.success) {
                alert(`Error: ${data.error}`);
                setIsExtracting(false);
                return;
            }

            const customQuestions = data.questions;

            const newTest = {
                id: Date.now().toString(),
                subject: 'Custom Uploaded Assessment',
                topic: data.title || selectedFile.name.replace('.pdf', ''),
                type: 'External Question Bank Test',
                questions: customQuestions.length,
                duration: customQuestions.length * 2, // 2 mins per question
                dateAssigned: new Date().toLocaleDateString(),
                createdAt: Date.now(),
                customQuestions: customQuestions // Save custom questions explicitly
            };

            const existingTests = JSON.parse(localStorage.getItem('adminAssignedTests') || '[]');
            localStorage.setItem('adminAssignedTests', JSON.stringify([...existingTests, newTest]));
            window.dispatchEvent(new Event('local-storage-update'));

            setIsExtracting(false);
            setSelectedFile(null);
            alert(`Successfully extracted ${customQuestions.length} questions from ${selectedFile.name} and dispatched to students!`);
        } catch (error) {
            console.error(error);
            alert("Failed to parse PDF. Please ensure the backend server is running and the file is a valid text PDF.");
            setIsExtracting(false);
        }
    };

    return (
        <div className="page-header">
            <div className="flex-between" style={{ marginBottom: '2rem' }}>
                <div>
                    <h1 className="page-title text-gradient" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <CheckSquare size={28} />
                        Tests & Quizzes Archive
                    </h1>
                    <p className="page-description">Generate test series or review student test results.</p>
                </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', borderBottom: '1px solid var(--border-glass)' }}>
                <button
                    onClick={() => setActiveTab('generate')}
                    style={{
                        padding: '1rem 2rem',
                        background: 'none',
                        border: 'none',
                        color: activeTab === 'generate' ? 'var(--primary)' : 'var(--text-muted)',
                        borderBottom: activeTab === 'generate' ? '2px solid var(--primary)' : '2px solid transparent',
                        cursor: 'pointer',
                        fontWeight: activeTab === 'generate' ? '600' : '400',
                        transition: 'all 0.2s ease',
                        fontSize: '1rem'
                    }}
                >
                    Generate Test Series
                </button>
                <button
                    onClick={() => setActiveTab('results')}
                    style={{
                        padding: '1rem 2rem',
                        background: 'none',
                        border: 'none',
                        color: activeTab === 'results' ? 'var(--primary)' : 'var(--text-muted)',
                        borderBottom: activeTab === 'results' ? '2px solid var(--primary)' : '2px solid transparent',
                        cursor: 'pointer',
                        fontWeight: activeTab === 'results' ? '600' : '400',
                        transition: 'all 0.2s ease',
                        fontSize: '1rem'
                    }}
                >
                    Student Results
                </button>
                <button
                    onClick={() => setActiveTab('upload')}
                    style={{
                        padding: '1rem 2rem',
                        background: 'none',
                        border: 'none',
                        color: activeTab === 'upload' ? 'var(--primary)' : 'var(--text-muted)',
                        borderBottom: activeTab === 'upload' ? '2px solid var(--primary)' : '2px solid transparent',
                        cursor: 'pointer',
                        fontWeight: activeTab === 'upload' ? '600' : '400',
                        transition: 'all 0.2s ease',
                        fontSize: '1rem'
                    }}
                >
                    Upload Question Bank
                </button>
            </div>

            {activeTab === 'generate' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    {Object.entries(subjectsTopics).map(([subject, topics]) => (
                        <div key={subject} className="glass-panel" style={{ padding: '1.5rem' }}>
                            <div className="flex-between" style={{ marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border-glass)' }}>
                                <h2 style={{ fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    {subject === 'Matrices and Calculus' && <Plus size={20} color="var(--primary)" />}
                                    {subject === 'C Programming' && <PenTool size={20} color="var(--success)" />}
                                    {subject === 'Electronic Devices' && <Cpu size={20} color="var(--warning)" />}
                                    {subject === 'Circuit Theory' && <Database size={20} color="var(--accent)" />}
                                    {subject} Test Configuration
                                </h2>
                                <button className="btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}>
                                    <PlusCircle size={16} />
                                    Generate Combined Test Series
                                </button>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
                                {topics.map((topic, idx) => (
                                    <div key={idx} style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        padding: '1rem',
                                        background: 'rgba(255,255,255,0.03)',
                                        border: '1px solid var(--border-glass)',
                                        borderRadius: '8px'
                                    }}>
                                        <div>
                                            <h4 style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-main)', marginBottom: '0.25rem' }}>{topic}</h4>
                                            <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>10 Questions • 15 Mins</p>
                                        </div>
                                        <button
                                            onClick={() => handleGenerateClick(subject, topic)}
                                            style={{
                                                background: 'rgba(99, 102, 241, 0.1)',
                                                color: 'var(--primary)',
                                                border: '1px solid rgba(99, 102, 241, 0.3)',
                                                padding: '0.4rem 0.75rem',
                                                borderRadius: '4px',
                                                fontSize: '0.75rem',
                                                cursor: 'pointer',
                                                transition: 'background 0.2s'
                                            }}
                                            onMouseOver={(e) => e.currentTarget.style.background = 'rgba(99, 102, 241, 0.2)'}
                                            onMouseOut={(e) => e.currentTarget.style.background = 'rgba(99, 102, 241, 0.1)'}
                                        >
                                            Generate
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {activeTab === 'upload' && (
                <div className="glass-panel" style={{ padding: '3rem 2rem', textAlign: 'center', maxWidth: '800px', margin: '0 auto' }}>
                    <div style={{ marginBottom: '2rem' }}>
                        <div style={{
                            width: '80px', height: '80px', borderRadius: '50%',
                            background: 'rgba(99, 102, 241, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            margin: '0 auto 1.5rem auto'
                        }}>
                            <UploadCloud size={40} color="var(--primary)" />
                        </div>
                        <h2 style={{ fontSize: '1.75rem', marginBottom: '0.5rem', color: 'var(--text-main)' }}>Upload Question Bank PDF</h2>
                        <p style={{ color: 'var(--text-muted)', fontSize: '1rem', maxWidth: '500px', margin: '0 auto' }}>
                            Upload an existing PDF document. Our system will automatically parse the textual contents and dynamically generate an interactive MCQ assessment for your students.
                        </p>
                    </div>

                    <div style={{
                        border: '2px dashed var(--border-glass)', borderRadius: '12px', padding: '3rem 2rem',
                        background: 'rgba(255, 255, 255, 0.02)', marginBottom: '2rem', transition: 'all 0.2s',
                        cursor: 'pointer', position: 'relative'
                    }}>
                        <input
                            type="file"
                            accept=".pdf"
                            onChange={handleFileUpload}
                            style={{
                                position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                                opacity: 0, cursor: 'pointer'
                            }}
                        />
                        {selectedFile ? (
                            <div>
                                <h3 style={{ color: 'var(--success)', margin: '0 0 0.5rem 0', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                                    <CheckSquare size={20} />
                                    File Selected Successfully!
                                </h3>
                                <p style={{ margin: 0, color: 'var(--text-main)', fontWeight: 600 }}>{selectedFile.name}</p>
                            </div>
                        ) : (
                            <div>
                                <p style={{ margin: '0 0 0.5rem 0', color: 'var(--text-main)', fontSize: '1.1rem', fontWeight: 500 }}>Click to browse or drag and drop</p>
                                <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.9rem' }}>Supports .PDF files (Max 10MB)</p>
                            </div>
                        )}
                    </div>

                    <button
                        className="btn-primary"
                        onClick={handleExtractAndGenerate}
                        disabled={!selectedFile || isExtracting}
                        style={{
                            padding: '1rem 3rem', fontSize: '1.1rem',
                            opacity: (!selectedFile || isExtracting) ? 0.5 : 1,
                            cursor: (!selectedFile || isExtracting) ? 'not-allowed' : 'pointer'
                        }}
                    >
                        {isExtracting ? 'Parsing PDF Extracting Questions...' : 'Extract & Generate Test'}
                    </button>
                    {isExtracting && (
                        <p style={{ marginTop: '1rem', color: 'var(--warning)', fontStyle: 'italic', fontSize: '0.9rem' }}>
                            Please hold. Analyzing document structure and applying Machine Learning models to generate meaningful multiple-choice variants...
                        </p>
                    )}
                </div>
            )}

            {activeTab === 'results' && (
                <div className="glass-panel" style={{ padding: '1.5rem' }}>
                    <div style={{ position: 'relative', marginBottom: '1.5rem' }}>
                        <Search color="var(--text-muted)" size={20} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
                        <input
                            type="text"
                            placeholder="Search student records..."
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

                    {JSON.parse(localStorage.getItem('studentCompletedTests') || '[]').length > 0 && (
                        <div style={{ marginBottom: '3rem' }}>
                            <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: 'var(--text-main)' }}>Recent Live Test Completions</h3>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
                                {JSON.parse(localStorage.getItem('studentCompletedTests') || '[]').map((test) => (
                                    <div key={test.id} style={{ padding: '1.25rem', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-glass)', borderRadius: '8px' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                                            <div>
                                                <h4 style={{ margin: 0, fontSize: '1rem', color: 'var(--primary)' }}>{test.studentName}</h4>
                                                <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.875rem', color: 'var(--text-muted)' }}>{test.testName} ({test.subject})</p>
                                            </div>
                                            <div style={{ textAlign: 'right' }}>
                                                <div style={{ fontSize: '1.1rem', fontWeight: 600, color: test.percentage >= 50 ? 'var(--success)' : 'var(--danger)' }}>{test.percentage}%</div>
                                                <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>{test.score}/{test.total}</p>
                                            </div>
                                        </div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Submitted on {test.date}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: 'var(--text-main)' }}>Overall Student Averages</h3>
                    {loading ? (
                        <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading test records...</div>
                    ) : (
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                                <thead>
                                    <tr style={{ borderBottom: '1px solid var(--border-glass)', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                                        <th style={{ padding: '1rem', width: '25%' }}>Student Name</th>
                                        <th style={{ padding: '1rem', width: '15%' }}>Avg Marks</th>
                                        <th style={{ padding: '1rem', width: '60%' }}>Command / Instructor Feedback</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredStudents.map((student) => {
                                        const feedback = getFeedbackCommand(student.avg_score);
                                        return (
                                            <tr
                                                key={student.id}
                                                style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', transition: 'background 0.2s' }}
                                                onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                                                onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
                                            >
                                                <td style={{ padding: '1rem', fontWeight: 500 }}>{student.name}</td>
                                                <td style={{ padding: '1rem', color: feedback.color, fontWeight: 600 }}>{student.avg_score}%</td>
                                                <td style={{ padding: '1rem' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                                                        <MessageSquare size={16} color={feedback.color} />
                                                        <span>{feedback.text}</span>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                    {filteredStudents.length === 0 && (
                                        <tr>
                                            <td colSpan="3" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                                                No test records found.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}

            {/* Generate Test Modal */}
            {showGenerateModal && (
                <div style={{
                    position: 'fixed',
                    top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.7)',
                    backdropFilter: 'blur(4px)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000
                }}>
                    <div className="glass-panel" style={{ width: '400px', padding: '2rem' }}>
                        <div className="flex-between" style={{ marginBottom: '1.5rem' }}>
                            <h3 style={{ fontSize: '1.25rem', margin: 0 }}>Configure Test</h3>
                            <button onClick={() => setShowGenerateModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                                <X size={20} />
                            </button>
                        </div>

                        <div style={{ marginBottom: '1.5rem' }}>
                            <p style={{ margin: '0 0 0.5rem 0', color: 'var(--text-muted)', fontSize: '0.875rem' }}>Selected Topic</p>
                            <div style={{ padding: '0.75rem', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', border: '1px solid var(--border-glass)' }}>
                                <p style={{ margin: 0, color: 'var(--primary)', fontWeight: 600 }}>{selectedTopicData?.subject}</p>
                                <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.9rem' }}>{selectedTopicData?.topic}</p>
                            </div>
                        </div>

                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>Test Type</label>
                            <select
                                value={testConfig.type}
                                onChange={(e) => setTestConfig({ ...testConfig, type: e.target.value })}
                                style={{
                                    width: '100%', padding: '0.75rem', background: 'rgba(0,0,0,0.5)',
                                    border: '1px solid var(--border-glass)', borderRadius: '8px',
                                    color: 'white', fontSize: '1rem', outline: 'none'
                                }}
                            >
                                <option value="Weekly Test">Weekly Test</option>
                                <option value="Subject Test">Subject Test</option>
                                <option value="Skill Quiz">Skill Quiz</option>
                            </select>
                        </div>

                        <div style={{ marginBottom: '2rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>Number of Questions (1 Q = 2 Mins)</label>
                            <input
                                type="number"
                                min="5" max="100"
                                value={testConfig.questions}
                                onChange={(e) => setTestConfig({ ...testConfig, questions: e.target.value })}
                                style={{
                                    width: '100%', padding: '0.75rem', background: 'rgba(0,0,0,0.5)',
                                    border: '1px solid var(--border-glass)', borderRadius: '8px',
                                    color: 'white', fontSize: '1rem', outline: 'none'
                                }}
                            />
                            <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.8rem', color: 'var(--warning)' }}>Duration: {testConfig.questions * 2} minutes</p>
                        </div>

                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <button
                                onClick={() => setShowGenerateModal(false)}
                                style={{ flex: 1, padding: '0.75rem', background: 'none', border: '1px solid var(--border-glass)', color: 'white', borderRadius: '8px', cursor: 'pointer' }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleConfirmGenerate}
                                className="btn-primary"
                                style={{ flex: 1, padding: '0.75rem', justifyContent: 'center' }}
                            >
                                Dispatch Test
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminTestsQuizzes;

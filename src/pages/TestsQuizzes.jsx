import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { PlayCircle, Award, Clock, MessageSquare, Target } from 'lucide-react';

const QuizCard = ({ title, type, duration, difficulty, onStart }) => (
    <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div className="flex-between">
            <span className="glass-pill" style={{ color: 'var(--accent)' }}>{type}</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                <Clock size={14} />
                <span>{duration}</span>
            </div>
        </div>
        <h3 style={{ fontSize: '1.25rem' }}>{title}</h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            <Award size={14} />
            <span>Difficulty: {difficulty}/5</span>
        </div>
        <button className="btn-primary" onClick={onStart} style={{ marginTop: 'auto', justifyContent: 'center' }}>
            <PlayCircle size={18} />
            <span>Start Test</span>
        </button>
    </div>
);

const TestsQuizzes = () => {
    const { user } = useAuth();
    const [myTests, setMyTests] = useState(null);
    const [loading, setLoading] = useState(true);

    // Test Taking State
    const [assignedTests, setAssignedTests] = useState([]);
    const [activeTest, setActiveTest] = useState(null);
    const [timeRemaining, setTimeRemaining] = useState(0);
    const [answers, setAnswers] = useState({});
    const [testResult, setTestResult] = useState(null);

    const topicQuestionBank = {
        "Matrices and Calculus": [
            { text: "What is the determinant of an identity matrix?", options: ["0", "1", "-1", "Depends on size"], answer: 1 },
            { text: "Eigenvalues of a triangular matrix are found on its:", options: ["Diagonal", "Last row", "First column", "Inverse"], answer: 0 },
            { text: "What is the derivative of sin(x)?", options: ["cos(x)", "-cos(x)", "sin(x)", "-sin(x)"], answer: 0 },
            { text: "If a matrix is singular, its determinant is:", options: ["1", "-1", "0", "Infinity"], answer: 2 },
            { text: "Integration is the reverse process of:", options: ["Addition", "Differentiation", "Multiplication", "Limits"], answer: 1 },
            { text: "Cayley-Hamilton theorem states every square matrix satisfies its own:", options: ["Characteristic equation", "Inverse", "Transpose", "Adjoint"], answer: 0 },
            { text: "What is the rank of a null matrix?", options: ["1", "0", "Undefined", "Depends on dimensions"], answer: 1 },
            { text: "The integral of e^x is:", options: ["x*e^x", "e^x", "e^(x+1)", "ln(x)"], answer: 1 }
        ],
        "C Programming": [
            { text: "What is the size of an 'int' data type in C (typically)?", options: ["1 byte", "2 bytes", "4 bytes", "8 bytes"], answer: 2 },
            { text: "Which keyword is used to prevent a variable from being modified?", options: ["static", "const", "volatile", "extern"], answer: 1 },
            { text: "What symbol specifies a pointer variable?", options: ["&", "#", "*", "@"], answer: 2 },
            { text: "Which function allocates memory dynamically?", options: ["malloc()", "alloc()", "new()", "create()"], answer: 0 },
            { text: "How do you start a single-line comment in C?", options: ["//", "/*", "#", "<!--"], answer: 0 },
            { text: "What is the return type of main() typically?", options: ["void", "int", "char", "float"], answer: 1 },
            { text: "Which loop guarantees execution at least once?", options: ["for", "while", "do-while", "foreach"], answer: 2 },
            { text: "What does the '&' operator return?", options: ["Value", "Address", "Pointer", "Reference"], answer: 1 }
        ],
        "Electronic Devices": [
            { text: "What is the primary material used in semiconductors?", options: ["Copper", "Silicon", "Aluminum", "Gold"], answer: 1 },
            { text: "In a P-type semiconductor, the majority carriers are:", options: ["Electrons", "Protons", "Holes", "Neutrons"], answer: 2 },
            { text: "What happens to the depletion region of a diode in reverse bias?", options: ["Narrows", "Widens", "Disappears", "Remains same"], answer: 1 },
            { text: "Which terminal controls the current in a BJT?", options: ["Emitter", "Collector", "Base", "Gate"], answer: 2 },
            { text: "A Zener diode is primarily used for:", options: ["Amplification", "Voltage Regulation", "Rectification", "Oscillation"], answer: 1 },
            { text: "What is the barrier potential for Silicon?", options: ["0.3V", "0.7V", "1.2V", "5V"], answer: 1 },
            { text: "A MOSFET is controlled by:", options: ["Current", "Voltage", "Temperature", "Light"], answer: 1 },
            { text: "Which junction is forward biased in active region of BJT?", options: ["Base-Collector", "Emitter-Base", "Both", "Neither"], answer: 1 }
        ],
        "Circuit Theory": [
            { text: "Ohm's Law is mathematically expressed as:", options: ["V = IR", "I = VR", "R = VI", "V = I/R"], answer: 0 },
            { text: "The equivalent resistance of two 10 ohm resistors in parallel is:", options: ["20 ohms", "5 ohms", "10 ohms", "15 ohms"], answer: 1 },
            { text: "Kirchhoff's Current Law is based on the conservation of:", options: ["Energy", "Momentum", "Charge", "Mass"], answer: 2 },
            { text: "What is the unit of Inductance?", options: ["Farad", "Ohm", "Henry", "Tesla"], answer: 2 },
            { text: "In an AC circuit, pure capacitors cause voltage to:", options: ["Lead current by 90deg", "Lag current by 90deg", "Be in phase", "Drop to zero"], answer: 1 },
            { text: "Thevenin's theorem reduces a linear circuit to a voltage source and a:", options: ["Parallel resistor", "Series resistor", "Series inductor", "Parallel capacitor"], answer: 1 },
            { text: "Power consumed by a resistor is given by:", options: ["V^2 / R", "V * R", "I / R", "V^2 * R"], answer: 0 },
            { text: "Which component opposes a change in current?", options: ["Resistor", "Capacitor", "Inductor", "Diode"], answer: 2 }
        ],
        "Default": [
            { text: "What is the time complexity of a binary search tree in the worst case?", options: ["O(log n)", "O(n)", "O(n log n)", "O(1)"], answer: 1 },
            { text: "Which principle is NOT part of SOLID?", options: ["Single Responsibility", "Open-Closed", "Loop Invariant", "Dependency Inversion"], answer: 2 },
            { text: "What determines the operational speed of a microprocessor?", options: ["Clock frequency", "Bus width", "ALU size", "Cache hit rate"], answer: 0 },
            { text: "Which algorithm is used to find the shortest path in a weighted graph?", options: ["DFS", "BFS", "Dijkstra's", "Kruskal's"], answer: 2 }
        ]
    };

    const mockQuestions = React.useMemo(() => {
        if (!activeTest) return [];
        if (activeTest.customQuestions && Array.isArray(activeTest.customQuestions) && activeTest.customQuestions.length > 0) {
            return activeTest.customQuestions.map(q => ({
                id: q.id,
                text: q.text,
                options: q.options,
                answer: q.answer
            }));
        }

        // Dynamically assign questions based on the subject of the test
        const activeBank = topicQuestionBank[activeTest.subject] || topicQuestionBank["Default"];

        return Array.from({ length: activeTest.questions }, (_, i) => {
            const poolItem = activeBank[i % activeBank.length];
            return {
                id: i + 1,
                text: `Q${i + 1}: ${poolItem.text}`,
                options: poolItem.options,
                answer: poolItem.answer
            };
        });
    }, [activeTest]);

    useEffect(() => {
        const fetchMyTestRecords = async () => {
            if (!user) return;
            try {
                // Fetching all students from the admin endpoint just to locate our own record for MVP
                const response = await fetch(import.meta.env.VITE_API_BASE_URL + '/admin/students');
                if (response.ok) {
                    const data = await response.json();
                    if (data.success) {
                        const myRecord = data.students.find(s => String(s.id) === String(user.id) || s.name === user.name);
                        setMyTests(myRecord);
                    }
                }
            } catch (error) {
                console.error("Failed to fetch test records", error);
            } finally {
                setLoading(false);
            }
        };

        fetchMyTestRecords();

        // Load Admin Assigned Tests (Valid for 1 Hour)
        const loadedTests = JSON.parse(localStorage.getItem('adminAssignedTests') || '[]');
        const validTests = loadedTests.filter(t => {
            const ageInMs = Date.now() - t.createdAt;
            return ageInMs <= 60 * 60 * 1000; // 1 Hour
        });

        if (validTests.length !== loadedTests.length) {
            localStorage.setItem('adminAssignedTests', JSON.stringify(validTests));
        }
        setAssignedTests(validTests);
    }, [user]);

    // Timer Logic for Active Test
    useEffect(() => {
        let timer;
        if (activeTest && timeRemaining > 0) {
            timer = setInterval(() => {
                setTimeRemaining(prev => prev - 1);
            }, 1000);
        } else if (activeTest && timeRemaining === 0) {
            handleSubmitTest();
        }
        return () => clearInterval(timer);
    }, [activeTest, timeRemaining]);

    const handleStartTest = (test) => {
        setActiveTest(test);
        setTimeRemaining(test.duration * 60); // duration in minutes to seconds
        setAnswers({}); // reset answers
    };

    const handleSubmitTest = () => {
        if (!activeTest) return;

        // Evaluate
        let score = 0;
        const detailedAnswers = mockQuestions.map(q => {
            const isCorrect = answers[q.id] === q.answer;
            if (isCorrect) score += 1;
            return {
                id: q.id,
                text: q.text,
                options: q.options,
                studentAnswer: answers[q.id],
                correctAnswer: q.answer,
                isCorrect
            };
        });
        const percentage = Math.round((score / activeTest.questions) * 100);

        const resultRecord = {
            id: Date.now().toString(),
            studentName: user.name,
            testName: activeTest.topic,
            subject: activeTest.subject,
            score,
            total: activeTest.questions,
            percentage,
            detailedAnswers,
            date: new Date().toLocaleDateString()
        };

        // Save to completed records
        const completed = JSON.parse(localStorage.getItem('studentCompletedTests') || '[]');
        localStorage.setItem('studentCompletedTests', JSON.stringify([resultRecord, ...completed]));

        // Remove from assigned
        const currentTests = JSON.parse(localStorage.getItem('adminAssignedTests') || '[]');
        const updatedTests = currentTests.filter(t => t.id !== activeTest.id);
        localStorage.setItem('adminAssignedTests', JSON.stringify(updatedTests));

        setAssignedTests(updatedTests);
        setTestResult(resultRecord);
        setActiveTest(null);
    };

    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60).toString().padStart(2, '0');
        const s = (seconds % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
    };

    const getFeedbackCommand = (score) => {
        if (!score) return null;
        if (score >= 85) return { text: "Outstanding performance. Keep it up!", color: "var(--success)" };
        if (score >= 70) return { text: "Good progress. Can improve consistency.", color: "var(--primary)" };
        if (score >= 55) return { text: "Needs focus and revision on core topics.", color: "var(--warning)" };
        return { text: "Critical: Remedial sessions recommended.", color: "var(--danger)" };
    };

    const feedback = myTests ? getFeedbackCommand(myTests.avg_score) : null;

    // Determine targeted weekly tests based on low subject scores
    let weeklyTests = [];
    if (myTests) {
        const subjects = [
            { name: 'Matrices and Calculus', score: myTests.maths_score },
            { name: 'C Programming', score: myTests.cpp_score },
            { name: 'Electronic Devices', score: myTests.de_score },
            { name: 'Circuit Theory', score: myTests.ct_score }
        ];

        weeklyTests = subjects.map(sub => {
            let qCount = 10; // Base questions
            let difficulty = 2;
            let duration = 15;

            if (sub.score < 50) {
                qCount = 30; // High remedial volume
                difficulty = 2;
                duration = 45;
            } else if (sub.score < 70) {
                qCount = 20; // Moderate remediation
                difficulty = 3;
                duration = 30;
            } else if (sub.score > 85) {
                difficulty = 4; // Challenge questions for high scorers
            }

            return {
                title: `${sub.name} Weekly Practice`,
                type: 'Weekly Test',
                duration: `${duration} mins`,
                difficulty: difficulty,
                questions: qCount,
                score: sub.score
            };
        });
    }

    // Default basic assessments if no data loaded yet
    const defaultAssessments = [
        <QuizCard key="1" title="General Aptitude" type="Diagnostic Test" duration="45 mins" difficulty={3} onStart={() => alert('Starting Diagnostic...')} />,
        <QuizCard key="2" title="Machine Learning Basics" type="Skill Quiz" duration="20 mins" difficulty={2} onStart={() => alert('Starting Quiz...')} />
    ];

    if (testResult) {
        return (
            <div className="glass-panel" style={{ padding: '4rem 2rem', maxWidth: '600px', margin: '2rem auto', textAlign: 'center' }}>
                <Award size={64} color={testResult.percentage >= 50 ? 'var(--success)' : 'var(--danger)'} style={{ marginBottom: '1rem' }} />
                <h2 style={{ fontSize: '2.5rem', marginBottom: '0.5rem', color: 'var(--text-main)' }}>Test Completed!</h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', marginBottom: '2rem' }}>You have successfully submitted the {testResult.testName} assessment.</p>

                <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-glass)', borderRadius: '12px', padding: '2rem', marginBottom: '3rem' }}>
                    <p style={{ margin: '0 0 0.5rem 0', textTransform: 'uppercase', letterSpacing: '1px', fontSize: '0.875rem', color: 'var(--text-muted)' }}>Your Score</p>
                    <div style={{ fontSize: '4rem', fontWeight: 800, color: testResult.percentage >= 50 ? 'var(--success)' : 'var(--danger)', lineHeight: 1 }}>
                        {testResult.percentage}%
                    </div>
                    <p style={{ margin: '0.5rem 0 0 0', fontSize: '1.1rem', color: 'var(--text-main)' }}>{testResult.score} out of {testResult.total} correct</p>
                </div>

                <div style={{ textAlign: 'left', marginBottom: '3rem' }}>
                    <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: 'var(--text-main)', textAlign: 'center' }}>Detailed Review</h3>
                    {testResult.detailedAnswers?.map((ans, idx) => (
                        <div key={idx} style={{
                            padding: '1.5rem', marginBottom: '1rem', borderRadius: '8px',
                            background: ans.isCorrect ? 'rgba(16, 185, 129, 0.05)' : 'rgba(239, 68, 68, 0.05)',
                            border: `1px solid ${ans.isCorrect ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)'}`
                        }}>
                            <h4 style={{ margin: '0 0 1rem 0', fontSize: '1rem', color: 'var(--text-main)', lineHeight: 1.4 }}>{ans.text}</h4>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.9rem' }}>
                                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                                    <span style={{ color: 'var(--text-muted)', minWidth: '90px' }}>Your Answer:</span>
                                    <span style={{ color: ans.isCorrect ? 'var(--success)' : 'var(--danger)', fontWeight: 500 }}>
                                        {ans.studentAnswer !== undefined ? ans.options[ans.studentAnswer] : 'Not Attempted'}
                                    </span>
                                </div>
                                {!ans.isCorrect && (
                                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                                        <span style={{ color: 'var(--text-muted)', minWidth: '90px' }}>Correct Answer:</span>
                                        <span style={{ color: 'var(--success)', fontWeight: 500 }}>
                                            {ans.options[ans.correctAnswer]}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                <button className="btn-primary" onClick={() => setTestResult(null)} style={{ padding: '1rem 3rem', fontSize: '1.1rem', width: '100%', justifyContent: 'center' }}>
                    Return to Dashboard
                </button>
            </div>
        );
    }

    if (activeTest) {
        return (
            <div className="glass-panel" style={{ padding: '3rem', maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
                <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem', color: 'var(--primary)' }}>Live Assessment</h2>
                <h3 style={{ fontSize: '1.5rem', marginBottom: '2rem' }}>{activeTest.topic} ({activeTest.subject})</h3>

                <div style={{ display: 'inline-block', padding: '1rem 3rem', background: 'rgba(239, 68, 68, 0.1)', border: '2px solid var(--danger)', borderRadius: '12px', marginBottom: '3rem' }}>
                    <p style={{ margin: '0 0 0.5rem 0', color: 'var(--text-muted)', fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '2px' }}>Time Remaining</p>
                    <div style={{ fontSize: '4rem', fontWeight: 800, color: 'var(--danger)', fontFamily: 'monospace', lineHeight: 1 }}>
                        {formatTime(timeRemaining)}
                    </div>
                </div>

                <div style={{ textAlign: 'left', marginBottom: '3rem' }}>
                    {mockQuestions.map((q) => (
                        <div key={q.id} style={{ marginBottom: '2rem', padding: '1.5rem', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid var(--border-glass)' }}>
                            <h4 style={{ fontSize: '1.1rem', marginBottom: '1rem', color: 'var(--text-main)', lineHeight: '1.4' }}>{q.text}</h4>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                {q.options.map((opt, idx) => (
                                    <label key={idx} style={{
                                        display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer',
                                        color: answers[q.id] === idx ? 'var(--primary)' : 'var(--text-muted)',
                                        padding: '0.5rem', borderRadius: '4px',
                                        background: answers[q.id] === idx ? 'rgba(99, 102, 241, 0.1)' : 'transparent',
                                        transition: 'all 0.2s'
                                    }}>
                                        <input
                                            type="radio"
                                            name={`q-${q.id}`}
                                            value={idx}
                                            checked={answers[q.id] === idx}
                                            onChange={() => setAnswers({ ...answers, [q.id]: idx })}
                                            style={{ accentColor: 'var(--primary)', width: '16px', height: '16px' }}
                                        />
                                        <span style={{ fontSize: '0.95rem' }}>{opt}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                <button className="btn-primary" onClick={handleSubmitTest} style={{ padding: '1rem 3rem', fontSize: '1.1rem' }}>
                    Submit Test Early
                </button>
            </div>
        );
    }

    return (
        <div>
            <h1 className="page-title text-gradient">Tests & Quizzes</h1>
            <p className="page-description">Adaptive assessments tailored to your academic performance across key subjects.</p>

            {assignedTests.length > 0 && (
                <div style={{ marginTop: '2rem', padding: '1.5rem', background: 'rgba(239, 68, 68, 0.05)', borderRadius: '12px', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                        <Award color="var(--danger)" size={24} />
                        <h2 style={{ fontSize: '1.5rem', margin: 0, color: 'var(--danger)' }}>New Instructor Assigned Tests</h2>
                    </div>
                    <div className="grid-dashboard">
                        {assignedTests.map(test => (
                            <QuizCard
                                key={test.id}
                                title={test.topic}
                                type={test.type}
                                duration={`${test.duration} mins`}
                                difficulty={4}
                                onStart={() => handleStartTest(test)}
                            />
                        ))}
                    </div>
                </div>
            )}

            <div style={{ marginTop: '2rem' }}>
                <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Your Recommended Assessments</h2>

                {myTests && (
                    <div style={{ padding: '1rem', background: 'rgba(56, 189, 248, 0.1)', border: '1px solid rgba(56, 189, 248, 0.3)', borderRadius: '8px', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <Target color="#38bdf8" />
                        <p style={{ color: 'white', margin: 0 }}>
                            <strong style={{ color: '#38bdf8' }}>Adaptive Mode Active:</strong> We noticed you have varying scores across subjects. Subjects where you scored lower will feature longer Weekly Tests to help you practice and improve.
                        </p>
                    </div>
                )}

                <div className="grid-dashboard">
                    {myTests ? weeklyTests.map((t, i) => (
                        <QuizCard
                            key={i}
                            title={t.title}
                            type={`${t.questions} Questions`}
                            duration={t.duration}
                            difficulty={t.difficulty}
                            onStart={() => alert('Starting adaptive assessment...')}
                        />
                    )) : defaultAssessments}
                    <QuizCard key="monthly" title="Comprehensive Exam" type="Monthly Exam" duration="120 mins" difficulty={4} onStart={() => alert('Starting monthly exam...')} />
                </div>
            </div>

            <div style={{ marginTop: '3rem' }}>
                <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>My Past Performance</h2>

                {loading ? (
                    <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center' }}>
                        <p style={{ color: 'var(--text-muted)' }}>Loading records...</p>
                    </div>
                ) : myTests ? (
                    <div className="glass-panel" style={{ padding: '0' }}>
                        <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border-glass)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <div style={{ padding: '1rem', background: 'rgba(99, 102, 241, 0.1)', borderRadius: '12px' }}>
                                    <Target size={24} color="var(--primary)" />
                                </div>
                                <div>
                                    <h3 style={{ fontSize: '1.25rem', marginBottom: '0.25rem' }}>Composite Test Average</h3>
                                    <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Based on all recent departmental exams.</p>
                                </div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <div style={{ fontSize: '2.5rem', fontWeight: 800, color: feedback?.color || 'white', lineHeight: 1 }}>
                                    {myTests.avg_score}%
                                </div>
                            </div>
                        </div>

                        {feedback && (
                            <div style={{ padding: '1.5rem', background: 'rgba(0,0,0,0.2)' }}>
                                <h4 style={{ fontSize: '0.875rem', marginBottom: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Latest Instructor Feedback</h4>
                                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', padding: '1.25rem', border: '1px solid var(--border-glass)', borderRadius: '8px', background: 'rgba(255,255,255,0.02)' }}>
                                    <MessageSquare size={20} color={feedback.color} style={{ marginTop: '2px', flexShrink: 0 }} />
                                    <p style={{ color: 'white', lineHeight: 1.5 }}>"{feedback.text}"</p>
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center' }}>
                        <p style={{ color: 'var(--text-muted)' }}>No past test records found for your account.</p>
                    </div>
                )}

                {JSON.parse(localStorage.getItem('studentCompletedTests') || '[]').filter(t => t.studentName === user?.name).length > 0 && (
                    <div className="glass-panel" style={{ padding: '1.5rem', marginTop: '2rem' }}>
                        <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Recently Completed Tests</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {JSON.parse(localStorage.getItem('studentCompletedTests') || '[]')
                                .filter(t => t.studentName === user?.name)
                                .map(test => (
                                    <div key={test.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-glass)', borderRadius: '8px' }}>
                                        <div>
                                            <h4 style={{ margin: 0, fontSize: '1rem', color: 'var(--text-main)' }}>{test.testName}</h4>
                                            <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.875rem', color: 'var(--text-muted)' }}>{test.subject} • {test.date}</p>
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <div style={{ fontSize: '1.25rem', fontWeight: 600, color: test.percentage >= 50 ? 'var(--success)' : 'var(--danger)' }}>{test.percentage}%</div>
                                            <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>{test.score}/{test.total}</p>
                                        </div>
                                    </div>
                                ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TestsQuizzes;

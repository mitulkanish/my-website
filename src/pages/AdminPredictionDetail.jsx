import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { BrainCircuit, AlertOctagon, Zap, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';

const AdminPredictionDetail = () => {
    const { id } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [studentData, setStudentData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStudentDetails = async () => {
            try {
                const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/admin/student/${id}`);
                if (response.ok) {
                    const data = await response.json();
                    if (data.success) {
                        setStudentData(data.student);
                    }
                }
            } catch (error) {
                console.error("Failed to fetch specific student prediction details", error);
            } finally {
                setLoading(false);
            }
        };

        if (user?.role === 'admin') {
            fetchStudentDetails();
        }
    }, [id, user]);

    if (!user || user.role !== 'admin') {
        return <div style={{ color: 'var(--danger)', padding: '2rem' }}>Unauthorized access. Administrator privileges required.</div>;
    }

    if (loading) {
        return <div style={{ padding: '2rem', color: 'var(--text-muted)' }}>Loading success intelligence profile...</div>;
    }

    if (!studentData) {
        return <div style={{ padding: '2rem', color: 'var(--danger)' }}>Student not found.</div>;
    }

    const { data, prediction, name } = studentData;
    const avgAtt = ((data.MATHS_ATT + data.CT_ATT + data.DE_ATT + data.CPP_ATT) / 4).toFixed(1);
    const avgScore = ((data.MATHS_SCORE + data.CT_SCORE + data.DE_SCORE + data.CPP_SCORE) / 4).toFixed(1);
    const insights = prediction?.insights;

    // Convert to mock practical/consistency scores based on profile 
    let practicalKnowledge = 70;
    let consistency = 70;
    if (prediction?.profile === 'Practical Learner') { practicalKnowledge = 95; consistency = 80; }
    if (prediction?.profile === 'Consistent Performer') { consistency = 95; practicalKnowledge = 85; }
    if (prediction?.profile === 'At-Risk') { consistency = 45; practicalKnowledge = 50; }

    const radarData = [
        { subject: 'Attendance', A: parseFloat(avgAtt), fullMark: 100 },
        { subject: 'Test Performance', A: parseFloat(avgScore), fullMark: 100 },
        { subject: 'Skills', A: (parseFloat(avgScore) + practicalKnowledge) / 2, fullMark: 100 },
        { subject: 'Practical Knowledge', A: practicalKnowledge, fullMark: 100 },
        { subject: 'Consistency', A: consistency, fullMark: 100 },
    ];

    return (
        <div className="page-header">
            <button
                onClick={() => navigate('/admin/predictions')}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', marginBottom: '1.5rem', padding: 0 }}
            >
                <ArrowLeft size={16} /> Back to Predictions List
            </button>

            <div className="flex-between" style={{ marginBottom: '2rem' }}>
                <div>
                    <h1 className="page-title text-gradient">{name}'s Success Intelligence</h1>
                    <p className="page-description">ML-powered analysis of academic trajectory and risk factors for this student.</p>
                </div>
            </div>

            <div className="grid-cols-1-2" style={{ marginTop: '2rem' }}>
                {/* Radar Chart for Academic Health Components */}
                <div className="glass-panel" style={{ padding: '1.5rem' }}>
                    <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <BrainCircuit color="var(--primary)" />
                        Academic Dimension Analysis
                    </h3>
                    <div style={{ height: '300px', width: '100%' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                                <PolarGrid stroke="rgba(255,255,255,0.1)" />
                                <PolarAngleAxis dataKey="subject" tick={{ fill: 'var(--text-muted)', fontSize: 12 }} />
                                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                                <Radar name="Student" dataKey="A" stroke="var(--primary)" fill="var(--primary)" fillOpacity={0.5} />
                            </RadarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Predictive Insights */}
                <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <h3 style={{ fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Zap color="var(--accent)" />
                        Predictive Insights
                    </h3>

                    {prediction?.profile === 'At-Risk' || prediction?.profile === 'Struggling Academically' ? (
                        <div style={{ background: 'rgba(244, 63, 94, 0.05)', border: '1px solid rgba(244, 63, 94, 0.2)', padding: '1.5rem', borderRadius: '12px' }}>
                            <h4 style={{ color: 'var(--danger)', marginBottom: '0.5rem', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <AlertOctagon size={18} />
                                Risk Warning Detected
                            </h4>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', lineHeight: 1.5 }}>
                                Over the last evaluation period, core metrics for {name} have dropped.
                                <br /><br />
                                {insights?.improvement_areas}
                            </p>
                        </div>
                    ) : (
                        <div style={{ background: 'rgba(16, 185, 129, 0.05)', border: '1px solid rgba(16, 185, 129, 0.2)', padding: '1.5rem', borderRadius: '12px' }}>
                            <h4 style={{ color: 'var(--success)', marginBottom: '0.5rem', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <CheckCircle2 size={18} />
                                High Probability of Success
                            </h4>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', lineHeight: 1.5 }}>
                                The ML profile indicates strong performance characteristics.
                                <br /><br />
                                {insights?.correct_procedure}
                            </p>
                        </div>
                    )}

                    <div style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border-glass)', padding: '1.5rem', borderRadius: '12px' }}>
                        <h4 style={{ color: 'white', marginBottom: '0.5rem', fontSize: '1.1rem' }}>Academic Review</h4>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', lineHeight: 1.5 }}>
                            {insights?.academic_performance}
                        </p>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default AdminPredictionDetail;

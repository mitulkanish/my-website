import React, { useState } from 'react';

const StudentPredictor = () => {
    const [formData, setFormData] = useState({
        maths_att: 85,
        ct_att: 90,
        de_att: 75,
        cpp_att: 80,
        coe_att: 95,
        maths_score: 80,
        ct_score: 85,
        de_score: 70,
        cpp_score: 88,
    });

    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: Number(e.target.value)
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setResult(null);

        try {
            const response = await fetch(import.meta.env.VITE_API_BASE_URL + "/predict", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(formData)
            });

            if (!response.ok) {
                throw new Error("Unable to connect to the ML API. Make sure the backend is running.");
            }

            const data = await response.json();
            setResult(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const renderInput = (label, name) => (
        <div key={name}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#4b5563', textTransform: 'uppercase', marginBottom: '4px' }}>
                {label}
            </label>
            <input
                type="number"
                name={name}
                min="0"
                max="100"
                value={formData[name]}
                onChange={handleChange}
                style={{
                    width: '100%',
                    padding: '8px 10px',
                    borderRadius: '6px',
                    border: '1px solid #d1d5db',
                    fontSize: '14px',
                    boxSizing: 'border-box',
                    outline: 'none',
                }}
                required
            />
        </div>
    );

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
            <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', padding: '32px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}>
                <h2 style={{ color: '#1e3a8a', marginBottom: '8px', fontSize: '28px', fontWeight: '800' }}>
                    Academic Health & COE Predictor
                </h2>
                <p style={{ color: '#6b7280', marginBottom: '24px', fontSize: '15px' }}>
                    Enter subject-wise attendance and test scores to analyze your academic deprovement, procedure correctness, and Center of Excellence engagement.
                </p>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

                    <div style={{ padding: '16px', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                        <h3 style={{ margin: '0 0 16px', fontSize: '16px', color: '#334155' }}>Classroom Attendance (%)</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '16px' }}>
                            {renderInput('Maths', 'maths_att')}
                            {renderInput('CT', 'ct_att')}
                            {renderInput('DE', 'de_att')}
                            {renderInput('C++', 'cpp_att')}
                        </div>
                    </div>

                    <div style={{ padding: '16px', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                        <h3 style={{ margin: '0 0 16px', fontSize: '16px', color: '#334155' }}>Subject Test Scores (%)</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '16px' }}>
                            {renderInput('Maths', 'maths_score')}
                            {renderInput('CT', 'ct_score')}
                            {renderInput('DE', 'de_score')}
                            {renderInput('C++', 'cpp_score')}
                        </div>
                    </div>

                    <div style={{ padding: '16px', backgroundColor: '#fffedd', borderRadius: '8px', border: '1px solid #fef08a' }}>
                        <h3 style={{ margin: '0 0 16px', fontSize: '16px', color: '#854d0e' }}>Center of Excellence (COE) (%)</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px' }}>
                            {renderInput('Practical Engagement / COE Attendance', 'coe_att')}
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            padding: '14px 24px',
                            backgroundColor: loading ? '#9ca3af' : '#2563eb',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            fontSize: '16px',
                            fontWeight: '700',
                            cursor: loading ? 'not-allowed' : 'pointer',
                            transition: 'background-color 0.2s',
                            boxShadow: '0 4px 6px -1px rgba(37, 99, 235, 0.2)'
                        }}
                    >
                        {loading ? 'Analyzing Data...' : 'Generate AI Insights'}
                    </button>
                </form>

                {error && (
                    <div style={{ marginTop: '20px', padding: '16px', backgroundColor: '#fee2e2', color: '#b91c1c', borderRadius: '8px' }}>
                        <strong>Error:</strong> {error}
                    </div>
                )}

                {result && result.insights && (
                    <div style={{ marginTop: '32px', display: 'flex', flexDirection: 'column', gap: '16px' }}>

                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#eff6ff', padding: '16px 24px', borderRadius: '12px', border: '1px solid #bfdbfe' }}>
                            <span style={{ fontSize: '18px', fontWeight: '600', color: '#1e40af' }}>Learner Profile:</span>
                            <span style={{ padding: '6px 16px', backgroundColor: '#1d4ed8', color: 'white', borderRadius: '9999px', fontWeight: 'bold', fontSize: '15px' }}>
                                {result.profile}
                            </span>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                            <div style={{ backgroundColor: '#f0fdf4', padding: '20px', borderRadius: '12px', border: '1px solid #bbf7d0' }}>
                                <h4 style={{ color: '#166534', margin: '0 0 8px 0', fontSize: '16px' }}>Correct Procedures ✅</h4>
                                <p style={{ margin: 0, color: '#15803d', fontSize: '14px', lineHeight: '1.6' }}>{result.insights.correct_procedure}</p>
                            </div>

                            <div style={{ backgroundColor: '#fff7ed', padding: '20px', borderRadius: '12px', border: '1px solid #fed7aa' }}>
                                <h4 style={{ color: '#9a3412', margin: '0 0 8px 0', fontSize: '16px' }}>What Needs Improvement ⚠️</h4>
                                <p style={{ margin: 0, color: '#c2410c', fontSize: '14px', lineHeight: '1.6' }}>{result.insights.improvement_areas}</p>
                            </div>

                            <div style={{ backgroundColor: '#f5f3ff', padding: '20px', borderRadius: '12px', border: '1px solid #ddd6fe' }}>
                                <h4 style={{ color: '#5b21b6', margin: '0 0 8px 0', fontSize: '16px' }}>Academic Performance 📚</h4>
                                <p style={{ margin: 0, color: '#6d28d9', fontSize: '14px', lineHeight: '1.6' }}>{result.insights.academic_performance}</p>
                            </div>

                            <div style={{ backgroundColor: '#fef2f2', padding: '20px', borderRadius: '12px', border: '1px solid #fecaca' }}>
                                <h4 style={{ color: '#991b1b', margin: '0 0 8px 0', fontSize: '16px' }}>COE / Practical Performance 🛠️</h4>
                                <p style={{ margin: 0, color: '#b91c1c', fontSize: '14px', lineHeight: '1.6' }}>{result.insights.coe_performance}</p>
                            </div>
                        </div>

                    </div>
                )}
            </div>
        </div>
    );
};

export default StudentPredictor;

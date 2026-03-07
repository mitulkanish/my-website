import React, { useState, useEffect } from 'react';
import { MessageSquareText, AlertCircle, RefreshCw, User, Tag } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const AdminStudentVoice = () => {
  const { user } = useAuth();
  const [voices, setVoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchVoices = async () => {
    setLoading(true);
    try {
      const res = await fetch(import.meta.env.VITE_API_BASE_URL + '/admin/student-voices');
      const data = await res.json();
      if (data.success) {
        setVoices(data.data);
      } else {
        setError('Failed to fetch student voices.');
      }
    } catch (err) {
      setError('Could not connect to the server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVoices();
  }, []);

  const getMindsetColor = (mindset) => {
    switch (mindset.toLowerCase()) {
      case 'motivated': return 'var(--success)';
      case 'depressed': return 'var(--danger)';
      case 'confused': return 'var(--warning)';
      case 'optimistic': return '#10b981'; // Emerald
      case 'stressed': return '#ef4444'; // Red
      case 'curious': return '#3b82f6'; // Blue
      default: return 'var(--text-muted)';
    }
  };

  const getMindsetBg = (mindset) => {
    switch (mindset.toLowerCase()) {
      case 'motivated': return 'rgba(16, 185, 129, 0.1)';
      case 'depressed': return 'rgba(239, 68, 68, 0.1)';
      case 'confused': return 'rgba(245, 158, 11, 0.1)';
      case 'optimistic': return 'rgba(16, 185, 129, 0.15)';
      case 'stressed': return 'rgba(239, 68, 68, 0.15)';
      case 'curious': return 'rgba(59, 130, 246, 0.15)';
      default: return 'var(--bg-card)';
    }
  };

  return (
    <div className="dashboard-container">
      <div className="flex-between" style={{ marginBottom: '2rem' }}>
        <div>
          <h1 className="text-gradient-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <MessageSquareText size={32} />
            Student Emotions & Insights
          </h1>
          <p style={{ color: 'var(--text-muted)' }}>AI-Assisted Analysis of Student Feedback</p>
        </div>
        <button 
          onClick={fetchVoices} 
          className="btn-primary" 
          disabled={loading}
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
        >
          <RefreshCw size={18} className={loading ? 'spin' : ''} />
          Refresh Feed
        </button>
      </div>

      {error && (
        <div style={{ padding: '1rem', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', borderRadius: '8px', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <AlertCircle size={20} />
          {error}
        </div>
      )}

      {loading ? (
        <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center' }}>
          <p style={{ color: 'var(--text-muted)' }}>Loading AI Insights...</p>
        </div>
      ) : voices.length === 0 ? (
        <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center' }}>
          <p style={{ color: 'var(--text-muted)' }}>No student feedback has been submitted yet.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: '1.5rem' }}>
          {voices.map(voice => (
            <div key={voice.id} className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
              
              {/* Header: Student & Subject */}
              <div className="flex-between" style={{ borderBottom: '1px solid var(--border-glass)', paddingBottom: '1rem', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <User size={20} color="var(--primary)" />
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1.1rem' }}>{voice.student_name}</h3>
                    <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>{voice.subject}</p>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {new Date(voice.timestamp).toLocaleDateString()}
                  </span>
                </div>
              </div>

              {/* AI Analysis Block */}
              <div style={{ 
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                background: getMindsetBg(voice.ai_mindset), 
                border: `1px solid ${getMindsetColor(voice.ai_mindset)}`, 
                borderRadius: '8px', 
                padding: '1.25rem' 
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                  <Tag size={16} color={getMindsetColor(voice.ai_mindset)} />
                  <span style={{ 
                    color: getMindsetColor(voice.ai_mindset), 
                    fontWeight: 'bold', 
                    fontSize: '0.85rem',
                    textTransform: 'uppercase',
                    letterSpacing: '1px'
                  }}>
                    MINDSET: {voice.ai_mindset}
                  </span>
                </div>
                <p style={{ margin: 0, fontSize: '0.9rem', lineHeight: 1.5, color: 'var(--text-main)' }}>
                  {voice.ai_response}
                </p>
              </div>

            </div>
          ))}
        </div>
      )}
      
      <style dangerouslySetInnerHTML={{__html: `
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { 100% { transform: rotate(360deg); } }
      `}} />
    </div>
  );
};

export default AdminStudentVoice;

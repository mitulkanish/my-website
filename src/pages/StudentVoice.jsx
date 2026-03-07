import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Send, MessageSquare, AlertCircle } from 'lucide-react';

const StudentVoice = () => {
  const { user } = useAuth();
  const [subject, setSubject] = useState('maths');
  const [text, setText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    
    setIsSubmitting(true);
    setMessage(null);
    
    try {
      const res = await fetch(import.meta.env.VITE_API_BASE_URL + '/student-voice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          student_email: user?.id || 'unknown@student.com',
          student_name: user?.name || 'Unknown Student',
          subject: subject,
          text: text
        })
      });
      
      const data = await res.json();
      
      if (data.success) {
        setMessage({ type: 'success', text: data.message });
        setText('');
      } else {
        setMessage({ type: 'error', text: 'Failed to submit.' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Server error occurred.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="dashboard-container max-w-4xl mx-auto">
      <div className="flex-between" style={{ marginBottom: '2rem' }}>
        <div>
          <h1 className="text-gradient-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <MessageSquare size={32} />
            Student Voice
          </h1>
          <p style={{ color: 'var(--text-muted)' }}>Share your thoughts, feelings, and feedback on your coursework securely.</p>
        </div>
      </div>

      <div className="glass-panel" style={{ padding: '2rem' }}>
        <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', color: 'var(--primary)' }}>How are you feeling about your classes?</h2>
        
        {message && (
          <div style={{ 
            padding: '1rem', 
            borderRadius: '0.5rem', 
            marginBottom: '1.5rem',
            background: message.type === 'success' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
            color: message.type === 'success' ? 'var(--success)' : 'var(--danger)',
            border: `1px solid ${message.type === 'success' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <AlertCircle size={20} />
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Select Subject</label>
            <select 
              value={subject} 
              onChange={(e) => setSubject(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                borderRadius: '0.5rem',
                background: 'rgba(0,0,0,0.2)',
                border: '1px solid var(--border-glass)',
                color: 'var(--text-main)',
                fontSize: '1rem',
                outline: 'none'
              }}
            >
              <option value="maths">Mathematics</option>
              <option value="ct">Computer Theory</option>
              <option value="de">Digital Electronics</option>
              <option value="cpp">C++ Programming</option>
              <option value="coe">Center of Excellence</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Your Thoughts & Feelings</label>
            <textarea 
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Be honest! Are you motivated? Confused? Stressed out? Let us know what is going on..."
              rows={6}
              style={{
                width: '100%',
                padding: '1rem',
                borderRadius: '0.5rem',
                background: 'rgba(0,0,0,0.2)',
                border: '1px solid var(--border-glass)',
                color: 'var(--text-main)',
                fontSize: '1rem',
                outline: 'none',
                resize: 'vertical'
              }}
            />
          </div>

          <button 
            type="submit" 
            disabled={isSubmitting || !text.trim()}
            style={{
              padding: '1rem',
              borderRadius: '0.5rem',
              background: 'var(--primary)',
              color: 'white',
              border: 'none',
              fontSize: '1rem',
              fontWeight: 600,
              cursor: isSubmitting || !text.trim() ? 'not-allowed' : 'pointer',
              opacity: isSubmitting || !text.trim() ? 0.7 : 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              transition: 'all 0.2s'
            }}
          >
            {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
            {!isSubmitting && <Send size={20} />}
          </button>
        </form>
      </div>
    </div>
  );
};

export default StudentVoice;

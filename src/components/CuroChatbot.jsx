import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Bot, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const CuroChatbot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { id: 1, text: "Hi! I am Curo, the INTERVENIX Academic AI. How can I guide you today?", sender: "curo", time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
    ]);
    const [inputValue, setInputValue] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef(null);
    const { user } = useAuth();

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isOpen]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!inputValue.trim()) return;

        const userMsg = {
            id: Date.now(),
            text: inputValue,
            sender: "user",
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        setMessages(prev => [...prev, userMsg]);
        setInputValue('');
        setIsTyping(true);

        try {
            const res = await fetch(import.meta.env.VITE_API_BASE_URL + '/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: userMsg.text,
                    user_role: user?.role || 'student'
                })
            });
            const data = await res.json();

            if (data.success) {
                // Simulate a slight delay for realistic typing feel
                setTimeout(() => {
                    setMessages(prev => [...prev, {
                        id: Date.now() + 1,
                        text: data.response,
                        sender: "curo",
                        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                    }]);
                    setIsTyping(false);
                }, 600);
            }
        } catch (err) {
            console.error("Chat error", err);
            setIsTyping(false);
            setMessages(prev => [...prev, {
                id: Date.now() + 1,
                text: "I'm having trouble connecting to the server right now. Please try again later.",
                sender: "curo",
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }]);
        }
    };

    // Render markdown-like bolding for highlighting terms
    const renderMessageContent = (text) => {
        const parts = text.split(/(\*\*.*?\*\*)/g);
        return parts.map((part, index) => {
            if (part.startsWith('**') && part.endsWith('**')) {
                return <strong key={index} style={{ color: 'var(--primary)' }}>{part.slice(2, -2)}</strong>;
            }
            return part;
        });
    };

    return (
        <>
            <button
                onClick={() => setIsOpen(!isOpen)}
                style={{
                    position: 'fixed',
                    bottom: '2rem',
                    right: '2rem',
                    width: '60px',
                    height: '60px',
                    borderRadius: '50%',
                    background: 'var(--primary-glow)',
                    border: '1px solid var(--primary)',
                    color: 'var(--primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 8px 32px rgba(99, 102, 241, 0.4)',
                    cursor: 'pointer',
                    zIndex: 9999,
                    transition: 'transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
                }}
                onMouseOver={e => e.currentTarget.style.transform = 'scale(1.1)'}
                onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
            >
                {isOpen ? <X size={28} /> : <Bot size={28} />}
            </button>

            {isOpen && (
                <div
                    className="glass-panel"
                    style={{
                        position: 'fixed',
                        bottom: '6rem',
                        right: '2rem',
                        width: '380px',
                        height: '600px',
                        maxHeight: '80vh',
                        display: 'flex',
                        flexDirection: 'column',
                        zIndex: 9998,
                        boxShadow: '0 20px 40px rgba(0,0,0,0.6)',
                        borderRadius: '20px',
                        overflow: 'hidden',
                        animation: 'slideUp 0.3s ease-out'
                    }}
                >
                    {/* Header */}
                    <div style={{
                        padding: '1.25rem',
                        borderBottom: '1px solid var(--border-glass)',
                        background: 'rgba(99, 102, 241, 0.05)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1rem'
                    }}>
                        <div style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '50%',
                            background: 'var(--primary-glow)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <Bot size={24} color="var(--primary)" />
                        </div>
                        <div>
                            <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Curo AI</h3>
                            <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--success)' }}>● Online</p>
                        </div>
                    </div>

                    {/* Messages Area */}
                    <div style={{
                        flex: 1,
                        overflowY: 'auto',
                        padding: '1.25rem',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '1rem'
                    }}>
                        {messages.map(msg => (
                            <div
                                key={msg.id}
                                style={{
                                    alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                                    maxWidth: '85%',
                                    display: 'flex',
                                    flexDirection: 'column'
                                }}
                            >
                                <div style={{
                                    background: msg.sender === 'user' ? 'var(--primary)' : 'rgba(255,255,255,0.05)',
                                    color: msg.sender === 'user' ? 'white' : 'var(--text-main)',
                                    padding: '0.85rem 1.15rem',
                                    borderRadius: msg.sender === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                                    border: msg.sender === 'curo' ? '1px solid var(--border-glass)' : 'none',
                                    fontSize: '0.95rem',
                                    lineHeight: '1.4'
                                }}>
                                    {renderMessageContent(msg.text)}
                                </div>
                                <span style={{
                                    fontSize: '0.7rem',
                                    color: 'var(--text-muted)',
                                    marginTop: '0.25rem',
                                    alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                                    padding: '0 0.5rem'
                                }}>
                                    {msg.time}
                                </span>
                            </div>
                        ))}

                        {isTyping && (
                            <div style={{ alignSelf: 'flex-start', background: 'rgba(255,255,255,0.05)', padding: '0.85rem 1.15rem', borderRadius: '18px 18px 18px 4px', border: '1px solid var(--border-glass)', display: 'flex', gap: '0.3rem' }}>
                                <div className="typing-dot" style={{ width: '8px', height: '8px', background: 'var(--primary)', borderRadius: '50%', animation: 'bounce 1.4s infinite ease-in-out both', animationDelay: '-0.32s' }} />
                                <div className="typing-dot" style={{ width: '8px', height: '8px', background: 'var(--primary)', borderRadius: '50%', animation: 'bounce 1.4s infinite ease-in-out both', animationDelay: '-0.16s' }} />
                                <div className="typing-dot" style={{ width: '8px', height: '8px', background: 'var(--primary)', borderRadius: '50%', animation: 'bounce 1.4s infinite ease-in-out both' }} />
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <form
                        onSubmit={handleSendMessage}
                        style={{
                            padding: '1rem',
                            borderTop: '1px solid var(--border-glass)',
                            display: 'flex',
                            gap: '0.5rem',
                            background: 'var(--bg-card)'
                        }}
                    >
                        <input
                            type="text"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            placeholder="Ask Curo for help..."
                            style={{
                                flex: 1,
                                padding: '0.85rem 1.15rem',
                                borderRadius: '99px',
                                border: '1px solid var(--border-glass)',
                                background: 'rgba(0,0,0,0.2)',
                                color: 'var(--text-main)',
                                outline: 'none',
                                fontSize: '0.95rem'
                            }}
                        />
                        <button
                            type="submit"
                            disabled={!inputValue.trim()}
                            style={{
                                width: '46px',
                                height: '46px',
                                borderRadius: '50%',
                                background: inputValue.trim() ? 'var(--primary)' : 'rgba(255,255,255,0.1)',
                                border: 'none',
                                color: inputValue.trim() ? 'white' : 'var(--text-muted)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: inputValue.trim() ? 'pointer' : 'default',
                                transition: 'all 0.2s'
                            }}
                        >
                            <Send size={20} style={{ marginLeft: '2px' }} />
                        </button>
                    </form>

                    <style dangerouslySetInnerHTML={{
                        __html: `
            @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
            @keyframes bounce { 0%, 80%, 100% { transform: scale(0); } 40% { transform: scale(1); } }
          `}} />
                </div>
            )}
        </>
    );
};

export default CuroChatbot;

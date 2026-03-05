import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { Camera, Lock, Clock, CheckCircle2, UserCheck, AlertTriangle } from 'lucide-react';

export default function TeacherAttendanceScanner() {
    const { user } = useAuth();
    const [password, setPassword] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [error, setError] = useState('');
    const [sessionData, setSessionData] = useState(null);

    // Timer and UI state
    const [timeLeft, setTimeLeft] = useState(15 * 60); // 15 mins
    const [statusLogs, setStatusLogs] = useState([]);

    // Media refs
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const streamRef = useRef(null);

    // We no longer need to fetch simulated students
    // The ML model handles the verification


    // Webcam and Timer Initialization
    useEffect(() => {
        let timer;
        let captureInterval; // Declare captureInterval here
        if (sessionData) {
            // Start webcam feed securely in-browser
            navigator.mediaDevices.getUserMedia({ video: true })
                .then(stream => {
                    streamRef.current = stream;
                    if (videoRef.current) {
                        videoRef.current.srcObject = stream;
                    }
                })
                .catch(err => {
                    console.error("Camera error:", err);
                    setError("Could not access camera. Please check permissions.");
                });

            // Start frame capturing interval
            captureInterval = setInterval(() => {
                captureAndAnalyzeFrame();
            }, 3000); // Analyze every 3 seconds

            // Start 15-min countdown
            timer = setInterval(() => {
                setTimeLeft(prev => {
                    if (prev <= 1) {
                        clearInterval(timer);
                        clearInterval(captureInterval);
                        endSession();
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);

            return () => {
                clearInterval(captureInterval);
                clearInterval(timer);
                stopCamera();
            };
        }

        return () => {
            if (timer) clearInterval(timer);
            if (captureInterval) clearInterval(captureInterval); // Also clear on unmount if sessionData was true
            stopCamera();
        };
    }, [sessionData]);

    const stopCamera = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
    };

    const endSession = () => {
        stopCamera();
        setSessionData(null);
        setPassword('');
        setError('Session uniquely closed after expiration.');
        // setLastScanned(null); // This is no longer needed
        setStatusLogs([]); // Clear logs on session end
    };

    const handleAuth = async (e) => {
        e.preventDefault();
        setError('');
        setIsGenerating(true);

        try {
            const res = await fetch(import.meta.env.VITE_API_BASE_URL + '/attendance/secure_start', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    teacher_id: user.id || "teacher_coe",
                    password: password
                })
            });
            const data = await res.json();

            if (data.success) {
                setSessionData(data);
                setTimeLeft(15 * 60);
            } else {
                setError(data.error || "Authentication failed.");
            }
        } catch (err) {
            setError("Cannot connect to server.");
        } finally {
            setIsGenerating(false);
        }
    };

    const captureAndAnalyzeFrame = async () => {
        if (!videoRef.current || !canvasRef.current || !sessionData) return;

        const video = videoRef.current;
        const canvas = canvasRef.current;

        // Ensure video is playing
        if (video.videoWidth === 0) return;

        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        // Convert to high-quality JPEG
        const base64Image = canvas.toDataURL('image/jpeg', 0.9);

        try {
            const res = await fetch(import.meta.env.VITE_API_BASE_URL + '/attendance/recognize_frame', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    teacher_id: user.id || 'teacher_coe',
                    subject: sessionData.subject,
                    frame_base64: base64Image
                })
            });
            const data = await res.json();

            if (data.success && data.message !== 'No recognized students found in frame.') {
                addLog({ message: data.message, type: 'success' });
            } else if (data.message === 'No reference faces uploaded.') {
                addLog({ message: "System warning: No reference photos uploaded to database", type: 'warn' });
            }
        } catch (err) {
            console.error("Frame analysis failed", err);
        }
    };

    const addLog = (log) => {
        setStatusLogs(prev => {
            // Keep only latest 10 logs
            const updated = [{ ...log, id: Date.now(), time: new Date().toLocaleTimeString() }, ...prev];
            return updated.slice(0, 10);
        });
    };

    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    if (!sessionData) {
        return (
            <div className="page-header">
                <div style={{ maxWidth: '500px', margin: '4rem auto' }} className="glass-panel">
                    <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                        <div style={{ display: 'inline-flex', padding: '1rem', background: 'rgba(99, 102, 241, 0.1)', borderRadius: '50%', marginBottom: '1rem' }}>
                            <Lock size={32} color="var(--primary)" />
                        </div>
                        <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Secure Webcam Tracker</h2>
                        <p style={{ color: 'var(--text-muted)' }}>Authenticate to initiate your 15-minute attendance session.</p>
                    </div>

                    {error && (
                        <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', padding: '0.75rem', borderRadius: '8px', marginBottom: '1.5rem', textAlign: 'center' }}>
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleAuth} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>Teacher Identification PIN</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Enter Security Password..."
                                style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '8px', background: 'var(--bg-darker)', border: '1px solid var(--border-glass)', color: 'white', outline: 'none' }}
                                required
                            />
                        </div>
                        <button type="submit" disabled={isGenerating} className="btn-primary" style={{ display: 'flex', justifyContent: 'center', width: '100%', padding: '1rem' }}>
                            {isGenerating ? 'Authenticating Object...' : 'Initialize Camera Protocol'}
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    return (
        <div className="page-header">
            <div className="flex-between" style={{ marginBottom: '2rem' }}>
                <div>
                    <h1 className="page-title text-gradient" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <Camera size={28} />
                        Live Webcam Attendance
                    </h1>
                    <p className="page-description">Simulated Facial Recognition is active. The camera feed is currently running.</p>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{
                        display: 'flex', alignItems: 'center', gap: '0.5rem',
                        padding: '0.75rem 1.5rem', background: timeLeft < 120 ? 'rgba(239, 68, 68, 0.1)' : 'rgba(99, 102, 241, 0.1)',
                        border: `1px solid ${timeLeft < 120 ? 'var(--danger)' : 'var(--primary)'}`, borderRadius: '12px'
                    }}>
                        <Clock size={20} color={timeLeft < 120 ? 'var(--danger)' : 'var(--primary)'} />
                        <span style={{ fontSize: '1.25rem', fontWeight: 600, color: timeLeft < 120 ? 'var(--danger)' : 'var(--primary)' }}>
                            {formatTime(timeLeft)}
                        </span>
                    </div>

                    <button onClick={endSession} className="btn-secondary" style={{ borderColor: 'var(--danger)', color: 'var(--danger)' }}>
                        Force Close
                    </button>
                </div>
            </div>

            <div className="grid-cols-1-2" style={{ alignItems: 'start' }}>
                {/* Left: Camera Feed */}
                <div className="glass-panel" style={{ padding: '0.5rem', borderRadius: '16px', overflow: 'hidden', position: 'relative' }}>
                    <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        style={{ width: '100%', borderRadius: '12px', background: '#000', minHeight: '400px', objectFit: 'cover' }}
                    />

                    {/* Hidden canvas for extracting frames */}
                    <canvas ref={canvasRef} style={{ display: 'none' }} />

                    <div style={{
                        position: 'absolute', top: '1.5rem', left: '1.5rem',
                        background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(10px)',
                        padding: '0.5rem 1rem', borderRadius: '99px',
                        display: 'flex', alignItems: 'center', gap: '0.5rem',
                        border: '1px solid rgba(255,255,255,0.1)'
                    }}>
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--danger)', boxShadow: '0 0 8px var(--danger)', animation: 'pulse 2s infinite' }}></div>
                        <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>LIVE ANALYSIS</span>
                    </div>
                </div>

                {/* Right: Live Facial Recognition Event Log */}
                <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', height: '100%', maxHeight: '500px' }}>
                    <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <UserCheck size={20} color="var(--primary)" />
                        ML Recognition Log
                    </h3>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                        Snapshots are routed to the Python DeepFace engine every 3 seconds. Valid matches will appear below.
                    </p>

                    <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.5rem', paddingRight: '0.5rem' }}>
                        {statusLogs.length === 0 ? <p style={{ color: 'var(--text-muted)', fontStyle: 'italic', textAlign: 'center', marginTop: '2rem' }}>Waiting for facial signatures...</p> :
                            statusLogs.map(log => (
                                <div
                                    key={log.id}
                                    style={{
                                        display: 'flex', alignItems: 'center', gap: '1rem',
                                        padding: '1rem', background: log.type === 'success' ? 'rgba(16, 185, 129, 0.05)' : 'rgba(245, 158, 11, 0.05)',
                                        border: `1px solid ${log.type === 'success' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(245, 158, 11, 0.2)'}`,
                                        borderRadius: '8px', animation: 'fadeIn 0.3s ease-out'
                                    }}
                                >
                                    <div style={{ color: log.type === 'success' ? 'var(--success)' : 'var(--warning)' }}>
                                        {log.type === 'success' ? <CheckCircle2 size={24} /> : <AlertTriangle size={24} />}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontWeight: 500, color: 'var(--text-main)', fontSize: '0.95rem' }}>{log.message}</div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{log.time}</div>
                                    </div>
                                </div>
                            ))
                        }
                    </div>
                </div>
            </div>
        </div>
    );
}

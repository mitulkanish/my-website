import React, { useState, useEffect } from 'react';
import { Target, Code, Cpu, Plus, ExternalLink, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const ProjectCard = ({ title, category, description, match, icon }) => (
    <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
        <div className="flex-between" style={{ marginBottom: '1rem' }}>
            <div style={{ padding: '0.75rem', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '12px' }}>
                {icon}
            </div>
            <div className="glass-pill" style={{ color: 'var(--success)' }}>
                {match}% Match
            </div>
        </div>
        <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>{title}</h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '1rem', lineHeight: 1.5, flex: 1 }}>
            {description}
        </p>
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
            <span className="glass-pill" style={{ fontSize: '0.75rem' }}>{category}</span>
        </div>
        <button className="btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
            <span>View Details</span>
        </button>
    </div>
);

const UploadedProjectCard = ({ title, url, date, subject }) => (
    <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                <CheckCircle size={16} color="var(--success)" />
                <h3 style={{ fontSize: '1.125rem', margin: 0 }}>{title}</h3>
                {subject && <span className="glass-pill" style={{ fontSize: '0.65rem', padding: '0.15rem 0.5rem', marginLeft: '0.5rem', background: 'rgba(255,255,255,0.1)' }}>{subject}</span>}
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', margin: 0 }}>Submitted on {date}</p>
        </div>
        <a href={url} target="_blank" rel="noopener noreferrer" className="btn-primary" style={{ padding: '0.5rem 1rem', textDecoration: 'none' }}>
            <ExternalLink size={16} />
            <span>View</span>
        </a>
    </div>
);

const Projects = () => {
    const { user } = useAuth();
    const [uploadedProjects, setUploadedProjects] = useState([]);
    const [isUploading, setIsUploading] = useState(false);
    const [newProject, setNewProject] = useState({ title: '', url: '' });

    // Load projects from local storage on component mount
    useEffect(() => {
        if (user?.id) {
            const savedProjects = localStorage.getItem(`uploaded_projects_${user.id}`);
            if (savedProjects) {
                setUploadedProjects(JSON.parse(savedProjects));
            } else {
                const defaultProjects = [
                    { id: Date.now().toString() + '-1', title: 'Matrix & Linear Algebra Solver', url: 'https://github.com/student/math-solver', date: new Date().toLocaleDateString(), subject: 'Matrices and Calculus' },
                    { id: Date.now().toString() + '-2', title: 'Logic Gate & Circuit Simulator', url: 'https://github.com/student/de-simulator', date: new Date().toLocaleDateString(), subject: 'Electronic Devices' },
                    { id: Date.now().toString() + '-3', title: 'Sorting Algorithm Visualizer', url: 'https://github.com/student/algo-visualizer', date: new Date().toLocaleDateString(), subject: 'Circuit Theory' },
                    { id: Date.now().toString() + '-4', title: 'Library Management System', url: 'https://github.com/student/cpp-library', date: new Date().toLocaleDateString(), subject: 'C Programming' }
                ];

                // Pick 2 projects deterministically based on user ID to have some variety
                const numId = parseInt(String(user.id).replace(/\\D/g, '') || '0', 10);
                const p1 = defaultProjects[numId % 4];
                const p2 = defaultProjects[(numId + 1) % 4];
                const seeded = [p1, p2];

                setUploadedProjects(seeded);
                localStorage.setItem(`uploaded_projects_${user.id}`, JSON.stringify(seeded));

                // Also update global index for admin page to see it
                const userIndexKey = 'admin_uploaded_projects_index';
                let globalIndex = JSON.parse(localStorage.getItem(userIndexKey) || '{}');
                globalIndex[user.id] = { name: user.name, profile: user.data?.STUDENT_PROFILE || 'Student' };
                localStorage.setItem(userIndexKey, JSON.stringify(globalIndex));
            }
        }
    }, [user]);

    const handleUploadClick = () => {
        setIsUploading(!isUploading);
    };

    const handleProjectSubmit = (e) => {
        e.preventDefault();

        if (!newProject.title.trim() || !newProject.url.trim()) return;

        const projectData = {
            id: Date.now().toString(),
            title: newProject.title,
            url: newProject.url,
            date: new Date().toLocaleDateString(),
            subject: newProject.subject || 'General'
        };

        const updatedProjects = [projectData, ...uploadedProjects];
        setUploadedProjects(updatedProjects);

        // Save to local storage using the student's ID
        if (user?.id) {
            localStorage.setItem(`uploaded_projects_${user.id}`, JSON.stringify(updatedProjects));

            // Also store a global index mapping student IDs to update the admin page
            const userIndexKey = 'admin_uploaded_projects_index';
            let globalIndex = JSON.parse(localStorage.getItem(userIndexKey) || '{}');
            globalIndex[user.id] = { name: user.name, profile: user.data?.STUDENT_PROFILE || 'Student' };
            localStorage.setItem(userIndexKey, JSON.stringify(globalIndex));
        }

        setNewProject({ title: '', url: '', subject: '' });
        setIsUploading(false);
    };

    return (
        <div>
            <div className="flex-between" style={{ marginBottom: '2rem' }}>
                <div>
                    <h1 className="page-title text-gradient">Skill Projects</h1>
                    <p className="page-description">Curated project recommendations based on your academic profile and skills.</p>
                </div>
                <button className="btn-primary" onClick={handleUploadClick}>
                    <Plus size={18} />
                    <span>Upload Project</span>
                </button>
            </div>

            {isUploading && (
                <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '2rem', animation: 'fadeIn 0.3s ease-out' }}>
                    <h3 style={{ marginBottom: '1rem', fontSize: '1.25rem' }}>Submit New Project</h3>
                    <form onSubmit={handleProjectSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '1rem', alignItems: 'end' }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Project Title</label>
                            <input
                                type="text"
                                required
                                value={newProject.title}
                                onChange={(e) => setNewProject({ ...newProject, title: e.target.value })}
                                placeholder="e.g. E-commerce Backend"
                                style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid var(--border-glass)', color: 'white', outline: 'none' }}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Project Web URL</label>
                            <input
                                type="url"
                                required
                                value={newProject.url}
                                onChange={(e) => setNewProject({ ...newProject, url: e.target.value })}
                                placeholder="https://github.com/username/project"
                                style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid var(--border-glass)', color: 'white', outline: 'none' }}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Subject (Optional)</label>
                            <input
                                type="text"
                                value={newProject.subject || ''}
                                onChange={(e) => setNewProject({ ...newProject, subject: e.target.value })}
                                placeholder="e.g. Maths, C++"
                                style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid var(--border-glass)', color: 'white', outline: 'none' }}
                            />
                        </div>
                        <button type="submit" className="btn-primary" style={{ padding: '0.75rem 1.5rem', height: '42px', gridColumn: '1 / -1' }}>
                            Submit
                        </button>
                    </form>
                </div>
            )}

            {uploadedProjects.length > 0 && (
                <div style={{ marginBottom: '3rem' }}>
                    <div className="flex-between" style={{ marginBottom: '1rem' }}>
                        <h2 style={{ fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <CheckCircle size={20} color="var(--success)" />
                            My Uploaded Projects
                        </h2>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {uploadedProjects.map(project => (
                            <UploadedProjectCard key={project.id} {...project} />
                        ))}
                    </div>
                </div>
            )}

            <div>
                <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem' }}>Recommended For You</h2>
                <div className="grid-dashboard">
                    <ProjectCard
                        title="Portfolio Website"
                        category="Web Dev"
                        description="Build a responsive personal portfolio using React and modern CSS techniques."
                        match={94}
                        icon={<Code color="var(--primary)" />}
                    />
                    <ProjectCard
                        title="Spam Classifier"
                        category="Machine Learning"
                        description="Create an NLP model to classify SMS messages as spam or ham using Python."
                        match={88}
                        icon={<Cpu color="var(--accent)" />}
                    />
                    <ProjectCard
                        title="Habit Tracker App"
                        category="Full Stack"
                        description="Develop a habit tracking application with user authentication and database storage."
                        match={82}
                        icon={<Target color="var(--secondary)" />}
                    />
                    <ProjectCard
                        title="Smart Attendance System"
                        category="Computer Vision"
                        description="Build a facial recognition system to automate classroom attendance tracking."
                        match={78}
                        icon={<Cpu color="var(--success)" />}
                    />
                    <ProjectCard
                        title="E-Commerce API"
                        category="Backend"
                        description="Design a RESTful API for an online store using Node.js and MongoDB."
                        match={85}
                        icon={<Code color="var(--warning)" />}
                    />
                </div>
            </div>
        </div>
    );
};

export default Projects;

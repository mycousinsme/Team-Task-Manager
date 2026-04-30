import React, { useEffect, useState } from 'react';
import axios from '../context/AuthContext';
import { useAuth } from '../context/AuthContext';

const Badge = ({ status }) => <span className={`badge badge-${status}`}>{status.replace('_',' ')}</span>;

export default function Dashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);

  useEffect(() => {
    axios.get('/tasks/dashboard').then(r => setData(r.data)).catch(console.error);
  }, []);

  if (!data) return <div className="loading-screen"><div className="spinner"></div></div>;

  const overdueTasks = data.overdue || [];
  const recentTasks = (data.tasks || []).slice(0, 8);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Good work, {user?.name?.split(' ')[0]} 👋</h1>
          <p style={{ color: '#6b6b8a', marginTop: 4 }}>Here's what's happening across your projects</p>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card accent">
          <div className="stat-number">{data.total}</div>
          <div className="stat-label">Total Tasks</div>
        </div>
        <div className="stat-card">
          <div className="stat-number" style={{ color: '#6b6b8a' }}>{data.stats?.todo || 0}</div>
          <div className="stat-label">To Do</div>
        </div>
        <div className="stat-card warning">
          <div className="stat-number">{data.stats?.in_progress || 0}</div>
          <div className="stat-label">In Progress</div>
        </div>
        <div className="stat-card success">
          <div className="stat-number">{data.stats?.done || 0}</div>
          <div className="stat-label">Completed</div>
        </div>
        <div className="stat-card danger">
          <div className="stat-number">{overdueTasks.length}</div>
          <div className="stat-label">Overdue</div>
        </div>
      </div>

      {overdueTasks.length > 0 && (
        <div style={{ marginBottom: 32 }}>
          <div className="section-title" style={{ color: '#ef4444' }}>⚠️ Overdue Tasks</div>
          <div className="task-list">
            {overdueTasks.map(t => (
              <div key={t.id} className="task-item overdue">
                <div className="task-title">{t.title}</div>
                <Badge status={t.priority} />
                <span className="task-meta">{t.project?.name}</span>
                <span className="task-meta">Due: {new Date(t.dueDate).toLocaleDateString()}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="section-title">Recent Tasks</div>
      {recentTasks.length === 0 ? (
        <div className="empty-state">
          <h3>No tasks yet</h3>
          <p>Create a project and start adding tasks</p>
        </div>
      ) : (
        <div className="task-list">
          {recentTasks.map(t => (
            <div key={t.id} className="task-item">
              <div className="task-title">{t.title}</div>
              <Badge status={t.status} />
              <Badge status={t.priority} />
              <span className="task-meta">{t.project?.name}</span>
              {t.assignee && <span className="task-meta">→ {t.assignee.name}</span>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

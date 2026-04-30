import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from '../context/AuthContext';
import { useAuth } from '../context/AuthContext';

const Badge = ({ status }) => <span className={`badge badge-${status}`}>{status?.replace('_',' ')}</span>;

const STATUSES = ['todo', 'in_progress', 'done'];
const STATUS_LABELS = { todo: 'To Do', in_progress: 'In Progress', done: 'Done' };

export default function ProjectDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [users, setUsers] = useState([]);
  const [activeTab, setActiveTab] = useState('board');
  const [taskModal, setTaskModal] = useState(false);
  const [memberModal, setMemberModal] = useState(false);
  const [editTask, setEditTask] = useState(null);
  const [taskForm, setTaskForm] = useState({ title: '', description: '', status: 'todo', priority: 'medium', dueDate: '', assignedTo: '' });
  const [memberForm, setMemberForm] = useState({ userId: '', role: 'member' });

  const load = useCallback(() => {
    axios.get(`/projects/${id}`).then(r => setProject(r.data)).catch(() => navigate('/projects'));
  }, [id, navigate]);

  useEffect(() => {
    load();
    axios.get('/users').then(r => setUsers(r.data)).catch(console.error);
  }, [load]);

  const canManage = project?.createdBy === user?.id || user?.role === 'admin';

  const openCreate = () => {
    setEditTask(null);
    setTaskForm({ title: '', description: '', status: 'todo', priority: 'medium', dueDate: '', assignedTo: '' });
    setTaskModal(true);
  };

  const openEdit = (task) => {
    setEditTask(task);
    setTaskForm({
      title: task.title, description: task.description || '',
      status: task.status, priority: task.priority,
      dueDate: task.dueDate ? task.dueDate.split('T')[0] : '',
      assignedTo: task.assignedTo || ''
    });
    setTaskModal(true);
  };

  const handleTaskSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editTask) {
        await axios.put(`/tasks/${editTask.id}`, taskForm);
      } else {
        await axios.post('/tasks', { ...taskForm, projectId: id });
      }
      setTaskModal(false); load();
    } catch (err) { alert(err.response?.data?.error || 'Failed'); }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Delete task?')) return;
    await axios.delete(`/tasks/${taskId}`);
    load();
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`/projects/${id}/members`, memberForm);
      setMemberModal(false); load();
    } catch (err) { alert(err.response?.data?.error || 'Failed'); }
  };

  const handleRemoveMember = async (userId) => {
    if (!window.confirm('Remove member?')) return;
    await axios.delete(`/projects/${id}/members/${userId}`);
    load();
  };

  const handleStatusChange = async (task, newStatus) => {
    await axios.put(`/tasks/${task.id}`, { status: newStatus });
    load();
  };

  if (!project) return <div className="loading-screen"><div className="spinner"></div></div>;

  const tasksByStatus = STATUSES.reduce((acc, s) => {
    acc[s] = (project.tasks || []).filter(t => t.status === s);
    return acc;
  }, {});

  const nonMembers = users.filter(u => !project.members?.find(m => m.id === u.id));

  return (
    <div>
      <div className="page-header">
        <div>
          <div style={{ color: '#6b6b8a', marginBottom: 4, cursor: 'pointer' }} onClick={() => navigate('/projects')}>← Projects</div>
          <h1 className="page-title">{project.name}</h1>
          {project.description && <p style={{ color: '#6b6b8a', marginTop: 4 }}>{project.description}</p>}
        </div>
        {canManage && (
          <div style={{ display: 'flex', gap: 12 }}>
            <button className="btn btn-ghost" onClick={() => setMemberModal(true)}>+ Add Member</button>
            <button className="btn btn-primary" onClick={openCreate}>+ Add Task</button>
          </div>
        )}
      </div>

      <div className="tabs">
        {['board', 'members'].map(tab => (
          <div key={tab} className={`tab ${activeTab === tab ? 'active' : ''}`} onClick={() => setActiveTab(tab)}>
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </div>
        ))}
      </div>

      {activeTab === 'board' && (
        <div className="kanban">
          {STATUSES.map(status => (
            <div key={status} className="kanban-col">
              <div className="kanban-col-title">
                {status === 'todo' && '⬜'} {status === 'in_progress' && '🔵'} {status === 'done' && '✅'}
                {STATUS_LABELS[status]}
                <span style={{ marginLeft: 'auto', background: '#2a2a3a', borderRadius: 100, padding: '2px 8px', fontSize: 12 }}>
                  {tasksByStatus[status].length}
                </span>
              </div>
              <div className="kanban-tasks">
                {tasksByStatus[status].map(task => (
                  <div key={task.id} className="kanban-task">
                    <div className="kanban-task-title">{task.title}</div>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 8 }}>
                      <Badge status={task.priority} />
                      {task.dueDate && (
                        <span style={{ fontSize: 12, color: new Date(task.dueDate) < new Date() && task.status !== 'done' ? '#ef4444' : '#6b6b8a' }}>
                          📅 {new Date(task.dueDate).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                    {task.assignee && (
                      <div style={{ fontSize: 12, color: '#6b6b8a', marginBottom: 8 }}>👤 {task.assignee.name}</div>
                    )}
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      {STATUSES.filter(s => s !== status).map(s => (
                        <button key={s} className="btn btn-ghost btn-sm" style={{ fontSize: 11, padding: '4px 8px' }}
                          onClick={() => handleStatusChange(task, s)}>
                          → {STATUS_LABELS[s]}
                        </button>
                      ))}
                      <button className="btn btn-ghost btn-sm" style={{ fontSize: 11, padding: '4px 8px' }} onClick={() => openEdit(task)}>Edit</button>
                      {canManage && (
                        <button className="btn btn-danger btn-sm" style={{ fontSize: 11, padding: '4px 8px' }} onClick={() => handleDeleteTask(task.id)}>Del</button>
                      )}
                    </div>
                  </div>
                ))}
                {tasksByStatus[status].length === 0 && (
                  <div style={{ color: '#6b6b8a', fontSize: 13, textAlign: 'center', padding: '20px 0' }}>No tasks</div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'members' && (
        <div>
          <div className="members-list">
            {project.members?.map(m => (
              <div key={m.id} className="member-item">
                <div className="avatar">{m.name[0].toUpperCase()}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600 }}>{m.name}</div>
                  <div style={{ fontSize: 13, color: '#6b6b8a' }}>{m.email}</div>
                </div>
                <span className={`role-badge ${m.ProjectMember?.role}`}>{m.ProjectMember?.role}</span>
                {canManage && m.id !== user.id && (
                  <button className="btn btn-danger btn-sm" onClick={() => handleRemoveMember(m.id)}>Remove</button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Task Modal */}
      {taskModal && (
        <div className="modal-overlay" onClick={() => setTaskModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-title">{editTask ? 'Edit Task' : 'New Task'}</div>
            <form onSubmit={handleTaskSubmit}>
              <div className="form-group">
                <label className="form-label">Title</label>
                <input className="form-input" value={taskForm.title} onChange={e => setTaskForm({...taskForm, title: e.target.value})} required />
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea className="form-input" value={taskForm.description} onChange={e => setTaskForm({...taskForm, description: e.target.value})} rows={2} style={{ resize: 'vertical' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div className="form-group">
                  <label className="form-label">Status</label>
                  <select className="form-select" value={taskForm.status} onChange={e => setTaskForm({...taskForm, status: e.target.value})}>
                    {STATUSES.map(s => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Priority</label>
                  <select className="form-select" value={taskForm.priority} onChange={e => setTaskForm({...taskForm, priority: e.target.value})}>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Due Date</label>
                <input className="form-input" type="date" value={taskForm.dueDate} onChange={e => setTaskForm({...taskForm, dueDate: e.target.value})} />
              </div>
              <div className="form-group">
                <label className="form-label">Assign To</label>
                <select className="form-select" value={taskForm.assignedTo} onChange={e => setTaskForm({...taskForm, assignedTo: e.target.value})}>
                  <option value="">Unassigned</option>
                  {project.members?.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                </select>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={() => setTaskModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">{editTask ? 'Update' : 'Create'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Member Modal */}
      {memberModal && (
        <div className="modal-overlay" onClick={() => setMemberModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-title">Add Member</div>
            <form onSubmit={handleAddMember}>
              <div className="form-group">
                <label className="form-label">User</label>
                <select className="form-select" value={memberForm.userId} onChange={e => setMemberForm({...memberForm, userId: e.target.value})} required>
                  <option value="">Select user...</option>
                  {nonMembers.map(u => <option key={u.id} value={u.id}>{u.name} ({u.email})</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Project Role</label>
                <select className="form-select" value={memberForm.role} onChange={e => setMemberForm({...memberForm, role: e.target.value})}>
                  <option value="member">Member</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={() => setMemberModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Add Member</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

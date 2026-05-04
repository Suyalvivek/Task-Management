import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { taskSchema } from '../../utils/validators';
import AppLayout from '../../components/AppLayout';
import Modal from '../../components/Modal';
import TaskCard from '../../components/TaskCard';
import MemberList from '../../components/MemberList';
import { projectApi } from '../../api/projectApi';
import { taskApi } from '../../api/taskApi';
import { authApi } from '../../api/authApi';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { Plus, UserPlus, ArrowLeft, CheckSquare } from 'lucide-react';

export default function ProjectDetail() {
  const { projectId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [memberEmail, setMemberEmail] = useState('');
  const [addingMember, setAddingMember] = useState(false);
  const [memberError, setMemberError] = useState('');

  const myMembership = project?.members?.find(m => m.user.id === user?.id);
  const isAdmin = myMembership?.role === 'ADMIN';

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(taskSchema),
    defaultValues: { priority: 'MEDIUM' },
  });

  useEffect(() => {
    Promise.all([
      projectApi.getById(projectId),
      taskApi.getAll(projectId),
      authApi.getAllUsers(),
    ]).then(([pRes, tRes, uRes]) => {
      setProject(pRes.data);
      setTasks(tRes.data);
      setAllUsers(uRes.data);
    }).catch(() => toast.error('Failed to load project'))
    .finally(() => setLoading(false));
  }, [projectId]);

  const onCreateTask = async (data) => {
    try {
      const res = await taskApi.create(projectId, data);
      setTasks(prev => [res.data, ...prev]);
      reset({ priority: 'MEDIUM' });
      setShowTaskModal(false);
      toast.success('Task created!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create task');
    }
  };

  const onAddMember = async () => {
    if (!memberEmail.trim()) return;
    setAddingMember(true);
    setMemberError('');
    try {
      await projectApi.addMember(projectId, memberEmail.trim());
      const res = await projectApi.getById(projectId);
      setProject(res.data);
      setMemberEmail('');
      setShowMemberModal(false);
      toast.success('Member added!');
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to add member';
      if (err.response?.status === 404 && errorMsg === 'User not found') {
        setMemberError("Account doesn't exist. Ask them to sign up first.");
      } else {
        setMemberError(errorMsg);
      }
    } finally {
      setAddingMember(false);
    }
  };

  const onDeleteTask = async (taskId) => {
    try {
      await taskApi.delete(projectId, taskId);
      setTasks(prev => prev.filter(t => t.id !== taskId));
      toast.success('Task deleted');
    } catch {
      toast.error('Failed to delete task');
    }
  };

  const onTaskUpdate = (updated) => {
    setTasks(prev => prev.map(t => t.id === updated.id ? updated : t));
  };

  const members = project?.members || [];
  const availableUsers = allUsers.filter(u => !members.some(m => m.user.id === u.id));

  if (loading) return (
    <AppLayout title="Loading...">
      <div className="spinner-center"><div className="spinner spinner-lg" /></div>
    </AppLayout>
  );

  if (!project) return (
    <AppLayout title="Not Found">
      <div className="empty-state"><p>Project not found.</p></div>
    </AppLayout>
  );

  const todoTasks = tasks.filter(t => t.status === 'TODO');
  const inProgressTasks = tasks.filter(t => t.status === 'IN_PROGRESS');
  const doneTasks = tasks.filter(t => t.status === 'DONE');

  return (
    <AppLayout title={project.name}>
      {/* Header */}
      <div className="page-header">
        <div className="page-header-left">
          <button className="btn btn-ghost btn-sm" onClick={() => navigate('/projects')} style={{ marginBottom: 4, paddingLeft: 0 }}>
            <ArrowLeft size={14} /> Projects
          </button>
          <h1>{project.name}</h1>
          {project.description && <p className="page-subtitle">{project.description}</p>}
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          {isAdmin && (
            <>
              <button id="btn-add-member" className="btn btn-secondary" onClick={() => setShowMemberModal(true)}>
                <UserPlus size={15} /> Add Member
              </button>
              <button id="btn-create-task" className="btn btn-primary" onClick={() => setShowTaskModal(true)}>
                <Plus size={15} /> New Task
              </button>
            </>
          )}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 24, alignItems: 'start' }}>
        {/* Tasks */}
        <div>
          {/* Stats row */}
          <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
            {[
              { label: 'To Do', count: todoTasks.length, color: 'var(--text-muted)' },
              { label: 'In Progress', count: inProgressTasks.length, color: 'var(--info)' },
              { label: 'Done', count: doneTasks.length, color: 'var(--success)' },
            ].map(({ label, count, color }) => (
              <div key={label} className="card card-sm" style={{ flex: 1, textAlign: 'center' }}>
                <div style={{ fontSize: '1.4rem', fontWeight: 700, color }}>{count}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>{label}</div>
              </div>
            ))}
          </div>

          {/* Task list */}
          {tasks.length === 0 ? (
            <div className="empty-state">
              <CheckSquare size={36} />
              <h3>No tasks yet</h3>
              <p>{isAdmin ? 'Create the first task for this project' : 'No tasks assigned to you'}</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <p className="section-title">All Tasks ({tasks.length})</p>
              {tasks.map(task => (
                <TaskCard
                  key={task.id}
                  task={task}
                  projectId={projectId}
                  role={myMembership?.role}
                  onUpdate={onTaskUpdate}
                  onDelete={onDeleteTask}
                />
              ))}
            </div>
          )}
        </div>

        {/* Sidebar: Members */}
        <div className="card">
          <div className="flex-between" style={{ marginBottom: 14 }}>
            <h3>Members <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>({members.length})</span></h3>
          </div>
          <MemberList
            members={members}
            projectId={projectId}
            isAdmin={isAdmin}
            currentUserId={user?.id}
            onUpdate={(updated) => setProject(p => ({ ...p, members: updated }))}
          />
        </div>
      </div>

      {/* Create Task Modal */}
      {showTaskModal && (
        <Modal
          title="Create Task"
          onClose={() => { setShowTaskModal(false); reset({ priority: 'MEDIUM' }); }}
          footer={
            <>
              <button className="btn btn-secondary" onClick={() => { setShowTaskModal(false); reset({ priority: 'MEDIUM' }); }}>Cancel</button>
              <button id="btn-task-submit" className="btn btn-primary" form="create-task-form" type="submit" disabled={isSubmitting}>
                {isSubmitting ? <div className="spinner" /> : 'Create Task'}
              </button>
            </>
          }
        >
          <form id="create-task-form" onSubmit={handleSubmit(onCreateTask)} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div className="form-group">
              <label className="form-label" htmlFor="task-title">Title *</label>
              <input id="task-title" className={`form-input ${errors.title ? 'error' : ''}`} placeholder="Task title" {...register('title')} />
              {errors.title && <span className="form-error">{errors.title.message}</span>}
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="task-desc">Description</label>
              <textarea id="task-desc" className="form-input" placeholder="Optional details..." {...register('description')} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div className="form-group">
                <label className="form-label" htmlFor="task-priority">Priority</label>
                <select id="task-priority" className="form-input" {...register('priority')}>
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="task-due">Due Date</label>
                <input id="task-due" type="date" className="form-input" {...register('dueDate')} />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="task-assignee">Assign To</label>
              <select id="task-assignee" className="form-input" {...register('assigneeId')}>
                <option value="">Unassigned</option>
                {members.map(({ user: u }) => (
                  <option key={u.id} value={u.id}>{u.name}</option>
                ))}
              </select>
            </div>
          </form>
        </Modal>
      )}

      {/* Add Member Modal */}
      {showMemberModal && (
        <Modal
          title="Add Member"
          onClose={() => { setShowMemberModal(false); setMemberEmail(''); setMemberError(''); }}
          footer={
            <>
              <button className="btn btn-secondary" onClick={() => { setShowMemberModal(false); setMemberEmail(''); setMemberError(''); }}>Cancel</button>
              <button id="btn-add-member-submit" className="btn btn-primary" onClick={onAddMember} disabled={addingMember}>
                {addingMember ? <div className="spinner" /> : 'Add Member'}
              </button>
            </>
          }
        >
          <div className="form-group">
            <label className="form-label" htmlFor="member-email">Select User</label>
            <select
              id="member-email"
              className={`form-input ${memberError ? 'error' : ''}`}
              value={memberEmail}
              onChange={e => { setMemberEmail(e.target.value); setMemberError(''); }}
            >
              <option value="">-- Choose a user --</option>
              {availableUsers.map(u => (
                <option key={u.id} value={u.email}>{u.name} ({u.email})</option>
              ))}
            </select>
            {memberError ? (
              <p className="form-error" style={{ marginTop: 4, color: 'var(--error)' }}>{memberError}</p>
            ) : (
              <p className="text-muted text-sm" style={{ marginTop: 4 }}>Select a user from the system to add to the project</p>
            )}
          </div>
        </Modal>
      )}
    </AppLayout>
  );
}

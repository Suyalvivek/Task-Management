import { getInitials, formatDate, isOverdue, STATUS_LABELS, PRIORITY_LABELS } from '../utils/formatDate';
import { taskApi } from '../api/taskApi';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { Trash2, Calendar, User } from 'lucide-react';

const STATUS_OPTIONS = ['TODO', 'IN_PROGRESS', 'DONE'];

export default function TaskCard({ task, projectId, role, members = [], onUpdate, onDelete }) {
  const [loading, setLoading] = useState(false);

  const handleStatusChange = async (e) => {
    setLoading(true);
    try {
      const updated = await taskApi.updateStatus(projectId, task.id, e.target.value);
      onUpdate(updated.data);
      toast.success('Status updated');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update status');
    } finally {
      setLoading(false);
    }
  };

  const handleAssigneeChange = async (e) => {
    setLoading(true);
    try {
      const updated = await taskApi.update(projectId, task.id, { assigneeId: e.target.value || null });
      onUpdate(updated.data);
      toast.success('Assignee updated');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update assignee');
    } finally {
      setLoading(false);
    }
  };

  const overdue = isOverdue(task.dueDate, task.status);

  const priorityClass = { LOW: 'badge-low', MEDIUM: 'badge-medium', HIGH: 'badge-high' }[task.priority];
  const statusClass = { TODO: 'badge-todo', IN_PROGRESS: 'badge-inprogress', DONE: 'badge-done' }[task.status];

  return (
    <div className="task-card">
      <div className="task-card-body">
        <div className="task-card-title">{task.title}</div>
        {task.description && <div className="task-card-desc">{task.description}</div>}
        <div className="task-card-meta">
          <span className={`badge ${priorityClass}`}>{PRIORITY_LABELS[task.priority]}</span>
          {task.dueDate && (
            <span className={`badge ${overdue ? 'badge-overdue' : 'badge-todo'}`} style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
              <Calendar size={10} />
              {formatDate(task.dueDate)}
              {overdue && ' · Overdue'}
            </span>
          )}
          {task.assignee ? (
            <span className="task-card-assignee">
              <div className="avatar sm">{getInitials(task.assignee.name)}</div>
              {task.assignee.name}
            </span>
          ) : (
            <span className="task-card-assignee" style={{ color: 'var(--text-muted)' }}>
              <User size={12} style={{ marginRight: 4 }} /> Unassigned
            </span>
          )}
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8, flexShrink: 0 }}>
        {role === 'ADMIN' && (
          <select
            className="form-input"
            style={{ width: 'auto', padding: '4px 8px', fontSize: '0.78rem' }}
            value={task.assigneeId || ''}
            onChange={handleAssigneeChange}
            disabled={loading}
            id={`task-assignee-${task.id}`}
            title="Reassign task"
          >
            <option value="">Unassigned</option>
            {members.map(({ user: u }) => (
              <option key={u.id} value={u.id}>{u.name}</option>
            ))}
          </select>
        )}
        <select
          className="form-input"
          style={{ width: 'auto', padding: '4px 8px', fontSize: '0.78rem' }}
          value={task.status}
          onChange={handleStatusChange}
          disabled={loading}
          id={`task-status-${task.id}`}
          title="Change status"
        >
          {STATUS_OPTIONS.map(s => (
            <option key={s} value={s}>{STATUS_LABELS[s]}</option>
          ))}
        </select>
        {role === 'ADMIN' && (
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => onDelete(task.id)}
            id={`task-delete-${task.id}`}
            title="Delete task"
          >
            <Trash2 size={13} style={{ color: 'var(--danger)' }} />
          </button>
        )}
      </div>
    </div>
  );
}

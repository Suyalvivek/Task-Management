import { getInitials } from '../utils/formatDate';
import { projectApi } from '../api/projectApi';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { UserMinus } from 'lucide-react';

export default function MemberList({ members, projectId, isAdmin, currentUserId, onUpdate }) {
  const [removing, setRemoving] = useState(null);

  const handleRemove = async (userId) => {
    setRemoving(userId);
    try {
      await projectApi.removeMember(projectId, userId);
      onUpdate(members.filter(m => m.user.id !== userId));
      toast.success('Member removed');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to remove member');
    } finally {
      setRemoving(null);
    }
  };

  return (
    <div>
      {members.map(({ user, role }) => (
        <div className="member-row" key={user.id}>
          <div className="avatar">{getInitials(user.name)}</div>
          <div className="member-info">
            <div className="member-name">{user.name}</div>
            <div className="member-email">{user.email}</div>
          </div>
          <span className={`role-chip ${role.toLowerCase()}`}>{role}</span>
          {isAdmin && user.id !== currentUserId && (
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => handleRemove(user.id)}
              disabled={removing === user.id}
              id={`btn-remove-member-${user.id}`}
              title="Remove member"
            >
              {removing === user.id
                ? <div className="spinner" />
                : <UserMinus size={13} style={{ color: 'var(--danger)' }} />}
            </button>
          )}
        </div>
      ))}
    </div>
  );
}

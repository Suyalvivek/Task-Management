import { useEffect, useState } from 'react';
import AppLayout from '../../components/AppLayout';
import { dashboardApi } from '../../api/dashboardApi';
import { useAuth } from '../../context/AuthContext';
import { CheckSquare, Clock, AlertTriangle, Users, TrendingUp } from 'lucide-react';

function StatCard({ icon, label, value, color }) {
  return (
    <div className="stat-card">
      <div className="stat-icon" style={{ background: `${color}20`, color }}>{icon}</div>
      <div className="stat-value">{value ?? '—'}</div>
      <div className="stat-label">{label}</div>
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardApi.getStats()
      .then(res => setStats(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <AppLayout title="Dashboard">
      <div className="page-header">
        <div className="page-header-left">
          <h1>{greeting()}, {user?.name?.split(' ')[0]} 👋</h1>
          <p className="page-subtitle">Here's what's happening with your tasks today.</p>
        </div>
      </div>

      {loading ? (
        <div className="stat-grid">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="stat-card">
              <div className="skeleton" style={{ width: 36, height: 36, borderRadius: 6 }} />
              <div className="skeleton" style={{ width: 60, height: 32, borderRadius: 4 }} />
              <div className="skeleton" style={{ width: 80, height: 12, borderRadius: 4 }} />
            </div>
          ))}
        </div>
      ) : stats ? (
        <>
          <div className="stat-grid" style={{ marginBottom: 24 }}>
            <StatCard icon={<CheckSquare size={18} />} label="Total Tasks" value={stats.totalTasks} color="var(--accent)" />
            <StatCard icon={<Clock size={18} />} label="In Progress" value={stats.byStatus?.IN_PROGRESS} color="var(--blue)" />
            <StatCard icon={<TrendingUp size={18} />} label="Completed" value={stats.byStatus?.DONE} color="var(--green)" />
            <StatCard icon={<AlertTriangle size={18} />} label="Overdue" value={stats.overdueCount} color="var(--red)" />
          </div>

          {/* Tasks by status breakdown */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div className="card">
              <h3 style={{ marginBottom: 16 }}>Tasks by Status</h3>
              {[
                { label: 'To Do', count: stats.byStatus?.TODO, color: 'var(--amber)' },
                { label: 'In Progress', count: stats.byStatus?.IN_PROGRESS, color: 'var(--blue)' },
                { label: 'Done', count: stats.byStatus?.DONE, color: 'var(--green)' },
              ].map(({ label, count, color }) => {
                const total = stats.totalTasks || 1;
                const pct = Math.round(((count || 0) / total) * 100);
                return (
                  <div key={label} style={{ marginBottom: 12 }}>
                    <div className="flex-between" style={{ marginBottom: 4 }}>
                      <span style={{ fontSize: '0.82rem', color: 'var(--text-2)' }}>{label}</span>
                      <span style={{ fontSize: '0.82rem', fontWeight: 600, color: count > 0 ? color : 'inherit' }}>{count ?? 0}</span>
                    </div>
                    <div style={{ height: 6, background: 'var(--border)', borderRadius: 99 }}>
                      <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: 99, transition: 'width 0.4s ease' }} />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Tasks per user (admin only) */}
            {stats.tasksPerUser?.length > 0 && (
              <div className="card">
                <h3 style={{ marginBottom: 16 }}>
                  <Users size={16} style={{ display: 'inline', marginRight: 6, verticalAlign: 'middle' }} />
                  Tasks per Member
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {stats.tasksPerUser.map(({ user: u, taskCount }) => (
                    <div key={u?.id} className="flex-between">
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div className="avatar sm">{u?.name?.slice(0, 2).toUpperCase()}</div>
                        <span style={{ fontSize: '0.85rem' }}>{u?.name}</span>
                      </div>
                      <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--accent)' }}>{taskCount} tasks</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </>
      ) : (
        <div className="empty-state">
          <p>No stats available yet. Create a project and add tasks to get started.</p>
        </div>
      )}
    </AppLayout>
  );
}

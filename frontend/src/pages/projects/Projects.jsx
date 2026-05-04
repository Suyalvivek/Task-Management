import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { projectSchema } from '../../utils/validators';
import AppLayout from '../../components/AppLayout';
import Modal from '../../components/Modal';
import { projectApi } from '../../api/projectApi';
import toast from 'react-hot-toast';
import { Plus, FolderKanban, Users, ChevronRight } from 'lucide-react';

function ProjectCard({ project, onClick }) {
  const memberCount = project.members?.length || 0;
  const taskCount = project._count?.tasks || 0;

  return (
    <div className="card" style={{ cursor: 'pointer' }} onClick={onClick} id={`project-card-${project.id}`}>
      <div className="flex-between" style={{ marginBottom: 12 }}>
        <div style={{ width: 38, height: 38, background: 'var(--accent-light)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <FolderKanban size={18} style={{ color: 'var(--accent)' }} />
        </div>
        <ChevronRight size={16} style={{ color: 'var(--text-muted)' }} />
      </div>
      <h3 style={{ marginBottom: 4 }}>{project.name}</h3>
      {project.description && (
        <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: 12, lineHeight: 1.5 }}>{project.description}</p>
      )}
      <div className="divider" />
      <div style={{ display: 'flex', gap: 16, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <Users size={12} /> {memberCount} member{memberCount !== 1 ? 's' : ''}
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <FolderKanban size={12} /> {taskCount} task{taskCount !== 1 ? 's' : ''}
        </span>
      </div>
    </div>
  );
}

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(projectSchema),
  });

  useEffect(() => {
    projectApi.getAll()
      .then(res => setProjects(res.data))
      .catch(() => toast.error('Failed to load projects'))
      .finally(() => setLoading(false));
  }, []);

  const onCreate = async (data) => {
    try {
      const res = await projectApi.create(data);
      setProjects(prev => [res.data, ...prev]);
      reset();
      setShowModal(false);
      toast.success('Project created!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create project');
    }
  };

  return (
    <AppLayout title="Projects">
      <div className="page-header">
        <div className="page-header-left">
          <h1>Projects</h1>
          <p className="page-subtitle">{projects.length} project{projects.length !== 1 ? 's' : ''} you're part of</p>
        </div>
        <button id="btn-create-project" className="btn btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={16} /> New Project
        </button>
      </div>

      {loading ? (
        <div className="project-grid">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="card">
              <div className="skeleton" style={{ width: 38, height: 38, borderRadius: 8, marginBottom: 12 }} />
              <div className="skeleton" style={{ width: '60%', height: 18, borderRadius: 4, marginBottom: 8 }} />
              <div className="skeleton" style={{ width: '90%', height: 14, borderRadius: 4 }} />
            </div>
          ))}
        </div>
      ) : projects.length === 0 ? (
        <div className="empty-state">
          <FolderKanban size={40} />
          <h3>No projects yet</h3>
          <p>Create your first project to get started</p>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            <Plus size={16} /> Create Project
          </button>
        </div>
      ) : (
        <div className="project-grid">
          {projects.map(p => (
            <ProjectCard key={p.id} project={p} onClick={() => navigate(`/projects/${p.id}`)} />
          ))}
        </div>
      )}

      {showModal && (
        <Modal
          title="Create New Project"
          onClose={() => { setShowModal(false); reset(); }}
          footer={
            <>
              <button className="btn btn-secondary" onClick={() => { setShowModal(false); reset(); }}>Cancel</button>
              <button id="btn-create-project-submit" className="btn btn-primary" form="create-project-form" type="submit" disabled={isSubmitting}>
                {isSubmitting ? <div className="spinner" /> : 'Create Project'}
              </button>
            </>
          }
        >
          <form id="create-project-form" onSubmit={handleSubmit(onCreate)} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="form-group">
              <label className="form-label" htmlFor="project-name">Project Name *</label>
              <input id="project-name" className={`form-input ${errors.name ? 'error' : ''}`} placeholder="e.g. Marketing Campaign" {...register('name')} />
              {errors.name && <span className="form-error">{errors.name.message}</span>}
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="project-desc">Description</label>
              <textarea id="project-desc" className="form-input" placeholder="What is this project about?" {...register('description')} />
            </div>
          </form>
        </Modal>
      )}
    </AppLayout>
  );
}

"use client";
import { useEffect, useState } from "react";

interface Project {
  id: string;
  client_id: string;
  name: string;
  status: string | null;
  description: string | null;
  start_date: string | null;
  end_date: string | null;
  created_at: string;
}

interface Client {
  id: string;
  name: string;
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [name, setName] = useState("");
  const [clientId, setClientId] = useState("");
  const [status, setStatus] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [search, setSearch] = useState("");
  const [editProject, setEditProject] = useState<Project | null>(null);
  const [editLoading, setEditLoading] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    fetchProjects();
    fetchClients();
  }, []);

  async function fetchProjects() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/projects");
      const data = await res.json();
      setProjects(Array.isArray(data) ? data : []);
    } catch {
      setProjects([]);
      setError("Failed to load projects");
    }
    setLoading(false);
  }

  async function fetchClients() {
    try {
      const res = await fetch("/api/clients");
      const data = await res.json();
      setClients(Array.isArray(data) ? data : []);
    } catch {
      setClients([]);
    }
  }

  async function handleAddProject(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    const res = await fetch("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, client_id: clientId, status, description }),
    });
    if (res.ok) {
      const newProject = await res.json();
      setProjects([newProject, ...projects]);
      setName("");
      setClientId("");
      setStatus("");
      setDescription("");
      setSuccess("Project added successfully");
    } else {
      setError("Failed to add project");
    }
    setLoading(false);
  }

  function handleEditClick(project: Project) {
    setEditProject(project);
  }

  async function handleEditSave(e: React.FormEvent) {
    e.preventDefault();
    if (!editProject) return;
    setEditLoading(true);
    setError("");
    setSuccess("");
    const res = await fetch(`/api/projects/${editProject.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editProject),
    });
    if (res.ok) {
      const updated = await res.json();
      setProjects(projects.map(p => p.id === updated.id ? updated : p));
      setEditProject(null);
      setSuccess("Project updated successfully");
    } else {
      setError("Failed to update project");
    }
    setEditLoading(false);
  }

  function handleEditChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    if (!editProject) return;
    setEditProject({ ...editProject, [e.target.name]: e.target.value });
  }

  function handleDeleteClick(id: string) {
    setDeleteId(id);
  }

  async function handleDeleteConfirm() {
    if (!deleteId) return;
    setDeleteLoading(true);
    setError("");
    setSuccess("");
    const res = await fetch(`/api/projects/${deleteId}`, { method: "DELETE" });
    if (res.ok) {
      setProjects(projects.filter(p => p.id !== deleteId));
      setSuccess("Project deleted successfully");
    } else {
      setError("Failed to delete project");
    }
    setDeleteId(null);
    setDeleteLoading(false);
  }

  // Defensive: always use arrays for .map/.filter
  const safeProjects = Array.isArray(projects) ? projects : [];
  const safeClients = Array.isArray(clients) ? clients : [];

  // Filtered projects
  const filteredProjects = safeProjects.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    (p.status || "").toLowerCase().includes(search.toLowerCase()) ||
    (p.description || "").toLowerCase().includes(search.toLowerCase())
  );

  // For datalist
  const clientOptions = safeClients.map(client => ({ id: client.id, name: client.name }));

  return (
    <div className="flex flex-col gap-8 w-full max-w-5xl mx-auto px-2 sm:px-6">
      <h1 className="text-2xl font-bold text-[var(--primary)]">Projects</h1>
      <form onSubmit={handleAddProject} className="flex flex-col sm:flex-row flex-wrap gap-4 items-end bg-[var(--surface)] border border-[var(--border)] rounded-lg p-4 shadow-sm w-full">
        <div className="flex flex-col gap-1 w-full sm:w-auto min-w-0 flex-1">
          <label className="font-medium text-[var(--primary-dark)]">Project Name</label>
          <input className="border border-[var(--border)] rounded px-3 py-2 w-full min-w-0" value={name} onChange={e => setName(e.target.value)} required />
        </div>
        <div className="flex flex-col gap-1 w-full sm:w-auto min-w-0 flex-1">
          <label className="font-medium text-[var(--primary-dark)]">Client</label>
          <input
            className="border border-[var(--border)] rounded px-3 py-2 w-full min-w-0"
            list="client-list"
            value={safeClients.find(c => c.id === clientId)?.name || clientId}
            onChange={e => {
              const match = safeClients.find(c => c.name === e.target.value);
              setClientId(match ? match.id : e.target.value);
            }}
            placeholder="Select or type client"
            required
          />
          <datalist id="client-list">
            {clientOptions.map(client => (
              <option key={client.id} value={client.name} />
            ))}
          </datalist>
        </div>
        <div className="flex flex-col gap-1 w-full sm:w-auto min-w-0 flex-1">
          <label className="font-medium text-[var(--primary-dark)]">Status</label>
          <input className="border border-[var(--border)] rounded px-3 py-2 w-full min-w-0" value={status} onChange={e => setStatus(e.target.value)} />
        </div>
        <div className="flex flex-col gap-1 w-full sm:w-auto min-w-0 flex-1">
          <label className="font-medium text-[var(--primary-dark)]">Description</label>
          <input className="border border-[var(--border)] rounded px-3 py-2 w-full min-w-0" value={description} onChange={e => setDescription(e.target.value)} />
        </div>
        <button type="submit" className="bg-[var(--primary)] text-white rounded px-4 py-2 font-semibold hover:bg-[var(--primary-light)] transition-colors min-w-[100px] w-full sm:w-auto" disabled={loading}>
          {loading ? "Adding..." : "Add Project"}
        </button>
      </form>
      <div className="flex flex-col sm:flex-row gap-4 items-center w-full">
        <input
          className="border border-[var(--border)] rounded px-3 py-2 w-full sm:w-64"
          placeholder="Search projects..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        {success && <div className="text-[var(--success)] font-medium">{success}</div>}
        {error && <div className="text-[var(--danger)] font-medium">{error}</div>}
      </div>
      <div className="overflow-x-auto w-full">
        <table className="min-w-[700px] w-full border border-[var(--border)] rounded-lg bg-[var(--surface)] text-sm sm:text-base">
          <thead>
            <tr className="bg-[var(--primary-light)] text-white">
              <th className="px-4 py-2 text-left">Name</th>
              <th className="px-4 py-2 text-left">Client</th>
              <th className="px-4 py-2 text-left">Status</th>
              <th className="px-4 py-2 text-left">Description</th>
              <th className="px-4 py-2 text-left">Created At</th>
              <th className="px-4 py-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredProjects.map(project => (
              <tr key={project.id} className="border-t border-[var(--border)]">
                <td className="px-4 py-2 break-words max-w-[120px]">{project.name}</td>
                <td className="px-4 py-2 break-words max-w-[120px]">{safeClients.find(c => c.id === project.client_id)?.name || "-"}</td>
                <td className="px-4 py-2 break-words max-w-[120px]">{project.status}</td>
                <td className="px-4 py-2 break-words max-w-[160px]">{project.description}</td>
                <td className="px-4 py-2 whitespace-nowrap">{new Date(project.created_at).toLocaleString()}</td>
                <td className="px-4 py-2 flex gap-2 flex-wrap">
                  <button className="text-[var(--primary)] underline" onClick={() => handleEditClick(project)} disabled={loading}>Edit</button>
                  <button className="text-[var(--danger)] underline" onClick={() => handleDeleteClick(project.id)} disabled={loading}>Delete</button>
                </td>
              </tr>
            ))}
            {filteredProjects.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-[var(--primary-dark)]">No projects found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {/* Edit Modal */}
      {editProject && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-2 sm:p-0">
          <form onSubmit={handleEditSave} className="bg-[var(--surface)] border border-[var(--border)] rounded-lg p-6 sm:p-8 flex flex-col gap-4 min-w-[90vw] max-w-md w-full shadow-lg">
            <h2 className="text-xl font-bold text-[var(--primary)] mb-2">Edit Project</h2>
            <label className="font-medium text-[var(--primary-dark)]">Name</label>
            <input name="name" className="border border-[var(--border)] rounded px-3 py-2" value={editProject.name} onChange={handleEditChange} required />
            <label className="font-medium text-[var(--primary-dark)]">Client</label>
            <input
              name="client_id"
              className="border border-[var(--border)] rounded px-3 py-2"
              list="edit-client-list"
              value={safeClients.find(c => c.id === editProject.client_id)?.name || editProject.client_id}
              onChange={e => {
                const match = safeClients.find(c => c.name === e.target.value);
                setEditProject({ ...editProject, client_id: match ? match.id : e.target.value });
              }}
              placeholder="Select or type client"
              required
            />
            <datalist id="edit-client-list">
              {clientOptions.map(client => (
                <option key={client.id} value={client.name} />
              ))}
            </datalist>
            <label className="font-medium text-[var(--primary-dark)]">Status</label>
            <input name="status" className="border border-[var(--border)] rounded px-3 py-2" value={editProject.status || ""} onChange={handleEditChange} />
            <label className="font-medium text-[var(--primary-dark)]">Description</label>
            <input name="description" className="border border-[var(--border)] rounded px-3 py-2" value={editProject.description || ""} onChange={handleEditChange} />
            <div className="flex gap-4 mt-4 flex-wrap">
              <button type="button" className="px-4 py-2 rounded bg-gray-200" onClick={() => setEditProject(null)} disabled={editLoading}>Cancel</button>
              <button type="submit" className="px-4 py-2 rounded bg-[var(--primary)] text-white font-semibold hover:bg-[var(--primary-light)]" disabled={editLoading}>{editLoading ? "Saving..." : "Save"}</button>
            </div>
          </form>
        </div>
      )}
      {/* Delete Confirmation */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-2 sm:p-0">
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-lg p-6 sm:p-8 flex flex-col gap-4 min-w-[90vw] max-w-md w-full shadow-lg">
            <h2 className="text-xl font-bold text-[var(--danger)] mb-2">Delete Project</h2>
            <p>Are you sure you want to delete this project?</p>
            <div className="flex gap-4 mt-4 flex-wrap">
              <button type="button" className="px-4 py-2 rounded bg-gray-200" onClick={() => setDeleteId(null)} disabled={deleteLoading}>Cancel</button>
              <button type="button" className="px-4 py-2 rounded bg-[var(--danger)] text-white font-semibold hover:bg-red-700" onClick={handleDeleteConfirm} disabled={deleteLoading}>{deleteLoading ? "Deleting..." : "Delete"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 
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

  function handleClientInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;
    const match = safeClients.find(c => c.name === value);
    if (match) {
      setClientId(match.id);
      setError("");
    } else {
      setClientId("");
      setError("Please select a valid client from the list.");
    }
  }

  async function handleAddProject(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    // Only allow valid UUIDs for clientId
    if (!clientId || !/^[0-9a-fA-F-]{36}$/.test(clientId)) {
      setError("Please select a valid client from the list.");
      setLoading(false);
      return;
    }
    const res = await fetch("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, client_id: clientId, status, description }),
    });
    if (res.ok) {
      const newProject = await res.json();
      if (newProject && !newProject.error) {
        setName("");
        setClientId("");
        setStatus("");
        setDescription("");
        setSuccess("Project added successfully");
        await fetchProjects();
      } else {
        setError(newProject?.error || "Failed to add project");
      }
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
      if (updated && !updated.error) {
        setEditProject(null);
        setSuccess("Project updated successfully");
        await fetchProjects();
      } else {
        setError(updated?.error || "Failed to update project");
      }
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
      setSuccess("Project deleted successfully");
      await fetchProjects();
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
    <div className="flex flex-col gap-6 sm:gap-8 w-full max-w-5xl mx-auto px-2 sm:px-6">
      <h1 className="text-xl sm:text-2xl font-bold text-[var(--primary)]">Projects</h1>
      
      {/* Add Project Form */}
      <form onSubmit={handleAddProject} className="flex flex-col gap-4 bg-[var(--surface)] border border-[var(--border)] rounded-lg p-4 shadow-sm w-full">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="flex flex-col gap-1">
            <label className="font-medium text-[var(--primary-dark)] text-sm">Project Name</label>
            <input className="border border-[var(--border)] rounded px-3 py-2 w-full min-w-0 text-sm" value={name} onChange={e => setName(e.target.value)} required />
          </div>
          <div className="flex flex-col gap-1">
            <label className="font-medium text-[var(--primary-dark)] text-sm">Client</label>
            <input
              className="border border-[var(--border)] rounded px-3 py-2 w-full min-w-0 text-sm"
              list="client-list"
              value={safeClients.find(c => c.id === clientId)?.name || clientId}
              onChange={handleClientInputChange}
              placeholder="Select or type client"
              required
            />
            <datalist id="client-list">
              {clientOptions.map(client => (
                <option key={client.id} value={client.name} />
              ))}
            </datalist>
          </div>
          <div className="flex flex-col gap-1">
            <label className="font-medium text-[var(--primary-dark)] text-sm">Status</label>
            <input className="border border-[var(--border)] rounded px-3 py-2 w-full min-w-0 text-sm" value={status} onChange={e => setStatus(e.target.value)} />
          </div>
          <div className="flex flex-col gap-1">
            <label className="font-medium text-[var(--primary-dark)] text-sm">Description</label>
            <input className="border border-[var(--border)] rounded px-3 py-2 w-full min-w-0 text-sm" value={description} onChange={e => setDescription(e.target.value)} />
          </div>
        </div>
        <button type="submit" className="bg-[var(--primary)] text-white rounded px-4 py-2 font-semibold hover:bg-[var(--primary-light)] transition-colors w-full sm:w-auto sm:self-end" disabled={loading}>
          {loading ? "Adding..." : "Add Project"}
        </button>
      </form>

      {/* Search and Messages */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center w-full">
        <input
          className="border border-[var(--border)] rounded px-3 py-2 w-full sm:w-64 text-sm"
          placeholder="Search projects..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <div className="flex flex-col gap-2 w-full sm:w-auto">
          {success && <div className="text-[var(--success)] font-medium text-sm">{success}</div>}
          {error && <div className="text-[var(--danger)] font-medium text-sm">{error}</div>}
        </div>
      </div>

      {/* Projects Table */}
      <div className="overflow-x-auto w-full">
        <div className="min-w-full border border-[var(--border)] rounded-lg bg-[var(--surface)] overflow-hidden">
          {/* Mobile Card View */}
          <div className="lg:hidden">
            {filteredProjects.map(project => (
              <div key={project.id} className="border-b border-[var(--border)] p-4 space-y-2">
                <div className="flex justify-between items-start">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-[var(--primary)] truncate">{project.name}</h3>
                    <p className="text-sm text-[var(--primary-dark)]">
                      Client: {safeClients.find(c => c.id === project.client_id)?.name || "-"}
                    </p>
                    <p className="text-sm text-[var(--primary-dark)]">
                      Status: {project.status || "-"}
                    </p>
                    {project.description && (
                      <p className="text-sm text-[var(--primary-dark)] mt-1 line-clamp-2">
                        {project.description}
                      </p>
                    )}
                    <p className="text-xs text-gray-500 mt-2">
                      Created: {new Date(project.created_at).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex flex-col gap-1 ml-4">
                    <button 
                      className="text-[var(--primary)] underline text-sm" 
                      onClick={() => handleEditClick(project)} 
                      disabled={loading}
                    >
                      Edit
                    </button>
                    <button 
                      className="text-[var(--danger)] underline text-sm" 
                      onClick={() => handleDeleteClick(project.id)} 
                      disabled={loading}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {filteredProjects.length === 0 && (
              <div className="p-8 text-center text-[var(--primary-dark)]">No projects found.</div>
            )}
          </div>

          {/* Desktop Table View */}
          <table className="hidden lg:table min-w-full text-sm">
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
      </div>

      {/* Edit Modal */}
      {editProject && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-2 sm:p-0">
          <form onSubmit={handleEditSave} className="bg-[var(--surface)] border border-[var(--border)] rounded-lg p-4 sm:p-6 flex flex-col gap-4 w-full max-w-md shadow-lg max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg sm:text-xl font-bold text-[var(--primary)] mb-2">Edit Project</h2>
            <div className="space-y-4">
              <div>
                <label className="font-medium text-[var(--primary-dark)] text-sm">Name</label>
                <input name="name" className="border border-[var(--border)] rounded px-3 py-2 w-full text-sm" value={editProject.name} onChange={handleEditChange} required />
              </div>
              <div>
                <label className="font-medium text-[var(--primary-dark)] text-sm">Client</label>
                <input
                  name="client_id"
                  className="border border-[var(--border)] rounded px-3 py-2 w-full text-sm"
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
              </div>
              <div>
                <label className="font-medium text-[var(--primary-dark)] text-sm">Status</label>
                <input name="status" className="border border-[var(--border)] rounded px-3 py-2 w-full text-sm" value={editProject.status || ""} onChange={handleEditChange} />
              </div>
              <div>
                <label className="font-medium text-[var(--primary-dark)] text-sm">Description</label>
                <input name="description" className="border border-[var(--border)] rounded px-3 py-2 w-full text-sm" value={editProject.description || ""} onChange={handleEditChange} />
              </div>
            </div>
            <div className="flex gap-4 mt-4 flex-wrap">
              <button type="button" className="px-4 py-2 rounded bg-gray-200 text-sm" onClick={() => setEditProject(null)} disabled={editLoading}>Cancel</button>
              <button type="submit" className="px-4 py-2 rounded bg-[var(--primary)] text-white font-semibold hover:bg-[var(--primary-light)] text-sm" disabled={editLoading}>{editLoading ? "Saving..." : "Save"}</button>
            </div>
          </form>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-2 sm:p-0">
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-lg p-4 sm:p-6 flex flex-col gap-4 w-full max-w-md shadow-lg">
            <h2 className="text-lg sm:text-xl font-bold text-[var(--danger)] mb-2">Delete Project</h2>
            <p className="text-sm">Are you sure you want to delete this project?</p>
            <div className="flex gap-4 mt-4 flex-wrap">
              <button type="button" className="px-4 py-2 rounded bg-gray-200 text-sm" onClick={() => setDeleteId(null)} disabled={deleteLoading}>Cancel</button>
              <button type="button" className="px-4 py-2 rounded bg-[var(--danger)] text-white font-semibold hover:bg-red-700 text-sm" onClick={handleDeleteConfirm} disabled={deleteLoading}>{deleteLoading ? "Deleting..." : "Delete"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 
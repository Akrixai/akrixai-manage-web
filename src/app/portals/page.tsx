"use client";
import { useEffect, useState } from "react";

interface Portal {
  id: string;
  name: string;
  link: string;
  credentials: any;
  notes: string | null;
  created_at: string;
}

export default function PortalsPage() {
  const [portals, setPortals] = useState<Portal[]>([]);
  const [name, setName] = useState("");
  const [link, setLink] = useState("");
  const [credentials, setCredentials] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [search, setSearch] = useState("");
  const [editPortal, setEditPortal] = useState<Portal | null>(null);
  const [editLoading, setEditLoading] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    fetchPortals();
  }, []);

  async function fetchPortals() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/portals");
      const data = await res.json();
      setPortals(Array.isArray(data) ? data : []);
    } catch {
      setPortals([]);
      setError("Failed to load portals");
    }
    setLoading(false);
  }

  async function handleAddPortal(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    let creds: any = null;
    try {
      creds = credentials ? JSON.parse(credentials) : null;
    } catch {
      setError("Credentials must be valid JSON");
      setLoading(false);
      return;
    }
    const res = await fetch("/api/portals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, link, credentials: creds, notes }),
    });
    if (res.ok) {
      const newPortal = await res.json();
      if (newPortal && !newPortal.error) {
        setName("");
        setLink("");
        setCredentials("");
        setNotes("");
        setSuccess("Portal added successfully");
        await fetchPortals();
      } else {
        setError(newPortal?.error || "Failed to add portal");
      }
    } else {
      setError("Failed to add portal");
    }
    setLoading(false);
  }

  function handleEditClick(portal: Portal) {
    setEditPortal({ ...portal, credentials: JSON.stringify(portal.credentials || {}, null, 2) });
  }

  async function handleEditSave(e: React.FormEvent) {
    e.preventDefault();
    if (!editPortal) return;
    setEditLoading(true);
    setError("");
    setSuccess("");
    let creds: any = null;
    try {
      creds = editPortal.credentials ? JSON.parse(editPortal.credentials) : null;
    } catch {
      setError("Credentials must be valid JSON");
      setEditLoading(false);
      return;
    }
    const res = await fetch(`/api/portals/${editPortal.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...editPortal, credentials: creds }),
    });
    if (res.ok) {
      const updated = await res.json();
      if (updated && !updated.error) {
        setEditPortal(null);
        setSuccess("Portal updated successfully");
        await fetchPortals();
      } else {
        setError(updated?.error || "Failed to update portal");
      }
    } else {
      setError("Failed to update portal");
    }
    setEditLoading(false);
  }

  function handleEditChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    if (!editPortal) return;
    setEditPortal({ ...editPortal, [e.target.name]: e.target.value });
  }

  function handleDeleteClick(id: string) {
    setDeleteId(id);
  }

  async function handleDeleteConfirm() {
    if (!deleteId) return;
    setDeleteLoading(true);
    setError("");
    setSuccess("");
    const res = await fetch(`/api/portals/${deleteId}`, { method: "DELETE" });
    if (res.ok) {
      setSuccess("Portal deleted successfully");
      await fetchPortals();
    } else {
      setError("Failed to delete portal");
    }
    setDeleteId(null);
    setDeleteLoading(false);
  }

  // Filtered portals
  const filteredPortals = portals.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    (p.link || "").toLowerCase().includes(search.toLowerCase()) ||
    (p.notes || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-8 w-full max-w-5xl mx-auto px-2 sm:px-6">
      <h1 className="text-2xl font-bold text-[var(--primary)]">Portals</h1>
      <form onSubmit={handleAddPortal} className="flex flex-col sm:flex-row flex-wrap gap-4 items-end bg-[var(--surface)] border border-[var(--border)] rounded-lg p-4 shadow-sm w-full">
        <div className="flex flex-col gap-1 w-full sm:w-auto min-w-0 flex-1">
          <label className="font-medium text-[var(--primary-dark)]">Name</label>
          <input className="border border-[var(--border)] rounded px-3 py-2 w-full min-w-0" value={name} onChange={e => setName(e.target.value)} required />
        </div>
        <div className="flex flex-col gap-1 w-full sm:w-auto min-w-0 flex-1">
          <label className="font-medium text-[var(--primary-dark)]">Link</label>
          <input className="border border-[var(--border)] rounded px-3 py-2 w-full min-w-0" value={link} onChange={e => setLink(e.target.value)} required />
        </div>
        <div className="flex flex-col gap-1 w-full sm:w-auto min-w-0 flex-1">
          <label className="font-medium text-[var(--primary-dark)]">Credentials (JSON)</label>
          <input className="border border-[var(--border)] rounded px-3 py-2 font-mono w-full min-w-0" value={credentials} onChange={e => setCredentials(e.target.value)} placeholder='{"user":"admin","pass":"secret"}' />
        </div>
        <div className="flex flex-col gap-1 w-full sm:w-auto min-w-0 flex-1">
          <label className="font-medium text-[var(--primary-dark)]">Notes</label>
          <input className="border border-[var(--border)] rounded px-3 py-2 w-full min-w-0" value={notes} onChange={e => setNotes(e.target.value)} />
        </div>
        <button type="submit" className="bg-[var(--primary)] text-white rounded px-4 py-2 font-semibold hover:bg-[var(--primary-light)] transition-colors min-w-[100px] w-full sm:w-auto" disabled={loading}>
          {loading ? "Adding..." : "Add Portal"}
        </button>
      </form>
      <div className="flex flex-col sm:flex-row gap-4 items-center w-full">
        <input
          className="border border-[var(--border)] rounded px-3 py-2 w-full sm:w-64"
          placeholder="Search portals..."
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
              <th className="px-4 py-2 text-left">Link</th>
              <th className="px-4 py-2 text-left">Credentials</th>
              <th className="px-4 py-2 text-left">Notes</th>
              <th className="px-4 py-2 text-left">Created At</th>
              <th className="px-4 py-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredPortals.map(portal => (
              <tr key={portal.id} className="border-t border-[var(--border)]">
                <td className="px-4 py-2 break-words max-w-[120px]">{portal.name}</td>
                <td className="px-4 py-2 break-words max-w-[160px]"><a href={portal.link} target="_blank" rel="noopener noreferrer" className="text-[var(--primary-light)] underline">{portal.link}</a></td>
                <td className="px-4 py-2 break-words max-w-[160px]"><pre className="whitespace-pre-wrap text-xs font-mono">{portal.credentials ? JSON.stringify(portal.credentials, null, 2) : ""}</pre></td>
                <td className="px-4 py-2 break-words max-w-[120px]">{portal.notes}</td>
                <td className="px-4 py-2 whitespace-nowrap">{new Date(portal.created_at).toLocaleString()}</td>
                <td className="px-4 py-2 flex gap-2 flex-wrap">
                  <button className="text-[var(--primary)] underline" onClick={() => handleEditClick(portal)} disabled={loading}>Edit</button>
                  <button className="text-[var(--danger)] underline" onClick={() => handleDeleteClick(portal.id)} disabled={loading}>Delete</button>
                </td>
              </tr>
            ))}
            {filteredPortals.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-[var(--primary-dark)]">No portals found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {/* Edit Modal */}
      {editPortal && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-2 sm:p-0">
          <form onSubmit={handleEditSave} className="bg-[var(--surface)] border border-[var(--border)] rounded-lg p-6 sm:p-8 flex flex-col gap-4 min-w-[90vw] max-w-md w-full shadow-lg">
            <h2 className="text-xl font-bold text-[var(--primary)] mb-2">Edit Portal</h2>
            <label className="font-medium text-[var(--primary-dark)]">Name</label>
            <input name="name" className="border border-[var(--border)] rounded px-3 py-2" value={editPortal.name} onChange={handleEditChange} required />
            <label className="font-medium text-[var(--primary-dark)]">Link</label>
            <input name="link" className="border border-[var(--border)] rounded px-3 py-2" value={editPortal.link} onChange={handleEditChange} required />
            <label className="font-medium text-[var(--primary-dark)]">Credentials (JSON)</label>
            <textarea name="credentials" className="border border-[var(--border)] rounded px-3 py-2 font-mono" rows={3} value={editPortal.credentials} onChange={handleEditChange} />
            <label className="font-medium text-[var(--primary-dark)]">Notes</label>
            <input name="notes" className="border border-[var(--border)] rounded px-3 py-2" value={editPortal.notes || ""} onChange={handleEditChange} />
            <div className="flex gap-4 mt-4 flex-wrap">
              <button type="button" className="px-4 py-2 rounded bg-gray-200" onClick={() => setEditPortal(null)} disabled={editLoading}>Cancel</button>
              <button type="submit" className="px-4 py-2 rounded bg-[var(--primary)] text-white font-semibold hover:bg-[var(--primary-light)]" disabled={editLoading}>{editLoading ? "Saving..." : "Save"}</button>
            </div>
          </form>
        </div>
      )}
      {/* Delete Confirmation */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-2 sm:p-0">
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-lg p-6 sm:p-8 flex flex-col gap-4 min-w-[90vw] max-w-md w-full shadow-lg">
            <h2 className="text-xl font-bold text-[var(--danger)] mb-2">Delete Portal</h2>
            <p>Are you sure you want to delete this portal?</p>
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
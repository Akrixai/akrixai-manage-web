"use client";
import { useEffect, useState } from "react";

interface Tracking {
  id: string;
  entity_type: string;
  entity_id: string;
  action: string;
  details: any;
  timestamp: string;
}

export default function TrackingPage() {
  const [trackings, setTrackings] = useState<Tracking[]>([]);
  const [entityType, setEntityType] = useState("");
  const [entityId, setEntityId] = useState("");
  const [action, setAction] = useState("");
  const [details, setDetails] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [search, setSearch] = useState("");
  const [editTracking, setEditTracking] = useState<Tracking | null>(null);
  const [editLoading, setEditLoading] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    fetchTrackings();
  }, []);

  async function fetchTrackings() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/tracking");
      const data = await res.json();
      setTrackings(Array.isArray(data) ? data : []);
    } catch {
      setTrackings([]);
      setError("Failed to load tracking entries");
    }
    setLoading(false);
  }

  async function handleAddTracking(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    let det: any = null;
    try {
      det = details ? JSON.parse(details) : null;
    } catch {
      setError("Details must be valid JSON");
      setLoading(false);
      return;
    }
    const res = await fetch("/api/tracking", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ entity_type: entityType, entity_id: entityId, action, details: det }),
    });
    if (res.ok) {
      const newTracking = await res.json();
      if (newTracking && !newTracking.error) {
        setEntityType("");
        setEntityId("");
        setAction("");
        setDetails("");
        setSuccess("Tracking entry added successfully");
        await fetchTrackings();
      } else {
        setError(newTracking?.error || "Failed to add tracking entry");
      }
    } else {
      setError("Failed to add tracking entry");
    }
    setLoading(false);
  }

  function handleEditClick(tracking: Tracking) {
    setEditTracking({ ...tracking, details: JSON.stringify(tracking.details || {}, null, 2) });
  }

  async function handleEditSave(e: React.FormEvent) {
    e.preventDefault();
    if (!editTracking) return;
    setEditLoading(true);
    setError("");
    setSuccess("");
    let det: any = null;
    try {
      det = editTracking.details ? JSON.parse(editTracking.details) : null;
    } catch {
      setError("Details must be valid JSON");
      setEditLoading(false);
      return;
    }
    const res = await fetch(`/api/tracking/${editTracking.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...editTracking, details: det }),
    });
    if (res.ok) {
      const updated = await res.json();
      if (updated && !updated.error) {
        setEditTracking(null);
        setSuccess("Tracking entry updated successfully");
        await fetchTrackings();
      } else {
        setError(updated?.error || "Failed to update tracking entry");
      }
    } else {
      setError("Failed to update tracking entry");
    }
    setEditLoading(false);
  }

  function handleEditChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    if (!editTracking) return;
    setEditTracking({ ...editTracking, [e.target.name]: e.target.value });
  }

  function handleDeleteClick(id: string) {
    setDeleteId(id);
  }

  async function handleDeleteConfirm() {
    if (!deleteId) return;
    setDeleteLoading(true);
    setError("");
    setSuccess("");
    const res = await fetch(`/api/tracking/${deleteId}`, { method: "DELETE" });
    if (res.ok) {
      setSuccess("Tracking entry deleted successfully");
      await fetchTrackings();
    } else {
      setError("Failed to delete tracking entry");
    }
    setDeleteId(null);
    setDeleteLoading(false);
  }

  // Filtered tracking
  const filteredTrackings = trackings.filter(t =>
    t.entity_type.toLowerCase().includes(search.toLowerCase()) ||
    t.entity_id.toLowerCase().includes(search.toLowerCase()) ||
    t.action.toLowerCase().includes(search.toLowerCase()) ||
    JSON.stringify(t.details || {}).toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-8 w-full max-w-5xl mx-auto px-2 sm:px-6">
      <h1 className="text-2xl font-bold text-[var(--primary)]">Tracking</h1>
      <form onSubmit={handleAddTracking} className="flex flex-col sm:flex-row flex-wrap gap-4 items-end bg-[var(--surface)] border border-[var(--border)] rounded-lg p-4 shadow-sm w-full">
        <div className="flex flex-col gap-1 w-full sm:w-auto min-w-0 flex-1">
          <label className="font-medium text-[var(--primary-dark)]">Entity Type</label>
          <input className="border border-[var(--border)] rounded px-3 py-2 w-full min-w-0" value={entityType} onChange={e => setEntityType(e.target.value)} required />
        </div>
        <div className="flex flex-col gap-1 w-full sm:w-auto min-w-0 flex-1">
          <label className="font-medium text-[var(--primary-dark)]">Entity ID</label>
          <input className="border border-[var(--border)] rounded px-3 py-2 w-full min-w-0" value={entityId} onChange={e => setEntityId(e.target.value)} required />
        </div>
        <div className="flex flex-col gap-1 w-full sm:w-auto min-w-0 flex-1">
          <label className="font-medium text-[var(--primary-dark)]">Action</label>
          <input className="border border-[var(--border)] rounded px-3 py-2 w-full min-w-0" value={action} onChange={e => setAction(e.target.value)} required />
        </div>
        <div className="flex flex-col gap-1 w-full sm:w-auto min-w-0 flex-1">
          <label className="font-medium text-[var(--primary-dark)]">Details (JSON)</label>
          <input className="border border-[var(--border)] rounded px-3 py-2 font-mono w-full min-w-0" value={details} onChange={e => setDetails(e.target.value)} placeholder='{"field":"value"}' />
        </div>
        <button type="submit" className="bg-[var(--primary)] text-white rounded px-4 py-2 font-semibold hover:bg-[var(--primary-light)] transition-colors min-w-[100px] w-full sm:w-auto" disabled={loading}>
          {loading ? "Adding..." : "Add Tracking"}
        </button>
      </form>
      <div className="flex flex-col sm:flex-row gap-4 items-center w-full">
        <input
          className="border border-[var(--border)] rounded px-3 py-2 w-full sm:w-64"
          placeholder="Search tracking..."
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
              <th className="px-4 py-2 text-left">Entity Type</th>
              <th className="px-4 py-2 text-left">Entity ID</th>
              <th className="px-4 py-2 text-left">Action</th>
              <th className="px-4 py-2 text-left">Details</th>
              <th className="px-4 py-2 text-left">Timestamp</th>
              <th className="px-4 py-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredTrackings.map(tracking => (
              <tr key={tracking.id} className="border-t border-[var(--border)]">
                <td className="px-4 py-2 break-words max-w-[120px]">{tracking.entity_type}</td>
                <td className="px-4 py-2 break-words max-w-[120px]">{tracking.entity_id}</td>
                <td className="px-4 py-2 break-words max-w-[120px]">{tracking.action}</td>
                <td className="px-4 py-2 break-words max-w-[160px]"><pre className="whitespace-pre-wrap text-xs font-mono">{tracking.details ? JSON.stringify(tracking.details, null, 2) : ""}</pre></td>
                <td className="px-4 py-2 whitespace-nowrap">{new Date(tracking.timestamp).toLocaleString()}</td>
                <td className="px-4 py-2 flex gap-2 flex-wrap">
                  <button className="text-[var(--primary)] underline" onClick={() => handleEditClick(tracking)} disabled={loading}>Edit</button>
                  <button className="text-[var(--danger)] underline" onClick={() => handleDeleteClick(tracking.id)} disabled={loading}>Delete</button>
                </td>
              </tr>
            ))}
            {filteredTrackings.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-[var(--primary-dark)]">No tracking entries found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {/* Edit Modal */}
      {editTracking && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-2 sm:p-0">
          <form onSubmit={handleEditSave} className="bg-[var(--surface)] border border-[var(--border)] rounded-lg p-6 sm:p-8 flex flex-col gap-4 min-w-[90vw] max-w-md w-full shadow-lg">
            <h2 className="text-xl font-bold text-[var(--primary)] mb-2">Edit Tracking Entry</h2>
            <label className="font-medium text-[var(--primary-dark)]">Entity Type</label>
            <input name="entity_type" className="border border-[var(--border)] rounded px-3 py-2" value={editTracking.entity_type} onChange={handleEditChange} required />
            <label className="font-medium text-[var(--primary-dark)]">Entity ID</label>
            <input name="entity_id" className="border border-[var(--border)] rounded px-3 py-2" value={editTracking.entity_id} onChange={handleEditChange} required />
            <label className="font-medium text-[var(--primary-dark)]">Action</label>
            <input name="action" className="border border-[var(--border)] rounded px-3 py-2" value={editTracking.action} onChange={handleEditChange} required />
            <label className="font-medium text-[var(--primary-dark)]">Details (JSON)</label>
            <textarea name="details" className="border border-[var(--border)] rounded px-3 py-2 font-mono" rows={3} value={editTracking.details} onChange={handleEditChange} />
            <div className="flex gap-4 mt-4 flex-wrap">
              <button type="button" className="px-4 py-2 rounded bg-gray-200" onClick={() => setEditTracking(null)} disabled={editLoading}>Cancel</button>
              <button type="submit" className="px-4 py-2 rounded bg-[var(--primary)] text-white font-semibold hover:bg-[var(--primary-light)]" disabled={editLoading}>{editLoading ? "Saving..." : "Save"}</button>
            </div>
          </form>
        </div>
      )}
      {/* Delete Confirmation */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-2 sm:p-0">
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-lg p-6 sm:p-8 flex flex-col gap-4 min-w-[90vw] max-w-md w-full shadow-lg">
            <h2 className="text-xl font-bold text-[var(--danger)] mb-2">Delete Tracking Entry</h2>
            <p>Are you sure you want to delete this tracking entry?</p>
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
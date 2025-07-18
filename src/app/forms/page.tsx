"use client";
import { useEffect, useState } from "react";

interface Form {
  id: string;
  name: string;
  link: string;
  excel_link: string | null;
  notes: string | null;
  created_at: string;
}

export default function FormsPage() {
  const [forms, setForms] = useState<Form[]>([]);
  const [name, setName] = useState("");
  const [link, setLink] = useState("");
  const [excelLink, setExcelLink] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [search, setSearch] = useState("");
  const [editForm, setEditForm] = useState<Form | null>(null);
  const [editLoading, setEditLoading] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    fetchForms();
  }, []);

  async function fetchForms() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/forms");
      const data = await res.json();
      setForms(Array.isArray(data) ? data : []);
    } catch {
      setForms([]);
      setError("Failed to load forms");
    }
    setLoading(false);
  }

  async function handleAddForm(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    const res = await fetch("/api/forms", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, link, excel_link: excelLink, notes }),
    });
    if (res.ok) {
      const newForm = await res.json();
      setForms([newForm, ...forms]);
      setName("");
      setLink("");
      setExcelLink("");
      setNotes("");
      setSuccess("Form added successfully");
    } else {
      setError("Failed to add form");
    }
    setLoading(false);
  }

  function handleEditClick(form: Form) {
    setEditForm(form);
  }

  async function handleEditSave(e: React.FormEvent) {
    e.preventDefault();
    if (!editForm) return;
    setEditLoading(true);
    setError("");
    setSuccess("");
    const res = await fetch(`/api/forms/${editForm.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editForm),
    });
    if (res.ok) {
      const updated = await res.json();
      setForms(forms.map(f => f.id === updated.id ? updated : f));
      setEditForm(null);
      setSuccess("Form updated successfully");
    } else {
      setError("Failed to update form");
    }
    setEditLoading(false);
  }

  function handleEditChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (!editForm) return;
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  }

  function handleDeleteClick(id: string) {
    setDeleteId(id);
  }

  async function handleDeleteConfirm() {
    if (!deleteId) return;
    setDeleteLoading(true);
    setError("");
    setSuccess("");
    const res = await fetch(`/api/forms/${deleteId}`, { method: "DELETE" });
    if (res.ok) {
      setForms(forms.filter(f => f.id !== deleteId));
      setSuccess("Form deleted successfully");
    } else {
      setError("Failed to delete form");
    }
    setDeleteId(null);
    setDeleteLoading(false);
  }

  // Filtered forms
  const filteredForms = forms.filter(f =>
    f.name.toLowerCase().includes(search.toLowerCase()) ||
    (f.link || "").toLowerCase().includes(search.toLowerCase()) ||
    (f.excel_link || "").toLowerCase().includes(search.toLowerCase()) ||
    (f.notes || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-2xl font-bold text-[var(--primary)]">Forms</h1>
      <form onSubmit={handleAddForm} className="flex flex-col sm:flex-row gap-4 items-end bg-[var(--surface)] border border-[var(--border)] rounded-lg p-4 shadow-sm">
        <div className="flex flex-col gap-1 w-full sm:w-auto">
          <label className="font-medium text-[var(--primary-dark)]">Name</label>
          <input className="border border-[var(--border)] rounded px-3 py-2" value={name} onChange={e => setName(e.target.value)} required />
        </div>
        <div className="flex flex-col gap-1 w-full sm:w-auto">
          <label className="font-medium text-[var(--primary-dark)]">Form Link</label>
          <input className="border border-[var(--border)] rounded px-3 py-2" value={link} onChange={e => setLink(e.target.value)} required />
        </div>
        <div className="flex flex-col gap-1 w-full sm:w-auto">
          <label className="font-medium text-[var(--primary-dark)]">Excel Link</label>
          <input className="border border-[var(--border)] rounded px-3 py-2" value={excelLink} onChange={e => setExcelLink(e.target.value)} />
        </div>
        <div className="flex flex-col gap-1 w-full sm:w-auto">
          <label className="font-medium text-[var(--primary-dark)]">Notes</label>
          <input className="border border-[var(--border)] rounded px-3 py-2" value={notes} onChange={e => setNotes(e.target.value)} />
        </div>
        <button type="submit" className="bg-[var(--primary)] text-white rounded px-4 py-2 font-semibold hover:bg-[var(--primary-light)] transition-colors min-w-[100px]" disabled={loading}>
          {loading ? "Adding..." : "Add Form"}
        </button>
      </form>
      <div className="flex flex-col sm:flex-row gap-4 items-center">
        <input
          className="border border-[var(--border)] rounded px-3 py-2 w-full sm:w-64"
          placeholder="Search forms..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        {success && <div className="text-[var(--success)] font-medium">{success}</div>}
        {error && <div className="text-[var(--danger)] font-medium">{error}</div>}
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full border border-[var(--border)] rounded-lg bg-[var(--surface)]">
          <thead>
            <tr className="bg-[var(--primary-light)] text-white">
              <th className="px-4 py-2 text-left">Name</th>
              <th className="px-4 py-2 text-left">Form Link</th>
              <th className="px-4 py-2 text-left">Excel Link</th>
              <th className="px-4 py-2 text-left">Notes</th>
              <th className="px-4 py-2 text-left">Created At</th>
              <th className="px-4 py-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredForms.map(form => (
              <tr key={form.id} className="border-t border-[var(--border)]">
                <td className="px-4 py-2">{form.name}</td>
                <td className="px-4 py-2"><a href={form.link} target="_blank" rel="noopener noreferrer" className="text-[var(--primary-light)] underline">{form.link}</a></td>
                <td className="px-4 py-2">{form.excel_link ? <a href={form.excel_link} target="_blank" rel="noopener noreferrer" className="text-[var(--primary-light)] underline">{form.excel_link}</a> : ""}</td>
                <td className="px-4 py-2">{form.notes}</td>
                <td className="px-4 py-2">{new Date(form.created_at).toLocaleString()}</td>
                <td className="px-4 py-2 flex gap-2">
                  <button className="text-[var(--primary)] underline" onClick={() => handleEditClick(form)} disabled={loading}>Edit</button>
                  <button className="text-[var(--danger)] underline" onClick={() => handleDeleteClick(form.id)} disabled={loading}>Delete</button>
                </td>
              </tr>
            ))}
            {filteredForms.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-[var(--primary-dark)]">No forms found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {/* Edit Modal */}
      {editForm && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <form onSubmit={handleEditSave} className="bg-[var(--surface)] border border-[var(--border)] rounded-lg p-8 flex flex-col gap-4 min-w-[320px] shadow-lg">
            <h2 className="text-xl font-bold text-[var(--primary)] mb-2">Edit Form</h2>
            <label className="font-medium text-[var(--primary-dark)]">Name</label>
            <input name="name" className="border border-[var(--border)] rounded px-3 py-2" value={editForm.name} onChange={handleEditChange} required />
            <label className="font-medium text-[var(--primary-dark)]">Form Link</label>
            <input name="link" className="border border-[var(--border)] rounded px-3 py-2" value={editForm.link} onChange={handleEditChange} required />
            <label className="font-medium text-[var(--primary-dark)]">Excel Link</label>
            <input name="excel_link" className="border border-[var(--border)] rounded px-3 py-2" value={editForm.excel_link || ""} onChange={handleEditChange} />
            <label className="font-medium text-[var(--primary-dark)]">Notes</label>
            <input name="notes" className="border border-[var(--border)] rounded px-3 py-2" value={editForm.notes || ""} onChange={handleEditChange} />
            <div className="flex gap-4 mt-4">
              <button type="button" className="px-4 py-2 rounded bg-gray-200" onClick={() => setEditForm(null)} disabled={editLoading}>Cancel</button>
              <button type="submit" className="px-4 py-2 rounded bg-[var(--primary)] text-white font-semibold hover:bg-[var(--primary-light)]" disabled={editLoading}>{editLoading ? "Saving..." : "Save"}</button>
            </div>
          </form>
        </div>
      )}
      {/* Delete Confirmation */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-lg p-8 flex flex-col gap-4 min-w-[320px] shadow-lg">
            <h2 className="text-xl font-bold text-[var(--danger)] mb-2">Delete Form</h2>
            <p>Are you sure you want to delete this form?</p>
            <div className="flex gap-4 mt-4">
              <button type="button" className="px-4 py-2 rounded bg-gray-200" onClick={() => setDeleteId(null)} disabled={deleteLoading}>Cancel</button>
              <button type="button" className="px-4 py-2 rounded bg-[var(--danger)] text-white font-semibold hover:bg-red-700" onClick={handleDeleteConfirm} disabled={deleteLoading}>{deleteLoading ? "Deleting..." : "Delete"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 
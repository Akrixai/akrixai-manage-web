"use client";
import { useEffect, useState } from "react";

interface Client {
  id: string;
  name: string;
  contact: string | null;
  email: string | null;
  created_at: string;
}

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [search, setSearch] = useState("");
  const [editClient, setEditClient] = useState<Client | null>(null);
  const [editLoading, setEditLoading] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Fetch clients from Supabase
  useEffect(() => {
    fetchClients();
  }, []);

  async function fetchClients() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/clients");
      const data = await res.json();
      setClients(Array.isArray(data) ? data : []);
    } catch {
      setClients([]);
      setError("Failed to load clients");
    }
    setLoading(false);
  }

  async function handleAddClient(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    const res = await fetch("/api/clients", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, contact, email }),
    });
    if (res.ok) {
      const newClient = await res.json();
      setClients([newClient, ...clients]);
      setName("");
      setContact("");
      setEmail("");
      setSuccess("Client added successfully");
    } else {
      setError("Failed to add client");
    }
    setLoading(false);
  }

  function handleEditClick(client: Client) {
    setEditClient(client);
  }

  async function handleEditSave(e: React.FormEvent) {
    e.preventDefault();
    if (!editClient) return;
    setEditLoading(true);
    setError("");
    setSuccess("");
    const res = await fetch(`/api/clients/${editClient.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editClient),
    });
    if (res.ok) {
      const updated = await res.json();
      setClients(clients.map(c => c.id === updated.id ? updated : c));
      setEditClient(null);
      setSuccess("Client updated successfully");
    } else {
      setError("Failed to update client");
    }
    setEditLoading(false);
  }

  function handleEditChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (!editClient) return;
    setEditClient({ ...editClient, [e.target.name]: e.target.value });
  }

  function handleDeleteClick(id: string) {
    setDeleteId(id);
  }

  async function handleDeleteConfirm() {
    if (!deleteId) return;
    setDeleteLoading(true);
    setError("");
    setSuccess("");
    const res = await fetch(`/api/clients/${deleteId}`, { method: "DELETE" });
    if (res.ok) {
      setClients(clients.filter(c => c.id !== deleteId));
      setSuccess("Client deleted successfully");
    } else {
      setError("Failed to delete client");
    }
    setDeleteId(null);
    setDeleteLoading(false);
  }

  // Filtered clients
  const filteredClients = clients.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    (c.email || "").toLowerCase().includes(search.toLowerCase()) ||
    (c.contact || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-8 w-full max-w-5xl mx-auto px-2 sm:px-6">
      <h1 className="text-2xl font-bold text-[var(--primary)]">Clients</h1>
      <form onSubmit={handleAddClient} className="flex flex-col sm:flex-row flex-wrap gap-4 items-end bg-[var(--surface)] border border-[var(--border)] rounded-lg p-4 shadow-sm w-full">
        <div className="flex flex-col gap-1 w-full sm:w-auto min-w-0 flex-1">
          <label className="font-medium text-[var(--primary-dark)]">Name</label>
          <input className="border border-[var(--border)] rounded px-3 py-2 w-full min-w-0" value={name} onChange={e => setName(e.target.value)} required />
        </div>
        <div className="flex flex-col gap-1 w-full sm:w-auto min-w-0 flex-1">
          <label className="font-medium text-[var(--primary-dark)]">Contact</label>
          <input className="border border-[var(--border)] rounded px-3 py-2 w-full min-w-0" value={contact} onChange={e => setContact(e.target.value)} />
        </div>
        <div className="flex flex-col gap-1 w-full sm:w-auto min-w-0 flex-1">
          <label className="font-medium text-[var(--primary-dark)]">Email</label>
          <input className="border border-[var(--border)] rounded px-3 py-2 w-full min-w-0" type="email" value={email} onChange={e => setEmail(e.target.value)} />
        </div>
        <button type="submit" className="bg-[var(--primary)] text-white rounded px-4 py-2 font-semibold hover:bg-[var(--primary-light)] transition-colors min-w-[100px] w-full sm:w-auto" disabled={loading}>
          {loading ? "Adding..." : "Add Client"}
        </button>
      </form>
      <div className="flex flex-col sm:flex-row gap-4 items-center w-full">
        <input
          className="border border-[var(--border)] rounded px-3 py-2 w-full sm:w-64"
          placeholder="Search clients..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        {success && <div className="text-[var(--success)] font-medium">{success}</div>}
        {error && <div className="text-[var(--danger)] font-medium">{error}</div>}
      </div>
      <div className="overflow-x-auto w-full">
        <table className="min-w-[600px] w-full border border-[var(--border)] rounded-lg bg-[var(--surface)] text-sm sm:text-base">
          <thead>
            <tr className="bg-[var(--primary-light)] text-white">
              <th className="px-4 py-2 text-left">Name</th>
              <th className="px-4 py-2 text-left">Contact</th>
              <th className="px-4 py-2 text-left">Email</th>
              <th className="px-4 py-2 text-left">Created At</th>
              <th className="px-4 py-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredClients.map(client => (
              <tr key={client.id} className="border-t border-[var(--border)]">
                <td className="px-4 py-2 break-words max-w-[120px]">{client.name}</td>
                <td className="px-4 py-2 break-words max-w-[120px]">{client.contact}</td>
                <td className="px-4 py-2 break-words max-w-[160px]">{client.email}</td>
                <td className="px-4 py-2 whitespace-nowrap">{new Date(client.created_at).toLocaleString()}</td>
                <td className="px-4 py-2 flex gap-2 flex-wrap">
                  <button className="text-[var(--primary)] underline" onClick={() => handleEditClick(client)} disabled={loading}>Edit</button>
                  <button className="text-[var(--danger)] underline" onClick={() => handleDeleteClick(client.id)} disabled={loading}>Delete</button>
                </td>
              </tr>
            ))}
            {filteredClients.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-[var(--primary-dark)]">No clients found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {/* Edit Modal */}
      {editClient && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-2 sm:p-0">
          <form onSubmit={handleEditSave} className="bg-[var(--surface)] border border-[var(--border)] rounded-lg p-6 sm:p-8 flex flex-col gap-4 min-w-[90vw] max-w-md w-full shadow-lg">
            <h2 className="text-xl font-bold text-[var(--primary)] mb-2">Edit Client</h2>
            <label className="font-medium text-[var(--primary-dark)]">Name</label>
            <input name="name" className="border border-[var(--border)] rounded px-3 py-2" value={editClient.name} onChange={handleEditChange} required />
            <label className="font-medium text-[var(--primary-dark)]">Contact</label>
            <input name="contact" className="border border-[var(--border)] rounded px-3 py-2" value={editClient.contact || ""} onChange={handleEditChange} />
            <label className="font-medium text-[var(--primary-dark)]">Email</label>
            <input name="email" className="border border-[var(--border)] rounded px-3 py-2" type="email" value={editClient.email || ""} onChange={handleEditChange} />
            <div className="flex gap-4 mt-4 flex-wrap">
              <button type="button" className="px-4 py-2 rounded bg-gray-200" onClick={() => setEditClient(null)} disabled={editLoading}>Cancel</button>
              <button type="submit" className="px-4 py-2 rounded bg-[var(--primary)] text-white font-semibold hover:bg-[var(--primary-light)]" disabled={editLoading}>{editLoading ? "Saving..." : "Save"}</button>
            </div>
          </form>
        </div>
      )}
      {/* Delete Confirmation */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-2 sm:p-0">
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-lg p-6 sm:p-8 flex flex-col gap-4 min-w-[90vw] max-w-md w-full shadow-lg">
            <h2 className="text-xl font-bold text-[var(--danger)] mb-2">Delete Client</h2>
            <p>Are you sure you want to delete this client?</p>
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
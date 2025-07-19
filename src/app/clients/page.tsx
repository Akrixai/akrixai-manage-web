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
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      const data = await res.json();
      setClients(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Fetch clients error:', err);
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
    
    try {
      const res = await fetch("/api/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, contact, email }),
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to add client');
      }
      
      const newClient = await res.json();
      if (newClient && !newClient.error) {
        // Update the clients list immediately without refetching
        setClients(prev => [newClient, ...prev]);
        setName("");
        setContact("");
        setEmail("");
        setSuccess("Client added successfully");
      } else {
        setError(newClient?.error || "Failed to add client");
      }
    } catch (err) {
      console.error('Add client error:', err);
      setError(err instanceof Error ? err.message : "Failed to add client");
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
    
    try {
      const res = await fetch(`/api/clients/${editClient.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editClient),
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to update client');
      }
      
      const updated = await res.json();
      if (updated && !updated.error) {
        // Update the clients list immediately without refetching
        setClients(prev => prev.map(c => c.id === editClient.id ? updated : c));
        setEditClient(null);
        setSuccess("Client updated successfully");
      } else {
        setError(updated?.error || "Failed to update client");
      }
    } catch (err) {
      console.error('Update client error:', err);
      setError(err instanceof Error ? err.message : "Failed to update client");
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
    
    try {
      const res = await fetch(`/api/clients/${deleteId}`, { method: "DELETE" });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to delete client');
      }
      
      // Update the clients list immediately without refetching
      setClients(prev => prev.filter(c => c.id !== deleteId));
      setSuccess("Client deleted successfully");
    } catch (err) {
      console.error('Delete client error:', err);
      setError(err instanceof Error ? err.message : "Failed to delete client");
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
    <div className="flex flex-col gap-6 sm:gap-8 w-full max-w-5xl mx-auto px-2 sm:px-6">
      <h1 className="text-xl sm:text-2xl font-bold text-[var(--primary)]">Clients</h1>
      
      {/* Add Client Form */}
      <form onSubmit={handleAddClient} className="flex flex-col gap-4 bg-[var(--surface)] border border-[var(--border)] rounded-lg p-4 shadow-sm w-full">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="flex flex-col gap-1">
            <label className="font-medium text-[var(--primary-dark)] text-sm">Name</label>
            <input className="border border-[var(--border)] rounded px-3 py-2 w-full min-w-0 text-sm" value={name} onChange={e => setName(e.target.value)} required />
          </div>
          <div className="flex flex-col gap-1">
            <label className="font-medium text-[var(--primary-dark)] text-sm">Contact</label>
            <input className="border border-[var(--border)] rounded px-3 py-2 w-full min-w-0 text-sm" value={contact} onChange={e => setContact(e.target.value)} />
          </div>
          <div className="flex flex-col gap-1">
            <label className="font-medium text-[var(--primary-dark)] text-sm">Email</label>
            <input className="border border-[var(--border)] rounded px-3 py-2 w-full min-w-0 text-sm" type="email" value={email} onChange={e => setEmail(e.target.value)} />
          </div>
          <div className="flex flex-col gap-1">
            <button type="submit" className="bg-[var(--primary)] text-white rounded px-4 py-2 font-semibold hover:bg-[var(--primary-light)] transition-colors w-full text-sm" disabled={loading}>
              {loading ? "Adding..." : "Add Client"}
            </button>
          </div>
        </div>
      </form>

      {/* Search and Messages */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center w-full">
        <input
          className="border border-[var(--border)] rounded px-3 py-2 w-full sm:w-64 text-sm"
          placeholder="Search clients..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <div className="flex flex-col gap-2 w-full sm:w-auto">
          {success && <div className="text-[var(--success)] font-medium text-sm">{success}</div>}
          {error && <div className="text-[var(--danger)] font-medium text-sm">{error}</div>}
        </div>
      </div>

      {/* Clients Table */}
      <div className="overflow-x-auto w-full">
        <div className="min-w-full border border-[var(--border)] rounded-lg bg-[var(--surface)] overflow-hidden">
          {/* Mobile Card View */}
          <div className="lg:hidden">
            {filteredClients.map(client => (
              <div key={client.id} className="border-b border-[var(--border)] p-4 space-y-2">
                <div className="flex justify-between items-start">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-[var(--primary)] truncate">{client.name}</h3>
                    <p className="text-sm text-[var(--primary-dark)]">
                      Contact: {client.contact || "-"}
                    </p>
                    <p className="text-sm text-[var(--primary-dark)]">
                      Email: {client.email || "-"}
                    </p>
                    <p className="text-xs text-gray-500 mt-2">
                      Created: {new Date(client.created_at).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex flex-col gap-1 ml-4">
                    <button 
                      className="text-[var(--primary)] underline text-sm" 
                      onClick={() => handleEditClick(client)} 
                      disabled={loading}
                    >
                      Edit
                    </button>
                    <button 
                      className="text-[var(--danger)] underline text-sm" 
                      onClick={() => handleDeleteClick(client.id)} 
                      disabled={loading}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {filteredClients.length === 0 && (
              <div className="p-8 text-center text-[var(--primary-dark)]">No clients found.</div>
            )}
          </div>

          {/* Desktop Table View */}
          <table className="hidden lg:table min-w-full text-sm">
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
      </div>

      {/* Edit Modal */}
      {editClient && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-2 sm:p-0">
          <form onSubmit={handleEditSave} className="bg-[var(--surface)] border border-[var(--border)] rounded-lg p-4 sm:p-6 flex flex-col gap-4 w-full max-w-md shadow-lg max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg sm:text-xl font-bold text-[var(--primary)] mb-2">Edit Client</h2>
            <div className="space-y-4">
              <div>
                <label className="font-medium text-[var(--primary-dark)] text-sm">Name</label>
                <input name="name" className="border border-[var(--border)] rounded px-3 py-2 w-full text-sm" value={editClient.name} onChange={handleEditChange} required />
              </div>
              <div>
                <label className="font-medium text-[var(--primary-dark)] text-sm">Contact</label>
                <input name="contact" className="border border-[var(--border)] rounded px-3 py-2 w-full text-sm" value={editClient.contact || ""} onChange={handleEditChange} />
              </div>
              <div>
                <label className="font-medium text-[var(--primary-dark)] text-sm">Email</label>
                <input name="email" className="border border-[var(--border)] rounded px-3 py-2 w-full text-sm" type="email" value={editClient.email || ""} onChange={handleEditChange} />
              </div>
            </div>
            <div className="flex gap-4 mt-4 flex-wrap">
              <button type="button" className="px-4 py-2 rounded bg-gray-200 text-sm" onClick={() => setEditClient(null)} disabled={editLoading}>Cancel</button>
              <button type="submit" className="px-4 py-2 rounded bg-[var(--primary)] text-white font-semibold hover:bg-[var(--primary-light)] text-sm" disabled={editLoading}>{editLoading ? "Saving..." : "Save"}</button>
            </div>
          </form>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-2 sm:p-0">
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-lg p-4 sm:p-6 flex flex-col gap-4 w-full max-w-md shadow-lg">
            <h2 className="text-lg sm:text-xl font-bold text-[var(--danger)] mb-2">Delete Client</h2>
            <p className="text-sm">Are you sure you want to delete this client?</p>
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
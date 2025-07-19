"use client";
import { useEffect, useState } from "react";

interface Payment {
  id: string;
  project_id: string;
  amount: number;
  status: string | null;
  payment_date: string | null;
  notes: string | null;
  created_at: string;
}

interface Project {
  id: string;
  name: string;
}

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectId, setProjectId] = useState("");
  const [amount, setAmount] = useState("");
  const [status, setStatus] = useState("");
  const [paymentDate, setPaymentDate] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [search, setSearch] = useState("");
  const [editPayment, setEditPayment] = useState<Payment | null>(null);
  const [editLoading, setEditLoading] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    fetchPayments();
    fetchProjects();
  }, []);

  async function fetchPayments() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/payments");
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      const data = await res.json();
      setPayments(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Fetch payments error:', err);
      setPayments([]);
      setError("Failed to load payments");
    }
    setLoading(false);
  }

  async function fetchProjects() {
    try {
      const res = await fetch("/api/projects");
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      const data = await res.json();
      setProjects(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Fetch projects error:', err);
      setProjects([]);
    }
  }

  // Defensive: always use arrays for .map/.filter
  const safePayments = Array.isArray(payments) ? payments : [];
  const safeProjects = Array.isArray(projects) ? projects : [];

  // For datalist
  const projectOptions = safeProjects.map(project => ({ id: project.id, name: project.name }));

  function handleProjectInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;
    const match = safeProjects.find(p => p.name === value);
    if (match) {
      setProjectId(match.id);
      setError("");
    } else {
      setProjectId("");
      setError("Please select a valid project from the list.");
    }
  }

  async function handleAddPayment(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    
    // Only allow valid UUIDs for projectId
    if (!projectId || !/^[0-9a-fA-F-]{36}$/.test(projectId)) {
      setError("Please select a valid project from the list.");
      setLoading(false);
      return;
    }
    
    try {
      const res = await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ project_id: projectId, amount: parseFloat(amount), status, payment_date: paymentDate, notes }),
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to add payment');
      }
      
      const newPayment = await res.json();
      if (newPayment && !newPayment.error) {
        // Update the payments list immediately without refetching
        setPayments(prev => [newPayment, ...prev]);
        setProjectId("");
        setAmount("");
        setStatus("");
        setPaymentDate("");
        setNotes("");
        setSuccess("Payment added successfully");
      } else {
        setError(newPayment?.error || "Failed to add payment");
      }
    } catch (err) {
      console.error('Add payment error:', err);
      setError(err instanceof Error ? err.message : "Failed to add payment");
    }
    setLoading(false);
  }

  function handleEditClick(payment: Payment) {
    setEditPayment(payment);
  }

  async function handleEditSave(e: React.FormEvent) {
    e.preventDefault();
    if (!editPayment) return;
    
    setEditLoading(true);
    setError("");
    setSuccess("");
    
    try {
      const res = await fetch(`/api/payments/${editPayment.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editPayment),
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to update payment');
      }
      
      const updated = await res.json();
      if (updated && !updated.error) {
        // Update the payments list immediately without refetching
        setPayments(prev => prev.map(p => p.id === editPayment.id ? updated : p));
        setEditPayment(null);
        setSuccess("Payment updated successfully");
      } else {
        setError(updated?.error || "Failed to update payment");
      }
    } catch (err) {
      console.error('Update payment error:', err);
      setError(err instanceof Error ? err.message : "Failed to update payment");
    }
    setEditLoading(false);
  }

  function handleEditChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    if (!editPayment) return;
    setEditPayment({ ...editPayment, [e.target.name]: e.target.value });
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
      const res = await fetch(`/api/payments/${deleteId}`, { method: "DELETE" });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to delete payment');
      }
      
      // Update the payments list immediately without refetching
      setPayments(prev => prev.filter(p => p.id !== deleteId));
      setSuccess("Payment deleted successfully");
    } catch (err) {
      console.error('Delete payment error:', err);
      setError(err instanceof Error ? err.message : "Failed to delete payment");
    }
    
    setDeleteId(null);
    setDeleteLoading(false);
  }

  // Filtered payments
  const filteredPayments = safePayments.filter(p =>
    (safeProjects.find(pr => pr.id === p.project_id)?.name || "").toLowerCase().includes(search.toLowerCase()) ||
    (p.status || "").toLowerCase().includes(search.toLowerCase()) ||
    (p.notes || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-6 sm:gap-8 w-full max-w-5xl mx-auto px-2 sm:px-6">
      <h1 className="text-xl sm:text-2xl font-bold text-[var(--primary)]">Payments</h1>
      
      {/* Add Payment Form */}
      <form onSubmit={handleAddPayment} className="flex flex-col gap-4 bg-[var(--surface)] border border-[var(--border)] rounded-lg p-4 shadow-sm w-full">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
          <div className="flex flex-col gap-1">
            <label className="font-medium text-[var(--primary-dark)] text-sm">Project</label>
            <input
              className="border border-[var(--border)] rounded px-3 py-2 w-full min-w-0 text-sm"
              list="project-list"
              value={safeProjects.find(p => p.id === projectId)?.name || projectId}
              onChange={handleProjectInputChange}
              placeholder="Select or type project"
              required
            />
            <datalist id="project-list">
              {projectOptions.map(project => (
                <option key={project.id} value={project.name} />
              ))}
            </datalist>
          </div>
          <div className="flex flex-col gap-1">
            <label className="font-medium text-[var(--primary-dark)] text-sm">Amount</label>
            <input className="border border-[var(--border)] rounded px-3 py-2 w-full min-w-0 text-sm" type="number" min="0" step="0.01" value={amount} onChange={e => setAmount(e.target.value)} required />
          </div>
          <div className="flex flex-col gap-1">
            <label className="font-medium text-[var(--primary-dark)] text-sm">Status</label>
            <input className="border border-[var(--border)] rounded px-3 py-2 w-full min-w-0 text-sm" value={status} onChange={e => setStatus(e.target.value)} />
          </div>
          <div className="flex flex-col gap-1">
            <label className="font-medium text-[var(--primary-dark)] text-sm">Payment Date</label>
            <input className="border border-[var(--border)] rounded px-3 py-2 w-full min-w-0 text-sm" type="date" value={paymentDate} onChange={e => setPaymentDate(e.target.value)} />
          </div>
          <div className="flex flex-col gap-1">
            <label className="font-medium text-[var(--primary-dark)] text-sm">Notes</label>
            <input className="border border-[var(--border)] rounded px-3 py-2 w-full min-w-0 text-sm" value={notes} onChange={e => setNotes(e.target.value)} />
          </div>
          <div className="flex flex-col gap-1">
            <button type="submit" className="bg-[var(--primary)] text-white rounded px-4 py-2 font-semibold hover:bg-[var(--primary-light)] transition-colors w-full text-sm" disabled={loading}>
              {loading ? "Adding..." : "Add Payment"}
            </button>
          </div>
        </div>
      </form>

      {/* Search and Messages */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center w-full">
        <input
          className="border border-[var(--border)] rounded px-3 py-2 w-full sm:w-64 text-sm"
          placeholder="Search payments..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <div className="flex flex-col gap-2 w-full sm:w-auto">
          {success && <div className="text-[var(--success)] font-medium text-sm">{success}</div>}
          {error && <div className="text-[var(--danger)] font-medium text-sm">{error}</div>}
        </div>
      </div>

      {/* Payments Table */}
      <div className="overflow-x-auto w-full">
        <div className="min-w-full border border-[var(--border)] rounded-lg bg-[var(--surface)] overflow-hidden">
          {/* Mobile Card View */}
          <div className="lg:hidden">
            {filteredPayments.map(payment => (
              <div key={payment.id} className="border-b border-[var(--border)] p-4 space-y-2">
                <div className="flex justify-between items-start">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-[var(--primary)] truncate">
                      {safeProjects.find(p => p.id === payment.project_id)?.name || "-"}
                    </h3>
                    <p className="text-sm text-[var(--primary-dark)]">
                      Amount: ${payment.amount}
                    </p>
                    <p className="text-sm text-[var(--primary-dark)]">
                      Status: {payment.status || "-"}
                    </p>
                    <p className="text-sm text-[var(--primary-dark)]">
                      Date: {payment.payment_date || "-"}
                    </p>
                    {payment.notes && (
                      <p className="text-sm text-[var(--primary-dark)] mt-1 line-clamp-2">
                        {payment.notes}
                      </p>
                    )}
                    <p className="text-xs text-gray-500 mt-2">
                      Created: {new Date(payment.created_at).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex flex-col gap-1 ml-4">
                    <button 
                      className="text-[var(--primary)] underline text-sm" 
                      onClick={() => handleEditClick(payment)} 
                      disabled={loading}
                    >
                      Edit
                    </button>
                    <button 
                      className="text-[var(--danger)] underline text-sm" 
                      onClick={() => handleDeleteClick(payment.id)} 
                      disabled={loading}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {filteredPayments.length === 0 && (
              <div className="p-8 text-center text-[var(--primary-dark)]">No payments found.</div>
            )}
          </div>

          {/* Desktop Table View */}
          <table className="hidden lg:table min-w-full text-sm">
            <thead>
              <tr className="bg-[var(--primary-light)] text-white">
                <th className="px-4 py-2 text-left">Project</th>
                <th className="px-4 py-2 text-left">Amount</th>
                <th className="px-4 py-2 text-left">Status</th>
                <th className="px-4 py-2 text-left">Payment Date</th>
                <th className="px-4 py-2 text-left">Notes</th>
                <th className="px-4 py-2 text-left">Created At</th>
                <th className="px-4 py-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPayments.map(payment => (
                <tr key={payment.id} className="border-t border-[var(--border)]">
                  <td className="px-4 py-2 break-words max-w-[120px]">{safeProjects.find(p => p.id === payment.project_id)?.name || "-"}</td>
                  <td className="px-4 py-2 break-words max-w-[100px]">${payment.amount}</td>
                  <td className="px-4 py-2 break-words max-w-[100px]">{payment.status}</td>
                  <td className="px-4 py-2 break-words max-w-[120px]">{payment.payment_date}</td>
                  <td className="px-4 py-2 break-words max-w-[120px]">{payment.notes}</td>
                  <td className="px-4 py-2 whitespace-nowrap">{new Date(payment.created_at).toLocaleString()}</td>
                  <td className="px-4 py-2 flex gap-2 flex-wrap">
                    <button className="text-[var(--primary)] underline" onClick={() => handleEditClick(payment)} disabled={loading}>Edit</button>
                    <button className="text-[var(--danger)] underline" onClick={() => handleDeleteClick(payment.id)} disabled={loading}>Delete</button>
                  </td>
                </tr>
              ))}
              {filteredPayments.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-[var(--primary-dark)]">No payments found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Modal */}
      {editPayment && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-2 sm:p-0">
          <form onSubmit={handleEditSave} className="bg-[var(--surface)] border border-[var(--border)] rounded-lg p-4 sm:p-6 flex flex-col gap-4 w-full max-w-md shadow-lg max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg sm:text-xl font-bold text-[var(--primary)] mb-2">Edit Payment</h2>
            <div className="space-y-4">
              <div>
                <label className="font-medium text-[var(--primary-dark)] text-sm">Project</label>
                <input
                  name="project_id"
                  className="border border-[var(--border)] rounded px-3 py-2 w-full text-sm"
                  list="edit-project-list"
                  value={safeProjects.find(p => p.id === editPayment.project_id)?.name || editPayment.project_id}
                  onChange={e => {
                    const match = safeProjects.find(p => p.name === e.target.value);
                    setEditPayment({ ...editPayment, project_id: match ? match.id : e.target.value });
                  }}
                  placeholder="Select or type project"
                  required
                />
                <datalist id="edit-project-list">
                  {projectOptions.map(project => (
                    <option key={project.id} value={project.name} />
                  ))}
                </datalist>
              </div>
              <div>
                <label className="font-medium text-[var(--primary-dark)] text-sm">Amount</label>
                <input name="amount" className="border border-[var(--border)] rounded px-3 py-2 w-full text-sm" type="number" min="0" step="0.01" value={editPayment.amount} onChange={handleEditChange} required />
              </div>
              <div>
                <label className="font-medium text-[var(--primary-dark)] text-sm">Status</label>
                <input name="status" className="border border-[var(--border)] rounded px-3 py-2 w-full text-sm" value={editPayment.status || ""} onChange={handleEditChange} />
              </div>
              <div>
                <label className="font-medium text-[var(--primary-dark)] text-sm">Payment Date</label>
                <input name="payment_date" className="border border-[var(--border)] rounded px-3 py-2 w-full text-sm" type="date" value={editPayment.payment_date || ""} onChange={handleEditChange} />
              </div>
              <div>
                <label className="font-medium text-[var(--primary-dark)] text-sm">Notes</label>
                <input name="notes" className="border border-[var(--border)] rounded px-3 py-2 w-full text-sm" value={editPayment.notes || ""} onChange={handleEditChange} />
              </div>
            </div>
            <div className="flex gap-4 mt-4 flex-wrap">
              <button type="button" className="px-4 py-2 rounded bg-gray-200 text-sm" onClick={() => setEditPayment(null)} disabled={editLoading}>Cancel</button>
              <button type="submit" className="px-4 py-2 rounded bg-[var(--primary)] text-white font-semibold hover:bg-[var(--primary-light)] text-sm" disabled={editLoading}>{editLoading ? "Saving..." : "Save"}</button>
            </div>
          </form>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-2 sm:p-0">
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-lg p-4 sm:p-6 flex flex-col gap-4 w-full max-w-md shadow-lg">
            <h2 className="text-lg sm:text-xl font-bold text-[var(--danger)] mb-2">Delete Payment</h2>
            <p className="text-sm">Are you sure you want to delete this payment?</p>
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
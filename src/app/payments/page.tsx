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
      const data = await res.json();
      setPayments(Array.isArray(data) ? data : []);
    } catch {
      setPayments([]);
      setError("Failed to load payments");
    }
    setLoading(false);
  }

  async function fetchProjects() {
    try {
      const res = await fetch("/api/projects");
      const data = await res.json();
      setProjects(Array.isArray(data) ? data : []);
    } catch {
      setProjects([]);
    }
  }

  // Defensive: always use arrays for .map/.filter
  const safePayments = Array.isArray(payments) ? payments : [];
  const safeProjects = Array.isArray(projects) ? projects : [];

  // For datalist
  const projectOptions = safeProjects.map(project => ({ id: project.id, name: project.name }));

  async function handleAddPayment(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    const res = await fetch("/api/payments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ project_id: projectId, amount: parseFloat(amount), status, payment_date: paymentDate, notes }),
    });
    if (res.ok) {
      const newPayment = await res.json();
      setPayments([newPayment, ...safePayments]);
      setProjectId("");
      setAmount("");
      setStatus("");
      setPaymentDate("");
      setNotes("");
      setSuccess("Payment added successfully");
    } else {
      setError("Failed to add payment");
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
    const res = await fetch(`/api/payments/${editPayment.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editPayment),
    });
    if (res.ok) {
      const updated = await res.json();
      setPayments(safePayments.map(p => p.id === updated.id ? updated : p));
      setEditPayment(null);
      setSuccess("Payment updated successfully");
    } else {
      setError("Failed to update payment");
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
    const res = await fetch(`/api/payments/${deleteId}`, { method: "DELETE" });
    if (res.ok) {
      setPayments(safePayments.filter(p => p.id !== deleteId));
      setSuccess("Payment deleted successfully");
    } else {
      setError("Failed to delete payment");
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
    <div className="flex flex-col gap-8">
      <h1 className="text-2xl font-bold text-[var(--primary)]">Payments</h1>
      <form onSubmit={handleAddPayment} className="flex flex-col sm:flex-row gap-4 items-end bg-[var(--surface)] border border-[var(--border)] rounded-lg p-4 shadow-sm">
        <div className="flex flex-col gap-1 w-full sm:w-auto">
          <label className="font-medium text-[var(--primary-dark)]">Project</label>
          <input
            className="border border-[var(--border)] rounded px-3 py-2"
            list="project-list"
            value={safeProjects.find(p => p.id === projectId)?.name || projectId}
            onChange={e => {
              const match = safeProjects.find(p => p.name === e.target.value);
              setProjectId(match ? match.id : e.target.value);
            }}
            placeholder="Select or type project"
            required
          />
          <datalist id="project-list">
            {projectOptions.map(project => (
              <option key={project.id} value={project.name} />
            ))}
          </datalist>
        </div>
        <div className="flex flex-col gap-1 w-full sm:w-auto">
          <label className="font-medium text-[var(--primary-dark)]">Amount</label>
          <input className="border border-[var(--border)] rounded px-3 py-2" type="number" min="0" step="0.01" value={amount} onChange={e => setAmount(e.target.value)} required />
        </div>
        <div className="flex flex-col gap-1 w-full sm:w-auto">
          <label className="font-medium text-[var(--primary-dark)]">Status</label>
          <input className="border border-[var(--border)] rounded px-3 py-2" value={status} onChange={e => setStatus(e.target.value)} />
        </div>
        <div className="flex flex-col gap-1 w-full sm:w-auto">
          <label className="font-medium text-[var(--primary-dark)]">Payment Date</label>
          <input className="border border-[var(--border)] rounded px-3 py-2" type="date" value={paymentDate} onChange={e => setPaymentDate(e.target.value)} />
        </div>
        <div className="flex flex-col gap-1 w-full sm:w-auto">
          <label className="font-medium text-[var(--primary-dark)]">Notes</label>
          <input className="border border-[var(--border)] rounded px-3 py-2" value={notes} onChange={e => setNotes(e.target.value)} />
        </div>
        <button type="submit" className="bg-[var(--primary)] text-white rounded px-4 py-2 font-semibold hover:bg-[var(--primary-light)] transition-colors min-w-[100px]" disabled={loading}>
          {loading ? "Adding..." : "Add Payment"}
        </button>
      </form>
      <div className="flex flex-col sm:flex-row gap-4 items-center">
        <input
          className="border border-[var(--border)] rounded px-3 py-2 w-full sm:w-64"
          placeholder="Search payments..."
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
                <td className="px-4 py-2">{safeProjects.find(p => p.id === payment.project_id)?.name || "-"}</td>
                <td className="px-4 py-2">{payment.amount}</td>
                <td className="px-4 py-2">{payment.status}</td>
                <td className="px-4 py-2">{payment.payment_date}</td>
                <td className="px-4 py-2">{payment.notes}</td>
                <td className="px-4 py-2">{new Date(payment.created_at).toLocaleString()}</td>
                <td className="px-4 py-2 flex gap-2">
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
      {/* Edit Modal */}
      {editPayment && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <form onSubmit={handleEditSave} className="bg-[var(--surface)] border border-[var(--border)] rounded-lg p-8 flex flex-col gap-4 min-w-[320px] shadow-lg">
            <h2 className="text-xl font-bold text-[var(--primary)] mb-2">Edit Payment</h2>
            <label className="font-medium text-[var(--primary-dark)]">Project</label>
            <input
              name="project_id"
              className="border border-[var(--border)] rounded px-3 py-2"
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
            <label className="font-medium text-[var(--primary-dark)]">Amount</label>
            <input name="amount" className="border border-[var(--border)] rounded px-3 py-2" type="number" min="0" step="0.01" value={editPayment.amount} onChange={handleEditChange} required />
            <label className="font-medium text-[var(--primary-dark)]">Status</label>
            <input name="status" className="border border-[var(--border)] rounded px-3 py-2" value={editPayment.status || ""} onChange={handleEditChange} />
            <label className="font-medium text-[var(--primary-dark)]">Payment Date</label>
            <input name="payment_date" className="border border-[var(--border)] rounded px-3 py-2" type="date" value={editPayment.payment_date || ""} onChange={handleEditChange} />
            <label className="font-medium text-[var(--primary-dark)]">Notes</label>
            <input name="notes" className="border border-[var(--border)] rounded px-3 py-2" value={editPayment.notes || ""} onChange={handleEditChange} />
            <div className="flex gap-4 mt-4">
              <button type="button" className="px-4 py-2 rounded bg-gray-200" onClick={() => setEditPayment(null)} disabled={editLoading}>Cancel</button>
              <button type="submit" className="px-4 py-2 rounded bg-[var(--primary)] text-white font-semibold hover:bg-[var(--primary-light)]" disabled={editLoading}>{editLoading ? "Saving..." : "Save"}</button>
            </div>
          </form>
        </div>
      )}
      {/* Delete Confirmation */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-lg p-8 flex flex-col gap-4 min-w-[320px] shadow-lg">
            <h2 className="text-xl font-bold text-[var(--danger)] mb-2">Delete Payment</h2>
            <p>Are you sure you want to delete this payment?</p>
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
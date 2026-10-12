'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, DollarSign, Save, Loader2, AlertCircle } from 'lucide-react'

export default function CreateFeePaymentPage() {
  const router = useRouter()

  const [students, setStudents]         = useState<any[]>([])
  const [feeStructures, setFeeStructures] = useState<any[]>([])
  const [users, setUsers]               = useState<any[]>([])

  const [form, setForm] = useState({
    student: '',
    feeStructure: '',
    amount: '',
    paidDate: new Date().toISOString().split('T')[0],
    paymentMethod: 'cash',
    transactionReference: '',
    remarks: '',
    receivedBy: '',
    status: 'completed',
  })

  const [submitting, setSubmitting] = useState(false)
  const [error, setError]           = useState('')
  const [currentUser, setCurrentUser] = useState<any>(null)

  useEffect(() => {
    fetch('/api/users/me', { credentials: 'include' })
      .then((r) => r.json())
      .then((d) => {
        if (d.user) {
          setCurrentUser(d.user)
          setForm((f) => ({ ...f, receivedBy: String(d.user.id) }))
        }
      })

    fetch('/api/students?limit=500&depth=1&sort=rollNo')
      .then((r) => r.json())
      .then((d) => setStudents(d.docs || []))

    fetch('/api/fee-structure?where[status][equals]=active&limit=100&depth=1')
      .then((r) => r.json())
      .then((d) => setFeeStructures(d.docs || []))

    fetch('/api/users?limit=100&sort=name')
      .then((r) => r.json())
      .then((d) => setUsers(d.docs || []))
  }, [])

  // Auto-fill amount when fee structure is selected
  useEffect(() => {
    if (!form.feeStructure) return
    const fs = feeStructures.find((f) => String(f.id) === form.feeStructure)
    if (fs) setForm((prev) => ({ ...prev, amount: String(fs.amount) }))
  }, [form.feeStructure, feeStructures])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.student || !form.feeStructure || !form.amount) {
      setError('Student, Fee Structure and Amount are required.')
      return
    }
    setSubmitting(true)
    setError('')
    try {
      const body: any = {
        student:              Number(form.student),
        feeStructure:         Number(form.feeStructure),
        amount:               Number(form.amount),
        paidDate:             form.paidDate,
        paymentMethod:        form.paymentMethod,
        status:               form.status,
        remarks:              form.remarks || undefined,
        transactionReference: form.transactionReference || undefined,
        receivedBy:           form.receivedBy ? Number(form.receivedBy) : undefined,
      }
      const res = await fetch('/api/fee-payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(body),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err?.errors?.[0]?.message || 'Failed to save payment')
      }
      router.push('/fee-payments')
    } catch (err: any) {
      setError(err.message || 'An error occurred.')
    } finally {
      setSubmitting(false)
    }
  }

  const inputClass = 'w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none text-sm transition-all'
  const labelClass = 'block text-sm font-semibold text-gray-700 mb-1.5'

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-3xl mx-auto px-6 h-20 flex items-center gap-4">
          <Link href="/fee-payments" className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <div className="w-10 h-10 bg-green-600 rounded-xl flex items-center justify-center">
            <DollarSign className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Record Fee Payment</h1>
            <p className="text-sm text-gray-500">Create a new payment record</p>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto p-6">
        {error && (
          <div className="mb-5 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-red-700 text-sm">
            <AlertCircle size={18} className="flex-shrink-0" />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 space-y-6">
          {/* Student */}
          <div>
            <label className={labelClass}>Student <span className="text-red-500">*</span></label>
            <select
              value={form.student}
              onChange={(e) => setForm({ ...form, student: e.target.value })}
              className={inputClass}
              required
            >
              <option value="">Select Student</option>
              {students.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.displayTitle || s.rollNo}
                </option>
              ))}
            </select>
          </div>

          {/* Fee Structure */}
          <div>
            <label className={labelClass}>Fee Structure <span className="text-red-500">*</span></label>
            <select
              value={form.feeStructure}
              onChange={(e) => setForm({ ...form, feeStructure: e.target.value })}
              className={inputClass}
              required
            >
              <option value="">Select Fee Structure</option>
              {feeStructures.map((fs) => (
                <option key={fs.id} value={fs.id}>
                  {fs.title} — PKR {fs.amount?.toLocaleString()} ({fs.feeType})
                </option>
              ))}
            </select>
          </div>

          {/* Amount + Date */}
          <div className="grid grid-cols-2 gap-5">
            <div>
              <label className={labelClass}>Amount (PKR) <span className="text-red-500">*</span></label>
              <input
                type="number"
                min="0"
                step="1"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                className={inputClass}
                placeholder="e.g. 25000"
                required
              />
            </div>
            <div>
              <label className={labelClass}>Payment Date</label>
              <input
                type="date"
                value={form.paidDate}
                onChange={(e) => setForm({ ...form, paidDate: e.target.value })}
                className={inputClass}
              />
            </div>
          </div>

          {/* Payment Method + Status */}
          <div className="grid grid-cols-2 gap-5">
            <div>
              <label className={labelClass}>Payment Method</label>
              <select
                value={form.paymentMethod}
                onChange={(e) => setForm({ ...form, paymentMethod: e.target.value })}
                className={inputClass}
              >
                <option value="cash">Cash</option>
                <option value="bank_transfer">Bank Transfer</option>
                <option value="cheque">Cheque</option>
                <option value="online">Online</option>
                <option value="credit_card">Credit Card</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Status</label>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
                className={inputClass}
              >
                <option value="completed">Completed</option>
                <option value="pending">Pending</option>
                <option value="failed">Failed</option>
                <option value="refunded">Refunded</option>
              </select>
            </div>
          </div>

          {/* Transaction Reference */}
          <div>
            <label className={labelClass}>Transaction / Receipt Reference</label>
            <input
              type="text"
              value={form.transactionReference}
              onChange={(e) => setForm({ ...form, transactionReference: e.target.value })}
              className={inputClass}
              placeholder="Bank slip no., cheque no., etc."
            />
          </div>

          {/* Received By */}
          <div>
            <label className={labelClass}>Received By</label>
            <select
              value={form.receivedBy}
              onChange={(e) => setForm({ ...form, receivedBy: e.target.value })}
              className={inputClass}
            >
              <option value="">Select Staff</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
              ))}
            </select>
          </div>

          {/* Remarks */}
          <div>
            <label className={labelClass}>Remarks</label>
            <textarea
              value={form.remarks}
              onChange={(e) => setForm({ ...form, remarks: e.target.value })}
              rows={3}
              className={`${inputClass} resize-none`}
              placeholder="Any additional notes…"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <Link href="/fee-payments" className="px-5 py-2.5 text-gray-600 font-semibold hover:bg-gray-100 rounded-xl transition-colors text-sm">
              Cancel
            </Link>
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-2 px-6 py-2.5 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 transition-all shadow-sm disabled:opacity-60 text-sm"
            >
              {submitting ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              {submitting ? 'Saving…' : 'Record Payment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

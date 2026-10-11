'use client'

import { useState, useEffect } from 'react'
import { DollarSign, Search, Plus, Download } from 'lucide-react'
import Link from 'next/link'
import { generateFeeReceiptPDF } from '@/utils/pdfGenerator'

export default function FeePaymentsPage() {
  const [payments, setPayments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetchPayments()
  }, [search])

  const fetchPayments = async () => {
    setLoading(true)
    try {
      const where: any = {}
      if (search) {
        where.displayTitle = { contains: search }
      }

      const query = new URLSearchParams({
        limit: '100',
        depth: '2',
        ...(Object.keys(where).length > 0 && { where: JSON.stringify(where) }),
      })

      const res = await fetch(`/api/fee-payments?${query}`)
      const data = await res.json()
      setPayments(data.docs || [])
    } catch (error) {
      console.error('Error fetching payments:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-[1600px] mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center shadow-lg shadow-green-200">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Fee Payments</h1>
              <p className="text-sm font-medium text-gray-500">Student fee payment records</p>
            </div>
          </div>

          <Link
            href="/fee-payments/create"
            className="flex items-center space-x-2 px-5 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all font-semibold shadow-md shadow-green-100"
          >
            <Plus size={20} />
            <span>Record Payment</span>
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-[1600px] mx-auto p-6 space-y-6">
        {/* Search */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search by student or receipt..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all"
            />
          </div>
        </div>

        {/* Payments List */}
        {loading ? (
          <div className="flex flex-col items-center justify-center h-64 space-y-4">
            <div className="w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-gray-500 font-medium">Loading payments...</p>
          </div>
        ) : payments.length > 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Student
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Fee Type
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Payment Date
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {payments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">
                        {payment.student?.displayTitle || 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {payment.feeStructure?.feeType || 'N/A'}
                    </td>
                    <td className="px-6 py-4 font-semibold text-gray-900">
                      PKR {payment.amount?.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {payment.paidDate
                        ? new Date(payment.paidDate).toLocaleDateString()
                        : 'N/A'}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          payment.status === 'completed'
                            ? 'bg-green-100 text-green-700'
                            : payment.status === 'pending'
                              ? 'bg-yellow-100 text-yellow-700'
                              : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {payment.status?.charAt(0).toUpperCase() + payment.status?.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => generateFeeReceiptPDF(payment)}
                        className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all"
                        title="Download Receipt"
                      >
                        <Download size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="bg-white rounded-3xl border-2 border-dashed border-gray-200 p-20 text-center">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <DollarSign className="w-10 h-10 text-gray-300" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No Payment Records Found</h3>
            <p className="text-gray-500 max-w-sm mx-auto mb-8">
              We couldn&apos;t find any payment records matching your search.
            </p>
            <button
              onClick={() => setSearch('')}
              className="px-6 py-2.5 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition-all"
            >
              Clear Search
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

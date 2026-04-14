'use client'

import React from 'react'
import { Banknote, TrendingUp, TrendingDown, Clock, User, Building2, Edit } from 'lucide-react'
import Link from 'next/link'

interface SalaryCardProps {
  salary: any
}

export default function SalaryCard({ salary }: SalaryCardProps) {
  const isPermanent = salary.teacherType === 'permanent'
  const basePay = isPermanent ? salary.fixedSalary : salary.perClassRate
  const bonus = salary.bonus || 0
  const tax = salary.deductions?.tax || 0
  const otherDeduction = salary.deductions?.otherDeduction || 0
  const totalDeductions = tax + otherDeduction
  
  // For permanent, net total is Base + Bonus - Deductions
  // For visiting, it's just a rate (calculation would depend on classes which we don't have here yet)
  const netTotal = isPermanent ? (basePay + bonus - totalDeductions) : (basePay + bonus)

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all duration-300">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center space-x-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${isPermanent ? 'bg-blue-100 text-blue-600' : 'bg-purple-100 text-purple-600'}`}>
              <User size={24} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 leading-none">{salary.teacher?.name}</h3>
            </div>
          </div>
          <div className="flex flex-col items-end space-y-2">
            <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${salary.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
              {salary.status}
            </span>
            <Link 
              href={`/teacher-salary/edit/${salary.id}`}
              className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
            >
              <Edit size={16} />
            </Link>
          </div>
        </div>

        {/* Salary Details */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-gray-50 rounded-xl p-3">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
              {isPermanent ? 'Fixed Salary' : 'Class Rate'}
            </p>
            <p className="text-lg font-extrabold text-gray-900">
              Rs. {basePay?.toLocaleString()}
              {!isPermanent && <span className="text-xs font-medium text-gray-500 ml-1">/ class</span>}
            </p>
          </div>
          <div className="bg-gray-50 rounded-xl p-3">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Teacher Type</p>
            <p className={`text-sm font-bold capitalize ${isPermanent ? 'text-blue-600' : 'text-purple-600'}`}>
              {salary.teacherType}
            </p>
          </div>
        </div>

        {/* Breakdown */}
        <div className="space-y-3 pb-6 border-b border-gray-100">
          <div className="flex justify-between items-center text-sm">
            <div className="flex items-center text-gray-500">
              <TrendingUp size={14} className="mr-2 text-green-500" />
              Bonus
            </div>
            <span className="font-bold text-green-600">+Rs. {bonus.toLocaleString()}</span>
          </div>
          
          {isPermanent && totalDeductions > 0 && (
            <div className="flex justify-between items-center text-sm">
              <div className="flex items-center text-gray-500">
                <TrendingDown size={14} className="mr-2 text-red-500" />
                Deductions
              </div>
              <span className="font-bold text-red-600">-Rs. {totalDeductions.toLocaleString()}</span>
            </div>
          )}
        </div>

        {/* Footer/Total */}
        <div className="pt-6 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Estimated Net</p>
            <p className="text-xl font-black text-gray-900">Rs. {netTotal.toLocaleString()}</p>
          </div>
          <div className="text-right">
            <div className="flex items-center text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">
              <Clock size={10} className="mr-1" />
              Effective From
            </div>
            <p className="text-xs font-bold text-gray-700">
              {new Date(salary.effectiveFrom).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

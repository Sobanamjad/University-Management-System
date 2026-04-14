'use client'

import React from 'react'
import { MapPin, User, BookOpen, Clock, Tag } from 'lucide-react'

interface TimetableEntryProps {
  entry: any
  viewType: 'class' | 'teacher'
}

export default function TimetableEntry({ entry, viewType }: TimetableEntryProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-700 border-green-200'
      case 'cancelled':
        return 'bg-red-100 text-red-700 border-red-200'
      case 'holiday':
        return 'bg-blue-100 text-blue-700 border-blue-200'
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  const getLectureTypeColor = (type: string) => {
    switch (type) {
      case 'lab':
        return 'bg-purple-100 text-purple-700'
      case 'tutorial':
        return 'bg-orange-100 text-orange-700'
      default:
        return 'bg-indigo-100 text-indigo-700'
    }
  }

  return (
    <div className={`group relative h-full w-full p-3 rounded-xl border transition-all duration-200 hover:shadow-lg hover:scale-[1.02] bg-white ${entry.status === 'cancelled' ? 'opacity-60 grayscale' : ''}`}>
      {/* Header with status and type */}
      <div className="flex items-center justify-between mb-2 gap-2">
        <span className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full border ${getStatusColor(entry.status)}`}>
          {entry.status}
        </span>
        <span className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full ${getLectureTypeColor(entry.lectureType || 'theory')}`}>
          {entry.lectureType || 'Theory'}
        </span>
      </div>

      {/* Subject Title */}
      <div className="mb-2">
        <h4 className="text-sm font-bold text-gray-900 line-clamp-2 min-h-[2.5rem] group-hover:text-blue-600 transition-colors">
          {entry.subject?.title || 'Unknown Subject'}
        </h4>
      </div>

      {/* Details Grid */}
      <div className="space-y-1.5">
        {viewType === 'class' ? (
          <div className="flex items-center text-xs text-gray-600">
            <User size={12} className="mr-1.5 text-gray-400 group-hover:text-blue-500 transition-colors" />
            <span className="truncate">{entry.teacher?.name || 'No Teacher'}</span>
          </div>
        ) : (
          <div className="flex items-center text-xs text-gray-600">
            <Tag size={12} className="mr-1.5 text-gray-400 group-hover:text-blue-500 transition-colors" />
            <span className="truncate">{entry.class?.title || 'No Class'}</span>
          </div>
        )}

        <div className="flex items-center text-xs text-gray-600">
          <MapPin size={12} className="mr-1.5 text-gray-400 group-hover:text-blue-500 transition-colors" />
          <span className="truncate">Room: {entry.room}</span>
        </div>
      </div>

      {/* Progress or Tooltip decoration */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-100 rounded-b-xl overflow-hidden">
        <div 
          className={`h-full transition-all duration-500 ${
            entry.status === 'active' ? 'bg-blue-500' : 
            entry.status === 'cancelled' ? 'bg-red-500' : 'bg-gray-400'
          }`} 
          style={{ width: entry.status === 'active' ? '100%' : '0%' }}
        />
      </div>
    </div>
  )
}

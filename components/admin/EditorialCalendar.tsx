'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Calendar, ChevronLeft, ChevronRight, Plus, Filter, Users, Clock, CheckCircle, AlertTriangle } from 'lucide-react'

interface CalendarEvent {
  id: string
  title: string
  type: 'deadline' | 'publication' | 'review' | 'meeting' | 'milestone'
  date: string
  time?: string
  author?: {
    _id: string
    name: string
    image?: { asset: { url: string } }
  }
  status: 'scheduled' | 'in_progress' | 'completed' | 'overdue'
  priority: 'high' | 'medium' | 'low'
  description?: string
  relatedContent?: {
    _id: string
    title: string
  }
}

const EditorialCalendar: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [view, setView] = useState<'month' | 'week' | 'day'>('month')
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [filters, setFilters] = useState({
    type: 'all',
    status: 'all',
    author: 'all'
  })

  const eventTypeConfig = {
    deadline: { label: 'Deadline', color: 'bg-red-100 text-red-800', icon: Clock },
    publication: { label: 'Publication', color: 'bg-green-100 text-green-800', icon: CheckCircle },
    review: { label: 'Review', color: 'bg-yellow-100 text-yellow-800', icon: Users },
    meeting: { label: 'Meeting', color: 'bg-blue-100 text-blue-800', icon: Users },
    milestone: { label: 'Milestone', color: 'bg-purple-100 text-purple-800', icon: CheckCircle }
  }

  const statusConfig = {
    scheduled: { label: 'Scheduled', color: 'bg-gray-100 text-gray-800' },
    in_progress: { label: 'In Progress', color: 'bg-blue-100 text-blue-800' },
    completed: { label: 'Completed', color: 'bg-green-100 text-green-800' },
    overdue: { label: 'Overdue', color: 'bg-red-100 text-red-800' }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Editorial Calendar</h1>
          <p className="text-muted-foreground">Plan and track content deadlines and milestones</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={view} onValueChange={(value: 'month' | 'week' | 'day') => setView(value)}>
            <SelectTrigger className="w-[120px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="month">Month</SelectItem>
              <SelectItem value="week">Week</SelectItem>
              <SelectItem value="day">Day</SelectItem>
            </SelectContent>
          </Select>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Event
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() - 1)))}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={() => setCurrentDate(new Date())}>
                Today
              </Button>
              <Button variant="outline" size="sm" onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() + 1)))}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-muted-foreground">
            <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Calendar view will be implemented here</p>
            <p className="text-sm">This would show a full calendar interface with events</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default EditorialCalendar
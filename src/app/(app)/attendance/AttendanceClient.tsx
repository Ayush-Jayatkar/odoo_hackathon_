'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Clock, Calendar as CalendarIcon } from 'lucide-react'

interface AttendanceRecord {
    id: string
    date: Date
    checkIn: Date | null
    checkOut: Date | null
    status: string
}

const STATUS_COLORS: Record<string, string> = {
    PRESENT: 'bg-[var(--meadow)] text-white',
    ABSENT: 'bg-[var(--rose)] text-white',
    HALF_DAY: 'bg-[var(--dawn)] text-white',
    LEAVE: 'bg-[var(--dusk)] text-white',
}

export function AttendanceClient({
    records,
    todayRecord,
    currentMonth,
    currentYear,
}: {
    records: AttendanceRecord[]
    todayRecord: AttendanceRecord | null
    currentMonth: number
    currentYear: number
}) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)

    const handleCheckIn = async () => {
        setLoading(true)
        try {
            const res = await fetch('/api/attendance/check-in', { method: 'POST' })
            const data = await res.json()
            if (!res.ok) { toast.error(data.error); return }
            toast.success('Checked in successfully')
            router.refresh()
        } finally {
            setLoading(false)
        }
    }

    const handleCheckOut = async () => {
        setLoading(true)
        try {
            const res = await fetch('/api/attendance/check-out', { method: 'POST' })
            const data = await res.json()
            if (!res.ok) { toast.error(data.error); return }
            toast.success('Checked out successfully')
            router.refresh()
        } finally {
            setLoading(false)
        }
    }

    // Generate calendar days
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate()
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay()

    const calendarDays = []
    for (let i = 0; i < firstDayOfMonth; i++) {
        calendarDays.push(null)
    }
    for (let i = 1; i <= daysInMonth; i++) {
        calendarDays.push(i)
    }

    // Weekly strip (last 7 days)
    const today = new Date()
    const weeklyStrip = Array.from({ length: 7 }).map((_, i) => {
        const d = new Date(today)
        d.setDate(d.getDate() - (6 - i))
        const record = records.find(r => new Date(r.date).getDate() === d.getDate() && new Date(r.date).getMonth() === d.getMonth())
        return {
            date: d,
            status: record?.status || null,
        }
    })

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Today's Control */}
            <Card className="md:col-span-1 shadow-soft">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                        <Clock className="w-5 h-5 text-primary" /> Today's Status
                    </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col items-center justify-center py-6 space-y-6">
                    <div className="text-center">
                        <p className="text-sm text-muted-foreground mb-1">
                            {new Date().toLocaleDateString('en-IN', { weekday: 'long', month: 'long', day: 'numeric' })}
                        </p>
                        <p className="text-3xl font-mono font-bold">
                            {new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}
                        </p>
                    </div>

                    <div className="w-full space-y-3">
                        {!todayRecord?.checkIn ? (
                            <Button
                                onClick={handleCheckIn}
                                disabled={loading}
                                className="checkin-btn w-full bg-[var(--meadow)] hover:bg-[var(--meadow)]/90 text-white h-12 text-lg font-semibold"
                            >
                                {loading ? 'Checking in…' : '✓ Check In'}
                            </Button>
                        ) : !todayRecord?.checkOut ? (
                            <Button
                                onClick={handleCheckOut}
                                disabled={loading}
                                className="checkin-btn w-full bg-[var(--dawn)] hover:bg-[var(--dawn)]/90 text-white h-12 text-lg font-semibold"
                            >
                                {loading ? 'Checking out…' : '↩ Check Out'}
                            </Button>
                        ) : (
                            <div className="w-full bg-[var(--meadow)]/10 text-[var(--meadow)] border border-[var(--meadow)]/30 text-center py-3 rounded-md font-medium flex items-center justify-center gap-2">
                                <span>✓</span> Completed for today
                            </div>
                        )}
                    </div>

                    {todayRecord?.checkIn && (
                        <div className="w-full text-sm space-y-2 pt-4 border-t">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Check In</span>
                                <span className="font-medium">{new Date(todayRecord.checkIn).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}</span>
                            </div>
                            {todayRecord.checkOut && (
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Check Out</span>
                                    <span className="font-medium">{new Date(todayRecord.checkOut).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}</span>
                                </div>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>

            <div className="md:col-span-2 space-y-6">
                {/* Weekly Strip */}
                <Card className="shadow-soft">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Last 7 Days</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex justify-between items-center">
                            {weeklyStrip.map((day, i) => (
                                <div key={i} className="flex flex-col items-center gap-2">
                                    <span className="text-xs text-muted-foreground">{day.date.toLocaleDateString('en-IN', { weekday: 'short' })}</span>
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${day.status ? STATUS_COLORS[day.status] : 'bg-secondary text-muted-foreground'}`}>
                                        {day.date.getDate()}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Monthly Calendar */}
                <Card className="shadow-soft">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <CalendarIcon className="w-5 h-5 text-primary" /> Monthly Overview
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-7 gap-1 text-center mb-2">
                            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
                                <div key={d} className="text-xs font-medium text-muted-foreground py-1">{d}</div>
                            ))}
                        </div>
                        <div className="grid grid-cols-7 gap-1">
                            {calendarDays.map((day, i) => {
                                if (!day) return <div key={`empty-${i}`} className="aspect-square" />

                                const record = records.find(r => new Date(r.date).getDate() === day)
                                const isToday = day === new Date().getDate()

                                return (
                                    <div
                                        key={day}
                                        className={`aspect-square rounded-md flex items-center justify-center text-sm relative
                      ${record?.status ? STATUS_COLORS[record.status] : 'bg-secondary/30 text-foreground'}
                      ${isToday ? 'ring-2 ring-primary ring-offset-2' : ''}
                    `}
                                    >
                                        {day}
                                    </div>
                                )
                            })}
                        </div>
                        <div className="flex flex-wrap gap-4 mt-6 text-xs">
                            <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-[var(--meadow)]" /> Present</div>
                            <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-[var(--rose)]" /> Absent</div>
                            <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-[var(--dawn)]" /> Half Day</div>
                            <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-[var(--dusk)]" /> Leave</div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

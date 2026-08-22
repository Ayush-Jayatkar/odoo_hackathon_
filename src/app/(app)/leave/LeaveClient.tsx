'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { EmptyState } from '@/components/ui/empty-state'
import { CalendarX, Loader2, Thermometer, Palmtree, Ban, CalendarDays, Plus, X } from 'lucide-react'

const STATUS_COLORS: Record<string, string> = {
    APPROVED: 'bg-[var(--meadow)]/10 text-[var(--meadow)] border-l-[var(--meadow)]',
    REJECTED: 'bg-[var(--rose)]/10 text-[var(--rose)] border-l-[var(--rose)]',
    PENDING: 'bg-[var(--dawn)]/10 text-[var(--dawn)] border-l-[var(--dawn)]',
}

const LEAVE_TYPES = [
    { value: 'SICK', label: 'Sick', icon: Thermometer },
    { value: 'PAID', label: 'Paid', icon: Palmtree },
    { value: 'UNPAID', label: 'Unpaid', icon: Ban },
] as const

// Hardcoded annual quotas — no quota field in schema yet, safe fast default
const QUOTAS: Record<string, number> = { PAID: 24, SICK: 7 }

const leaveSchema = z.object({
    leaveType: z.enum(['SICK', 'PAID', 'UNPAID']),
    startDate: z.string().min(1, 'Start date is required'),
    endDate: z.string().min(1, 'End date is required'),
    remarks: z.string().optional(),
}).refine((data) => new Date(data.endDate) >= new Date(data.startDate), {
    message: 'End date must be on or after start date',
    path: ['endDate'],
}).refine((data) => data.leaveType !== 'UNPAID' || (data.remarks && data.remarks.length > 0), {
    message: 'Remarks are required for unpaid leave',
    path: ['remarks'],
})

function daysBetween(a: string, b: string) {
    if (!a || !b) return null
    const diff = (new Date(b).getTime() - new Date(a).getTime()) / 86400000
    return diff >= 0 ? diff + 1 : null
}

function relativeDate(dateStr: string) {
    const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000)
    if (diff === 0) return 'Applied today'
    if (diff === 1) return 'Applied yesterday'
    return `Applied ${diff} days ago`
}

// Build a Sun–Sat month grid for a given year/month (0-indexed month)
function buildMonth(year: number, month: number) {
    const first = new Date(Date.UTC(year, month, 1))
    const startOffset = first.getUTCDay()
    const daysInMonth = new Date(Date.UTC(year, month + 1, 0)).getUTCDate()
    const cells: (Date | null)[] = Array(startOffset).fill(null)
    for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(Date.UTC(year, month, d)))
    while (cells.length % 7 !== 0) cells.push(null)
    return cells
}

function toKey(d: Date) {
    return d.toISOString().slice(0, 10)
}

const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
const WEEKDAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

export function LeaveClient({ records }: { records: any[] }) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [errors, setErrors] = useState<Record<string, string>>({})
    const [showForm, setShowForm] = useState(false)

    const [leaveType, setLeaveType] = useState<'SICK' | 'PAID' | 'UNPAID'>('SICK')
    const [startDate, setStartDate] = useState('')
    const [endDate, setEndDate] = useState('')
    const [remarks, setRemarks] = useState('')

    const duration = useMemo(() => daysBetween(startDate, endDate), [startDate, endDate])
    const year = new Date().getUTCFullYear()

    // Map every date covered by a leave record -> status
    const dayStatusMap = useMemo(() => {
        const map = new Map<string, string>()
        for (const r of records) {
            const start = new Date(r.startDate)
            const end = new Date(r.endDate)
            for (let d = new Date(start); d <= end; d.setUTCDate(d.getUTCDate() + 1)) {
                map.set(toKey(d), r.status)
            }
        }
        return map
    }, [records])

    // Used days per type this year (APPROVED only)
    const usedDays = useMemo(() => {
        const used: Record<string, number> = { PAID: 0, SICK: 0 }
        for (const r of records) {
            if (r.status !== 'APPROVED') continue
            if (new Date(r.startDate).getUTCFullYear() !== year) continue
            const days = daysBetween(r.startDate, r.endDate) ?? 0
            if (r.leaveType === 'PAID') used.PAID += days
            if (r.leaveType === 'SICK') used.SICK += days
        }
        return used
    }, [records, year])

    const months = useMemo(() => Array.from({ length: 12 }, (_, m) => buildMonth(year, m)), [year])
    const todayKey = toKey(new Date())

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setErrors({})

        const startUTC = startDate ? new Date(startDate).toISOString() : ''
        const endUTC = endDate ? new Date(endDate).toISOString() : ''

        const result = leaveSchema.safeParse({ leaveType, startDate: startUTC, endDate: endUTC, remarks })
        if (!result.success) {
            const errs: Record<string, string> = {}
            result.error.issues.forEach((i) => { errs[String(i.path[0])] = i.message })
            setErrors(errs)
            return
        }

        setLoading(true)
        try {
            const res = await fetch('/api/leave', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(result.data),
            })
            const data = await res.json()
            if (!res.ok) { toast.error(data.error); return }

            toast.success('Leave request submitted')
            setStartDate('')
            setEndDate('')
            setRemarks('')
            setShowForm(false)
            router.refresh()
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-serif font-bold">Time Off</h1>
                <Button onClick={() => setShowForm((v) => !v)} className="bg-primary text-primary-foreground">
                    {showForm ? <><X className="w-4 h-4 mr-2" /> Close</> : <><Plus className="w-4 h-4 mr-2" /> New Request</>}
                </Button>
            </div>

            {/* Balance cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-card rounded-2xl shadow-soft p-5">
                    <p className="text-sm font-medium text-primary">Paid Time Off</p>
                    <p className="text-3xl font-mono font-bold mt-1">
                        {Math.max(QUOTAS.PAID - usedDays.PAID, 0)} <span className="text-sm text-muted-foreground font-sans font-normal">Days Available</span>
                    </p>
                </div>
                <div className="bg-card rounded-2xl shadow-soft p-5">
                    <p className="text-sm font-medium text-primary">Sick Time Off</p>
                    <p className="text-3xl font-mono font-bold mt-1">
                        {Math.max(QUOTAS.SICK - usedDays.SICK, 0)} <span className="text-sm text-muted-foreground font-sans font-normal">Days Available</span>
                    </p>
                </div>
            </div>

            {/* Collapsible apply form */}
            {showForm && (
                <Card className="shadow-soft rounded-2xl">
                    <CardHeader>
                        <CardTitle className="text-lg">Apply for Leave</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
                            <div className="space-y-2">
                                <Label>Leave Type</Label>
                                <div className="grid grid-cols-3 gap-2">
                                    {LEAVE_TYPES.map(({ value, label, icon: Icon }) => (
                                        <button
                                            type="button"
                                            key={value}
                                            onClick={() => setLeaveType(value)}
                                            className={`flex flex-col items-center gap-1 rounded-xl border py-3 text-xs font-medium transition-all ${leaveType === value
                                                ? 'border-primary bg-primary/10 text-primary'
                                                : 'border-border text-muted-foreground hover:border-primary/40'
                                                }`}
                                        >
                                            <Icon className="w-4 h-4" />
                                            {label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-2">
                                    <Label>Start Date</Label>
                                    <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} disabled={loading} />
                                    {errors.startDate && <p className="text-xs text-destructive">{errors.startDate}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label>End Date</Label>
                                    <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} disabled={loading} />
                                    {errors.endDate && <p className="text-xs text-destructive">{errors.endDate}</p>}
                                </div>
                            </div>

                            {duration !== null && (
                                <div className="flex items-center gap-2 text-xs font-medium text-primary bg-primary/5 rounded-lg px-3 py-2">
                                    <CalendarDays className="w-3.5 h-3.5" />
                                    {duration} day{duration > 1 ? 's' : ''} of leave
                                </div>
                            )}

                            <div className="space-y-2">
                                <Label>Remarks {leaveType === 'UNPAID' && <span className="text-destructive">*</span>}</Label>
                                <Textarea value={remarks} onChange={(e) => setRemarks(e.target.value)} placeholder="Reason for leave..." disabled={loading} />
                                {errors.remarks && <p className="text-xs text-destructive">{errors.remarks}</p>}
                            </div>

                            <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground h-11" disabled={loading}>
                                {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Submitting…</> : 'Submit Request'}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            )}

            {/* Year calendar */}
            <Card className="shadow-soft rounded-2xl">
                <CardContent className="pt-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        {months.map((cells, m) => (
                            <div key={m}>
                                <p className="text-xs font-semibold mb-2">{MONTH_NAMES[m]} {year}</p>
                                <div className="grid grid-cols-7 gap-[2px] text-[10px] text-center">
                                    {WEEKDAY_LABELS.map((w, i) => (
                                        <span key={i} className="text-muted-foreground font-medium">{w}</span>
                                    ))}
                                    {cells.map((d, i) => {
                                        if (!d) return <span key={i} />
                                        const key = toKey(d)
                                        const status = dayStatusMap.get(key)
                                        const isToday = key === todayKey
                                        return (
                                            <span
                                                key={i}
                                                className={`w-full aspect-square flex items-center justify-center rounded-full
                                                    ${status === 'APPROVED' ? 'bg-[var(--meadow)]/20 text-[var(--meadow)] font-semibold' : ''}
                                                    ${status === 'PENDING' ? 'bg-[var(--dawn)]/20 text-[var(--dawn)] font-semibold' : ''}
                                                    ${isToday ? 'ring-1 ring-primary' : ''}
                                                `}
                                            >
                                                {d.getUTCDate()}
                                            </span>
                                        )
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="flex gap-4 mt-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-[var(--meadow)]/40" /> Approved</span>
                        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-[var(--dawn)]/40" /> Pending</span>
                    </div>
                </CardContent>
            </Card>

            {/* History */}
            <Card className="shadow-soft rounded-2xl">
                <CardHeader>
                    <CardTitle className="text-lg">Leave History</CardTitle>
                </CardHeader>
                <CardContent>
                    {records.length === 0 ? (
                        <EmptyState icon={CalendarX} title="No leave requests yet" description="Use New Request above to apply." />
                    ) : (
                        <div className="space-y-3">
                            {records.map((record) => {
                                const typeInfo = LEAVE_TYPES.find((t) => t.value === record.leaveType)
                                const Icon = typeInfo?.icon ?? CalendarDays
                                return (
                                    <div key={record.id} className={`flex items-center justify-between gap-4 rounded-xl border-l-4 bg-muted/30 px-4 py-3 ${STATUS_COLORS[record.status]}`}>
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-full bg-card flex items-center justify-center shrink-0">
                                                <Icon className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-sm capitalize text-foreground">{record.leaveType.toLowerCase()} Leave</p>
                                                <p className="text-xs text-muted-foreground">
                                                    {new Date(record.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} – {new Date(record.endDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} · {relativeDate(record.createdAt)}
                                                </p>
                                            </div>
                                        </div>
                                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full shrink-0 ${STATUS_COLORS[record.status]}`}>{record.status}</span>
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
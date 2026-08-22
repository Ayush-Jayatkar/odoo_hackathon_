'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

const STATUS_COLORS: Record<string, string> = {
    APPROVED: 'bg-[var(--meadow)]/10 text-[var(--meadow)]',
    REJECTED: 'bg-[var(--rose)]/10 text-[var(--rose)]',
    PENDING: 'bg-[var(--dawn)]/10 text-[var(--dawn)]',
}

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

export function LeaveClient({ records }: { records: any[] }) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [errors, setErrors] = useState<Record<string, string>>({})

    const [leaveType, setLeaveType] = useState<'SICK' | 'PAID' | 'UNPAID'>('SICK')
    const [startDate, setStartDate] = useState('')
    const [endDate, setEndDate] = useState('')
    const [remarks, setRemarks] = useState('')

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
            router.refresh()
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Apply Form */}
            <Card className="lg:col-span-1 shadow-soft h-fit">
                <CardHeader>
                    <CardTitle className="text-lg">Apply for Leave</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label>Leave Type</Label>
                            <Select value={leaveType} onValueChange={(v: any) => setLeaveType(v)}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="SICK">Sick Leave</SelectItem>
                                    <SelectItem value="PAID">Paid Leave</SelectItem>
                                    <SelectItem value="UNPAID">Unpaid Leave</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

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

                        <div className="space-y-2">
                            <Label>Remarks {leaveType === 'UNPAID' && <span className="text-destructive">*</span>}</Label>
                            <Textarea
                                value={remarks}
                                onChange={(e) => setRemarks(e.target.value)}
                                placeholder="Reason for leave..."
                                disabled={loading}
                            />
                            {errors.remarks && <p className="text-xs text-destructive">{errors.remarks}</p>}
                        </div>

                        <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground" disabled={loading}>
                            {loading ? 'Submitting...' : 'Submit Request'}
                        </Button>
                    </form>
                </CardContent>
            </Card>

            {/* History */}
            <Card className="lg:col-span-2 shadow-soft">
                <CardHeader>
                    <CardTitle className="text-lg">Leave History</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Type</TableHead>
                                <TableHead>Duration</TableHead>
                                <TableHead>Applied On</TableHead>
                                <TableHead>Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {records.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                                        No leave requests found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                records.map((record) => (
                                    <TableRow key={record.id}>
                                        <TableCell className="font-medium capitalize">{record.leaveType.toLowerCase()}</TableCell>
                                        <TableCell>
                                            {new Date(record.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} -
                                            {new Date(record.endDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                                        </TableCell>
                                        <TableCell className="text-muted-foreground">
                                            {new Date(record.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                        </TableCell>
                                        <TableCell>
                                            <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${STATUS_COLORS[record.status]}`}>
                                                {record.status}
                                            </span>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}

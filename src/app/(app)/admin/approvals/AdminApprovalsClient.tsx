'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { EmptyState } from '@/components/ui/empty-state'
import { Check, X, ClipboardList, History } from 'lucide-react'

const STATUS_COLORS: Record<string, string> = {
    APPROVED: 'bg-[var(--meadow)]/10 text-[var(--meadow)]',
    REJECTED: 'bg-[var(--rose)]/10 text-[var(--rose)]',
    PENDING: 'bg-[var(--dawn)]/10 text-[var(--dawn)]',
}

export function AdminApprovalsClient({ records }: { records: any[] }) {
    const router = useRouter()
    const [loadingId, setLoadingId] = useState<string | null>(null)
    const [comments, setComments] = useState<Record<string, string>>({})

    const pendingRecords = records.filter((r) => r.status === 'PENDING')
    const historyRecords = records.filter((r) => r.status !== 'PENDING')

    const handleAction = async (id: string, status: 'APPROVED' | 'REJECTED') => {
        setLoadingId(id)
        try {
            const res = await fetch(`/api/leave/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status, adminComment: comments[id] || '' }),
            })
            const data = await res.json()
            if (!res.ok) { toast.error(data.error); return }

            toast.success(`Leave request ${status.toLowerCase()}`)
            router.refresh()
        } finally {
            setLoadingId(null)
        }
    }

    const renderTable = (data: any[], isPending: boolean) => (
        data.length === 0 ? (
            <EmptyState
                icon={isPending ? ClipboardList : History}
                title={isPending ? 'No pending requests' : 'No approval history yet'}
                description={isPending ? 'All leave requests have been reviewed.' : 'Approved and rejected requests will appear here.'}
            />
        ) : (
        <div className="overflow-x-auto">
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Remarks</TableHead>
                    {isPending ? <TableHead>Action</TableHead> : <TableHead>Status & Comment</TableHead>}
                </TableRow>
            </TableHeader>
            <TableBody>
                {data.map((record) => (
                    <TableRow key={record.id}>
                        <TableCell>
                            <div className="flex flex-col">
                                <span className="font-medium">{record.user.profile?.fullName}</span>
                                <span className="text-xs text-muted-foreground">{record.user.employeeId}</span>
                            </div>
                        </TableCell>
                        <TableCell className="capitalize">{record.leaveType.toLowerCase()}</TableCell>
                        <TableCell className="whitespace-nowrap">
                            {new Date(record.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} –{' '}
                            {new Date(record.endDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                        </TableCell>
                        <TableCell className="max-w-xs truncate" title={record.remarks}>
                            {record.remarks || '—'}
                        </TableCell>
                        <TableCell>
                            {isPending ? (
                                <div className="flex items-center gap-2">
                                    <Input
                                        placeholder="Comment (optional)"
                                        className="h-8 text-xs w-32"
                                        value={comments[record.id] || ''}
                                        onChange={(e) => setComments({ ...comments, [record.id]: e.target.value })}
                                        disabled={loadingId === record.id}
                                    />
                                    <Button
                                        size="icon"
                                        variant="outline"
                                        className="h-8 w-8 text-[var(--meadow)] hover:text-[var(--meadow)] hover:bg-[var(--meadow)]/10"
                                        onClick={() => handleAction(record.id, 'APPROVED')}
                                        disabled={loadingId === record.id}
                                    >
                                        <Check className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        size="icon"
                                        variant="outline"
                                        className="h-8 w-8 text-[var(--rose)] hover:text-[var(--rose)] hover:bg-[var(--rose)]/10"
                                        onClick={() => handleAction(record.id, 'REJECTED')}
                                        disabled={loadingId === record.id}
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>
                            ) : (
                                <div className="flex flex-col gap-1">
                                    <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full w-fit ${STATUS_COLORS[record.status]}`}>
                                        {record.status}
                                    </span>
                                    {record.adminComment && (
                                        <span className="text-xs text-muted-foreground truncate max-w-[200px]" title={record.adminComment}>
                                            {record.adminComment}
                                        </span>
                                    )}
                                </div>
                            )}
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
        </div>
        )
    )


    return (
        <div className="space-y-6">
            <Card className="shadow-soft">
                <CardHeader>
                    <CardTitle className="text-lg">Pending Approvals</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    {renderTable(pendingRecords, true)}
                </CardContent>
            </Card>

            <Card className="shadow-soft">
                <CardHeader>
                    <CardTitle className="text-lg">Approval History</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    {renderTable(historyRecords, false)}
                </CardContent>
            </Card>
        </div>
    )
}

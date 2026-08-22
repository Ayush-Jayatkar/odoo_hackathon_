'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Search } from 'lucide-react'

interface AttendanceRecord {
    id: string
    date: Date
    checkIn: Date | null
    checkOut: Date | null
    status: string
    user: {
        employeeId: string
        profile: {
            fullName: string
            department: string | null
        } | null
    }
}

const STATUS_COLORS: Record<string, string> = {
    PRESENT: 'bg-[var(--meadow)]/10 text-[var(--meadow)]',
    ABSENT: 'bg-[var(--rose)]/10 text-[var(--rose)]',
    HALF_DAY: 'bg-[var(--dawn)]/10 text-[var(--dawn)]',
    LEAVE: 'bg-[var(--dusk)]/10 text-[var(--dusk)]',
}

export function AdminAttendanceClient({
    records,
    departments,
}: {
    records: AttendanceRecord[]
    departments: string[]
}) {
    const [search, setSearch] = useState('')
    const [department, setDepartment] = useState<string>('ALL')
    const [dateFilter, setDateFilter] = useState<string>('')

    const filteredRecords = records.filter((record) => {
        const matchesSearch =
            record.user.profile?.fullName.toLowerCase().includes(search.toLowerCase()) ||
            record.user.employeeId.toLowerCase().includes(search.toLowerCase())

        const matchesDept = department === 'ALL' || record.user.profile?.department === department

        const matchesDate = !dateFilter || new Date(record.date).toISOString().slice(0, 10) === dateFilter

        return matchesSearch && matchesDept && matchesDate
    })

    return (
        <Card className="shadow-soft">
            <div className="p-4 border-b flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search employee..."
                        className="pl-9"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <Select value={department} onValueChange={setDepartment}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Department" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="ALL">All Departments</SelectItem>
                        {departments.map((dept) => (
                            <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <Input
                    type="date"
                    className="w-[180px]"
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                />
            </div>
            <CardContent className="p-0">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Date</TableHead>
                            <TableHead>Employee</TableHead>
                            <TableHead>Department</TableHead>
                            <TableHead>Check In</TableHead>
                            <TableHead>Check Out</TableHead>
                            <TableHead>Status</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredRecords.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                    No attendance records found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredRecords.map((record) => (
                                <TableRow key={record.id}>
                                    <TableCell className="font-medium">
                                        {new Date(record.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span className="font-medium">{record.user.profile?.fullName}</span>
                                            <span className="text-xs text-muted-foreground">{record.user.employeeId}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>{record.user.profile?.department || '—'}</TableCell>
                                    <TableCell>
                                        {record.checkIn ? new Date(record.checkIn).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }) : '—'}
                                    </TableCell>
                                    <TableCell>
                                        {record.checkOut ? new Date(record.checkOut).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }) : '—'}
                                    </TableCell>
                                    <TableCell>
                                        <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${STATUS_COLORS[record.status] || 'bg-secondary text-muted-foreground'}`}>
                                            {record.status.replace('_', ' ')}
                                        </span>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    )
}

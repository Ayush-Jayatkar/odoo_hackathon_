'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { EmptyState } from '@/components/ui/empty-state'
import { Search, Download, CalendarOff } from 'lucide-react'

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

    const handleDownloadCSV = () => {
        const headers = ['Date', 'Employee ID', 'Name', 'Department', 'Check In', 'Check Out', 'Status']
        const csvRows = [headers.join(',')]

        filteredRecords.forEach((record) => {
            const date = new Date(record.date).toLocaleDateString('en-IN')
            const empId = record.user.employeeId
            const name = `"${record.user.profile?.fullName || ''}"`
            const dept = `"${record.user.profile?.department || ''}"`
            const checkIn = record.checkIn ? new Date(record.checkIn).toLocaleTimeString('en-IN') : ''
            const checkOut = record.checkOut ? new Date(record.checkOut).toLocaleTimeString('en-IN') : ''
            const status = record.status

            csvRows.push([date, empId, name, dept, checkIn, checkOut, status].join(','))
        })

        const csvString = csvRows.join('\n')
        const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' })
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.setAttribute('download', `Attendance_Report_${new Date().toISOString().slice(0, 10)}.csv`)
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(url)
    }

    return (
        <Card className="shadow-soft">
            <div className="p-4 border-b flex flex-col md:flex-row gap-4 items-start md:items-center">
                <div className="relative flex-1 w-full max-w-sm">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search employee..."
                        className="pl-9"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <Select value={department} onValueChange={(v) => setDepartment(v ?? 'ALL')}>
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
                <div className="flex-1 hidden md:block" />
                <Button variant="outline" onClick={handleDownloadCSV} className="w-full md:w-auto shrink-0">
                    <Download className="w-4 h-4 mr-2" />
                    Download CSV
                </Button>
            </div>
            <CardContent className="p-0">
                <div className="overflow-x-auto">
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
                                <TableCell colSpan={6} className="p-0">
                                    <EmptyState
                                        icon={CalendarOff}
                                        title="No attendance records found"
                                        description="Try adjusting your search, department, or date filters."
                                    />
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
                </div>
            </CardContent>
        </Card>
    )
}

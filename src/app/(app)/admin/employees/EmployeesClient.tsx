'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { EmptyState } from '@/components/ui/empty-state'
import { Search, ArrowRight, Users } from 'lucide-react'

interface Employee {
    id: string
    employeeId: string
    email: string
    role: string
    createdAt: string
    profile: {
        fullName: string
        jobTitle: string | null
        department: string | null
        profilePicUrl: string | null
    } | null
}

function Avatar({ name, picUrl }: { name: string; picUrl: string | null }) {
    const initials = name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .substring(0, 2)

    if (picUrl) {
        return (
            // eslint-disable-next-line @next/next/no-img-element
            <img
                src={picUrl}
                alt={name}
                className="w-9 h-9 rounded-full object-cover shrink-0"
            />
        )
    }

    return (
        <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary shrink-0">
            {initials}
        </div>
    )
}

export function EmployeesClient({
    employees,
    departments,
}: {
    employees: Employee[]
    departments: string[]
}) {
    const [search, setSearch] = useState('')
    const [deptFilter, setDeptFilter] = useState('ALL')

    const filtered = employees.filter((emp) => {
        const term = search.toLowerCase()
        const matchesSearch =
            emp.profile?.fullName.toLowerCase().includes(term) ||
            emp.employeeId.toLowerCase().includes(term) ||
            emp.email.toLowerCase().includes(term)

        const matchesDept =
            deptFilter === 'ALL' || emp.profile?.department === deptFilter

        return matchesSearch && matchesDept
    })

    return (
        <Card className="shadow-soft">
            {/* Filters */}
            <div className="p-4 border-b flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        id="employee-search"
                        placeholder="Search by name or ID…"
                        className="pl-9"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <Select value={deptFilter} onValueChange={(v) => setDeptFilter(v ?? 'ALL')}>
                    <SelectTrigger id="dept-filter" className="w-full sm:w-[200px]">
                        <SelectValue placeholder="All Departments" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="ALL">All Departments</SelectItem>
                        {departments.map((dept) => (
                            <SelectItem key={dept} value={dept}>
                                {dept}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <CardContent className="p-0">
                <div className="overflow-x-auto">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-12" />
                            <TableHead>Employee</TableHead>
                            <TableHead className="hidden sm:table-cell">Role</TableHead>
                            <TableHead className="hidden md:table-cell">Department</TableHead>
                            <TableHead className="text-right">Action</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filtered.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="p-0">
                                    <EmptyState
                                        icon={Users}
                                        title="No employees found"
                                        description={search || deptFilter !== 'ALL' ? 'Try adjusting your search or department filter.' : 'No employees have been added yet.'}
                                    />
                                </TableCell>
                            </TableRow>
                        ) : (
                            filtered.map((emp) => (
                                <TableRow key={emp.id} className="group">
                                    <TableCell>
                                        <Avatar
                                            name={emp.profile?.fullName ?? emp.employeeId}
                                            picUrl={emp.profile?.profilePicUrl ?? null}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span className="font-medium text-sm">
                                                {emp.profile?.fullName ?? '—'}
                                            </span>
                                            <span className="text-xs text-muted-foreground">
                                                {emp.employeeId} · {emp.email}
                                            </span>
                                            {emp.profile?.jobTitle && (
                                                <span className="text-xs text-muted-foreground">
                                                    {emp.profile.jobTitle}
                                                </span>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell className="hidden sm:table-cell">
                                        <Badge
                                            variant="secondary"
                                            className="text-xs capitalize"
                                        >
                                            {emp.role.toLowerCase()}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                                        {emp.profile?.department ?? '—'}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Link
                                            href={`/admin/employees/${emp.id}`}
                                            id={`view-${emp.id}`}
                                            className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline group-hover:gap-2 transition-all"
                                        >
                                            View
                                            <ArrowRight className="w-4 h-4" />
                                        </Link>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
                </div>
                {filtered.length > 0 && (
                    <div className="px-4 py-3 border-t text-xs text-muted-foreground">
                        Showing {filtered.length} of {employees.length} employee{employees.length !== 1 ? 's' : ''}
                    </div>
                )}
            </CardContent>
        </Card>
    )
}

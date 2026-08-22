'use client'

import { useRouter } from 'next/navigation'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { ChevronLeft, ChevronRight, User, Calendar as CalendarIcon, Banknote, CalendarOff, Download } from 'lucide-react'
import Image from 'next/image'
import { jsPDF } from 'jspdf'

// ─── Types ────────────────────────────────────────────────────────────────────

interface AttendanceRecord {
    id: string
    date: string
    checkIn: string | null
    checkOut: string | null
    status: string
}

interface LeaveRecord {
    id: string
    leaveType: string
    startDate: string
    endDate: string
    remarks: string | null
    status: string
    adminComment: string | null
    createdAt: string
}

interface SalaryData {
    baseSalary: number
    allowances: number
    deductions: number
    netSalary: number
    effectiveDate: string
    employeeName: string
    employeeId: string
    department: string
}

interface EmployeeData {
    id: string
    employeeId: string
    email: string
    role: string
    profile: {
        fullName: string
        phone: string | null
        address: string | null
        jobTitle: string | null
        department: string | null
        dateOfJoining: string | null
        profilePicUrl: string | null
    } | null
    salary: SalaryData | null
    attendance: AttendanceRecord[]
    leaveRequests: LeaveRecord[]
}

interface EmployeeListItem {
    id: string
    name: string
    employeeId: string
}

// ─── Constants ────────────────────────────────────────────────────────────────

const STATUS_COLORS: Record<string, string> = {
    PRESENT: 'bg-[var(--meadow)] text-white',
    ABSENT: 'bg-[var(--rose)] text-white',
    HALF_DAY: 'bg-[var(--dawn)] text-white',
    LEAVE: 'bg-[var(--dusk)] text-white',
}

const LEAVE_STATUS_COLORS: Record<string, string> = {
    APPROVED: 'bg-[var(--meadow)]/10 text-[var(--meadow)]',
    REJECTED: 'bg-[var(--rose)]/10 text-[var(--rose)]',
    PENDING: 'bg-[var(--dawn)]/10 text-[var(--dawn)]',
}

const formatINR = (amount: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount)

const formatINRPdf = (amount: number) =>
    'Rs. ' + new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(amount)

// ─── Sub-components ───────────────────────────────────────────────────────────

function ProfileTab({ data }: { data: EmployeeData }) {
    const initials = (data.profile?.fullName ?? 'U')
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .substring(0, 2)

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-card rounded-2xl shadow-soft p-6 flex items-center gap-6">
                <div className="shrink-0">
                    {data.profile?.profilePicUrl ? (
                        <div className="w-20 h-20 rounded-full overflow-hidden">
                            <Image
                                src={data.profile.profilePicUrl}
                                alt="Profile"
                                width={80}
                                height={80}
                                className="object-cover w-full h-full"
                            />
                        </div>
                    ) : (
                        <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center text-2xl font-bold text-primary">
                            {initials}
                        </div>
                    )}
                </div>
                <div className="flex-1 min-w-0">
                    <h2 className="text-2xl font-serif font-bold">{data.profile?.fullName ?? 'Unknown'}</h2>
                    <p className="text-muted-foreground">
                        {data.profile?.jobTitle}
                        {data.profile?.department ? ` · ${data.profile.department}` : ''}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                        {data.employeeId} · {data.email}
                    </p>
                </div>
            </div>

            {/* Personal details */}
            <div className="bg-card rounded-xl shadow-soft p-6 space-y-4">
                <h3 className="font-semibold flex items-center gap-2"><User className="w-4 h-4" /> Personal Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-sm">
                    <FieldRow label="Full Name" value={data.profile?.fullName ?? '—'} />
                    <FieldRow label="Email" value={data.email} />
                    <FieldRow label="Phone" value={data.profile?.phone ?? '—'} />
                    <FieldRow label="Address" value={data.profile?.address ?? '—'} />
                </div>
            </div>

            {/* Job details */}
            <div className="bg-card rounded-xl shadow-soft p-6 space-y-4">
                <h3 className="font-semibold">Job Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-sm">
                    <FieldRow label="Job Title" value={data.profile?.jobTitle ?? '—'} />
                    <FieldRow label="Department" value={data.profile?.department ?? '—'} />
                    <FieldRow
                        label="Date of Joining"
                        value={
                            data.profile?.dateOfJoining
                                ? new Date(data.profile.dateOfJoining).toLocaleDateString('en-IN', {
                                      day: 'numeric',
                                      month: 'long',
                                      year: 'numeric',
                                  })
                                : '—'
                        }
                    />
                    <FieldRow label="Employee ID" value={data.employeeId} />
                </div>
            </div>

            {/* Salary summary */}
            {data.salary && (
                <div className="bg-card rounded-xl shadow-soft p-6 space-y-4">
                    <h3 className="font-semibold">Salary Summary</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[
                            { label: 'Net Salary', value: data.salary.netSalary, color: 'var(--meadow)' },
                            { label: 'Basic', value: data.salary.baseSalary, color: 'var(--midday)' },
                            { label: 'Allowances', value: data.salary.allowances, color: 'var(--dawn)' },
                            { label: 'Deductions', value: data.salary.deductions, color: 'var(--rose)' },
                        ].map((s) => (
                            <div key={s.label} className="flex flex-col gap-1">
                                <span className="text-2xl font-mono font-bold" style={{ color: s.color }}>
                                    ₹{s.value.toLocaleString('en-IN')}
                                </span>
                                <span className="text-xs text-muted-foreground">{s.label}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}

function AttendanceTab({
    records,
    currentMonth,
    currentYear,
}: {
    records: AttendanceRecord[]
    currentMonth: number
    currentYear: number
}) {
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate()
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay()

    const calendarDays: (number | null)[] = []
    for (let i = 0; i < firstDayOfMonth; i++) calendarDays.push(null)
    for (let i = 1; i <= daysInMonth; i++) calendarDays.push(i)

    const today = new Date()
    const weeklyStrip = Array.from({ length: 7 }).map((_, i) => {
        const d = new Date(today)
        d.setDate(d.getDate() - (6 - i))
        const rec = records.find(
            (r) =>
                new Date(r.date).getDate() === d.getDate() &&
                new Date(r.date).getMonth() === d.getMonth()
        )
        return { date: d, status: rec?.status ?? null }
    })

    const presentDays = records.filter((r) => r.status === 'PRESENT').length
    const absentDays = records.filter((r) => r.status === 'ABSENT').length
    const halfDays = records.filter((r) => r.status === 'HALF_DAY').length

    return (
        <div className="space-y-6">
            {/* Summary chips */}
            <div className="grid grid-cols-3 gap-4">
                {[
                    { label: 'Present', value: presentDays, color: 'var(--meadow)' },
                    { label: 'Absent', value: absentDays, color: 'var(--rose)' },
                    { label: 'Half Days', value: halfDays, color: 'var(--dawn)' },
                ].map((s) => (
                    <div key={s.label} className="bg-card rounded-xl shadow-soft p-4 flex flex-col">
                        <span className="text-3xl font-mono font-bold" style={{ color: s.color }}>
                            {s.value}
                        </span>
                        <span className="text-xs text-muted-foreground mt-1">{s.label}</span>
                    </div>
                ))}
            </div>

            <Card className="shadow-soft">
                <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                        Last 7 Days
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex justify-between items-center">
                        {weeklyStrip.map((day, i) => (
                            <div key={i} className="flex flex-col items-center gap-2">
                                <span className="text-xs text-muted-foreground">
                                    {day.date.toLocaleDateString('en-IN', { weekday: 'short' })}
                                </span>
                                <div
                                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${day.status ? STATUS_COLORS[day.status] : 'bg-secondary text-muted-foreground'}`}
                                >
                                    {day.date.getDate()}
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            <Card className="shadow-soft">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                        <CalendarIcon className="w-5 h-5 text-primary" /> Monthly Overview
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-7 gap-1 text-center mb-2">
                        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d) => (
                            <div key={d} className="text-xs font-medium text-muted-foreground py-1">{d}</div>
                        ))}
                    </div>
                    <div className="grid grid-cols-7 gap-1">
                        {calendarDays.map((day, i) => {
                            if (!day) return <div key={`empty-${i}`} className="aspect-square" />
                            const record = records.find((r) => new Date(r.date).getDate() === day)
                            const isToday = day === today.getDate() && today.getMonth() === currentMonth

                            return (
                                <div
                                    key={day}
                                    className={`aspect-square rounded-md flex items-center justify-center text-sm
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
    )
}

function LeaveTab({ records }: { records: LeaveRecord[] }) {
    return (
        <Card className="shadow-soft">
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
                            <TableHead>Remarks</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {records.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                    No leave requests found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            records.map((record) => (
                                <TableRow key={record.id}>
                                    <TableCell className="font-medium capitalize">
                                        {record.leaveType.toLowerCase()}
                                    </TableCell>
                                    <TableCell>
                                        {new Date(record.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} –{' '}
                                        {new Date(record.endDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                                    </TableCell>
                                    <TableCell className="text-muted-foreground">
                                        {new Date(record.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                    </TableCell>
                                    <TableCell>
                                        <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${LEAVE_STATUS_COLORS[record.status] ?? ''}`}>
                                            {record.status}
                                        </span>
                                    </TableCell>
                                    <TableCell className="max-w-xs truncate text-muted-foreground text-sm" title={record.remarks ?? ''}>
                                        {record.remarks || '—'}
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

function PayrollTab({ salary }: { salary: SalaryData | null }) {
    if (!salary) {
        return (
            <div className="bg-card rounded-xl shadow-soft p-8 text-center text-muted-foreground">
                No salary information available for this employee.
            </div>
        )
    }

    const handleDownload = () => {
        const doc = new jsPDF()
        doc.setFontSize(22)
        doc.text('Dayflow HRMS', 20, 20)
        doc.setFontSize(14)
        doc.text('Payslip', 20, 30)
        doc.setFontSize(11)
        doc.text(`Employee Name: ${salary.employeeName}`, 20, 45)
        doc.text(`Employee ID:   ${salary.employeeId}`, 20, 52)
        doc.text(`Department:    ${salary.department}`, 20, 59)
        doc.text(`Effective Date: ${new Date(salary.effectiveDate).toLocaleDateString('en-IN')}`, 20, 66)
        doc.setLineWidth(0.5)
        doc.line(20, 75, 190, 75)
        doc.text('Description', 20, 85)
        doc.text('Amount', 150, 85)
        doc.line(20, 90, 190, 90)
        doc.text('Base Salary', 20, 100)
        doc.text(formatINRPdf(salary.baseSalary), 150, 100)
        doc.text('Allowances', 20, 110)
        doc.text(formatINRPdf(salary.allowances), 150, 110)
        doc.text('Deductions', 20, 120)
        doc.text(`- ${formatINRPdf(salary.deductions)}`, 150, 120)
        doc.line(20, 130, 190, 130)
        doc.setFont(undefined as unknown as string, 'bold')
        doc.text('Net Salary', 20, 140)
        doc.text(formatINRPdf(salary.netSalary), 150, 140)
        doc.save(`Payslip_${salary.employeeId}_${new Date().toISOString().slice(0, 7)}.pdf`)
    }

    return (
        <Card className="shadow-soft">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                    <Banknote className="w-5 h-5 text-primary" /> Current Payslip
                </CardTitle>
                <Button variant="outline" size="sm" onClick={handleDownload}>
                    <Download className="w-4 h-4 mr-2" /> Download PDF
                </Button>
            </CardHeader>
            <CardContent className="pt-6">
                <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                            <p className="text-muted-foreground">Effective Date</p>
                            <p className="font-medium">
                                {new Date(salary.effectiveDate).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
                            </p>
                        </div>
                        <div className="text-right">
                            <p className="text-muted-foreground">Net Salary</p>
                            <p className="text-2xl font-mono font-bold text-[var(--meadow)]">{formatINR(salary.netSalary)}</p>
                        </div>
                    </div>
                    <div className="border rounded-lg overflow-hidden">
                        <div className="bg-muted/50 p-3 grid grid-cols-2 font-medium text-sm">
                            <div>Earnings / Deductions</div>
                            <div className="text-right">Amount</div>
                        </div>
                        <div className="p-3 grid grid-cols-2 text-sm border-b">
                            <div>Base Salary</div>
                            <div className="text-right font-mono">{formatINR(salary.baseSalary)}</div>
                        </div>
                        <div className="p-3 grid grid-cols-2 text-sm border-b">
                            <div>Allowances</div>
                            <div className="text-right font-mono text-[var(--meadow)]">+{formatINR(salary.allowances)}</div>
                        </div>
                        <div className="p-3 grid grid-cols-2 text-sm border-b bg-rose/5">
                            <div>Deductions</div>
                            <div className="text-right font-mono text-[var(--rose)]">-{formatINR(salary.deductions)}</div>
                        </div>
                        <div className="p-3 grid grid-cols-2 text-sm font-bold bg-muted/20">
                            <div>Total Net Salary</div>
                            <div className="text-right font-mono text-[var(--meadow)]">{formatINR(salary.netSalary)}</div>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}

function FieldRow({ label, value }: { label: string; value: string }) {
    return (
        <div className="space-y-1">
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className="font-medium">{value}</p>
        </div>
    )
}

// ─── Main Component ────────────────────────────────────────────────────────────

export function EmployeeDetailClient({
    employeeData,
    employeeList,
    currentMonth,
    currentYear,
}: {
    employeeData: EmployeeData
    employeeList: EmployeeListItem[]
    currentMonth: number
    currentYear: number
}) {
    const router = useRouter()

    const currentIndex = employeeList.findIndex((e) => e.id === employeeData.id)
    const prevEmployee = currentIndex > 0 ? employeeList[currentIndex - 1] : null
    const nextEmployee = currentIndex < employeeList.length - 1 ? employeeList[currentIndex + 1] : null

    const navigateTo = (id: string) => {
        router.push(`/admin/employees/${id}`)
    }

    const displayName = employeeData.profile?.fullName ?? employeeData.employeeId

    return (
        <div className="max-w-5xl space-y-6">
            {/* Page heading + Back */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <button
                    onClick={() => router.push('/admin/employees')}
                    className="hover:text-foreground transition-colors"
                >
                    Employees
                </button>
                <span>/</span>
                <span className="text-foreground font-medium">{displayName}</span>
            </div>

            {/* Employee Switcher Bar */}
            <div className="bg-card rounded-xl shadow-soft p-4 flex items-center gap-3">
                <Button
                    id="prev-employee-btn"
                    variant="outline"
                    size="icon"
                    onClick={() => prevEmployee && navigateTo(prevEmployee.id)}
                    disabled={!prevEmployee}
                    className="shrink-0"
                    aria-label="Previous employee"
                >
                    <ChevronLeft className="w-4 h-4" />
                </Button>

                <div className="flex-1 min-w-0">
                    <Select value={employeeData.id} onValueChange={(v) => v && navigateTo(v)}>
                        <SelectTrigger id="employee-switcher" className="w-full">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {employeeList.map((emp) => (
                                <SelectItem key={emp.id} value={emp.id}>
                                    <span className="font-medium">{emp.name}</span>
                                    <span className="text-muted-foreground ml-2 text-xs">
                                        {emp.employeeId}
                                    </span>
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <Button
                    id="next-employee-btn"
                    variant="outline"
                    size="icon"
                    onClick={() => nextEmployee && navigateTo(nextEmployee.id)}
                    disabled={!nextEmployee}
                    className="shrink-0"
                    aria-label="Next employee"
                >
                    <ChevronRight className="w-4 h-4" />
                </Button>

                <div className="text-xs text-muted-foreground shrink-0 hidden sm:block">
                    {currentIndex + 1} / {employeeList.length}
                </div>
            </div>

            {/* Tabs */}
            <Tabs defaultValue="profile">
                <TabsList className="flex w-full">
                    <TabsTrigger value="profile" id="tab-profile" className="flex items-center gap-1.5">
                        <User className="w-4 h-4" />
                        <span className="hidden sm:inline">Profile</span>
                    </TabsTrigger>
                    <TabsTrigger value="attendance" id="tab-attendance" className="flex items-center gap-1.5">
                        <CalendarIcon className="w-4 h-4" />
                        <span className="hidden sm:inline">Attendance</span>
                    </TabsTrigger>
                    <TabsTrigger value="leave" id="tab-leave" className="flex items-center gap-1.5">
                        <CalendarOff className="w-4 h-4" />
                        <span className="hidden sm:inline">Leave</span>
                    </TabsTrigger>
                    <TabsTrigger value="payroll" id="tab-payroll" className="flex items-center gap-1.5">
                        <Banknote className="w-4 h-4" />
                        <span className="hidden sm:inline">Payroll</span>
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="profile" className="mt-6">
                    <ProfileTab data={employeeData} />
                </TabsContent>

                <TabsContent value="attendance" className="mt-6">
                    <AttendanceTab
                        records={employeeData.attendance}
                        currentMonth={currentMonth}
                        currentYear={currentYear}
                    />
                </TabsContent>

                <TabsContent value="leave" className="mt-6">
                    <LeaveTab records={employeeData.leaveRequests} />
                </TabsContent>

                <TabsContent value="payroll" className="mt-6">
                    <PayrollTab salary={employeeData.salary} />
                </TabsContent>
            </Tabs>
        </div>
    )
}

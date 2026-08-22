'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Search, Save, Pencil, X } from 'lucide-react'

const formatINR = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0,
    }).format(amount)
}

export function AdminPayrollClient({ employees }: { employees: any[] }) {
    const router = useRouter()
    const [search, setSearch] = useState('')
    const [editingId, setEditingId] = useState<string | null>(null)
    const [editValues, setEditValues] = useState<{ baseSalary: number; allowances: number; deductions: number } | null>(null)
    const [saving, setSaving] = useState(false)

    const filteredEmployees = employees.filter((emp) => {
        const term = search.toLowerCase()
        return (
            emp.profile?.fullName?.toLowerCase().includes(term) ||
            emp.employeeId.toLowerCase().includes(term) ||
            emp.profile?.department?.toLowerCase().includes(term)
        )
    })

    const startEdit = (emp: any) => {
        setEditingId(emp.id)
        setEditValues({
            baseSalary: emp.salary?.baseSalary || 0,
            allowances: emp.salary?.allowances || 0,
            deductions: emp.salary?.deductions || 0,
        })
    }

    const cancelEdit = () => {
        setEditingId(null)
        setEditValues(null)
    }

    const handleSave = async (userId: string) => {
        if (!editValues) return
        setSaving(true)
        try {
            const res = await fetch(`/api/salary/${userId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(editValues),
            })
            const data = await res.json()
            if (!res.ok) { toast.error(data.error); return }

            toast.success('Salary updated successfully')
            setEditingId(null)
            router.refresh()
        } finally {
            setSaving(false)
        }
    }

    return (
        <Card className="shadow-soft">
            <div className="p-4 border-b">
                <div className="relative max-w-sm">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search employee or department..."
                        className="pl-9"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>
            <CardContent className="p-0">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Employee</TableHead>
                            <TableHead>Department</TableHead>
                            <TableHead className="text-right">Base Salary</TableHead>
                            <TableHead className="text-right">Allowances</TableHead>
                            <TableHead className="text-right">Deductions</TableHead>
                            <TableHead className="text-right">Net Salary</TableHead>
                            <TableHead className="text-center">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredEmployees.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                                    No employees found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredEmployees.map((emp) => {
                                const isEditing = editingId === emp.id
                                const currentNet = emp.salary ? emp.salary.baseSalary + emp.salary.allowances - emp.salary.deductions : 0
                                const editNet = editValues ? editValues.baseSalary + editValues.allowances - editValues.deductions : 0

                                return (
                                    <TableRow key={emp.id}>
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <span className="font-medium">{emp.profile?.fullName || 'Unknown'}</span>
                                                <span className="text-xs text-muted-foreground">{emp.employeeId}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>{emp.profile?.department || '—'}</TableCell>

                                        {isEditing && editValues ? (
                                            <>
                                                <TableCell className="text-right">
                                                    <Input
                                                        type="number"
                                                        className="w-24 h-8 text-right ml-auto font-mono text-xs"
                                                        value={editValues.baseSalary}
                                                        onChange={(e) => setEditValues({ ...editValues, baseSalary: Number(e.target.value) })}
                                                    />
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <Input
                                                        type="number"
                                                        className="w-24 h-8 text-right ml-auto font-mono text-xs text-[var(--meadow)]"
                                                        value={editValues.allowances}
                                                        onChange={(e) => setEditValues({ ...editValues, allowances: Number(e.target.value) })}
                                                    />
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <Input
                                                        type="number"
                                                        className="w-24 h-8 text-right ml-auto font-mono text-xs text-[var(--rose)]"
                                                        value={editValues.deductions}
                                                        onChange={(e) => setEditValues({ ...editValues, deductions: Number(e.target.value) })}
                                                    />
                                                </TableCell>
                                                <TableCell className="text-right font-mono font-bold text-[var(--meadow)]">
                                                    {formatINR(editNet)}
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    <div className="flex items-center justify-center gap-2">
                                                        <Button size="icon" variant="ghost" className="h-8 w-8 text-[var(--meadow)]" onClick={() => handleSave(emp.id)} disabled={saving}>
                                                            <Save className="h-4 w-4" />
                                                        </Button>
                                                        <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground" onClick={cancelEdit} disabled={saving}>
                                                            <X className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </>
                                        ) : (
                                            <>
                                                <TableCell className="text-right font-mono text-sm">{emp.salary ? formatINR(emp.salary.baseSalary) : '—'}</TableCell>
                                                <TableCell className="text-right font-mono text-sm text-[var(--meadow)]">{emp.salary ? `+${formatINR(emp.salary.allowances)}` : '—'}</TableCell>
                                                <TableCell className="text-right font-mono text-sm text-[var(--rose)]">{emp.salary ? `-${formatINR(emp.salary.deductions)}` : '—'}</TableCell>
                                                <TableCell className="text-right font-mono font-bold text-[var(--meadow)]">{emp.salary ? formatINR(currentNet) : '—'}</TableCell>
                                                <TableCell className="text-center">
                                                    <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => startEdit(emp)}>
                                                        <Pencil className="h-4 w-4" />
                                                    </Button>
                                                </TableCell>
                                            </>
                                        )}
                                    </TableRow>
                                )
                            })
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    )
}

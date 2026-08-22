'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Plane, User as UserIcon } from 'lucide-react'

interface Employee {
    id: string
    employeeId: string
    fullName: string
    jobTitle: string
    profilePicUrl: string | null
    status: 'PRESENT' | 'LEAVE' | 'ABSENT'
}

export function EmployeesGridClient({ employees }: { employees: Employee[] }) {
    const [search, setSearch] = useState('')
    const router = useRouter()

    const filtered = employees.filter((e) =>
        e.fullName.toLowerCase().includes(search.toLowerCase())
    )

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-serif font-bold">Employees</h1>
                <Input
                    placeholder="Search"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="max-w-xs"
                />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {filtered.map((emp) => (
                    <button
                        key={emp.id}
                        onClick={() => router.push(`/admin/employees/${emp.id}`)}
                        className="bg-card rounded-2xl shadow-soft p-4 text-left hover:-translate-y-0.5 hover:shadow-lg transition-all"
                    >
                        <div className="relative w-16 h-16 mb-3">
                            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                                {emp.profilePicUrl ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img src={emp.profilePicUrl} alt={emp.fullName} className="w-full h-full object-cover" />
                                ) : (
                                    <UserIcon className="w-8 h-8 text-muted-foreground" />
                                )}
                            </div>
                            <span className="absolute -top-1 -right-1">
                                {emp.status === 'PRESENT' && (
                                    <span className="block w-4 h-4 rounded-full bg-green-500 border-2 border-white" />
                                )}
                                {emp.status === 'LEAVE' && (
                                    <span className="block w-5 h-5 rounded-full bg-blue-100 border-2 border-white flex items-center justify-center">
                                        <Plane className="w-3 h-3 text-blue-600" />
                                    </span>
                                )}
                                {emp.status === 'ABSENT' && (
                                    <span className="block w-4 h-4 rounded-full bg-yellow-400 border-2 border-white" />
                                )}
                            </span>
                        </div>
                        <p className="font-semibold text-sm truncate">{emp.fullName}</p>
                        <p className="text-xs text-muted-foreground truncate">{emp.jobTitle}</p>
                    </button>
                ))}
            </div>
        </div>
    )
}
'use client'

import { useState, useRef } from 'react'
import Image from 'next/image'
import { toast } from 'sonner'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Pencil, Save, X, User } from 'lucide-react'

interface Profile {
    fullName: string
    phone: string | null
    address: string | null
    jobTitle: string | null
    department: string | null
    dateOfJoining: string | null
    profilePicUrl: string | null
}

interface UserData {
    employeeId: string
    email: string
    role: string
    profile: Profile | null
    salary: { netSalary: number; baseSalary: number; allowances: number; deductions: number } | null
}

const phoneRegex = /^(\+\d{1,3}[-\s]?)?(\d{10}|\d{3}[-\s]\d{3}[-\s]\d{4})$/

const editSchema = z.object({
    phone: z.string().refine((v) => !v || phoneRegex.test(v), { message: 'Invalid phone format' }).optional(),
    address: z.string().max(300).optional(),
})

export function ProfileClient({ userData, isAdminView }: { userData: UserData; isAdminView: boolean }) {
    const [editing, setEditing] = useState(false)
    const [phone, setPhone] = useState(userData.profile?.phone ?? '')
    const [address, setAddress] = useState(userData.profile?.address ?? '')
    const [profilePicUrl, setProfilePicUrl] = useState(userData.profile?.profilePicUrl ?? '')
    const [errors, setErrors] = useState<Record<string, string>>({})
    const [saving, setSaving] = useState(false)
    const fileRef = useRef<HTMLInputElement>(null)

    const handlePicChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return
        if (file.size > 1_000_000) { toast.error('Image must be under 1 MB'); return }
        const reader = new FileReader()
        reader.onload = (ev) => setProfilePicUrl(ev.target?.result as string)
        reader.readAsDataURL(file)
    }

    const handleSave = async () => {
        setErrors({})
        const result = editSchema.safeParse({ phone: phone || undefined, address: address || undefined })
        if (!result.success) {
            const errs: Record<string, string> = {}
            result.error.issues.forEach((i) => { errs[String(i.path[0])] = i.message })
            setErrors(errs)
            return
        }
        setSaving(true)
        try {
            const res = await fetch('/api/profile', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phone: phone || null, address: address || null, profilePicUrl: profilePicUrl || null }),
            })
            const data = await res.json()
            if (!res.ok) { toast.error(data.error); return }
            toast.success('Profile updated')
            setEditing(false)
        } finally {
            setSaving(false)
        }
    }

    const initials = (userData.profile?.fullName ?? 'U')
        .split(' ').map((n) => n[0]).join('').toUpperCase().substring(0, 2)

    return (
        <div className="max-w-3xl space-y-6">
            {/* Header card */}
            <div className="bg-card rounded-2xl shadow-soft p-6 flex items-center gap-6">
                {/* Avatar */}
                <div className="relative shrink-0">
                    {profilePicUrl ? (
                        <div className="w-20 h-20 rounded-full overflow-hidden">
                            <Image src={profilePicUrl} alt="Profile" width={80} height={80} className="object-cover w-full h-full" />
                        </div>
                    ) : (
                        <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center text-2xl font-bold text-primary">
                            {initials}
                        </div>
                    )}
                    {editing && (
                        <button
                            onClick={() => fileRef.current?.click()}
                            className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-primary text-white flex items-center justify-center shadow"
                        >
                            <Pencil className="w-3 h-3" />
                        </button>
                    )}
                    <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePicChange} />
                </div>

                <div className="flex-1 min-w-0">
                    <h1 className="text-2xl font-serif font-bold">{userData.profile?.fullName ?? 'Unknown'}</h1>
                    <p className="text-muted-foreground">
                        {userData.profile?.jobTitle}{userData.profile?.department ? ` · ${userData.profile.department}` : ''}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">{userData.employeeId} · {userData.email}</p>
                </div>

                <div className="shrink-0 flex gap-2">
                    {!editing ? (
                        <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
                            <Pencil className="w-4 h-4 mr-2" /> Edit
                        </Button>
                    ) : (
                        <>
                            <Button variant="outline" size="sm" onClick={() => setEditing(false)} disabled={saving}>
                                <X className="w-4 h-4 mr-2" /> Cancel
                            </Button>
                            <Button size="sm" onClick={handleSave} disabled={saving}>
                                <Save className="w-4 h-4 mr-2" /> {saving ? 'Saving…' : 'Save'}
                            </Button>
                        </>
                    )}
                </div>
            </div>

            {/* Personal details */}
            <div className="bg-card rounded-xl shadow-soft p-6 space-y-6">
                <h2 className="font-semibold text-base flex items-center gap-2"><User className="w-4 h-4" /> Personal Details</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <Field label="Full Name" value={userData.profile?.fullName ?? '—'} readOnly />
                    <Field label="Email" value={userData.email} readOnly />

                    <div className="space-y-1">
                        <Label htmlFor="phone">Phone</Label>
                        {editing ? (
                            <>
                                <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91-9876543210" />
                                {errors.phone && <p className="text-xs text-destructive">{errors.phone}</p>}
                            </>
                        ) : (
                            <p className="text-sm text-foreground">{phone || '—'}</p>
                        )}
                    </div>

                    <div className="space-y-1 md:col-span-2">
                        <Label htmlFor="address">Address</Label>
                        {editing ? (
                            <>
                                <Input id="address" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="123 Main St, City" />
                                {errors.address && <p className="text-xs text-destructive">{errors.address}</p>}
                            </>
                        ) : (
                            <p className="text-sm text-foreground">{address || '—'}</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Job details (read-only for employees) */}
            <div className="bg-card rounded-xl shadow-soft p-6 space-y-4">
                <h2 className="font-semibold text-base">Job Details</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <Field label="Job Title" value={userData.profile?.jobTitle ?? '—'} readOnly />
                    <Field label="Department" value={userData.profile?.department ?? '—'} readOnly />
                    <Field
                        label="Date of Joining"
                        value={userData.profile?.dateOfJoining
                            ? new Date(userData.profile.dateOfJoining).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
                            : '—'}
                        readOnly
                    />
                    <Field label="Employee ID" value={userData.employeeId} readOnly />
                </div>
            </div>

            {/* Salary summary */}
            {userData.salary && (
                <div className="bg-card rounded-xl shadow-soft p-6 space-y-4">
                    <h2 className="font-semibold text-base">Salary Summary</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[
                            { label: 'Net Salary', value: userData.salary.netSalary, color: 'var(--meadow)' },
                            { label: 'Basic', value: userData.salary.baseSalary, color: 'var(--midday)' },
                            { label: 'Allowances', value: userData.salary.allowances, color: 'var(--dawn)' },
                            { label: 'Deductions', value: userData.salary.deductions, color: 'var(--rose)' },
                        ].map((s) => (
                            <div key={s.label} className="flex flex-col gap-1">
                                <span
                                    className="text-2xl font-mono font-bold"
                                    style={{ color: s.color }}
                                >
                                    ₹{s.value.toLocaleString('en-IN')}
                                </span>
                                <span className="text-xs text-muted-foreground">{s.label}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Documents placeholder */}
            <div className="bg-card rounded-xl shadow-soft p-6">
                <h2 className="font-semibold text-base mb-3">Documents</h2>
                <div className="border-2 border-dashed border-border rounded-lg p-8 text-center text-muted-foreground text-sm">
                    Document uploads coming soon
                </div>
            </div>
        </div>
    )
}

function Field({ label, value, readOnly }: { label: string; value: string; readOnly?: boolean }) {
    return (
        <div className="space-y-1">
            <Label>{label}</Label>
            <p className="text-sm text-foreground">{value}</p>
        </div>
    )
}

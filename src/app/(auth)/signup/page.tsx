'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'

const signupSchema = z.object({
    employeeId: z.string().min(1, 'Employee ID is required'),
    fullName: z.string().min(1, 'Full name is required'),
    email: z.string().email('Invalid email address'),
    password: z
        .string()
        .min(8, 'Password must be at least 8 characters')
        .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
        .regex(/[0-9]/, 'Password must contain at least one number'),
})

export default function SignupPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [errors, setErrors] = useState<Record<string, string>>({})
    const [apiError, setApiError] = useState('')
    const [verifyMode, setVerifyMode] = useState(false)
    const [verifyEmail, setVerifyEmail] = useState('')
    const [devCode, setDevCode] = useState('')
    const [verifyCode, setVerifyCode] = useState('')

    const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setErrors({})
        setApiError('')

        const formData = new FormData(e.currentTarget)
        const data = Object.fromEntries(formData.entries())

        const result = signupSchema.safeParse(data)
        if (!result.success) {
            const formattedErrors: Record<string, string> = {}
            result.error.issues.forEach((issue) => {
                formattedErrors[String(issue.path[0])] = issue.message
            })
            setErrors(formattedErrors)
            return
        }

        setLoading(true)
        try {
            const res = await fetch('/api/auth/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            })

            const resData = await res.json()

            if (!res.ok) {
                setApiError(resData.error || 'Signup failed. Please try again.')
                return
            }

            setVerifyEmail(data.email as string)
            setDevCode(resData.devModeVerifyCode)
            setVerifyMode(true)
            toast.success('Account created!')
        } catch (error) {
            toast.error('An unexpected error occurred')
        } finally {
            setLoading(false)
        }
    }

    const handleVerify = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        if (verifyCode.length !== 6) {
            toast.error('Code must be 6 digits')
            return
        }

        setLoading(true)
        try {
            const res = await fetch('/api/auth/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: verifyEmail, code: verifyCode }),
            })

            const data = await res.json()

            if (!res.ok) {
                toast.error(data.error)
                return
            }

            toast.success('Email verified! You can now log in.')
            router.push('/login')
        } catch (error) {
            toast.error('An unexpected error occurred')
        } finally {
            setLoading(false)
        }
    }

    if (verifyMode) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background p-4">
                <Card className="w-full max-w-md shadow-soft border-none">
                    <div className="h-1 w-full flow-line rounded-t-xl" />
                    <CardHeader className="space-y-2 text-center pb-6">
                        <CardTitle className="text-2xl font-serif text-foreground">Verify Email</CardTitle>
                        <CardDescription>Enter the code sent to {verifyEmail}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="bg-accent/20 border border-accent rounded-md p-4 mb-6 text-center">
                            <p className="text-xs font-semibold text-accent-foreground uppercase tracking-wider mb-1">Dev Mode Preview</p>
                            <p className="text-2xl font-mono tracking-widest">{devCode}</p>
                        </div>
                        <form onSubmit={handleVerify} className="space-y-4">
                            <div className="space-y-2 text-left">
                                <Label htmlFor="code">Verification Code</Label>
                                <Input
                                    id="code"
                                    value={verifyCode}
                                    onChange={(e) => setVerifyCode(e.target.value)}
                                    placeholder="123456"
                                    maxLength={6}
                                    className="text-center text-lg tracking-widest font-mono"
                                    disabled={loading}
                                />
                            </div>
                            <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground h-11" disabled={loading}>
                                {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Verifying…</> : 'Verify Account'}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
            <Card className="w-full max-w-md shadow-soft border-none">
                <div className="h-1 w-full flow-line rounded-t-xl" />
                <CardHeader className="space-y-2 text-center pb-6">
                    <CardTitle className="text-2xl font-serif text-foreground">Join Dayflow</CardTitle>
                    <CardDescription>Create your employee account.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSignup} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2 text-left">
                                <Label htmlFor="employeeId">Employee ID</Label>
                                <Input id="employeeId" name="employeeId" placeholder="EMP123" disabled={loading} />
                                {errors.employeeId && <p className="text-xs text-destructive">{errors.employeeId}</p>}
                            </div>
                            <div className="space-y-2 text-left">
                                <Label htmlFor="fullName">Full Name</Label>
                                <Input id="fullName" name="fullName" placeholder="Jane Doe" disabled={loading} />
                                {errors.fullName && <p className="text-xs text-destructive">{errors.fullName}</p>}
                            </div>
                        </div>
                        <div className="space-y-2 text-left">
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" name="email" type="email" placeholder="name@dayflow.dev" disabled={loading} />
                            {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
                        </div>
                        <div className="space-y-2 text-left">
                            <Label htmlFor="password">Password</Label>
                            <Input id="password" name="password" type="password" disabled={loading} />
                            {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
                        </div>
                        <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground h-11" disabled={loading}>
                            {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Creating account…</> : 'Create Account'}
                        </Button>
                        {apiError && (
                            <p className="text-sm text-center text-destructive">{apiError}</p>
                        )}
                    </form>
                </CardContent>
                <CardFooter className="flex justify-center border-t p-4 mt-2">
                    <p className="text-sm text-muted-foreground">
                        Already have an account?{' '}
                        <Link href="/login" className="text-primary hover:underline font-medium">
                            Sign in
                        </Link>
                    </p>
                </CardFooter>
            </Card>
        </div>
    )
}

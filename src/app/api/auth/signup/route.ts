import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/db'
import { hashPassword } from '@/lib/auth'

const signupSchema = z.object({
    employeeId: z.string().min(1, 'Employee ID is required'),
    email: z.string().email('Invalid email address'),
    password: z
        .string()
        .min(8, 'Password must be at least 8 characters')
        .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
        .regex(/[0-9]/, 'Password must contain at least one number'),
    fullName: z.string().min(1, 'Full name is required'),
})

export async function POST(req: Request) {
    try {
        const body = await req.json()
        const result = signupSchema.safeParse(body)

        if (!result.success) {
            return NextResponse.json({ error: result.error.errors[0].message }, { status: 400 })
        }

        const { employeeId, email, password, fullName } = result.data

        // Check if user exists
        const existingUser = await prisma.user.findFirst({
            where: {
                OR: [{ email }, { employeeId }],
            },
        })

        if (existingUser) {
            return NextResponse.json(
                { error: 'User with this email or Employee ID already exists' },
                { status: 400 }
            )
        }

        const passwordHash = await hashPassword(password)
        const verifyCode = Math.floor(100000 + Math.random() * 900000).toString() // 6-digit code

        // Create user and profile in a transaction
        const user = await prisma.user.create({
            data: {
                employeeId,
                email,
                passwordHash,
                role: 'EMPLOYEE',
                verifyCode,
                profile: {
                    create: {
                        fullName,
                    },
                },
            },
        })

        return NextResponse.json(
            {
                message: 'Signup successful. Please verify your email.',
                // DEV MODE ONLY: Return the code to show on the UI
                devModeVerifyCode: verifyCode,
            },
            { status: 201 }
        )
    } catch (error) {
        console.error('Signup error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

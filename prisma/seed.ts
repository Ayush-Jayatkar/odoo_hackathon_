import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

function toUTCDate(dateStr: string): Date {
    return new Date(dateStr + 'T00:00:00.000Z')
}

function randomTime(baseDate: string, hour: number, minuteJitter = 15): Date {
    const d = new Date(baseDate + 'T00:00:00.000Z')
    d.setUTCHours(hour, Math.floor(Math.random() * minuteJitter), 0, 0)
    return d
}

// Get weekdays in August 2026 (current month) up to today (22nd)
function getAugWeekdays(): string[] {
    const days: string[] = []
    for (let d = 1; d <= 22; d++) {
        const date = new Date(`2026-08-${String(d).padStart(2, '0')}T00:00:00.000Z`)
        const dow = date.getUTCDay()
        if (dow !== 0 && dow !== 6) days.push(`2026-08-${String(d).padStart(2, '0')}`)
    }
    return days
}

// ─── data ─────────────────────────────────────────────────────────────────────

const employees = [
    {
        employeeId: 'EMP001',
        email: 'arjun.sharma@dayflow.dev',
        fullName: 'Arjun Sharma',
        jobTitle: 'Senior Software Engineer',
        department: 'Engineering',
        phone: '+91-9876543201',
        address: 'Flat 4B, Andheri West, Mumbai',
        dateOfJoining: '2024-03-15',
        baseSalary: 120000,
        allowances: 20000,
        deductions: 12000,
    },
    {
        employeeId: 'EMP002',
        email: 'priya.nair@dayflow.dev',
        fullName: 'Priya Nair',
        jobTitle: 'Frontend Developer',
        department: 'Engineering',
        phone: '+91-9876543202',
        address: '12, Koregaon Park, Pune',
        dateOfJoining: '2024-07-01',
        baseSalary: 90000,
        allowances: 15000,
        deductions: 9000,
    },
    {
        employeeId: 'EMP003',
        email: 'rohan.desai@dayflow.dev',
        fullName: 'Rohan Desai',
        jobTitle: 'DevOps Engineer',
        department: 'Engineering',
        phone: '+91-9876543203',
        address: 'HSR Layout, Bengaluru',
        dateOfJoining: '2025-01-10',
        baseSalary: 105000,
        allowances: 18000,
        deductions: 10500,
    },
    {
        employeeId: 'EMP004',
        email: 'sneha.patel@dayflow.dev',
        fullName: 'Sneha Patel',
        jobTitle: 'Sales Executive',
        department: 'Sales',
        phone: '+91-9876543204',
        address: 'Satellite, Ahmedabad',
        dateOfJoining: '2024-09-23',
        baseSalary: 70000,
        allowances: 10000,
        deductions: 7000,
    },
    {
        employeeId: 'EMP005',
        email: 'vikram.mishra@dayflow.dev',
        fullName: 'Vikram Mishra',
        jobTitle: 'Sales Manager',
        department: 'Sales',
        phone: '+91-9876543205',
        address: 'Gomti Nagar, Lucknow',
        dateOfJoining: '2023-11-05',
        baseSalary: 95000,
        allowances: 16000,
        deductions: 9500,
    },
    {
        employeeId: 'EMP006',
        email: 'kavita.joshi@dayflow.dev',
        fullName: 'Kavita Joshi',
        jobTitle: 'HR Business Partner',
        department: 'HR',
        phone: '+91-9876543206',
        address: 'Baner, Pune',
        dateOfJoining: '2024-04-20',
        baseSalary: 85000,
        allowances: 12000,
        deductions: 8500,
    },
    {
        employeeId: 'EMP007',
        email: 'rahul.kapoor@dayflow.dev',
        fullName: 'Rahul Kapoor',
        jobTitle: 'UI/UX Designer',
        department: 'Design',
        phone: '+91-9876543207',
        address: 'Defence Colony, New Delhi',
        dateOfJoining: '2025-02-14',
        baseSalary: 88000,
        allowances: 14000,
        deductions: 8800,
    },
    {
        employeeId: 'EMP008',
        email: 'ananya.reddy@dayflow.dev',
        fullName: 'Ananya Reddy',
        jobTitle: 'Graphic Designer',
        department: 'Design',
        phone: '+91-9876543208',
        address: 'Jubilee Hills, Hyderabad',
        dateOfJoining: '2024-06-03',
        baseSalary: 72000,
        allowances: 10000,
        deductions: 7200,
    },
]

// Which days each employee is absent/half-day (index into weekdays array)
const absentDays: Record<string, number[]> = {
    EMP001: [3],
    EMP002: [7],
    EMP003: [2, 10],
    EMP004: [5],
    EMP005: [],
    EMP006: [4, 9],
    EMP007: [1],
    EMP008: [6],
}

const halfDays: Record<string, number[]> = {
    EMP001: [8],
    EMP002: [12],
    EMP003: [],
    EMP004: [10],
    EMP005: [3],
    EMP006: [],
    EMP007: [11],
    EMP008: [2],
}

// ─── seed ─────────────────────────────────────────────────────────────────────

async function main() {
    console.log('🌱  Seeding Dayflow database…')

    // Wipe existing data
    await prisma.notification.deleteMany()
    await prisma.leaveRequest.deleteMany()
    await prisma.attendance.deleteMany()
    await prisma.salary.deleteMany()
    await prisma.profile.deleteMany()
    await prisma.user.deleteMany()

    const passwordHash = await bcrypt.hash('Admin@123', 12)
    const empPasswordHash = await bcrypt.hash('Employee@123', 12)

    // ── Admin ──────────────────────────────────────────────────────────────────
    const admin = await prisma.user.create({
        data: {
            employeeId: 'ADMIN001',
            email: 'admin@dayflow.dev',
            passwordHash,
            role: 'ADMIN',
            emailVerified: true,
            profile: {
                create: {
                    fullName: 'Aisha Mehra',
                    phone: '+91-9800000001',
                    jobTitle: 'HR Administrator',
                    department: 'HR',
                    address: 'Viman Nagar, Pune',
                    dateOfJoining: toUTCDate('2023-01-10'),
                },
            },
            salary: {
                create: {
                    baseSalary: 150000,
                    allowances: 25000,
                    deductions: 15000,
                    effectiveDate: toUTCDate('2023-01-10'),
                },
            },
        },
    })
    console.log(`  ✅  Admin created: ${admin.email}`)

    const weekdays = getAugWeekdays()

    // ── Employees ──────────────────────────────────────────────────────────────
    const createdUsers: { id: string; employeeId: string }[] = []

    for (const emp of employees) {
        const user = await prisma.user.create({
            data: {
                employeeId: emp.employeeId,
                email: emp.email,
                passwordHash: empPasswordHash,
                role: 'EMPLOYEE',
                emailVerified: true,
                profile: {
                    create: {
                        fullName: emp.fullName,
                        phone: emp.phone,
                        address: emp.address,
                        jobTitle: emp.jobTitle,
                        department: emp.department,
                        dateOfJoining: toUTCDate(emp.dateOfJoining),
                    },
                },
                salary: {
                    create: {
                        baseSalary: emp.baseSalary,
                        allowances: emp.allowances,
                        deductions: emp.deductions,
                        effectiveDate: toUTCDate(emp.dateOfJoining),
                    },
                },
            },
        })

        createdUsers.push({ id: user.id, employeeId: emp.employeeId })

        // Attendance records for August 2026
        const absent = absentDays[emp.employeeId] ?? []
        const half = halfDays[emp.employeeId] ?? []

        for (let i = 0; i < weekdays.length; i++) {
            const dayStr = weekdays[i]
            let status: 'PRESENT' | 'ABSENT' | 'HALF_DAY' = 'PRESENT'
            if (absent.includes(i)) status = 'ABSENT'
            else if (half.includes(i)) status = 'HALF_DAY'

            const checkIn = status !== 'ABSENT' ? randomTime(dayStr, 9, 20) : null
            // Check-out: HALF_DAY ends at 13:xx, PRESENT ends 17–19
            const checkOut =
                status === 'PRESENT'
                    ? randomTime(dayStr, 17 + Math.floor(Math.random() * 2), 30)
                    : status === 'HALF_DAY'
                        ? randomTime(dayStr, 13, 15)
                        : null

            await prisma.attendance.create({
                data: {
                    userId: user.id,
                    date: toUTCDate(dayStr),
                    checkIn,
                    checkOut,
                    status,
                },
            })
        }

        console.log(`  ✅  Employee created: ${user.email} (${weekdays.length} attendance records)`)
    }

    // ── Leave requests ─────────────────────────────────────────────────────────
    // APPROVED — Arjun took sick leave last week
    await prisma.leaveRequest.create({
        data: {
            userId: createdUsers.find((u) => u.employeeId === 'EMP001')!.id,
            leaveType: 'SICK',
            startDate: toUTCDate('2026-08-11'),
            endDate: toUTCDate('2026-08-12'),
            remarks: 'Running high fever, doctor advised rest for 2 days.',
            status: 'APPROVED',
            adminComment: 'Get well soon! Approved.',
            reviewedById: admin.id,
            reviewedAt: new Date('2026-08-11T06:30:00.000Z'),
        },
    })

    // APPROVED — Sneha took annual leave
    await prisma.leaveRequest.create({
        data: {
            userId: createdUsers.find((u) => u.employeeId === 'EMP004')!.id,
            leaveType: 'PAID',
            startDate: toUTCDate('2026-08-04'),
            endDate: toUTCDate('2026-08-06'),
            remarks: 'Family function in Ahmedabad. Festival leave.',
            status: 'APPROVED',
            adminComment: 'Enjoy the festivities!',
            reviewedById: admin.id,
            reviewedAt: new Date('2026-08-03T08:00:00.000Z'),
        },
    })

    // REJECTED — Rohan requested leave mid-sprint
    await prisma.leaveRequest.create({
        data: {
            userId: createdUsers.find((u) => u.employeeId === 'EMP003')!.id,
            leaveType: 'UNPAID',
            startDate: toUTCDate('2026-08-18'),
            endDate: toUTCDate('2026-08-20'),
            remarks: 'Need to travel outstation for personal work.',
            status: 'REJECTED',
            adminComment: 'Dates clash with sprint deadline. Please reschedule.',
            reviewedById: admin.id,
            reviewedAt: new Date('2026-08-15T09:15:00.000Z'),
        },
    })

    // PENDING — Priya upcoming planned leave
    await prisma.leaveRequest.create({
        data: {
            userId: createdUsers.find((u) => u.employeeId === 'EMP002')!.id,
            leaveType: 'PAID',
            startDate: toUTCDate('2026-08-25'),
            endDate: toUTCDate('2026-08-27'),
            remarks: 'Pre-planned vacation to Goa with family.',
            status: 'PENDING',
        },
    })

    // PENDING — Ananya medical leave
    await prisma.leaveRequest.create({
        data: {
            userId: createdUsers.find((u) => u.employeeId === 'EMP008')!.id,
            leaveType: 'SICK',
            startDate: toUTCDate('2026-08-23'),
            endDate: toUTCDate('2026-08-23'),
            remarks: 'Scheduled dental surgery, will need the day off.',
            status: 'PENDING',
        },
    })

    console.log('  ✅  Leave requests seeded (2 APPROVED, 1 REJECTED, 2 PENDING)')

    // ── Notifications ──────────────────────────────────────────────────────────
    await prisma.notification.createMany({
        data: [
            {
                userId: createdUsers.find((u) => u.employeeId === 'EMP001')!.id,
                message: 'Your sick leave request has been approved.',
                type: 'LEAVE_APPROVED',
                read: true,
            },
            {
                userId: createdUsers.find((u) => u.employeeId === 'EMP003')!.id,
                message: 'Your leave request has been rejected. Reason: Sprint deadline conflict.',
                type: 'LEAVE_REJECTED',
                read: false,
            },
            {
                userId: createdUsers.find((u) => u.employeeId === 'EMP002')!.id,
                message: 'Your leave request for Aug 25–27 is under review.',
                type: 'LEAVE_PENDING',
                read: false,
            },
        ],
    })
    console.log('  ✅  Notifications seeded')

    console.log('\n🎉  Seeding complete!')
    console.log(`
  Admin credentials
    Email   : admin@dayflow.dev
    Password: Admin@123

  Employee credentials (all same password)
    Password: Employee@123
  `)
}

main()
    .catch((e) => {
        console.error('❌  Seed failed:', e)
        process.exit(1)
    })
    .finally(() => prisma.$disconnect())

import { getSession } from '@/lib/auth'
import { redirect } from 'next/navigation'

export default async function AdminDashboardPage() {
    const session = await getSession()

    if (!session || session.role !== 'ADMIN') {
        redirect('/dashboard')
    }

    return (
        <div className="p-8">
            <h1 className="text-3xl font-serif mb-4">Admin Dashboard</h1>
            <p className="mb-4">Welcome, {session.name}!</p>
            <form action="/api/auth/logout" method="POST">
                <button type="submit" className="px-4 py-2 bg-rose text-white rounded-md">Logout</button>
            </form>
        </div>
    )
}

import { redirect } from 'next/navigation'

// The admin home has moved to /admin
export default async function AdminDashboardPage() {
    redirect('/admin')
}

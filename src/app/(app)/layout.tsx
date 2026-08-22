import { getSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { Sidebar } from '@/components/layout/Sidebar'
import { BottomTabBar } from '@/components/layout/BottomTabBar'
import { TopBar } from '@/components/layout/TopBar'

export default async function AppLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const session = await getSession()

    if (!session) {
        redirect('/login')
    }

    return (
        <div className="flex min-h-screen bg-background">
            <Sidebar role={session.role as 'EMPLOYEE' | 'ADMIN'} />
            <div className="flex-1 flex flex-col min-w-0 pb-16 md:pb-0">
                <TopBar user={session} />
                <main className="flex-1 overflow-y-auto p-4 md:p-8">
                    <div className="page-transition">
                        {children}
                    </div>
                </main>
            </div>
            <BottomTabBar role={session.role as 'EMPLOYEE' | 'ADMIN'} />
        </div>
    )
}

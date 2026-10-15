import { lazy, Suspense, useMemo } from 'react'
import {Routes, Route} from 'react-router'
import SideBar from '../combinedComponents/SideBar'
import { useSelector } from 'react-redux'
import ProtectedRoute from '../features/ProtectedRoute'
import { ChunkLoader } from '../components/AsyncState'
import { useRoleAccess } from '../features/roleAccess'

const DashboardContent = lazy(() => import('../combinedComponents/DashboardContent'))
const MemberMenuContent = lazy(() => import('../combinedComponents/MemberMenuContent'))
const PaymentsMenuContent = lazy(() => import('../combinedComponents/PaymentsMenuContent'))
const ReportsMenuContent = lazy(() => import('../combinedComponents/ReportsMenuContent'))
const SettingsMenuContent = lazy(() => import('../combinedComponents/SettingsMenuContent'))
const NotificationMenuContent = lazy(() => import('../combinedComponents/NotificationMenuContent'))
const AuditLogContent = lazy(() => import('../combinedComponents/AuditLogContent'))
const AddMemberForm = lazy(() => import('../components/AddMemberForm'))
const AddPaymentForm = lazy(() => import('../components/AddPaymentForm'))
const LoginComp = lazy(() => import('../components/LoginComp'))
const SignUp = lazy(() => import('../components/SignUp'))
const MemberAccess = lazy(() => import('../combinedComponents/MemberAccess'))
const LogoutBox = lazy(() => import('../components/LogoutBox'))


function MainPage() {
  const { value: currentPageState, visitedPages } = useSelector((state)=>state.currentPageState)
  const dataVersion = useSelector((state) => state.dataVersion)
  const { isLoading: isRoleLoading, dashboard, members, payments, reports, notifications, auditLogs, settings, manageMembers, managePayments } = useRoleAccess()

  // Page components used to be conditionally rendered below. That unmounted a
  // page on every sidebar change, losing its data and causing all of its API
  // calls to run again when the user came back. Keep a visited page mounted,
  // but hidden, so switching between workspace sections is instant.
  const requestedPage = currentPageState === 'addMember'
    ? 'Members'
    : currentPageState === 'addPayment'
      ? 'Payments'
      : currentPageState

  const availablePages = useMemo(() => [
    { name: 'Dashboard', enabled: dashboard, Component: DashboardContent },
    { name: 'Members', enabled: members, Component: MemberMenuContent },
    { name: 'Payments', enabled: payments, Component: PaymentsMenuContent },
    { name: 'Reports', enabled: reports, Component: ReportsMenuContent },
    { name: 'Notifications', enabled: notifications, Component: NotificationMenuContent },
    { name: 'AuditLogs', enabled: auditLogs, Component: AuditLogContent },
    { name: 'Settings', enabled: settings, Component: SettingsMenuContent },
  ], [auditLogs, dashboard, members, notifications, payments, reports, settings])

  // A trainer or front-desk account can open the app with the default
  // Dashboard selection even though that page is owner-only. Keep the
  // original fallback behaviour and show their first permitted page instead.
  const activePage = availablePages.some((page) => page.name === requestedPage && page.enabled)
    ? requestedPage
    : availablePages.find((page) => page.enabled)?.name

  if (isRoleLoading) {
    return <div className='flex min-h-screen w-full items-center justify-center bg-gray-950 text-gray-400'>Loading workspace...</div>
  }

  return (
    <div className='
    flex
    min-h-screen
    font-sans
    bg-gray-950
    text-white
    '>
      <Routes>
        <Route element={<Suspense fallback={<ChunkLoader message="Loading sign up..." />}><SignUp/></Suspense>} path='/signup'/>
        <Route element={<Suspense fallback={<ChunkLoader message="Loading member access..." />}><MemberAccess/></Suspense>} path='/memberaccess/:token'/>
        <Route element={<Suspense fallback={<ChunkLoader message="Loading sign in..." />}><LoginComp/></Suspense>} exact path='/'/>
        <Route element={
          <ProtectedRoute>
            <>
            <SideBar/>
            <Suspense fallback={<ChunkLoader message="Loading workspace..." />}>
              {currentPageState === 'logout' ? <LogoutBox/> : <>
                {availablePages.map((page) => {
                  const shouldRender = page.enabled && (
                    page.name === activePage || visitedPages[page.name]
                  )
                  if (!shouldRender) return null
                  const { Component } = page

                  return (
                    <div
                      key={page.name}
                      className={page.name === activePage ? 'flex w-full' : 'hidden'}
                      aria-hidden={page.name !== activePage}
                    >
                      <Component isActive={page.name === activePage} dataVersion={dataVersion}/>
                    </div>
                  )
                })}
                {currentPageState === 'addMember' && manageMembers && <AddMemberForm/>}
                {currentPageState === 'addPayment' && managePayments && <AddPaymentForm/>}
              </>}
            </Suspense>
            </> 
          </ProtectedRoute>
        } path='/gymapp'/>
      </Routes>
    </div>
  )
}

export default MainPage

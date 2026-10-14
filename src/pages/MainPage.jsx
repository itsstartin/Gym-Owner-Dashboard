import { lazy, Suspense } from 'react'
import {Routes, Route} from 'react-router'
import SideBar from '../combinedComponents/SideBar'
import { useSelector } from 'react-redux'
import ProtectedRoute from '../features/ProtectedRoute'
import { ChunkLoader } from '../components/AsyncState'

const DashboardContent = lazy(() => import('../combinedComponents/DashboardContent'))
const MemberMenuContent = lazy(() => import('../combinedComponents/MemberMenuContent'))
const PaymentsMenuContent = lazy(() => import('../combinedComponents/PaymentsMenuContent'))
const ReportsMenuContent = lazy(() => import('../combinedComponents/ReportsMenuContent'))
const SettingsMenuContent = lazy(() => import('../combinedComponents/SettingsMenuContent'))
const NotificationMenuContent = lazy(() => import('../combinedComponents/NotificationMenuContent'))
const AddMemberForm = lazy(() => import('../components/AddMemberForm'))
const AddPaymentForm = lazy(() => import('../components/AddPaymentForm'))
const LoginComp = lazy(() => import('../components/LoginComp'))
const SignUp = lazy(() => import('../components/SignUp'))
const MemberAccess = lazy(() => import('../combinedComponents/MemberAccess'))
const LogoutBox = lazy(() => import('../components/LogoutBox'))


function MainPage() {
  const currentPageState = useSelector((state)=>state.currentPageState.value)
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
              {
              currentPageState==='Dashboard' ?
              <DashboardContent/>
              :
              currentPageState==='Members' ?
              <MemberMenuContent/>
              :
              currentPageState==='addMember' ?
              <> 
                <DashboardContent/>
                <AddMemberForm/>
              </>
              :
              currentPageState==='Payments' ?
              <PaymentsMenuContent/>
              :
              currentPageState==='addPayment' ?
              <>
                <PaymentsMenuContent/>
                <AddPaymentForm/>
              </>
              :
              currentPageState==='Reports' ?
              <ReportsMenuContent/>
              :
              currentPageState==='Notifications' ?
              <NotificationMenuContent/>
              :
              currentPageState==='Settings' ?
              <SettingsMenuContent/>
              :
              currentPageState==='logout' ?
              <>
              <LogoutBox/>
              </>
              :''
              }
            </Suspense>
            </> 
          </ProtectedRoute>
        } path='/gymapp'/>
      </Routes>
    </div>
  )
}

export default MainPage

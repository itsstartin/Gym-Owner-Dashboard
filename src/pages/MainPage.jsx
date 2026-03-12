import React from 'react'
import {Routes, Route} from 'react-router'
import SideBar from '../combinedComponents/SideBar'
import DashboardContent from '../combinedComponents/DashboardContent'
import { useSelector } from 'react-redux'
import MemberMenuContent from '../combinedComponents/MemberMenuContent'
import AddMemberForm from '../components/AddMemberForm'
import PaymentsMenuContent from '../combinedComponents/PaymentsMenuContent'
import ReportsMenuContent from '../combinedComponents/ReportsMenuContent'
import AddPaymentForm from '../components/AddPaymentForm'
import LoginComp from '../components/LoginComp'
import SignUp from '../components/SignUp'
import ProtectedRoute from '../features/ProtectedRoute'
import LogoutBox from '../components/LogoutBox'
import SettingsMenuContent from '../combinedComponents/SettingsMenuContent'


function MainPage() {
  const currentPageState = useSelector((state)=>state.currentPageState.value)
  return (
    <div className='
    flex
    font-sans-serif
    bg-gray-950
    text-white
    '>
      <Routes>
        <Route Component={SignUp} exact path='/'/>
        <Route element={<LoginComp/>} path='/login'/>
        <Route element={
          <ProtectedRoute>
            <>
            <SideBar/>
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
              currentPageState==='Settings' ?
              <SettingsMenuContent/>
              :
              currentPageState==='logout' ?
              <>
                <LogoutBox/>
              </>
              :''
            }
            </> 
          </ProtectedRoute>
        } path='/gymapp'/>
      </Routes>
    </div>
  )
}

export default MainPage
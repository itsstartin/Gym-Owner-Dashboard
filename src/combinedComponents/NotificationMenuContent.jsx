import React from 'react'
import NotificationList from '../components/NotificationList'

function NotificationMenuContent({ isActive, dataVersion }) {
  return (
    <NotificationList isActive={isActive} dataVersion={dataVersion}/>
  )
}

export default NotificationMenuContent

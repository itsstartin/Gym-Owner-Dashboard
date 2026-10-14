import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import axios from '../axios'

/* eslint-disable react-refresh/only-export-components */

const RoleContext = createContext(null)

export const ROLES = {
  OWNER: 'owner',
  TRAINER: 'trainer',
  FRONT_DESK: 'front_desk',
}

const ROLE_CAPABILITIES = {
  [ROLES.OWNER]: {
    dashboard: true,
    members: true,
    payments: true,
    reports: true,
    notifications: true,
    settings: true,
    manageMembers: true,
    managePayments: true,
    manageAttendance: true,
    viewPaymentDetails: true,
  },
  [ROLES.TRAINER]: {
    members: true,
  },
  [ROLES.FRONT_DESK]: {
    members: true,
    payments: true,
    manageMembers: true,
    managePayments: true,
    manageAttendance: true,
    viewPaymentDetails: true,
  },
}

export function getCapabilities(role) {
  return ROLE_CAPABILITIES[role] || {}
}

export function RoleProvider({ children }) {
  const [role, setRole] = useState(() => localStorage.getItem('gymRole') || '')
  const [isLoading, setIsLoading] = useState(() => Boolean(localStorage.getItem('token')))

  useEffect(() => {
    const updateRole = () => {
      setRole(localStorage.getItem('gymRole') || '')
      setIsLoading(false)
    }
    window.addEventListener('gym-role-changed', updateRole)
    return () => window.removeEventListener('gym-role-changed', updateRole)
  }, [])

  useEffect(() => {
    if (!localStorage.getItem('token')) return undefined

    let active = true
    axios.get('members/user')
      .then(({ data }) => {
        if (!active) return
        const nextRole = data.role || ROLES.OWNER
        localStorage.setItem('gymRole', nextRole)
        setRole(nextRole)
      })
      .catch(() => {
        if (active) setRole('')
      })
      .finally(() => {
        if (active) setIsLoading(false)
      })

    return () => {
      active = false
    }
  }, [])

  const value = useMemo(() => ({
    role,
    isLoading,
    ...getCapabilities(role),
  }), [role, isLoading])

  return <RoleContext.Provider value={value}>{children}</RoleContext.Provider>
}

export function useRoleAccess() {
  const value = useContext(RoleContext)
  if (!value) {
    throw new Error('useRoleAccess must be used inside RoleProvider')
  }
  return value
}

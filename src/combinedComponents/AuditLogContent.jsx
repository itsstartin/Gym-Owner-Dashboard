import React, { useCallback, useEffect, useRef, useState } from 'react'
import WelcomeHeader from '../components/WelcomeHeader'
import { EmptyState, ErrorState, LoadingState } from '../components/AsyncState'
import axios from '../axios'

const actionOptions = [
  { value: '', label: 'All actions' },
  { value: 'member_created', label: 'Member created' },
  { value: 'member_updated', label: 'Member updated' },
  { value: 'payment_recorded', label: 'Payment recorded' },
  { value: 'attendance_marked', label: 'Attendance marked' },
  { value: 'attendance_removed', label: 'Attendance removed' },
  { value: 'settings_updated', label: 'Settings updated' },
]

function AuditLogContent({ isActive, dataVersion }) {
  const [filters, setFilters] = useState({ action: '', date: '' })
  const [logs, setLogs] = useState([])
  const [pagination, setPagination] = useState({ page: 1, total_pages: 0, total: 0 })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const loadedDataVersion = useRef(dataVersion)

  const loadLogs = useCallback(async (page = 1) => {
    setIsLoading(true)
    setError('')
    try {
      const response = await axios.get('members/audit-logs', { params: { ...filters, page } })
      setLogs(response.data.results)
      setPagination(response.data.pagination)
    } catch {
      setError('Unable to load the audit log. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }, [filters])

  useEffect(() => {
    loadLogs()
  }, [loadLogs])

  useEffect(() => {
    if (!isActive || loadedDataVersion.current === dataVersion) return
    loadedDataVersion.current = dataVersion
    loadLogs()
  }, [dataVersion, isActive, loadLogs])

  const updateFilter = (event) => {
    const { name, value } = event.target
    setFilters((current) => ({ ...current, [name]: value }))
  }

  return (
    <div className='flex min-h-screen w-full flex-col gap-6 p-4 sm:p-6 lg:p-8'>
      <WelcomeHeader header='Audit Log' desc='Review important changes made in your gym workspace.' />
      <div className='flex flex-col gap-3 rounded-xl border border-gray-800 bg-gray-900/50 p-4 sm:flex-row sm:items-end'>
        <label className='flex flex-1 flex-col gap-1 text-sm text-gray-300'>Action
          <select name='action' value={filters.action} onChange={updateFilter} className='rounded-lg border border-gray-700 bg-gray-950 px-3 py-2 text-white'>
            {actionOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
          </select>
        </label>
        <label className='flex flex-1 flex-col gap-1 text-sm text-gray-300'>Date
          <input type='date' name='date' value={filters.date} onChange={updateFilter} className='rounded-lg border border-gray-700 bg-gray-950 px-3 py-2 text-white' />
        </label>
        <button type='button' onClick={() => setFilters({ action: '', date: '' })} className='rounded-lg bg-gray-800 px-4 py-2 text-sm font-semibold hover:bg-gray-700'>Clear filters</button>
      </div>

      {isLoading ? <LoadingState message='Loading audit log...' /> : error ? <ErrorState message={error} onRetry={() => loadLogs(pagination.page)} /> : logs.length === 0 ? <EmptyState title='No audit events found' message='Try a different date or action filter.' /> : <>
        <div className='overflow-hidden rounded-xl border border-gray-800 bg-gray-900/50'>
          <div className='grid grid-cols-3 gap-3 border-b border-gray-800 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-400 sm:grid-cols-4'>
            <span>When</span><span>Action</span><span>Target</span><span className='hidden sm:block'>Actor & summary</span>
          </div>
          {logs.map((entry) => <div key={entry.id} className='grid grid-cols-3 gap-3 border-b border-gray-800 px-4 py-4 text-sm last:border-b-0 sm:grid-cols-4'>
            <span className='text-gray-400'>{new Date(entry.created_at).toLocaleString()}</span>
            <span className='font-medium'>{entry.action_label}</span>
            <span>{entry.target_name}<span className='mt-1 block text-xs text-gray-500'>{entry.target_type}</span></span>
            <span className='hidden text-gray-300 sm:block'><span className='font-medium text-white'>{entry.actor_username}</span><span className='mt-1 block text-xs text-gray-400'>{entry.metadata_summary}</span></span>
          </div>)}
        </div>
        <div className='flex items-center justify-between gap-3 text-sm text-gray-400'>
          <span>{pagination.total} event{pagination.total === 1 ? '' : 's'}</span>
          <div className='flex items-center gap-2'>
            <button type='button' disabled={pagination.page <= 1} onClick={() => loadLogs(pagination.page - 1)} className='rounded-lg bg-gray-800 px-3 py-2 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50'>Previous</button>
            <span>Page {pagination.page} of {pagination.total_pages || 1}</span>
            <button type='button' disabled={pagination.page >= pagination.total_pages} onClick={() => loadLogs(pagination.page + 1)} className='rounded-lg bg-gray-800 px-3 py-2 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50'>Next</button>
          </div>
        </div>
      </>}
    </div>
  )
}

export default AuditLogContent

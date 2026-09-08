import React, { useEffect, useState } from 'react'
import { CalendarDays, ReceiptIndianRupee, X } from 'lucide-react'
import axios from '../axios'

function MemberHistoryModal({ member, type, onClose }) {
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const isAttendance = type === 'attendance'
  const title = isAttendance ? 'Attendance History' : 'Payment History'

  useEffect(() => {
    const endpoint = isAttendance
      ? `members/getattendancehistory/${member.id}`
      : `members/getpaymenthistory/${member.id}`

    axios.get(endpoint)
      .then((res) => setHistory(res.data))
      .catch(() => setError(`Unable to load ${title.toLowerCase()}.`))
      .finally(() => setLoading(false))
  }, [isAttendance, member.id, title])

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4'>
      <div className='flex max-h-[80vh] w-full max-w-md flex-col gap-4 rounded-lg bg-gray-900 p-4 text-white outline-1 outline-gray-800'>
        <div className='flex items-start gap-3'>
          {isAttendance ? <CalendarDays size={28} /> : <ReceiptIndianRupee size={28} />}
          <div className='w-full'>
            <h1 className='text-lg font-semibold'>{title}</h1>
            <p className='text-sm text-gray-400'>{member.name}</p>
          </div>
          <button type='button' onClick={onClose} aria-label={`Close ${title}`} className='rounded p-1 hover:bg-gray-800'>
            <X size={20} />
          </button>
        </div>

        <div className='flex max-h-[58vh] flex-col gap-2 overflow-y-auto pr-1'>
          {loading && <p className='text-gray-400'>Loading history...</p>}
          {error && <p className='text-red-400'>{error}</p>}
          {!loading && !error && history.length === 0 && (
            <p className='text-gray-400'>No {isAttendance ? 'attendance' : 'payment'} records found.</p>
          )}
          {!loading && !error && history.map((record, index) => (
            isAttendance ? (
              <div key={`${record.date}-${index}`} className='rounded-lg bg-black p-3'>
                <p>Present</p>
                <p className='text-sm text-gray-400'>
                  {new Date(record.date).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
                </p>
              </div>
            ) : (
              <div key={record.id} className='flex justify-between rounded-lg bg-black p-3'>
                <div>
                  <p className='capitalize'>{record.payment_type}</p>
                  <p className='text-sm text-gray-400'>
                    {new Date(record.created_at).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
                  </p>
                </div>
                <p>₹ {record.amount}</p>
              </div>
            )
          ))}
        </div>
      </div>
    </div>
  )
}

export default MemberHistoryModal

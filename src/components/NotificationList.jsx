import { useCallback, useEffect, useRef, useState } from "react";
import { Bell, Search } from "lucide-react";
import axios from '../axios'
import NotificationCard from "./NotificationCard";
import { EmptyState, ErrorState, LoadingState } from './AsyncState'

export default function NotificationList({ isActive, dataVersion }) {
  const [notifications, setNotifications] = useState([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const loadedDataVersion = useRef(dataVersion)

  const loadNotifications = useCallback(async () => {
    setIsLoading(true)
    setError('')
    try {
      const response = await axios.get('members/getnotifications')
      setNotifications(response.data)
    } catch {
      setError('Unable to load notifications. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(()=>{
    loadNotifications()
  },[loadNotifications])

  useEffect(() => {
    if (!isActive || loadedDataVersion.current === dataVersion) return
    loadedDataVersion.current = dataVersion
    loadNotifications()
  }, [dataVersion, isActive, loadNotifications])

  const filtered = notifications.filter((obj) =>
    obj.message.toLowerCase().includes(search.toLowerCase())
  )

  const emptyTitle = notifications.length === 0 ? 'No notifications yet' : 'No matching notifications'
  const emptyMessage = notifications.length === 0
    ? 'New member and payment updates will appear here.'
    : 'Try a different search term.'

  return (
    <div className="flex min-h-screen w-full flex-col gap-6 p-4 sm:p-6 lg:p-8">
      <div className="flex items-center justify-between ">
        <h1 className="flex items-center gap-3 text-2xl font-bold tracking-tight sm:text-3xl">
          <span className='rounded-lg bg-green-950 p-2 text-green-500'><Bell size={24} /></span> Notifications
        </h1>
      </div>

      <div className="flex items-center gap-2 rounded-xl border border-gray-800 bg-gray-900/70 px-3 py-3 focus-within:border-green-700">
        <Search size={18} className='text-gray-400'/>
        <input
          type="text"
          placeholder="Search by name or message"
          className="w-full bg-transparent text-sm outline-none"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {isLoading ? <LoadingState message="Loading notifications..." /> : error ? <ErrorState message={error} onRetry={loadNotifications} /> :
      <div className="space-y-3">
        {filtered.length > 0
          ? filtered.map((obj) => <NotificationCard key={obj.id} obj={obj}/>)
          : <EmptyState title={emptyTitle} message={emptyMessage} />
        }
      </div>
      }
    </div>
  );
}

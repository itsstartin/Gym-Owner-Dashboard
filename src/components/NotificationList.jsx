import { useEffect, useState } from "react";
import { Bell, Search } from "lucide-react";
import axios from '../axios'
import NotificationCard from "./NotificationCard";


export default function NotificationList() {
    const [notifications, setNotifications] = useState();
    useEffect(()=>{
        axios.get('members/getnotifications').then((res)=>{
            setNotifications(res.data)
            console.log(res.data)
        })
    },[])
  const [search, setSearch] = useState("");
  const filtered = notifications ? notifications.filter((obj) =>
    obj.message.toLowerCase().includes(search.toLowerCase())
  ) : ''

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

      <div className="space-y-3">
        {notifications ? filtered.map((obj) => (
          <NotificationCard key={obj.id} obj={obj}/>
        )):<p className='text-sm text-gray-400'>Loading notifications...</p>}
      </div>
    </div>
  );
}

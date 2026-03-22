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
    <div className="flex flex-col p-3 sm:p-6 w-full gap-4">
      <div className="flex items-center justify-between ">
        <h1 className="text-3xl font-extrabold flex items-center gap-2">
          <Bell size={35} /> Notifications
        </h1>
      </div>

      <div className="flex items-center gap-2 outline-1 outline-gray-700 rounded-lg p-1 ">
        <Search size={18}/>
        <input
          type="text"
          placeholder="Search by name or message"
          className="w-full outline-none"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="space-y-4">
        {notifications ? filtered.map((obj) => (
          <NotificationCard obj={obj}/>
        )):''}
      </div>
    </div>
  );
}

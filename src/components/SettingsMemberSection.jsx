import React, { useEffect, useState } from "react"
import axios from "../axios"
import { Copy, Link2Off, Send } from "lucide-react"
import { ClipLoader } from "react-spinners"
import { ROLES, useRoleAccess } from "../features/roleAccess"

function SettingsMemberSection() {
  const [isLoading, setIsLoading] = useState(false)
  const [members, setMembers] = useState([])
  const [selectedMember, setSelectedMember] = useState("")
  const [message, setMessage] = useState("")
  const { role } = useRoleAccess()
  const isOwner = role === ROLES.OWNER

  useEffect(() => {
    axios.get("members/get").then((res) => setMembers(res.data))
  }, [])

  const requireSingleMember = () => {
    if (!selectedMember || selectedMember === "all") {
      setMessage("Choose one member for this action.")
      return false
    }
    return true
  }

  const resendLink = async () => {
    if (!selectedMember) return
    setIsLoading(true)
    setMessage("")
    try {
      await axios.post("members/attendance-mail", { member_id: selectedMember })
      setMessage("A new attendance link was emailed. Older links no longer work.")
    } catch {
      setMessage("Could not resend the attendance link.")
    } finally {
      setIsLoading(false)
    }
  }

  const copyNewLink = async () => {
    if (!requireSingleMember()) return
    setIsLoading(true)
    setMessage("")
    try {
      const { data } = await axios.post(`members/member-access-links/${selectedMember}/regenerate`)
      await navigator.clipboard.writeText(data.access_url)
      setMessage("New attendance link copied. Older links no longer work.")
    } catch {
      setMessage("Could not create and copy a new attendance link.")
    } finally {
      setIsLoading(false)
    }
  }

  const revokeLink = async () => {
    if (!requireSingleMember()) return
    setIsLoading(true)
    setMessage("")
    try {
      await axios.post(`members/member-access-links/${selectedMember}/revoke`)
      setMessage("Attendance link revoked.")
    } catch {
      setMessage("Could not revoke the attendance link.")
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOwner) return null

  return (
    <div className="flex w-full flex-col gap-3 rounded-lg p-2 outline outline-1 outline-gray-700">
      <h1 className="font-medium">Member attendance links</h1>
      <div className="flex flex-wrap items-center gap-3">
        <select
          name="member"
          onChange={(event) => setSelectedMember(event.target.value)}
          className="rounded-lg bg-gray-900 p-2"
          value={selectedMember}
        >
          <option value="">Select Member</option>
          <option value="all">All Members (email only)</option>
          {members.map((member) => <option value={member.id} key={member.id}>{member.name}</option>)}
        </select>
        {isLoading ? <ClipLoader size={20} color="#fff" /> : <>
          <button type="button" className="inline-flex items-center gap-2 rounded-md bg-green-700 px-3 py-2 text-sm font-medium" onClick={resendLink} disabled={!selectedMember}>
            <Send size={16} /> Resend new link
          </button>
          <button type="button" className="inline-flex items-center gap-2 rounded-md border border-gray-600 px-3 py-2 text-sm" onClick={copyNewLink} disabled={!selectedMember || selectedMember === "all"}>
            <Copy size={16} /> Copy new link
          </button>
          <button type="button" className="inline-flex items-center gap-2 rounded-md border border-red-800 px-3 py-2 text-sm text-red-300" onClick={revokeLink} disabled={!selectedMember || selectedMember === "all"}>
            <Link2Off size={16} /> Revoke link
          </button>
        </>}
      </div>
      {message && <p className="text-sm text-gray-300" role="status">{message}</p>}
    </div>
  )
}

export default SettingsMemberSection

import React, { useState, useEffect } from "react"
import {
  ChevronLeft,
  ChevronRight,
  Today,
  SportsSoccer,
  Add
} from "@mui/icons-material"
import { useMatches } from "../../../hooks/useFirebase"
import { PageLoader } from "../../../components/LoadingSpinner"
import { formatDate } from "../../../utils/helpers"
import MatchModal from "../../../components/MatchModal"

const CalendarView = () => {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(new Date())
  const { matches, loading, error, createMatch, updateMatch } = useMatches()
  const [localError, setLocalError] = useState("")

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingMatch, setEditingMatch] = useState(null)
  const [formData, setFormData] = useState({
    home_team: "",
    away_team: "",
    match_date: "",
    venue: "",
    ticket_price: "",
    total_seats: ""
  })

  // Submit (create / update) match
  const handleSubmit = async (e) => {
    e.preventDefault()
    setLocalError("")
    
    try {
      const matchData = {
        home_team: formData.home_team,
        away_team: formData.away_team,
        match_date: new Date(formData.match_date),
        venue: formData.venue,
        ticket_price: parseInt(formData.ticket_price),
        total_seats: parseInt(formData.total_seats),
        available_seats: parseInt(formData.total_seats)
      }

      if (editingMatch) {
        await updateMatch(editingMatch.id, matchData)
      } else {
        await createMatch(matchData)
      }

      closeModal()
    } catch (err) {
      setLocalError(`Failed to ${editingMatch ? "update" : "create"} match`)
      console.error("Error saving match:", err)
    }
  }

  // Open "Add Match" modal for selected day
  const openAddModal = () => {
    setEditingMatch(null)
    setFormData({
      home_team: "",
      away_team: "",
      match_date: selectedDate.toISOString().slice(0, 16),
      venue: "",
      ticket_price: "",
      total_seats: ""
    })
    setIsModalOpen(true)
  }

  // Open "Edit Match" modal
  const openEditModal = (match) => {
    setEditingMatch(match)
    setFormData({
      home_team: match.home_team,
      away_team: match.away_team,
      match_date: new Date(match.match_date?.toDate?.() || match.match_date).toISOString().slice(0, 16),
      venue: match.venue,
      ticket_price: match.ticket_price?.toString() || "",
      total_seats: match.total_seats?.toString() || ""
    })
    setIsModalOpen(true)
  }

  // Close modal and reset form
  const closeModal = () => {
    setIsModalOpen(false)
    setEditingMatch(null)
    setFormData({
      home_team: "",
      away_team: "",
      match_date: "",
      venue: "",
      ticket_price: "",
      total_seats: ""
    })
    setLocalError("")
  }

  // Calendar helpers
  const getDaysInMonth = (date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    return {
      daysInMonth: lastDay.getDate(),
      startingDay: firstDay.getDay()
    }
  }

  const getMatchesForDate = (date) => {
    if (!date) return []
    
    return matches.filter((match) => {
      const matchDate = match.match_date?.toDate?.() || match.match_date
      return new Date(matchDate).toDateString() === date.toDateString()
    })
  }

  const { daysInMonth, startingDay } = getDaysInMonth(currentDate)
  const monthName = currentDate.toLocaleString("default", { month: "long", year: "numeric" })

  // Build days array for grid
  const days = [...Array(startingDay).fill(null)]
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(new Date(currentDate.getFullYear(), currentDate.getMonth(), i))
  }

  // UI
  if (loading) return <PageLoader />
  if (error) return <div className="text-center text-red-600 p-8">{error}</div>

  return (
    <div className="min-h-screen bg-[#d6d8e0] p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#0b1b32]">Match Calendar</h1>
          <p className="text-[#5a5f6d]">View and manage match schedule</p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => {
              setCurrentDate(new Date())
              setSelectedDate(new Date())
            }}
            className="bg-[#c9ced8] hover:bg-[#c8cdd7] text-[#0b1b32] px-4 py-2 rounded-lg flex items-center space-x-2"
          >
            <Today className="h-4 w-4" />
            <span>Today</span>
          </button>
          <button
            onClick={openAddModal}
            className="bg-[#FFD600] hover:bg-yellow-400 text-[#0b1b32] font-medium px-4 py-2 rounded-lg flex items-center space-x-2"
          >
            <Add className="h-4 w-4" />
            <span>Add Match</span>
          </button>
        </div>
      </div>

      {/* Calendar */}
      <div className="admin-card bg-white rounded-2xl shadow border border-[#c9ced8] p-6">
        {/* Month Navigation */}
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={() =>
              setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
            }
            className="p-2 hover:bg-[#f2f4f8] rounded-full"
          >
            <ChevronLeft className="h-5 w-5 text-[#0b1b32]" />
          </button>
          <h2 className="text-lg font-semibold text-[#0b1b32]">{monthName}</h2>
          <button
            onClick={() =>
              setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
            }
            className="p-2 hover:bg-[#f2f4f8] rounded-full"
          >
            <ChevronRight className="h-5 w-5 text-[#0b1b32]" />
          </button>
        </div>

        {/* Days of week */}
        <div className="grid grid-cols-7 gap-2 mb-2">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <div key={day} className="text-center text-sm font-medium text-[#5a5f6d]">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-2">
          {days.map((date, idx) => {
            const isSelected = date && date.toDateString() === selectedDate.toDateString()
            const dayMatches = date ? getMatchesForDate(date) : []

            return (
              <div
                key={idx}
                onClick={() => date && setSelectedDate(date)}
                className={`min-h-[100px] border rounded-lg p-2 cursor-pointer ${
                  isSelected ? "border-[#FFD600] bg-[#fffbe6]" : "border-[#e2e6ef] bg-[#f9fafb]"
                }`}
              >
                <div
                  className={`text-sm mb-1 ${
                    isSelected ? "font-bold text-[#0b1b32]" : "text-[#5a5f6d]"
                  }`}
                >
                  {date ? date.getDate() : ""}
                </div>
                <div className="space-y-1">
                  {dayMatches.map((match) => (
                    <div
                      key={match.id}
                      onClick={(e) => {
                        e.stopPropagation()
                        openEditModal(match)
                      }}
                      className="text-xs p-1 rounded bg-[#e6f2ff] text-[#0b1b32] truncate cursor-pointer hover:bg-[#d6ebff]"
                    >
                      {match.home_team} vs {match.away_team}
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Matches for selected day */}
      <div className="admin-card bg-white rounded-2xl shadow border border-[#c9ced8] p-6">
        <h3 className="text-lg font-semibold text-[#0b1b32] mb-4">
          Matches on {formatDate(selectedDate, { weekday: "long", month: "long", day: "numeric" })}
        </h3>
        {getMatchesForDate(selectedDate).length > 0 ? (
          <div className="space-y-3">
            {getMatchesForDate(selectedDate).map((match) => (
              <div
                key={match.id}
                className="flex items-center justify-between p-3 bg-[#f2f4f8] rounded-lg border border-[#c9ced8]"
              >
                <div className="flex items-center space-x-3">
                  <SportsSoccer className="h-6 w-6 text-[#FFD600]" />
                  <div>
                    <div className="font-medium text-[#0b1b32]">
                      {match.home_team} vs {match.away_team}
                    </div>
                    <div className="text-sm text-[#5a5f6d]">
                      {formatDate(match.match_date, {
                        hour: "2-digit",
                        minute: "2-digit"
                      })}{" "}
                      • {match.venue}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-[#0b1b32]">KES {match.ticket_price}</div>
                  <button
                    onClick={() => openEditModal(match)}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    Edit
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 text-[#5a5f6d]">No matches scheduled for this day</div>
        )}
      </div>

      {/* Modal */}
      <MatchModal
        isOpen={isModalOpen}
        onClose={closeModal}
        onSubmit={handleSubmit}
        formData={formData}
        setFormData={setFormData}
        editingMatch={editingMatch}
        error={localError}
      />
    </div>
  )
}

export default CalendarView
import React, { useState, useEffect } from "react"
import { Add, SportsSoccer, Edit, Delete } from "@mui/icons-material"
import { useMatches } from "../../../hooks/useFirebase"
import { PageLoader } from "../../../components/LoadingSpinner"
import { formatDate } from "../../../utils/helpers"
import MatchModal from "../../../components/MatchModal"

const MatchManager = () => {
  const { matches, loading, error, createMatch, updateMatch, deleteMatch } = useMatches()
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

  useEffect(() => {
    // Auto-open modal if redirected with ?add=new
    const params = new URLSearchParams(window.location.search)
    if (params.get("add") === "new") {
      openAddModal()
    }
  }, [])

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

  const handleDeleteMatch = async (matchId) => {
    if (window.confirm("Are you sure you want to delete this match?")) {
      try {
        await deleteMatch(matchId)
      } catch (err) {
        setLocalError("Failed to delete match")
        console.error("Error deleting match:", err)
      }
    }
  }

  const openAddModal = () => {
    setEditingMatch(null)
    setFormData({
      home_team: "",
      away_team: "",
      match_date: new Date().toISOString().slice(0, 16),
      venue: "",
      ticket_price: "",
      total_seats: ""
    })
    setIsModalOpen(true)
  }

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

  if (loading) return <PageLoader />
  if (error) return <div className="text-center text-red-600 p-8">{error}</div>

  return (
    <div className="min-h-screen bg-[#d6d8e0] p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#0b1b32]">Match Manager</h1>
          <p className="text-[#5a5f6d]">Create, edit and manage football matches</p>
        </div>
        <button
          onClick={openAddModal}
          className="bg-[#FFD600] hover:bg-yellow-400 text-[#0b1b32] font-medium px-4 py-2 rounded-lg flex items-center space-x-2"
        >
          <Add className="h-4 w-4" />
          <span>Add Match</span>
        </button>
      </div>

      {/* Error Display */}
      {localError && (
        <div className="bg-red-100 border border-red-300 text-red-700 px-4 py-3 rounded-lg">
          {localError}
        </div>
      )}

      {/* Matches List */}
      <div className="admin-card bg-white rounded-2xl shadow border border-[#c9ced8] p-6">
        {matches.length > 0 ? (
          <div className="space-y-3">
            {matches.map((match) => (
              <div
                key={match.id}
                className="flex items-center justify-between p-3 bg-[#eeedf2] rounded-lg border border-[#c9ced8]"
              >
                <div className="flex items-center space-x-3">
                  <SportsSoccer className="h-8 w-8 text-[#0b1b32]" />
                  <div>
                    <div className="font-semibold text-[#0b1b32]">
                      {match.home_team} vs {match.away_team}
                    </div>
                    <div className="text-sm text-[#5a5f6d]">
                      {formatDate(match.match_date, {
                        hour: "2-digit",
                        minute: "2-digit",
                        weekday: "short",
                        month: "short",
                        day: "numeric"
                      })}{" "}
                      • {match.venue}
                    </div>
                    <div className="text-xs text-[#5a5f6d]">
                      Available seats: {match.available_seats || 0} / {match.total_seats || 0}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <div className="font-semibold text-[#0b1b32]">KES {match.ticket_price}</div>
                    <div className="text-xs text-[#5a5f6d]">
                      {match.available_seats || 0} seats left
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => openEditModal(match)}
                      className="p-2 rounded-full hover:bg-[#eeedf2] text-[#0b1b32]"
                      title="Edit Match"
                    >
                      <Edit className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleDeleteMatch(match.id)}
                      className="p-2 rounded-full hover:bg-red-50 text-red-600"
                      title="Delete Match"
                    >
                      <Delete className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-[#5a5f6d]">
            <SportsSoccer className="h-12 w-12 mx-auto mb-4 text-[#c8cdd7]" />
            <p>No matches scheduled yet</p>
            <button
              onClick={openAddModal}
              className="mt-4 bg-[#FFD600] hover:bg-yellow-400 text-[#0b1b32] font-medium px-4 py-2 rounded-lg"
            >
              Add Your First Match
            </button>
          </div>
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

export default MatchManager
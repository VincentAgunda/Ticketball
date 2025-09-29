// src/components/MatchModal.jsx
import React from "react"
import { Close, Save } from "@mui/icons-material"
import { TEAMS } from "../utils/constants"

const MatchModal = ({ isOpen, onClose, onSubmit, formData, setFormData, editingMatch }) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl p-6 w-full max-w-md max-h-[80vh] overflow-y-auto shadow-xl">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-[#032f30]">
            {editingMatch ? "Edit Match" : "Add New Match"}
          </h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <Close className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          {/* Home Team */}
          <div>
            <label className="block font-medium text-gray-700 mb-1">Home Team</label>
            <select
              value={formData.home_team}
              onChange={(e) => setFormData({ ...formData, home_team: e.target.value })}
              className="w-full border rounded-lg py-2 px-3 focus:ring-2 focus:ring-[#FFD600] focus:outline-none"
              required
            >
              <option value="">Select home team</option>
              {TEAMS.map((team) => (
                <option key={team} value={team}>
                  {team}
                </option>
              ))}
            </select>
          </div>

          {/* Away Team */}
          <div>
            <label className="block font-medium text-gray-700 mb-1">Away Team</label>
            <select
              value={formData.away_team}
              onChange={(e) => setFormData({ ...formData, away_team: e.target.value })}
              className="w-full border rounded-lg py-2 px-3 focus:ring-2 focus:ring-[#FFD600] focus:outline-none"
              required
            >
              <option value="">Select away team</option>
              {TEAMS.filter((team) => team !== formData.home_team).map((team) => (
                <option key={team} value={team}>
                  {team}
                </option>
              ))}
            </select>
          </div>

          {/* Date & Time */}
          <div>
            <label className="block font-medium text-gray-700 mb-1">Match Date & Time</label>
            <input
              type="datetime-local"
              value={formData.match_date}
              onChange={(e) => setFormData({ ...formData, match_date: e.target.value })}
              className="w-full border rounded-lg py-2 px-3 focus:ring-2 focus:ring-[#FFD600] focus:outline-none"
              required
            />
          </div>

          {/* Venue */}
          <div>
            <label className="block font-medium text-gray-700 mb-1">Venue</label>
            <input
              type="text"
              placeholder="Enter venue name"
              value={formData.venue}
              onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
              className="w-full border rounded-lg py-2 px-3 focus:ring-2 focus:ring-[#FFD600] focus:outline-none"
              required
            />
          </div>

          {/* Ticket Price */}
          <div>
            <label className="block font-medium text-gray-700 mb-1">Ticket Price (KES)</label>
            <input
              type="number"
              placeholder="Enter ticket price"
              value={formData.ticket_price}
              onChange={(e) => setFormData({ ...formData, ticket_price: e.target.value })}
              className="w-full border rounded-lg py-2 px-3 focus:ring-2 focus:ring-[#FFD600] focus:outline-none"
              required
            />
          </div>

          {/* Total Seats */}
          <div>
            <label className="block font-medium text-gray-700 mb-1">Total Seats</label>
            <input
              type="number"
              placeholder="Enter total seats"
              value={formData.total_seats}
              onChange={(e) => setFormData({ ...formData, total_seats: e.target.value })}
              className="w-full border rounded-lg py-2 px-3 focus:ring-2 focus:ring-[#FFD600] focus:outline-none"
              required
            />
          </div>

          {/* Actions */}
          <div className="flex space-x-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2 px-4 bg-[#FFD600] text-[#032f30] rounded-lg hover:bg-[#e6c200] font-medium"
            >
              <Save className="h-4 w-4 inline mr-2" />
              {editingMatch ? "Update" : "Add"} Match
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default MatchModal

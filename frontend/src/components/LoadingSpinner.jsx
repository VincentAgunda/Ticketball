// src/components/LoadingSpinner.jsx
import React from "react"
import CircularProgress from "@mui/material/CircularProgress"

const LoadingSpinner = ({
  size = "medium",
  color = "primary",
  text = "Loading...",
  overlay = false,
}) => {
  const sizeClasses = {
    small: "h-4 w-4",
    medium: "h-8 w-8",
    large: "h-12 w-12",
    xlarge: "h-16 w-16",
  }

  const colorClasses = {
    primary: "text-black",
    secondary: "text-[#FFD600]",
    white: "text-white",
  }

  const spinner = (
    <div
      className={`flex flex-col items-center justify-center ${
        overlay ? "p-8" : "p-4"
      }`}
    >
      <CircularProgress
        className={`animate-spin ${sizeClasses[size]} ${colorClasses[color]}`}
      />
      {text && (
        <p
          className={`mt-2 ${colorClasses[color]} ${
            size === "small" ? "text-sm" : "text-base"
          }`}
        >
          {text}
        </p>
      )}
    </div>
  )

  if (overlay) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-md flex items-center justify-center z-50">
        <div className="bg-white rounded-xl shadow-xl">
          {spinner}
        </div>
      </div>
    )
  }

  return spinner
}

// 🔄 Specific loading components

export const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-[#f8f8f8]">
    <div className="bg-white border border-gray-200 rounded-xl shadow-md p-10">
      <LoadingSpinner size="large" text="Loading page..." color="primary" />
    </div>
  </div>
)

export const ButtonLoader = ({ text = "Processing..." }) => (
  <div className="flex items-center space-x-2">
    <LoadingSpinner size="small" color="white" text={null} />
    <span className="text-white">{text}</span>
  </div>
)

export const CardLoader = () => (
  <div className="bg-white border border-gray-200 rounded-xl p-6 animate-pulse shadow-md">
    <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
    <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
    <div className="h-3 bg-gray-200 rounded w-5/6 mb-2"></div>
    <div className="h-3 bg-gray-200 rounded w-4/6"></div>
  </div>
)

export default LoadingSpinner

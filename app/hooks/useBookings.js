// hooks/useBookings.js
import { useState, useEffect } from 'react'

export function useBookings() {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchBookings()
  }, [])

  const fetchBookings = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch('/api/bookings')
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      setBookings(data.bookings || [])
    } catch (error) {
      console.error('Error fetching bookings:', error)
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const updateBookingStatus = async (bookingId, status) => {
    try {
      const response = await fetch(`/api/bookings/${bookingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update booking status')
      }
      
      // Update the booking in local state
      setBookings(bookings.map(booking => 
        booking._id === bookingId 
          ? { ...booking, status, updatedAt: new Date().toISOString() }
          : booking
      ))
      
      return true
    } catch (error) {
      console.error('Error updating booking status:', error)
      throw error
    }
  }

  const deleteBooking = async (bookingId) => {
    try {
      const response = await fetch(`/api/bookings/${bookingId}`, {
        method: 'DELETE'
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to delete booking')
      }
      
      // Remove booking from local state
      setBookings(bookings.filter(booking => booking._id !== bookingId))
      
      return true
    } catch (error) {
      console.error('Error deleting booking:', error)
      throw error
    }
  }

  const confirmBooking = async (bookingId, sendEmail = true) => {
    try {
      const response = await fetch('/api/bookings/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId, sendEmail })
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to confirm booking')
      }
      
      const result = await response.json()
      
      // Update the booking in local state if it was successfully confirmed
      if (result.success) {
        setBookings(bookings.map(booking => 
          booking._id === bookingId 
            ? { 
                ...booking, 
                confirmationEmailSent: result.emailSent,
                lastConfirmationAttempt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
              }
            : booking
        ))
      }
      
      return result
    } catch (error) {
      console.error('Error confirming booking:', error)
      throw error
    }
  }

  return {
    bookings,
    loading,
    error,
    updateBookingStatus,
    deleteBooking,
    confirmBooking,
    refetch: fetchBookings
  }
}
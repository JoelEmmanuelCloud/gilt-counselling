//hooks/useBookings.js
'use client'
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
      const response = await fetch('/api/bookings')
      
      if (!response.ok) {
        throw new Error('Failed to fetch bookings')
      }
      
      const data = await response.json()
      setBookings(data.bookings || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const createBooking = async (bookingData) => {
    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bookingData),
      })

      if (!response.ok) {
        throw new Error('Failed to create booking')
      }

      const result = await response.json()
      await fetchBookings() // Refresh the list
      return result
    } catch (err) {
      throw new Error(err.message)
    }
  }

  const updateBookingStatus = async (bookingId, status) => {
    try {
      const response = await fetch(`/api/bookings/${bookingId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      })

      if (!response.ok) {
        throw new Error('Failed to update booking status')
      }

      // Update local state
      setBookings(bookings.map(booking => 
        booking._id === bookingId 
          ? { ...booking, status }
          : booking
      ))
    } catch (err) {
      throw new Error(err.message)
    }
  }

  const deleteBooking = async (bookingId) => {
    try {
      const response = await fetch(`/api/bookings/${bookingId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete booking')
      }

      // Update local state
      setBookings(bookings.filter(booking => booking._id !== bookingId))
    } catch (err) {
      throw new Error(err.message)
    }
  }

  const getBookingsByStatus = (status) => {
    return bookings.filter(booking => booking.status === status)
  }

  const getBookingsByUser = (userId) => {
    return bookings.filter(booking => booking.userId === userId)
  }

  const getUpcomingBookings = () => {
    const today = new Date()
    return bookings.filter(booking => {
      const bookingDate = new Date(booking.date)
      return bookingDate >= today && booking.status !== 'cancelled'
    }).sort((a, b) => new Date(a.date) - new Date(b.date))
  }

  return {
    bookings,
    loading,
    error,
    createBooking,
    updateBookingStatus,
    deleteBooking,
    getBookingsByStatus,
    getBookingsByUser,
    getUpcomingBookings,
    refetch: fetchBookings
  }
}
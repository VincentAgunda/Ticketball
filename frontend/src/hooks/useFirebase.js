// src/hooks/useFirebase.js
import { useState, useEffect } from 'react'
import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy,
  onSnapshot,
  serverTimestamp,
  writeBatch
} from 'firebase/firestore'
import { db } from '../lib/firebase'

// Helper function for client-side sorting
const sortByCreatedAt = (data, order = 'desc') => {
  return [...data].sort((a, b) => {
    try {
      const aDate = a.created_at?.toDate ? a.created_at.toDate() : new Date(a.created_at || 0)
      const bDate = b.created_at?.toDate ? b.created_at.toDate() : new Date(b.created_at || 0)
      return order === 'desc' ? bDate.getTime() - aDate.getTime() : aDate.getTime() - bDate.getTime()
    } catch (error) {
      console.error('Error sorting data:', error)
      return 0
    }
  })
}

// Custom hook for matches
export const useMatches = () => {
  const [matches, setMatches] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchMatches()
    
    // Real-time subscription
    const unsubscribe = onSnapshot(
      collection(db, 'matches'),
      (snapshot) => {
        const matchesData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
        setMatches(sortByCreatedAt(matchesData))
        setLoading(false)
      },
      (err) => {
        console.error('Matches real-time error:', err)
        setError(err.message)
        setLoading(false)
      }
    )

    return () => unsubscribe()
  }, [])

  const fetchMatches = async () => {
    try {
      setLoading(true)
      setError(null)
      const matchesRef = collection(db, 'matches')
      
      let querySnapshot
      try {
        const q = query(matchesRef, orderBy('match_date', 'asc'))
        querySnapshot = await getDocs(q)
      } catch (indexError) {
        console.warn('Ordered query failed, using simple query:', indexError)
        querySnapshot = await getDocs(matchesRef)
      }
      
      let matchesData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      
      // Ensure sorting if we used fallback
      matchesData = sortByCreatedAt(matchesData, 'asc')
      
      setMatches(matchesData)
    } catch (err) {
      console.error('Error fetching matches:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const createMatch = async (matchData) => {
    try {
      setError(null)
      const matchesRef = collection(db, 'matches')
      const docRef = await addDoc(matchesRef, {
        ...matchData,
        created_at: serverTimestamp(),
        updated_at: serverTimestamp()
      })
      return { id: docRef.id, ...matchData }
    } catch (err) {
      console.error('Error creating match:', err)
      setError(err.message)
      throw err
    }
  }

  const updateMatch = async (matchId, updates) => {
    try {
      setError(null)
      const matchRef = doc(db, 'matches', matchId)
      await updateDoc(matchRef, {
        ...updates,
        updated_at: serverTimestamp()
      })
      return true
    } catch (err) {
      console.error('Error updating match:', err)
      setError(err.message)
      throw err
    }
  }

  const deleteMatch = async (matchId) => {
    try {
      setError(null)
      const matchRef = doc(db, 'matches', matchId)
      await deleteDoc(matchRef)
      return true
    } catch (err) {
      console.error('Error deleting match:', err)
      setError(err.message)
      throw err
    }
  }

  return { 
    matches, 
    loading, 
    error, 
    refetch: fetchMatches,
    createMatch,
    updateMatch,
    deleteMatch
  }
}

// Custom hook for user tickets - UPDATED with better error handling
export const useUserTickets = (userId) => {
  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (userId) {
      fetchTickets()
      
      // Real-time subscription with error handling for index issues
      try {
        const ticketsRef = collection(db, 'tickets')
        let q
        
        try {
          q = query(
            ticketsRef, 
            where('user_id', '==', userId),
            orderBy('created_at', 'desc')
          )
        } catch (indexError) {
          console.warn('Indexed query failed, using simple query:', indexError)
          q = query(ticketsRef, where('user_id', '==', userId))
        }

        const unsubscribe = onSnapshot(
          q,
          (snapshot) => {
            const ticketsData = snapshot.docs.map(doc => ({
              id: doc.id,
              ...doc.data()
            }))
            
            // Sort by created_at descending on client side if needed
            const sortedTickets = sortByCreatedAt(ticketsData)
            setTickets(sortedTickets)
            setLoading(false)
          },
          (err) => {
            console.error('Real-time subscription error:', err)
            setError(err.message)
            // If real-time fails, fall back to regular fetch
            fetchTickets()
          }
        )

        return () => unsubscribe()
      } catch (err) {
        console.error('Subscription setup error:', err)
        setError(err.message)
        fetchTickets()
      }
    } else {
      setTickets([])
      setLoading(false)
    }
  }, [userId])

  const fetchTickets = async () => {
    if (!userId) {
      setTickets([])
      setLoading(false)
      return
    }
    
    try {
      setLoading(true)
      setError(null)
      const ticketsRef = collection(db, 'tickets')
      
      // Try the indexed query first, fallback to simple query if it fails
      let querySnapshot
      try {
        const q = query(
          ticketsRef, 
          where('user_id', '==', userId),
          orderBy('created_at', 'desc')
        )
        querySnapshot = await getDocs(q)
      } catch (indexError) {
        console.warn('Indexed query failed, using simple query:', indexError)
        // Fallback: get all user tickets and sort client-side
        const simpleQuery = query(ticketsRef, where('user_id', '==', userId))
        querySnapshot = await getDocs(simpleQuery)
      }
      
      let ticketsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      
      // Ensure sorting if we used fallback
      ticketsData = sortByCreatedAt(ticketsData)
      
      setTickets(ticketsData)
    } catch (err) {
      console.error('Error fetching tickets:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const createTicket = async (ticketData) => {
    try {
      setError(null)
      const ticketsRef = collection(db, 'tickets')
      const docRef = await addDoc(ticketsRef, {
        ...ticketData,
        created_at: serverTimestamp(),
        updated_at: serverTimestamp()
      })
      console.log('Ticket created successfully:', docRef.id)
      return { id: docRef.id, ...ticketData }
    } catch (err) {
      console.error('Error creating ticket:', err)
      setError(err.message)
      throw err
    }
  }

  const updateTicket = async (ticketId, updates) => {
    try {
      setError(null)
      const ticketRef = doc(db, 'tickets', ticketId)
      await updateDoc(ticketRef, {
        ...updates,
        updated_at: serverTimestamp()
      })
      console.log('Ticket updated successfully:', ticketId)
      return true
    } catch (err) {
      console.error('Error updating ticket:', err)
      setError(err.message)
      throw err
    }
  }

  const createMultipleTickets = async (ticketsData) => {
    try {
      setError(null)
      const batch = writeBatch(db)
      const createdTickets = []

      ticketsData.forEach(ticketData => {
        const ticketRef = doc(collection(db, 'tickets'))
        batch.set(ticketRef, {
          ...ticketData,
          created_at: serverTimestamp(),
          updated_at: serverTimestamp()
        })
        createdTickets.push({ id: ticketRef.id, ...ticketData })
      })

      await batch.commit()
      console.log('Multiple tickets created successfully')
      return createdTickets
    } catch (err) {
      console.error('Error creating multiple tickets:', err)
      setError(err.message)
      throw err
    }
  }

  return { 
    tickets, 
    loading, 
    error, 
    refetch: fetchTickets,
    createTicket,
    updateTicket,
    createMultipleTickets
  }
}

// Custom hook for all tickets (admin) - UPDATED
export const useAllTickets = () => {
  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchTickets()
    
    // Real-time subscription
    const unsubscribe = onSnapshot(
      collection(db, 'tickets'),
      (snapshot) => {
        const ticketsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
        setTickets(sortByCreatedAt(ticketsData))
        setLoading(false)
      },
      (err) => {
        console.error('All tickets real-time error:', err)
        setError(err.message)
        setLoading(false)
      }
    )

    return () => unsubscribe()
  }, [])

  const fetchTickets = async () => {
    try {
      setLoading(true)
      setError(null)
      const ticketsRef = collection(db, 'tickets')
      
      let querySnapshot
      try {
        const q = query(ticketsRef, orderBy('created_at', 'desc'))
        querySnapshot = await getDocs(q)
      } catch (indexError) {
        console.warn('Ordered query failed, using simple query:', indexError)
        querySnapshot = await getDocs(ticketsRef)
      }
      
      let ticketsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      
      // Ensure sorting if we used fallback
      ticketsData = sortByCreatedAt(ticketsData)
      
      setTickets(ticketsData)
    } catch (err) {
      console.error('Error fetching all tickets:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const updateTicket = async (ticketId, updates) => {
    try {
      setError(null)
      const ticketRef = doc(db, 'tickets', ticketId)
      await updateDoc(ticketRef, {
        ...updates,
        updated_at: serverTimestamp()
      })
      return true
    } catch (err) {
      console.error('Error updating ticket:', err)
      setError(err.message)
      throw err
    }
  }

  const deleteTicket = async (ticketId) => {
    try {
      setError(null)
      const ticketRef = doc(db, 'tickets', ticketId)
      await deleteDoc(ticketRef)
      return true
    } catch (err) {
      console.error('Error deleting ticket:', err)
      setError(err.message)
      throw err
    }
  }

  return { 
    tickets, 
    loading, 
    error, 
    refetch: fetchTickets,
    updateTicket,
    deleteTicket
  }
}

// Custom hook for payments
export const usePayments = (userId = null) => {
  const [payments, setPayments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchPayments()
  }, [userId])

  const fetchPayments = async () => {
    try {
      setLoading(true)
      setError(null)
      const paymentsRef = collection(db, 'payments')
      let q
      
      if (userId) {
        // Get payments for specific user through their tickets
        const userTicketsQuery = query(collection(db, 'tickets'), where('user_id', '==', userId))
        const userTicketsSnapshot = await getDocs(userTicketsQuery)
        const userTicketIds = userTicketsSnapshot.docs.map(doc => doc.id)
        
        if (userTicketIds.length > 0) {
          q = query(paymentsRef, where('ticket_id', 'in', userTicketIds))
        } else {
          setPayments([])
          setLoading(false)
          return
        }
      } else {
        q = query(paymentsRef, orderBy('created_at', 'desc'))
      }
      
      const querySnapshot = await getDocs(q)
      const paymentsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      setPayments(sortByCreatedAt(paymentsData))
    } catch (err) {
      console.error('Error fetching payments:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const createPayment = async (paymentData) => {
    try {
      setError(null)
      const paymentsRef = collection(db, 'payments')
      const docRef = await addDoc(paymentsRef, {
        ...paymentData,
        created_at: serverTimestamp()
      })
      return { id: docRef.id, ...paymentData }
    } catch (err) {
      console.error('Error creating payment:', err)
      setError(err.message)
      throw err
    }
  }

  const updatePayment = async (paymentId, updates) => {
    try {
      setError(null)
      const paymentRef = doc(db, 'payments', paymentId)
      await updateDoc(paymentRef, {
        ...updates,
        updated_at: serverTimestamp()
      })
      return true
    } catch (err) {
      console.error('Error updating payment:', err)
      setError(err.message)
      throw err
    }
  }

  return { 
    payments, 
    loading, 
    error, 
    refetch: fetchPayments,
    createPayment,
    updatePayment
  }
}

// Custom hook for users (admin)
export const useUsers = () => {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchUsers()
    
    // Real-time subscription
    const unsubscribe = onSnapshot(
      collection(db, 'users'),
      (snapshot) => {
        const usersData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
        setUsers(sortByCreatedAt(usersData))
        setLoading(false)
      },
      (err) => {
        console.error('Users real-time error:', err)
        setError(err.message)
        setLoading(false)
      }
    )

    return () => unsubscribe()
  }, [])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      setError(null)
      const usersRef = collection(db, 'users')
      const querySnapshot = await getDocs(usersRef)
      const usersData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      setUsers(sortByCreatedAt(usersData))
    } catch (err) {
      console.error('Error fetching users:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const updateUser = async (userId, updates) => {
    try {
      setError(null)
      const userRef = doc(db, 'users', userId)
      await updateDoc(userRef, {
        ...updates,
        updated_at: serverTimestamp()
      })
      return true
    } catch (err) {
      console.error('Error updating user:', err)
      setError(err.message)
      throw err
    }
  }

  return { 
    users, 
    loading, 
    error, 
    refetch: fetchUsers,
    updateUser
  }
}

export default {
  useMatches,
  useUserTickets,
  useAllTickets,
  usePayments,
  useUsers
}
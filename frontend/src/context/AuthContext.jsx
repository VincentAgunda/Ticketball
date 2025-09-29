import React, { createContext, useContext, useEffect, useState } from "react";
import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  onIdTokenChanged,
  updateProfile
} from 'firebase/auth';
import { 
  doc, 
  getDoc, 
  setDoc, 
  serverTimestamp
} from 'firebase/firestore';
import { auth, db } from '../lib/firebase';

const AuthContext = createContext(undefined);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authLoading, setAuthLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch user profile from Firestore
  const fetchUserProfile = async (userId) => {
    if (!userId) return null;
    
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      
      if (userDoc.exists()) {
        return { id: userDoc.id, ...userDoc.data() };
      } else {
        // Create user profile if it doesn't exist
        const newProfile = {
          role: 'user',
          email: auth.currentUser?.email || '',
          displayName: auth.currentUser?.displayName || '',
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        };
        
        await setDoc(doc(db, 'users', userId), newProfile);
        return { id: userId, ...newProfile };
      }
    } catch (err) {
      console.error("Error fetching user profile:", err);
      return { id: userId, role: 'user' };
    }
  };

  useEffect(() => {
    // Subscribe to Firebase auth state
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setLoading(true);
      
      try {
        if (firebaseUser) {
          const userData = {
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName,
            photoURL: firebaseUser.photoURL
          };
          setUser(userData);

          const profile = await fetchUserProfile(firebaseUser.uid);
          setUserProfile(profile);

          // Fetch fresh token on login
          const token = await firebaseUser.getIdToken(true);
          localStorage.setItem('firebaseToken', token);
        } else {
          setUser(null);
          setUserProfile(null);
          localStorage.removeItem('firebaseToken');
        }
      } catch (error) {
        console.error("Error in auth state change:", error);
        setError("Failed to load user data");
      } finally {
        setLoading(false);
      }
    });

    // Listen for token refresh and update localStorage automatically
    const unsubscribeToken = onIdTokenChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const freshToken = await firebaseUser.getIdToken(true);
        localStorage.setItem('firebaseToken', freshToken);
      } else {
        localStorage.removeItem('firebaseToken');
      }
    });

    return () => {
      unsubscribe();
      unsubscribeToken();
    };
  }, []);

  const signUp = async (email, password, displayName = '') => {
    try {
      setAuthLoading(true);
      setError(null);
      
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update profile with display name
      if (displayName) {
        await updateProfile(userCredential.user, {
          displayName: displayName
        });
      }
      
      // Create user profile in Firestore
      const newProfile = {
        role: 'user',
        displayName: displayName,
        email: email,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      
      await setDoc(doc(db, 'users', userCredential.user.uid), newProfile);
      
      // Get token immediately after sign up
      const token = await userCredential.user.getIdToken(true);
      localStorage.setItem('firebaseToken', token);

      return userCredential;
    } catch (error) {
      let errorMessage = 'Sign up failed';
      
      switch (error.code) {
        case 'auth/email-already-in-use':
          errorMessage = 'Email already in use';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Invalid email address';
          break;
        case 'auth/weak-password':
          errorMessage = 'Password should be at least 6 characters';
          break;
        case 'auth/operation-not-allowed':
          errorMessage = 'Email/password accounts are not enabled. Please contact support.';
          break;
        default:
          errorMessage = error.message;
      }
      
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setAuthLoading(false);
    }
  };

  const signIn = async (email, password) => {
    try {
      setAuthLoading(true);
      setError(null);
      
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      // Get token immediately after sign in
      const token = await userCredential.user.getIdToken(true);
      localStorage.setItem('firebaseToken', token);

      return userCredential;
    } catch (error) {
      let errorMessage = 'Sign in failed';
      
      switch (error.code) {
        case 'auth/user-not-found':
          errorMessage = 'No account found with this email';
          break;
        case 'auth/wrong-password':
          errorMessage = 'Incorrect password';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Invalid email address';
          break;
        case 'auth/too-many-requests':
          errorMessage = 'Too many failed attempts. Please try again later.';
          break;
        case 'auth/operation-not-allowed':
          errorMessage = 'Email/password accounts are not enabled. Please contact support.';
          break;
        case 'auth/invalid-credential':
          errorMessage = 'Invalid email or password';
          break;
        default:
          errorMessage = error.message;
      }
      
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setAuthLoading(false);
    }
  };

  const signOutUser = async () => {
    try {
      setAuthLoading(true);
      setError(null);
      await signOut(auth);
      localStorage.removeItem('firebaseToken');
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setAuthLoading(false);
    }
  };

  const clearError = () => setError(null);

  const isAdmin = userProfile?.role === "admin";

  const value = {
    user,
    userProfile,
    loading,
    authLoading,
    error,
    signUp,
    signIn,
    signOut: signOutUser,
    clearError,
    isAdmin,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

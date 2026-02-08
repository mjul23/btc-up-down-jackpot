import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL
const SUPABASE_ANON_KEY = process.env.REACT_APP_SUPABASE_ANON_KEY

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

// Fonctions d'authentification
export const signIn = async (email, password) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  })
  return { data, error }
}

export const signUp = async (email, password) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password
  })
  return { data, error }
}

export const signOut = async () => {
  const { error } = await supabase.auth.signOut()
  return { error }
}

export const getUser = () => {
  return supabase.auth.getUser()
}

// Fonctions de gestion des paris
export const createPari = async (userId, choix, mise) => {
  const { data, error } = await supabase
    .from('paris')
    .insert([{
      user_id: userId,
      choix: choix, // true = UP, false = DOWN
      mise: mise,
      timestamp: new Date().toISOString()
    }])
    .select()
    .single()
  
  return { data, error }
}

export const getUserParis = async (userId) => {
  const { data, error } = await supabase
    .from('paris')
    .select('*')
    .eq('user_id', userId)
    .order('timestamp', { ascending: false })
  
  return { data, error }
}

export const getLeaderboard = async () => {
  const { data, error } = await supabase
    .from('users')
    .select('id, address, total_gagne, total_mise, paris_gagnes, paris_total')
    .order('total_gagne', { ascending: false })
    .limit(10)
  
  return { data, error }
}

export const updateUserStats = async (userId, stats) => {
  const { data, error } = await supabase
    .from('users')
    .update(stats)
    .eq('id', userId)
  
  return { data, error }
}

// Fonctions de monitoring
export const getCurrentJackpot = async () => {
  const { data, error } = await supabase
    .from('jackpot')
    .select('amount')
    .order('created_at', { ascending: false })
    .limit(1)
    .single()
  
  return { data, error }
}

export const updateJackpot = async (amount) => {
  const { data, error } = await supabase
    .from('jackpot')
    .insert([{
      amount: amount,
      timestamp: new Date().toISOString()
    }])
    .select()
    .single()
  
  return { data, error }
}
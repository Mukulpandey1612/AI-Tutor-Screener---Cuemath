'use client'
import { signIn } from 'next-auth/react'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion' // Added for premium feel

export default function LoginPage() {
  const [user, setUser] = useState('')
  const [pass, setPass] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    const res = await signIn('credentials', {
      username: user,
      password: pass,
      redirect: false,
    })

    if (res?.error) {
      setError('Invalid credentials')
      setIsLoading(false)
    } else {
      router.push('/admin/dashboard')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-math-grid p-4 relative overflow-hidden">
      
      {/* 🎨 Background Radial Glow - Gives depth to the grid */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#e8bc20]/10 rounded-full blur-[120px] pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative z-10 w-full max-w-sm"
      >
        <form 
          onSubmit={handleSubmit} 
          className="bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.08)]"
        >
          {/* 🚀 Brand Icon Header */}
          <div className="mb-8 flex flex-col items-center text-center">
            {/* <div className="w-14 h-14 bg-[#e8bc20] rounded-2xl flex items-center justify-center shadow-lg shadow-yellow-200/50 mb-4 transition-transform hover:scale-105">
              <span className="text-white text-3xl font-black italic">C</span>
            </div> */}
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Recruiter Login</h1>
            <p className="text-sm text-gray-400 mt-1 uppercase tracking-widest font-mono text-[10px]">
              Intelligence Dashboard
            </p>
          </div>

          {error && (
            <motion.div 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="mb-6 p-3 bg-red-50 border border-red-100 rounded-xl text-[11px] text-red-600 font-medium text-center"
            >
              {error}
            </motion.div>
          )}

          <div className="space-y-4 mb-8">
            <div className="group">
              <input 
                type="text" 
                placeholder="Username" 
                className="w-full p-4 rounded-2xl border border-gray-100 bg-gray-50/50 outline-none focus:bg-white focus:border-[#e8bc20] focus:ring-4 focus:ring-[#e8bc20]/10 transition-all text-sm"
                onChange={e => setUser(e.target.value)}
                disabled={isLoading}
                required 
              />
            </div>
            <div className="group">
              <input 
                type="password" 
                placeholder="Password" 
                className="w-full p-4 rounded-2xl border border-gray-100 bg-gray-50/50 outline-none focus:bg-white focus:border-[#e8bc20] focus:ring-4 focus:ring-[#e8bc20]/10 transition-all text-sm"
                onChange={e => setPass(e.target.value)}
                disabled={isLoading}
                required 
              />
            </div>
          </div>

          <button 
            type="submit"
            disabled={isLoading}
            className="w-full py-4 bg-[#f6c928] text-black font-extrabold rounded-2xl hover:shadow-xl hover:shadow-yellow-200/50 active:scale-[0.98] transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-lg shadow-yellow-100"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span className="text-sm">Authenticating...</span>
              </>
            ) : (
              <span className="text-sm">Enter Dashboard</span>
            )}
          </button>
        </form>

        {/* 📎 Footer Note */}
        <p className="mt-8 text-center text-[10px] font-mono text-black uppercase tracking-[0.4em]">
          Secure Cuemath Internal Environment
        </p>
      </motion.div>
    </div>
  )
}
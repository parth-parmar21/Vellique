import React, { useState } from 'react'
import { useAuth } from '../hook/useAuth'
import { useNavigate } from 'react-router-dom'
import ContinueWithGoogle from '../components/ContinueWithGoogle'

const Login = () => {
    const { handleLogin } = useAuth()
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    })


    const navigate = useNavigate()

    const handleChange = e => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        await handleLogin({
            email: formData.email,
            password: formData.password,
        })

        navigate('/')
    }

    const inputStyle = {
        width: '100%',
        backgroundColor: '#0d0d0d',
        border: '1px solid #2e2e2e',
        borderRadius: '4px',
        padding: '12px 16px',
        fontSize: '14px',
        fontFamily: 'Inter, sans-serif',
        color: '#211E1A',
        outline: 'none',
        transition: 'border-color 0.2s, box-shadow 0.2s',
        backgroundColor: 'white'
    }

    const labelStyle = {
        fontFamily: 'Inter, sans-serif',
        fontSize: '10px',
        fontWeight: 600,
        letterSpacing: '0.18em',
        textTransform: 'uppercase',
        color: '#9a9078',
    }

    const handleFocus = e => {
        e.target.style.borderColor = '#f5c518'
        e.target.style.boxShadow = '0 0 0 1px #f5c51840'
    }

    const handleBlur = e => {
        e.target.style.borderColor = '#2e2e2e'
        e.target.style.boxShadow = 'none'
    }

    return (
        <div className="h-screen w-full flex flex-col lg:flex-row overflow-hidden bg-[#F8F5F0] text-[#211E1A] font-sans antialiased">

            {/* ════════════════════════════════════════
            LEFT PANEL — Editorial Fashion Visual
        ════════════════════════════════════════ */}
            <aside className="hidden lg:flex lg:w-1/2 xl:w-[48%] relative flex-col justify-between overflow-hidden bg-[#1c1a17]">

                {/* Background Image */}
                <img
                    src="https://i.pinimg.com/736x/8a/fb/41/8afb41f60ff7ebdf89de13cf0e543c9f.jpg"
                    alt="Vellique fashion"
                    className="absolute inset-0 w-full h-full object-cover object-top opacity-90"
                />

                {/* Warm Editorial Overlays */}
                <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60 pointer-events-none" />
                <div className="absolute inset-0 bg-gradient-to-r from-black/30 via-transparent to-transparent pointer-events-none" />

                {/* Brand */}
                <div className="relative z-10 px-8 py-7 xl:px-10 xl:py-8">
                    <span className="font-serif text-white text-lg tracking-[0.25em] uppercase font-normal">
                        VELLIQUE
                    </span>
                </div>

                {/* Editorial Copy */}
                <div className="relative z-10 px-8 py-8 xl:px-10 xl:py-9">

                    <h2 className="font-serif text-white text-3xl xl:text-[40px] font-normal leading-[1.1] tracking-tight mb-3">
                        Welcome back
                        <br />
                        to Vellique.
                    </h2>

                    <p className="text-white/80 font-sans text-xs xl:text-sm font-light leading-relaxed max-w-sm tracking-wide">
                        Continue exploring premium fashion, thoughtfully curated for you.
                    </p>

                </div>

            </aside>


            {/* ════════════════════════════════════════
            RIGHT PANEL — Login Form
        ════════════════════════════════════════ */}
            <main className="flex-1 h-screen flex items-center justify-center overflow-y-auto bg-[#F8F5F0] px-5 py-6 sm:px-8 lg:px-10 xl:px-14">

                <div className="w-full max-w-[410px]">

                    {/* Mobile Brand */}
                    <div className="lg:hidden text-center mb-5">
                        <span className="font-serif text-[#9D782F] text-lg tracking-[0.25em] uppercase font-medium">
                            VELLIQUE
                        </span>
                    </div>


                    {/* Header */}
                    <header className="text-center mb-6">

                        <span className="text-[9px] sm:text-[15px] font-mono uppercase tracking-[0.1em] text-[#9D782F] font-semibold block mb-1.5">
                            WELCOME BACK
                        </span>

                        <h1 className="text-[28px] sm:text-4xl font-serif text-[#211E1A] font-normal tracking-tight mb-1.5">
                            Sign in to Vellique
                        </h1>

                        <p className="text-[11px] sm:text-xs text-[#756E63] font-light leading-relaxed">
                            Welcome back! Please enter your details.
                        </p>

                    </header>


                    {/* Login Form */}
                    <form
                        onSubmit={handleSubmit}
                        className="flex flex-col gap-4"
                    >

                        {/* Email */}
                        <div className="flex flex-col gap-1">

                            <label
                                htmlFor="email"
                                className="text-[9px] font-semibold font-mono tracking-[0.18em] uppercase text-[#211E1A]"
                            >
                                EMAIL
                            </label>

                            <input
                                id="email"
                                name="email"
                                type="email"
                                placeholder="jane@example.com"
                                value={formData.email}
                                onChange={handleChange}
                                autoComplete="off"
                                required
                                className="w-full h-[42px] bg-white border border-[#DDD6CA] px-3.5 text-[13px] text-[#211E1A] placeholder-[#999083] outline-none rounded-none focus:border-[#9D782F] transition-colors duration-200"
                                onFocus={handleFocus}
                                onBlur={handleBlur}
                            />

                        </div>


                        {/* Password */}
                        <div className="flex flex-col gap-1">

                            <label
                                htmlFor="password"
                                className="text-[9px] font-semibold font-mono tracking-[0.18em] uppercase text-[#211E1A]"
                            >
                                PASSWORD
                            </label>

                            <input
                                id="password"
                                name="password"
                                type="password"
                                placeholder="••••••••"
                                value={formData.password}
                                onChange={handleChange}
                                autoComplete="off"
                                required
                                className="w-full h-[42px] bg-white border border-[#DDD6CA] px-3.5 text-[13px] text-[#211E1A] placeholder-[#999083] outline-none rounded-none focus:border-[#9D782F] transition-colors duration-200"
                                onFocus={handleFocus}
                                onBlur={handleBlur}
                            />

                        </div>


                        {/* Sign In Button */}
                        <button
                            type="submit"
                            className="w-full h-[44px] bg-[#9D782F] hover:bg-[#8A6827] text-white font-mono text-[10px] font-bold tracking-[0.18em] uppercase rounded-none shadow-sm transition-colors duration-200 cursor-pointer mt-1"
                        >
                            SIGN IN
                        </button>


                        {/* Google */}
                        <ContinueWithGoogle />


                        {/* Sign Up */}
                        <p className="text-center text-[11px] text-[#756E63] mt-1 font-light">

                            Don't have an account?

                            <a
                                href="/register"
                                className="text-[#9D782F] font-medium hover:underline transition-colors ml-1"
                            >
                                Register
                            </a>

                        </p>

                    </form>

                </div>

            </main>

        </div>
    )
}

export default Login
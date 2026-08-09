import React, { useState } from 'react'
import { useAuth } from '../hook/useAuth'
import { useNavigate } from 'react-router-dom'
import ContinueWithGoogle from '../components/ContinueWithGoogle'

const Register = () => {
    const { handleRegister } = useAuth()
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        contactNo: '',
        password: '',
        isSeller: false,
    })

    const [showPassword, setShowPassword] = useState(false)

    const navigate = useNavigate()

    const handleChange = e => {
        const { name, value, type, checked } = e.target
        setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        await handleRegister({
            email: formData.email,
            contact: formData.contactNo,
            password: formData.password,
            fullName: formData.fullName,
            isSeller: formData.isSeller,
        })

        navigate('/login')
    }

    return (
        <div className="h-screen w-full flex flex-col lg:flex-row overflow-hidden bg-[#F8F5F0] text-[#211E1A] font-sans antialiased selection:bg-[#9D782F] selection:text-white">

            {/* ════════════════════════════════════════
            LEFT PANEL — Editorial Fashion Visual
        ════════════════════════════════════════ */}
            <aside className="hidden lg:flex lg:w-1/2 xl:w-[48%] relative flex-col justify-between overflow-hidden bg-[#1c1a17]">

                <img
                    src="https://i.pinimg.com/736x/05/1b/f7/051bf793b1c5bbc349bd916f5998fa36.jpg"
                    alt="Vellique editorial coat fashion"
                    className="absolute inset-0 w-full h-full object-cover object-top opacity-90"
                />

                {/* Editorial overlays */}
                <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60 pointer-events-none" />
                <div className="absolute inset-0 bg-gradient-to-r from-black/30 via-transparent to-transparent pointer-events-none" />

                {/* Brand */}
                <div className="relative z-10 px-8 py-7 xl:px-10 xl:py-8">
                    <span className="font-serif text-white text-lg tracking-[0.25em] uppercase font-normal">
                        VELLIQUE
                    </span>
                </div>

                {/* Editorial Text */}
                <div className="relative z-10 px-8 py-8 xl:px-10 xl:py-9">
                    <h2 className="font-serif text-white text-3xl xl:text-[40px] font-normal leading-[1.1] tracking-tight mb-3">
                        Dress the story
                        <br />
                        you want to tell.
                    </h2>

                    <p className="text-white/80 font-sans text-xs xl:text-sm font-light leading-relaxed max-w-sm tracking-wide">
                        Premium fashion, thoughtfully curated for the modern wardrobe.
                    </p>
                </div>
            </aside>


            {/* ════════════════════════════════════════
            RIGHT PANEL — Registration
        ════════════════════════════════════════ */}
            <main className="flex-1 h-screen flex items-center justify-center overflow-y-auto bg-[#F8F5F0] px-5 py-6 sm:px-8 lg:px-10 xl:px-14">

                {/* Mobile Brand */}
                <div className="w-full max-w-102.5">

                    <div className="lg:hidden text-center mb-5">
                        <span className="font-serif text-[#9D782F] text-lg tracking-[0.25em] uppercase font-medium">
                            VELLIQUE
                        </span>
                    </div>

                    {/* Form Container */}
                    <div className="w-full">

                        {/* Header */}
                        <header className="text-center mb-5">

                            <span className="text-[9px] sm:text-[10px] font-mono uppercase tracking-[0.25em] text-[#9D782F] font-semibold block mb-1.5">
                                WELCOME TO VELLIQUE
                            </span>

                            <h1 className="sm:text-4xl font-serif text-[#211E1A] font-normal tracking-tight mb-1.5">
                                Create your account
                            </h1>

                            <p className="text-[11px] sm:text-xs text-[#756E63] font-light leading-relaxed">
                                Join Vellique and discover a more considered wardrobe.
                            </p>

                        </header>


                        {/* ═══════════════════════
                        REGISTRATION FORM
                    ═══════════════════════ */}
                        <form
                            onSubmit={handleSubmit}
                            className="flex flex-col gap-3.5"
                        >

                            {/* Full Name */}
                            <div className="flex flex-col gap-1">

                                <label
                                    htmlFor="fullName"
                                    className="text-[10px] font-semibold font-mono tracking-[0.18em] uppercase text-[#211E1A]"
                                >
                                    FULL NAME
                                </label>

                                <input
                                    id="fullName"
                                    name="fullName"
                                    type="text"
                                    placeholder="Jane Doe"
                                    value={formData.fullName}
                                    onChange={handleChange}
                                    required
                                    autoComplete="off"
                                    className="w-full h-10.5 bg-white border border-[#DDD6CA] px-3.5 text-[13px] text-[#211E1A] placeholder-[#999083] outline-none rounded-none focus:border-[#9D782F] transition-colors duration-200"
                                />

                            </div>


                            {/* Contact Number */}
                            <div className="flex flex-col gap-1">

                                <label
                                    htmlFor="contactNo"
                                    className="text-[9px] font-semibold font-mono tracking-[0.18em] uppercase text-[#211E1A]"
                                >
                                    CONTACT NUMBER
                                </label>

                                <input
                                    id="contactNo"
                                    name="contactNo"
                                    type="tel"
                                    placeholder="+1 (555) 000-0000"
                                    value={formData.contactNo}
                                    onChange={handleChange}
                                    autoComplete="off"
                                    className="w-full h-10.5 bg-white border border-[#DDD6CA] px-3.5 text-[13px] text-[#211E1A] placeholder-[#999083] outline-none rounded-none focus:border-[#9D782F] transition-colors duration-200"
                                />

                            </div>


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
                                    required
                                    autoComplete="off"
                                    className="w-full h-10.5 bg-white border border-[#DDD6CA] px-3.5 text-[13px] text-[#211E1A] placeholder-[#999083] outline-none rounded-none focus:border-[#9D782F] transition-colors duration-200"
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

                                <div className="relative flex items-center">

                                    <input
                                        id="password"
                                        name="password"
                                        type={showPassword ? "text" : "password"}
                                        placeholder="••••••••"
                                        value={formData.password}
                                        onChange={handleChange}
                                        required
                                        autoComplete="off"
                                        className="w-full h-10.5 bg-white border border-[#DDD6CA] pl-3.5 pr-11 text-[13px] text-[#211E1A] placeholder-[#999083] outline-none rounded-none focus:border-[#9D782F] transition-colors duration-200"
                                    />

                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(prev => !prev)}
                                        className="absolute right-3 text-[#756E63] hover:text-[#211E1A] transition-colors p-1"
                                        title={showPassword ? "Hide password" : "Show password"}
                                    >
                                        {showPassword ? (
                                            <svg
                                                className="w-4 h-4"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={1.5}
                                                    d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858-5.908a10.03 10.03 0 013.682-.763c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21M3 3l18 18"
                                                />
                                            </svg>
                                        ) : (
                                            <svg
                                                className="w-4 h-4"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={1.5}
                                                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                                />
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={1.5}
                                                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                                />
                                            </svg>
                                        )}
                                    </button>

                                </div>
                            </div>


                            {/* Seller Switch */}
                            <div className="pt-1">

                                <div className="flex items-center justify-between pb-3 border-b border-[#DDD6CA]">

                                    <label
                                        htmlFor="isSeller"
                                        className="text-[9px] font-semibold font-mono tracking-[0.18em] uppercase text-[#211E1A] cursor-pointer"
                                    >
                                        REGISTER AS A SELLER
                                    </label>

                                    <label className="relative inline-flex items-center cursor-pointer">

                                        <input
                                            id="isSeller"
                                            name="isSeller"
                                            type="checkbox"
                                            checked={formData.isSeller}
                                            onChange={handleChange}
                                            className="sr-only peer"
                                        />

                                        <div className="w-10 h-[22px] bg-[#E5DFD5] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-[#DDD6CA] after:border after:rounded-full after:h-[18px] after:w-[18px] after:transition-all peer-checked:bg-[#9D782F]" />

                                    </label>

                                </div>

                            </div>


                            {/* Create Account */}
                            <button
                                type="submit"
                                className="w-full h-[44px] bg-[#222] hover:bg-[#333] text-white font-mono text-sm font-bold tracking-[0.1em] uppercase rounded-md transition-colors duration-200 cursor-pointer"
                            >
                                CREATE ACCOUNT
                            </button>


                            {/* OR Divider */}
                            <div className="relative flex items-center justify-center my-0.5">

                                <div className="border-t border-[#DDD6CA] w-full" />

                                <span className="bg-[#] px-3 text-[9px] font-mono uppercase tracking-widest text-[#999083] absolute">
                                    OR
                                </span>

                            </div>


                            {/* Google */}
                            <ContinueWithGoogle />


                            {/* Sign In */}
                            <p className="text-center text-[11px] text-[#756E63] mt-0.5 font-light">

                                Already have an account?

                                <a
                                    href="/login"
                                    className="text-[#9D782F] font-medium hover:underline transition-colors ml-1"
                                >
                                    Sign In
                                </a>

                            </p>

                        </form>

                    </div>

                </div>

            </main>

        </div>
    )


}

export default Register
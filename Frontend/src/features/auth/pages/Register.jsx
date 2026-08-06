import React, { useState } from 'react'
import { useAuth } from '../hook/useAuth'
import { useNavigate } from 'react-router-dom'

const Register = () => {
    const { handleRegister} = useAuth()
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        contactNo: '',
        password: '',
        isSeller: false,
    })

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

    const inputStyle = {
        width: '100%',
        backgroundColor: '#0d0d0d',
        border: '1px solid #2e2e2e',
        borderRadius: '4px',
        padding: '12px 16px',
        fontSize: '14px',
        fontFamily: 'Inter, sans-serif',
        color: '#e5e2e1',
        outline: 'none',
        transition: 'border-color 0.2s, box-shadow 0.2s',
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
        <div
            className="h-screen flex"
            style={{ backgroundColor: '#0d0d0d', fontFamily: 'Inter, sans-serif' }}
        >
            {/* ════════════════════════════════════════
                LEFT PANEL — brand visual (desktop only)
            ════════════════════════════════════════ */}
            <aside
                className="hidden lg:flex lg:w-1/2 xl:w-[55%] relative flex-col justify-between overflow-hidden"
                style={{ minHeight: '100vh' }}
            >
                {/* background image */}
                <img
                    src="/fashion-panel.png"
                    alt="Vellique fashion"
                    style={{
                        position: 'absolute',
                        inset: 0,
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        objectPosition: 'center',
                        opacity: 0.55,
                    }}
                />

                {/* dark gradient overlays */}
                <div
                    style={{
                        position: 'absolute',
                        inset: 0,
                        background: 'linear-gradient(135deg, #0d0d0d 0%, transparent 60%)',
                    }}
                />
                <div
                    style={{
                        position: 'absolute',
                        inset: 0,
                        background: 'linear-gradient(to right, #0d0d0d 0%, transparent 35%)',
                    }}
                />
                <div
                    style={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        height: '40%',
                        background: 'linear-gradient(to top, #0d0d0d 0%, transparent 100%)',
                    }}
                />

                {/* top brand mark */}
                <div className="relative z-10 p-10 xl:p-14">
                    <span
                        style={{
                            fontFamily: 'Montserrat, sans-serif',
                            fontSize: '13px',
                            fontWeight: 700,
                            letterSpacing: '0.35em',
                            textTransform: 'uppercase',
                            color: '#f5c518',
                        }}
                    >
                        Vellique
                    </span>
                </div>

                {/* bottom editorial copy */}
                <div className="relative z-10 p-10 xl:p-14">
                    {/* golden accent line */}
                    <div
                        style={{
                            width: '36px',
                            height: '2px',
                            backgroundColor: '#f5c518',
                            marginBottom: '24px',
                        }}
                    />
                    <p
                        style={{
                            fontFamily: 'Montserrat, sans-serif',
                            fontSize: '30px',
                            fontWeight: 700,
                            lineHeight: 1.25,
                            letterSpacing: '-0.01em',
                            color: '#e5e2e1',
                            maxWidth: '320px',
                            marginBottom: '16px',
                        }}
                    >
                        Dress the story
                        <br />
                        you want to tell.
                    </p>
                    <p
                        style={{
                            fontFamily: 'Inter, sans-serif',
                            fontSize: '13px',
                            lineHeight: 1.7,
                            color: '#9a9078',
                            maxWidth: '260px',
                        }}
                    >
                        Premium fashion, thoughtfully curated
                        <br />
                        for the modern wardrobe.
                    </p>
                </div>
            </aside>

            {/* ════════════════════════════════════════
                RIGHT PANEL — form
            ════════════════════════════════════════ */}
            <main
                className="flex-1 flex flex-col justify-center min-h-screen"
                style={{ padding: '48px 32px' }}
            >
                {/* mobile-only brand mark */}
                <div className="lg:hidden mb-10 text-center">
                    <span
                        style={{
                            fontFamily: 'Montserrat, sans-serif',
                            fontSize: '13px',
                            fontWeight: 700,
                            letterSpacing: '0.35em',
                            textTransform: 'uppercase',
                            color: '#f5c518',
                        }}
                    >
                        Vellique
                    </span>
                </div>

                <div style={{ maxWidth: '440px', width: '100%', margin: '0 auto' }}>

                    {/* heading */}
                    <header style={{ marginBottom: '20px' }}>
                        <h1
                            style={{
                                fontFamily: 'Montserrat, sans-serif',
                                fontSize: '26px',
                                fontWeight: 700,
                                color: '#e5e2e1',
                                letterSpacing: '-0.01em',
                                lineHeight: 1.3,
                                marginBottom: '8px',
                            }}
                        >
                            Create Your Account
                        </h1>
                        <p
                            style={{
                                fontFamily: 'Inter, sans-serif',
                                fontSize: '13px',
                                color: '#6b6055',
                                letterSpacing: '0.04em',
                            }}
                        >
                            Join Vellique — discover fashion made for you.
                        </p>
                    </header>

                    {/* form */}
                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>

                            {/* Full Name */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <label htmlFor="fullName" style={labelStyle}>
                                    Full Name
                                </label>
                                <input
                                    id="fullName"
                                    name="fullName"
                                    type="text"
                                    placeholder="John Doe"
                                    value={formData.fullName}
                                    onChange={handleChange}
                                    required
                                    autoComplete="off"
                                    style={inputStyle}
                                    onFocus={handleFocus}
                                    onBlur={handleBlur}
                                />
                            </div>

                            {/* Contact No. */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <label htmlFor="contactNo" style={labelStyle}>
                                    Contact No.
                                </label>
                                <input
                                    id="contactNo"
                                    name="contactNo"
                                    type="tel"
                                    placeholder="+91 98765 43210"
                                    value={formData.contactNo}
                                    onChange={handleChange}
                                    autoComplete="off"
                                    style={inputStyle}
                                    onFocus={handleFocus}
                                    onBlur={handleBlur}
                                />
                            </div>

                        {/* Email */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <label htmlFor="email" style={labelStyle}>
                                Email
                            </label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                placeholder="john@example.com"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                autoComplete="off"
                                style={inputStyle}
                                onFocus={handleFocus}
                                onBlur={handleBlur}
                            />
                        </div>

                        {/* Password */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <label htmlFor="password" style={labelStyle}>
                                Password
                            </label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                placeholder="••••••••"
                                value={formData.password}
                                onChange={handleChange}
                                required
                                autoComplete="off"
                                style={inputStyle}
                                onFocus={handleFocus}
                                onBlur={handleBlur}
                            />
                        </div>

                        {/* divider */}
                        <div style={{ borderTop: '1px solid #1f1f1f', margin: '2px 0' }} />

                        {/* isSeller */}
                        <div
                            className="flex items-center gap-4"
                            style={{
                                padding: '14px 16px',
                                borderRadius: '4px',
                                border: `1px solid ${formData.isSeller ? '#f5c51850' : '#1f1f1f'}`,
                                backgroundColor: formData.isSeller ? '#f5c5180a' : 'transparent',
                                transition: 'all 0.2s',
                                cursor: 'pointer',
                            }}
                        >
                            <input
                                id="isSeller"
                                name="isSeller"
                                type="checkbox"
                                checked={formData.isSeller}
                                onChange={handleChange}
                                style={{
                                    width: '16px',
                                    height: '16px',
                                    flexShrink: 0,
                                    accentColor: '#f5c518',
                                    cursor: 'pointer',
                                }}
                            />

                            <div style={{ flex: 1 }}>
                                <p style={{ fontSize: '13px', fontWeight: 500, color: '#e5e2e1', marginBottom: '2px' }}>
                                    Register as a Seller
                                </p>
                                <p style={{ fontSize: '11px', color: '#6b6055', letterSpacing: '0.02em' }}>
                                    List your clothing on the Vellique marketplace
                                </p>
                            </div>

                            {/* pill badge */}
                            <span
                                style={{
                                    marginLeft: 'auto',
                                    fontSize: '9px',
                                    fontWeight: 600,
                                    letterSpacing: '0.14em',
                                    textTransform: 'uppercase',
                                    padding: '3px 8px',
                                    borderRadius: '999px',
                                    border: '1px solid #2e2e2e',
                                    color: formData.isSeller ? '#f5c518' : '#4a4a4a',
                                    backgroundColor: formData.isSeller ? '#f5c5181a' : 'transparent',
                                    transition: 'all 0.2s',
                                    flexShrink: 0,
                                }}
                            >
                                isSeller
                            </span>
                        </div>
                                {/* testing */}
                                <a href="/api/auth/google"
                                className='text-sm underline'
                                >Sign in with Google</a>
                        {/* submit */}
                        <button
                            type="submit"
                            style={{
                                width: '100%',
                                padding: '15px 24px',
                                borderRadius: '4px',
                                border: 'none',
                                backgroundColor: '#f5c518',
                                color: '#0d0d0d',
                                fontSize: '12px',
                                fontWeight: 700,
                                fontFamily: 'Inter, sans-serif',
                                letterSpacing: '0.14em',
                                textTransform: 'uppercase',
                                cursor: 'pointer',
                                transition: 'background-color 0.2s, transform 0.1s',
                            }}
                            onMouseEnter={e => e.currentTarget.style.backgroundColor = '#ffe08b'}
                            onMouseLeave={e => e.currentTarget.style.backgroundColor = '#f5c518'}
                            onMouseDown={e => e.currentTarget.style.transform = 'scale(0.99)'}
                            onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
                        >
                            Create Account
                        </button>

                        {/* sign in link */}
                        <p
                            style={{
                                textAlign: 'center',
                                fontSize: '12px',
                                color: '#6b6055',
                                marginTop: '4px',
                            }}
                        >
                            Already have an account?{' '}
                            <a
                                href="/login"
                                style={{
                                    color: '#f5c518',
                                    fontWeight: 500,
                                    textDecoration: 'underline',
                                    textUnderlineOffset: '3px',
                                    textDecorationThickness: '1px',
                                }}
                                onMouseEnter={e => e.currentTarget.style.color = '#ffe08b'}
                                onMouseLeave={e => e.currentTarget.style.color = '#f5c518'}
                            >
                                Sign In
                            </a>
                        </p>

                    </form>
                </div>
            </main>
        </div>
    )
}

export default Register
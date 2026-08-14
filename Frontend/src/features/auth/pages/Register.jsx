import React, { useState } from 'react';
import { useAuth } from "../hook/useAuth";
import { useNavigate } from 'react-router';
import ContinueWithGoogle from '../components/ContinueWithGoogle';

const Register = () => {
    const { handleRegister } = useAuth();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        fullName: '',
        contactNumber: '',
        email: '',
        password: '',
        isSeller: false
    });

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        await handleRegister({
            email: formData.email,
            contact: formData.contactNumber,
            password: formData.password,
            isSeller: formData.isSeller,
            fullName: formData.fullName
        });

        navigate("/login");
    };

    const inputStyle = {
        color: '#211E1A',
        borderBottom: '1px solid #DDD7CC',
        fontFamily: "'Inter', sans-serif"
    };

    const handleFocus = (e) => {
        e.target.style.borderBottomColor = '#9D782F';
    };

    const handleBlur = (e) => {
        e.target.style.borderBottomColor = '#DDD7CC';
    };

    return (
        <>
            {/* Google Fonts */}
            <link
                href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400&family=Inter:wght@300;400;500;600&display=swap"
                rel="stylesheet"
            />

            <div
                className="h-screen w-full flex flex-col lg:flex-row overflow-hidden selection:bg-[#9D782F]/30"
                style={{
                    backgroundColor: '#C9A96E',
                    fontFamily: "'Inter', sans-serif"
                }}
            >

                {/* ─────────────────────────────────
                    LEFT — EDITORIAL IMAGE
                ───────────────────────────────── */}
                <div
                    className="hidden lg:flex lg:w-1/2 h-screen relative overflow-hidden"
                    style={{ backgroundColor: '#211E1A' }}
                >

                    <img
                        src="https://i.pinimg.com/736x/05/1b/f7/051bf793b1c5bbc349bd916f5998fa36.jpg"
                        alt="Vellique Fashion Editorial"
                        className="absolute inset-0 w-full h-full object-cover object-top"
                    />

                    {/* Subtle overlay */}
                    <div
                        className="absolute inset-0"
                        style={{
                            background:
                                'linear-gradient(to top, rgba(33,30,26,0.65) 0%, rgba(33,30,26,0.08) 55%, transparent 100%)'
                        }}
                    />

                    <div className="absolute inset-0 px-10 xl:px-14 py-8 flex flex-col justify-between z-10">

                        {/* Brand */}
                        <span
                            className="text-sm font-normal tracking-[0.3em] uppercase"
                            style={{
                                fontFamily: "'Cormorant Garamond', serif",
                                color: '#FFFFFF'
                            }}
                        >
                            Vellique.
                        </span>

                        {/* Editorial Copy */}
                        <div className="max-w-md">

                            <p
                                className="text-4xl xl:text-5xl font-light leading-[1.05] text-white mb-3"
                                style={{
                                    fontFamily: "'Cormorant Garamond', serif"
                                }}
                            >
                                Define your
                                <br />
                                <em>aesthetic.</em>
                            </p>

                            <p
                                className="text-xs xl:text-sm font-light leading-relaxed max-w-xs"
                                style={{
                                    color: 'rgba(255,255,255,0.68)'
                                }}
                            >
                                Join the exclusive movement of creators and brands
                                redefining the modern fashion landscape.
                            </p>

                        </div>
                    </div>
                </div>


                {/* ─────────────────────────────────
                    RIGHT — REGISTER FORM
                ───────────────────────────────── */}
                <div
                    className="w-full lg:w-1/2 h-screen flex items-center justify-center px-6 sm:px-10 lg:px-14 xl:px-20 py-5 overflow-y-auto"
                    style={{ backgroundColor: '#fbf9f6' }}
                >

                    <div className="w-full max-w-sm">

                        {/* Mobile Brand */}
                        <div className="lg:hidden mb-6">
                            <span
                                className="text-sm tracking-[0.3em] uppercase"
                                style={{
                                    fontFamily: "'Cormorant Garamond', serif",
                                    color: '#9D782F'
                                }}
                            >
                                Vellique.
                            </span>
                        </div>


                        {/* Header */}
                        <div className="mb-6">

                            <p
                                className="text-[9px] uppercase tracking-[0.2em] mb-2 font-medium"
                                style={{ color: '#9D782F' }}
                            >
                                Welcome to Vellique
                            </p>

                            <h1
                                className="text-[2.25rem] xl:text-[2.6rem] font-light leading-[1.05]"
                                style={{
                                    fontFamily: "'Cormorant Garamond', serif",
                                    color: '#211E1A'
                                }}
                            >
                                Elevate Your Style
                            </h1>

                        </div>


                        {/* Form */}
                        <form
                            onSubmit={handleSubmit}
                            className="flex flex-col gap-4"
                        >

                            {/* Full Name */}
                            <div className="flex flex-col gap-1">

                                <label
                                    htmlFor="reg-fullName"
                                    className="text-[9px] uppercase tracking-[0.16em] font-medium"
                                    style={{ color: '#756E63' }}
                                >
                                    Full Name
                                </label>

                                <input
                                    id="reg-fullName"
                                    type="text"
                                    name="fullName"
                                    value={formData.fullName}
                                    onChange={handleChange}
                                    required
                                    placeholder="e.g. John Doe"
                                    className="w-full bg-transparent outline-none py-2 text-[13px] transition-colors duration-300"
                                    style={inputStyle}
                                    onFocus={handleFocus}
                                    onBlur={handleBlur}
                                />

                            </div>


                            {/* Contact Number */}
                            <div className="flex flex-col gap-1">

                                <label
                                    htmlFor="reg-contact"
                                    className="text-[9px] uppercase tracking-[0.16em] font-medium"
                                    style={{ color: '#756E63' }}
                                >
                                    Contact Number
                                </label>

                                <input
                                    id="reg-contact"
                                    type="tel"
                                    name="contactNumber"
                                    value={formData.contactNumber}
                                    onChange={handleChange}
                                    required
                                    placeholder="+91 98765 43210"
                                    className="w-full bg-transparent outline-none py-2 text-[13px] transition-colors duration-300"
                                    style={inputStyle}
                                    onFocus={handleFocus}
                                    onBlur={handleBlur}
                                />

                            </div>


                            {/* Email */}
                            <div className="flex flex-col gap-1">

                                <label
                                    htmlFor="reg-email"
                                    className="text-[9px] uppercase tracking-[0.16em] font-medium"
                                    style={{ color: '#756E63' }}
                                >
                                    Email Address
                                </label>

                                <input
                                    id="reg-email"
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                    placeholder="hello@example.com"
                                    className="w-full bg-transparent outline-none py-2 text-[13px] transition-colors duration-300"
                                    style={inputStyle}
                                    onFocus={handleFocus}
                                    onBlur={handleBlur}
                                />

                            </div>


                            {/* Password */}
                            <div className="flex flex-col gap-1">

                                <label
                                    htmlFor="reg-password"
                                    className="text-[9px] uppercase tracking-[0.16em] font-medium"
                                    style={{ color: '#756E63' }}
                                >
                                    Password
                                </label>

                                <input
                                    id="reg-password"
                                    type="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                    placeholder="••••••••"
                                    className="w-full bg-transparent outline-none py-2 text-[13px] transition-colors duration-300"
                                    style={inputStyle}
                                    onFocus={handleFocus}
                                    onBlur={handleBlur}
                                />

                            </div>


                            {/* Seller Checkbox */}
                            <label
                                htmlFor="reg-isSeller"
                                className="flex items-center gap-3 cursor-pointer group mt-1"
                            >

                                <div className="relative flex-shrink-0">

                                    <input
                                        id="reg-isSeller"
                                        type="checkbox"
                                        name="isSeller"
                                        checked={formData.isSeller}
                                        onChange={handleChange}
                                        className="peer sr-only"
                                    />

                                    <div
                                        className="w-4 h-4 border transition-all duration-200 flex items-center justify-center"
                                        style={{
                                            borderColor: formData.isSeller
                                                ? '#9D782F'
                                                : '#DDD7CC',
                                            backgroundColor: formData.isSeller
                                                ? '#9D782F'
                                                : 'transparent'
                                        }}
                                    >
                                        {formData.isSeller && (
                                            <svg
                                                className="w-2.5 h-2.5"
                                                viewBox="0 0 12 12"
                                                fill="none"
                                            >
                                                <path
                                                    d="M2 6l3 3 5-5"
                                                    stroke="#F7F4EE"
                                                    strokeWidth="1.5"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                />
                                            </svg>
                                        )}
                                    </div>

                                </div>

                                <span
                                    className="text-[10px] uppercase tracking-[0.14em] transition-colors duration-200"
                                    style={{
                                        color: formData.isSeller
                                            ? '#9D782F'
                                            : '#756E63'
                                    }}
                                >
                                    Register as Seller
                                </span>

                            </label>


                            {/* Sign Up */}
                            <button
                                type="submit"
                                className="w-full py-3.5 text-[10px] uppercase tracking-[0.22em] font-medium transition-all duration-300 mt-1"
                                style={{
                                    backgroundColor: '#211E1A',
                                    color: '#FFFFFF',
                                    fontFamily: "'Inter', sans-serif"
                                }}
                                onMouseEnter={e => {
                                    e.currentTarget.style.backgroundColor = '#302C27';
                                }}
                                onMouseLeave={e => {
                                    e.currentTarget.style.backgroundColor = '#211E1A';
                                }}
                            >
                                Sign Up
                            </button>


                            {/* Divider */}
                            <div className="flex items-center gap-3 my-0.5">

                                <div
                                    className="flex-1 h-px"
                                    style={{ backgroundColor: '#DDD7CC' }}
                                />

                                <span
                                    className="text-[9px] uppercase tracking-[0.15em]"
                                    style={{ color: '#9A9287' }}
                                >
                                    or
                                </span>

                                <div
                                    className="flex-1 h-px"
                                    style={{ backgroundColor: '#DDD7CC' }}
                                />

                            </div>


                            {/* Google */}
                            <ContinueWithGoogle />


                            {/* Footer */}
                            <p
                                className="text-center text-[10px] mt-0.5"
                                style={{ color: '#9A9287' }}
                            >
                                Already have an account?{' '}

                                <a
                                    href="/login"
                                    className="transition-colors duration-200"
                                    style={{
                                        color: '#756E63',
                                        textDecoration: 'underline',
                                        textUnderlineOffset: '3px'
                                    }}
                                    onMouseEnter={e => {
                                        e.target.style.color = '#9D782F';
                                    }}
                                    onMouseLeave={e => {
                                        e.target.style.color = '#756E63';
                                    }}
                                >
                                    Sign in
                                </a>

                            </p>

                        </form>

                    </div>
                </div>
            </div>
        </>
    );
};

export default Register;


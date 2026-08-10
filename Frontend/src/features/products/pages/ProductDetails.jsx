import React, { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { useProducts } from '../hook/useProduct'
import { getProductById } from '../services/product.api'
import {
    Heart,
    ShoppingBag,
    ArrowLeft,
    Package,
    Sparkles,
    ChevronLeft,
    ChevronRight,
} from 'lucide-react'

/* ─── Shared Helpers (mirrored from Home.jsx) ─── */

const CURRENCY_SYMBOLS = {
    INR: '₹',
    USD: '$',
    EUR: '€',
    GBP: '£',
    AED: 'AED ',
}

const formatPrice = (priceObj) => {
    if (!priceObj) return 'N/A'

    const amount = priceObj.amount ?? 0
    const currency = priceObj.currency || 'USD'
    const symbol = CURRENCY_SYMBOLS[currency] || `${currency} `

    return `${symbol}${Number(amount).toLocaleString()}`
}

const formatDate = (isoString) => {
    if (!isoString) return ''

    try {
        return new Date(isoString)
            .toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
            })
            .toUpperCase()
    } catch {
        return ''
    }
}

/* ─── Component ─── */

const ProductDetails = () => {
    const { id } = useParams()
    const navigate = useNavigate()
    const { handleGetAllProducts } = useProducts()

    const user = useSelector((state) => state.auth.user)
    const allProducts =
        useSelector((state) => state.product.allProducts) || []

    /* Local state */
    const [product, setProduct] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [selectedImage, setSelectedImage] = useState(0)
    const [wishlist, setWishlist] = useState([])

    /* Fetch single product */
    useEffect(() => {
        let isMounted = true

        async function fetchProduct() {
            setLoading(true)
            setError(null)

            try {
                const data = await getProductById(id)
                if (isMounted) {
                    setProduct(data.product)
                }
            } catch (err) {
                console.error('Failed to load product:', err)
                if (isMounted) {
                    setError(err)
                }
            } finally {
                if (isMounted) {
                    setLoading(false)
                }
            }
        }

        fetchProduct()
        window.scrollTo(0, 0)

        return () => {
            isMounted = false
        }
    }, [id])

    /* Fetch all products for "More from Collection" */
    useEffect(() => {
        if (allProducts.length === 0) {
            handleGetAllProducts().catch((err) =>
                console.error('Failed to load collection:', err)
            )
        }
    }, [])

    /* Related products — exclude current */
    const relatedProducts = allProducts
        .filter((p) => p._id !== id)
        .slice(0, 4)

    /* Wishlist */
    const toggleWishlist = (productId, e) => {
        if (e) e.stopPropagation()
        setWishlist((prev) =>
            prev.includes(productId)
                ? prev.filter((item) => item !== productId)
                : [...prev, productId]
        )
    }

    const isWishlisted = wishlist.includes(id)

    /* Font shorthand */
    const serif = { fontFamily: "'Cormorant Garamond', serif" }
    const mono = { fontFamily: "'DM Mono', monospace" }
    const sans = { fontFamily: "'Inter', sans-serif" }

    /* ================================================================
    LOADING STATE
    ================================================================ */
    if (loading) {
        return (
            <>
                <link
                    href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400&family=Inter:wght@300;400;500;600&family=DM+Mono:wght@300;400;500&display=swap"
                    rel="stylesheet"
                />

                <div
                    className="min-h-screen flex flex-col selection:bg-[#9D782F]/20"
                    style={{ backgroundColor: '#F8F5F0', ...sans }}
                >
                    {/* Header skeleton */}
                    <header className="sticky top-0 z-40 bg-[#F8F5F0]/95 backdrop-blur-md border-b border-[#DDD6CA]">
                        <div className="max-w-[1400px] mx-auto px-6 sm:px-10 lg:px-14">
                            <div className="h-[72px] flex items-center justify-between">
                                <Link to="/" className="group shrink-0">
                                    <span
                                        className="text-[15px] tracking-[0.35em] uppercase font-normal text-[#211E1A] group-hover:text-[#9D782F] transition-colors duration-300"
                                        style={serif}
                                    >
                                        Vellique.
                                    </span>
                                </Link>
                            </div>
                        </div>
                    </header>

                    {/* Breadcrumb skeleton */}
                    <div className="max-w-[1400px] mx-auto px-6 sm:px-10 lg:px-14 pt-10 pb-6">
                        <div className="animate-pulse h-3 bg-[#EBE5DA] w-48" />
                    </div>

                    {/* Content skeleton */}
                    <div className="max-w-[1400px] mx-auto px-6 sm:px-10 lg:px-14 pb-20">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
                            {/* Image skeleton */}
                            <div className="animate-pulse">
                                <div className="aspect-[4/5] bg-[#EBE5DA]" />
                                <div className="flex gap-3 mt-4">
                                    {[1, 2, 3].map((i) => (
                                        <div
                                            key={i}
                                            className="w-[76px] h-[76px] bg-[#EBE5DA]"
                                        />
                                    ))}
                                </div>
                            </div>

                            {/* Info skeleton */}
                            <div className="animate-pulse space-y-6 pt-2">
                                <div className="h-3 bg-[#EBE5DA] w-36" />
                                <div className="space-y-3">
                                    <div className="h-10 bg-[#EBE5DA] w-4/5" />
                                    <div className="h-10 bg-[#EBE5DA] w-3/5" />
                                </div>
                                <div className="h-3 bg-[#EBE5DA] w-28" />
                                <div className="h-9 bg-[#EBE5DA] w-32" />
                                <div className="h-px bg-[#EBE5DA]" />
                                <div className="space-y-2">
                                    <div className="h-3 bg-[#EBE5DA] w-24" />
                                    <div className="h-3 bg-[#EBE5DA] w-full" />
                                    <div className="h-3 bg-[#EBE5DA] w-full" />
                                    <div className="h-3 bg-[#EBE5DA] w-3/4" />
                                </div>
                                <div className="h-px bg-[#EBE5DA]" />
                                <div className="h-[52px] bg-[#EBE5DA] w-full" />
                            </div>
                        </div>
                    </div>
                </div>
            </>
        )
    }

    /* ================================================================
       ERROR STATE
    ================================================================ */
    if (error) {
        return (
            <>
                <link
                    href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400&family=Inter:wght@300;400;500;600&family=DM+Mono:wght@300;400;500&display=swap"
                    rel="stylesheet"
                />

                <div
                    className="min-h-screen flex flex-col selection:bg-[#9D782F]/20"
                    style={{ backgroundColor: '#F8F5F0', ...sans }}
                >
                    {renderHeader()}

                    <div className="grow flex items-center justify-center px-6">
                        <div className="text-center max-w-md py-32">
                            <span
                                className="text-[10px] uppercase tracking-[0.3em] text-[#9D782F] block mb-5"
                                style={mono}
                            >
                                Unable to Load Piece
                            </span>

                            <h1
                                className="text-3xl sm:text-4xl font-light text-[#211E1A] mb-4"
                                style={serif}
                            >
                                Something went wrong.
                            </h1>

                            <p className="text-[12px] text-[#756E63] font-light mb-10 leading-relaxed">
                                Something went wrong while loading this
                                product. Please try again.
                            </p>

                            <button
                                onClick={() => window.location.reload()}
                                className="inline-block text-[9px] uppercase tracking-[0.22em] text-[#211E1A] border-b border-[#211E1A] pb-1.5 hover:text-[#9D782F] hover:border-[#9D782F] transition-colors duration-300"
                                style={mono}
                            >
                                Try Again
                            </button>
                        </div>
                    </div>

                    {renderFooter()}
                </div>
            </>
        )
    }

    /* ================================================================
       PRODUCT NOT FOUND
    ================================================================ */
    if (!product) {
        return (
            <>
                <link
                    href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400&family=Inter:wght@300;400;500;600&family=DM+Mono:wght@300;400;500&display=swap"
                    rel="stylesheet"
                />

                <div
                    className="min-h-screen flex flex-col selection:bg-[#9D782F]/20"
                    style={{ backgroundColor: '#F8F5F0', ...sans }}
                >
                    {renderHeader()}

                    <div className="grow flex items-center justify-center px-6">
                        <div className="text-center max-w-md py-32">
                            <span
                                className="text-[10px] uppercase tracking-[0.3em] text-[#9D782F] block mb-5"
                                style={mono}
                            >
                                The Piece Is Unavailable
                            </span>

                            <h1
                                className="text-3xl sm:text-4xl font-light text-[#211E1A] mb-4"
                                style={serif}
                            >
                                This product could not be found.
                            </h1>

                            <p className="text-[12px] text-[#756E63] font-light mb-10 leading-relaxed">
                                The piece you're looking for may have been
                                removed or is no longer available.
                            </p>

                            <Link
                                to="/"
                                className="inline-block text-[9px] uppercase tracking-[0.22em] text-[#211E1A] border-b border-[#211E1A] pb-1.5 hover:text-[#9D782F] hover:border-[#9D782F] transition-colors duration-300"
                                style={mono}
                            >
                                Return to Collection
                            </Link>
                        </div>
                    </div>

                    {renderFooter()}
                </div>
            </>
        )
    }

    /* ================================================================
       SHARED SECTIONS
    ================================================================ */

    function renderHeader() {
        return (
            <header className="sticky top-0 z-40 bg-[#F8F5F0]/95 backdrop-blur-md border-b border-[#DDD6CA]">
                <div className="max-w-[1400px] mx-auto px-6 sm:px-10 lg:px-14">
                    <div className="h-[72px] flex items-center justify-between">
                        {/* Brand */}
                        <Link to="/" className="group shrink-0">
                            <span
                                className="text-[15px] tracking-[0.35em] uppercase font-normal text-[#211E1A] group-hover:text-[#9D782F] transition-colors duration-300"
                                style={serif}
                            >
                                Vellique.
                            </span>
                        </Link>

                        {/* Navigation Links */}
                        <nav className="hidden lg:flex items-center gap-10">
                            {['COLLECTION', 'NEW ARRIVALS', 'ABOUT'].map(
                                (label) => (
                                    <Link
                                        to="/"
                                        key={label}
                                        className="text-[9px] uppercase tracking-[0.2em] text-[#756E63] hover:text-[#9D782F] transition-colors duration-300"
                                        style={mono}
                                    >
                                        {label}
                                    </Link>
                                )
                            )}
                        </nav>

                        {/* Actions */}
                        <div className="flex items-center gap-5">
                            {user?.role === 'seller' && (
                                <Link
                                    to="/seller/dashboard"
                                    className="hidden sm:inline-flex items-center gap-1.5 text-[9px] uppercase tracking-[0.18em] text-[#9D782F] border border-[#9D782F]/30 px-4 py-2 hover:bg-[#9D782F] hover:text-white transition-all duration-300"
                                    style={mono}
                                >
                                    <Sparkles className="w-3 h-3" />
                                    Seller Studio
                                </Link>
                            )}

                            {user ? (
                                <div className="flex items-center gap-4">
                                    <span
                                        className="text-[11px] text-[#756E63] font-light hidden md:inline"
                                        style={sans}
                                    >
                                        Welcome,{' '}
                                        <span className="text-[#211E1A] font-medium">
                                            {user.fullName ||
                                                user.email?.split(
                                                    '@'
                                                )[0]}
                                        </span>
                                    </span>

                                    {user.role === 'seller' && (
                                        <Link
                                            to="/seller/dashboard"
                                            className="sm:hidden p-2 text-[#9D782F] border border-[#DDD6CA]"
                                            title="Seller Dashboard"
                                        >
                                            <Sparkles className="w-4 h-4" />
                                        </Link>
                                    )}
                                </div>
                            ) : (
                                <div className="flex items-center gap-4">
                                    <Link
                                        to="/login"
                                        className="text-[9px] uppercase tracking-[0.18em] text-[#211E1A] hover:text-[#9D782F] transition-colors duration-300"
                                        style={mono}
                                    >
                                        Sign In
                                    </Link>

                                    <Link
                                        to="/register"
                                        className="px-5 py-2.5 bg-[#211E1A] hover:bg-[#302C27] text-white text-[9px] uppercase tracking-[0.18em] transition-colors duration-300"
                                        style={mono}
                                    >
                                        Register
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </header>
        )
    }

    function renderFooter() {
        return (
            <footer className="border-t border-[#DDD6CA] bg-[#F3EFEA]">
                <div className="max-w-[1400px] mx-auto px-6 sm:px-10 lg:px-14 py-14 sm:py-16">
                    <div className="flex flex-col md:flex-row items-center md:items-end justify-between gap-8">
                        {/* Brand */}
                        <div className="text-center md:text-left">
                            <span
                                className="text-[15px] tracking-[0.35em] uppercase font-normal text-[#211E1A] block mb-2"
                                style={serif}
                            >
                                Vellique.
                            </span>

                            <p className="text-[11px] text-[#756E63] font-light">
                                Curated luxury fashion & tailored catalog
                                pieces.
                            </p>
                        </div>

                        {/* Footer Links */}
                        <div className="flex flex-col sm:flex-row items-center gap-6 sm:gap-8">
                            {['Collection', 'About', 'Contact'].map(
                                (label) => (
                                    <span
                                        key={label}
                                        className="text-[9px] uppercase tracking-[0.18em] text-[#999083] hover:text-[#9D782F] transition-colors duration-300 cursor-pointer"
                                        style={mono}
                                    >
                                        {label}
                                    </span>
                                )
                            )}
                        </div>
                    </div>

                    {/* Copyright */}
                    <div className="mt-10 pt-6 border-t border-[#DDD6CA]">
                        <p
                            className="text-[8px] uppercase tracking-[0.2em] text-[#999083] text-center"
                            style={mono}
                        >
                            © {new Date().getFullYear()} Vellique. All
                            Rights Reserved.
                        </p>
                    </div>
                </div>
            </footer>
        )
    }

    /* ================================================================
       MAIN RENDER — PRODUCT FOUND
    ================================================================ */
    return (
        <>
            {/* Fonts */}
            <link
                href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400&family=Inter:wght@300;400;500;600&family=DM+Mono:wght@300;400;500&display=swap"
                rel="stylesheet"
            />

            <div
                className="min-h-screen flex flex-col selection:bg-[#9D782F]/20"
                style={{ backgroundColor: '#F8F5F0', ...sans }}
            >
                {/* =================================================
                    1. HEADER
                ================================================= */}
                {renderHeader()}

                {/* =================================================
                    2. BREADCRUMB
                ================================================= */}
                <div className="border-b border-[#EBE5DA]">
                    <div className="max-w-[1400px] mx-auto px-6 sm:px-10 lg:px-14 py-5 flex items-center gap-3">
                        <button
                            onClick={() => navigate(-1)}
                            className="flex items-center gap-2 text-[#756E63] hover:text-[#9D782F] transition-colors duration-300"
                            aria-label="Go back"
                        >
                            <ArrowLeft className="w-3.5 h-3.5" />
                        </button>

                        <span
                            className="text-[9px] uppercase tracking-[0.2em] text-[#9A9287]"
                            style={mono}
                        >
                            <Link
                                to="/"
                                className="hover:text-[#9D782F] transition-colors duration-300"
                            >
                                Collection
                            </Link>
                            <span className="mx-2 text-[#DDD6CA]">/</span>
                            <span className="text-[#9D782F]">Product</span>
                        </span>
                    </div>
                </div>

                {/* =================================================
                    3. PRODUCT DETAIL
                ================================================= */}
                <main className="grow">
                    <div className="max-w-[1400px] mx-auto px-6 sm:px-10 lg:px-14 py-10 sm:py-14 lg:py-16">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
                            {/* ─────────────────────────────────────
                                LEFT — IMAGE GALLERY
                            ───────────────────────────────────── */}
                            <div>
                                {/* Main Image */}
                                <div className="relative aspect-square overflow-hidden bg-[#F3EFEA] border border-[#DDD6CA] group cursor-crosshair">
                                    {product.images?.[selectedImage]
                                        ?.url ? (
                                        <img
                                            src={
                                                product.images[
                                                    selectedImage
                                                ].url
                                            }
                                            alt={`${product.title} — Image ${selectedImage + 1}`}
                                            className="w-full h-full object-cover object-top transition-transform duration-700 ease-out group-hover:scale-[1.02]"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex flex-col items-center justify-center text-[#9A9287]">
                                            <Package className="w-12 h-12 mb-3 stroke-[1]" />
                                            <span
                                                className="text-[9px] uppercase tracking-[0.25em]"
                                                style={mono}
                                            >
                                                No Image
                                            </span>
                                        </div>
                                    )}

                                    {/* Prev / Next arrows for multi-image */}
                                    {product.images?.length > 1 && (
                                        <>
                                            <button
                                                onClick={() =>
                                                    setSelectedImage(
                                                        (prev) =>
                                                            prev === 0
                                                                ? product
                                                                    .images
                                                                    .length -
                                                                1
                                                                : prev - 1
                                                    )
                                                }
                                                className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center bg-white/90 backdrop-blur-sm border border-[#DDD6CA] text-[#756E63] hover:text-[#211E1A] hover:border-[#9D782F] opacity-0 group-hover:opacity-100 transition-all duration-300"
                                                aria-label="Previous image"
                                            >
                                                <ChevronLeft className="w-4 h-4" />
                                            </button>

                                            <button
                                                onClick={() =>
                                                    setSelectedImage(
                                                        (prev) =>
                                                            prev ===
                                                                product.images
                                                                    .length -
                                                                1
                                                                ? 0
                                                                : prev + 1
                                                    )
                                                }
                                                className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center bg-white/90 backdrop-blur-sm border border-[#DDD6CA] text-[#756E63] hover:text-[#211E1A] hover:border-[#9D782F] opacity-0 group-hover:opacity-100 transition-all duration-300"
                                                aria-label="Next image"
                                            >
                                                <ChevronRight className="w-4 h-4" />
                                            </button>

                                            {/* Image counter */}
                                            <div className="absolute bottom-3 right-3 px-2.5 py-1 bg-white/90 backdrop-blur-sm border border-[#DDD7CC]">
                                                <span
                                                    className="text-[8px] uppercase tracking-[0.15em] text-[#756E63]"
                                                    style={mono}
                                                >
                                                    {String(
                                                        selectedImage + 1
                                                    ).padStart(2, '0')}
                                                    {' / '}
                                                    {String(
                                                        product.images
                                                            .length
                                                    ).padStart(2, '0')}
                                                </span>
                                            </div>
                                        </>
                                    )}
                                </div>

                                {/* Thumbnails */}
                                {product.images?.length > 1 && (
                                    <div className="flex items-center gap-3 mt-4 overflow-x-auto pb-2">
                                        {product.images.map(
                                            (img, idx) => (
                                                <button
                                                    key={img._id || idx}
                                                    onClick={() =>
                                                        setSelectedImage(
                                                            idx
                                                        )
                                                    }
                                                    className="w-[76px] h-[76px] shrink-0 border overflow-hidden transition-all duration-300"
                                                    style={{
                                                        borderColor:
                                                            selectedImage ===
                                                                idx
                                                                ? '#9D782F'
                                                                : '#DDD6CA',
                                                        opacity:
                                                            selectedImage ===
                                                                idx
                                                                ? 1
                                                                : 0.65,
                                                    }}
                                                    aria-label={`View image ${idx + 1}`}
                                                >
                                                    <img
                                                        src={img.url}
                                                        alt=""
                                                        className="w-full h-full object-cover hover:opacity-100 transition-opacity duration-300"
                                                    />
                                                </button>
                                            )
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* ─────────────────────────────────────
                                RIGHT — PRODUCT INFORMATION
                            ───────────────────────────────────── */}
                            <div className="flex flex-col lg:pt-2 w-[70%]">
                                {/* Eyebrow Label */}
                                <span
                                    className="text-[9px] uppercase tracking-[0.25em] text-[#9D782F] block mb-4"
                                    style={mono}
                                >
                                    Vellique Collection
                                </span>

                                {/* Product Title */}
                                <h1
                                    className="text-[2.2rem] sm:text-[2.6rem] lg:text-[3rem] font-light leading-[1.08] text-[#211E1A]"
                                    style={serif}
                                >
                                    {product.title}
                                </h1>

                                {/* Item Reference */}
                                <div className="flex items-center gap-3 mb-1">
                                    <span
                                        className="text-[8px] uppercase tracking-[0.2em] text-[#999083]"
                                        style={mono}
                                    >
                                        Item Ref
                                    </span>
                                    <span
                                        className="text-[8px] tracking-widest text-[#999083]"
                                        style={mono}
                                    >
                                        {product._id?.slice(0, 12)}…
                                    </span>
                                    {product.createdAt && (
                                        <>
                                            <span className="text-[#DDD6CA]">
                                                ·
                                            </span>
                                            <span
                                                className="text-[8px] uppercase tracking-[0.15em] text-[#9A9287]"
                                                style={mono}
                                            >
                                                {formatDate(
                                                    product.createdAt
                                                )}
                                            </span>
                                        </>
                                    )}
                                </div>

                                {/* Divider */}
                                <div className="w-full h-px bg-[#EBE5DA] mb-5" />

                                {/* Price */}
                                <div className="mb-3">
                                    <span
                                        className="text-[8px] uppercase tracking-[0.2em] text-[#999083] block mb-2"
                                        style={mono}
                                    >
                                        Price
                                    </span>

                                    <span
                                        className="text-[2rem] sm:text-[2.4rem] text-[#9D782F] leading-none"
                                        style={serif}
                                    >
                                        {formatPrice(product.price)}
                                    </span>
                                </div>

                                {/* Divider */}
                                <div className="w-full h-px bg-[#EBE5DA] mb-5" />

                                {/* Description */}
                                {product.description && (
                                    <div className="mb-3">
                                        <span
                                            className="text-[9px] uppercase tracking-[0.2em] text-[#999083] block mb-2"
                                            style={mono}
                                        >
                                            Description
                                        </span>

                                        <p
                                            className="text-[13px] text-[#756E63] font-light leading-[1.7] max-h-52 overflow-y-auto pr-2"
                                            style={sans}
                                        >
                                            {product.description}
                                        </p>
                                    </div>
                                )}

                                {/* Divider */}
                                <div className="w-full h-px bg-[#EBE5DA] mb-5" />

                                {/* Seller info — only if present */}
                                {product.seller && (
                                    <div className="mb-3">
                                        <span
                                            className="text-[8px] uppercase tracking-[0.2em] text-[#999083] block mb-2"
                                            style={mono}
                                        >
                                            Curated By
                                        </span>

                                        <span
                                            className="text-[15px] text-[#211E1A] font-light"
                                            style={serif}
                                        >
                                            {product.seller.fullName ||
                                                product.seller.email?.split(
                                                    '@'
                                                )[0] ||
                                                'Vellique Atelier'}
                                        </span>

                                        <div className="w-full h-px bg-[#EBE5DA] mt-3" />
                                    </div>
                                )}

                                {/* Actions */}
                                <div className="space-y-3">
                                    {/* Add to Bag */}
                                    <div className="flex items-center gap-3">
                                        <button
                                            className="grow h-[52px] bg-[#211E1A] text-white text-[9px] uppercase tracking-[0.22em] hover:bg-[#9D782F] hover:text-[#211E1A] transition-all duration-300 flex items-center justify-center gap-2.5"
                                            style={mono}
                                            aria-label="Add to bag"
                                        >
                                            <ShoppingBag className="w-3.5 h-3.5" />
                                            Add to Bag
                                        </button>

                                        {/* Wishlist */}
                                        <button
                                            onClick={(e) =>
                                                toggleWishlist(id, e)
                                            }
                                            className="shrink-0 w-[52px] h-[52px] flex items-center justify-center border border-[#DDD6CA] hover:border-[#9D782F] transition-all duration-300"
                                            aria-label={
                                                isWishlisted
                                                    ? 'Remove from wishlist'
                                                    : 'Add to wishlist'
                                            }
                                        >
                                            <Heart
                                                className={`w-4 h-4 transition-all duration-300 ${isWishlisted
                                                    ? 'fill-[#9D782F] text-[#9D782F]'
                                                    : 'text-[#756E63]'
                                                    }`}
                                            />
                                        </button>
                                    </div>

                                    {/* Back to collection */}
                                    <Link
                                        to="/"
                                        className="block w-full py-3 text-center bg-transparent hover:bg-[#F3EFEA] text-[#211E1A] text-[9px] uppercase tracking-[0.22em] border border-[#DDD6CA] transition-colors duration-300"
                                        style={mono}
                                    >
                                        Back to Collection
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* =================================================
                        4. MORE FROM THE COLLECTION
                    ================================================= */}
                    {relatedProducts.length > 0 && (
                        <section className="h-screen min-h-[600px] max-h-[1000px] flex flex-col justify-center overflow-hidden">
                            <div className="w-full max-w-[1440px] mx-auto px-5 sm:px-8 lg:px-12 xl:px-16">

                                {/* Section Header */}
                                <div className="flex items-end justify-between mb-[clamp(1.5rem,4vh,3rem)]">
                                    <div>
                                        <p
                                            className="text-[9px] uppercase tracking-[0.3em] text-[#9D782F] mb-2"
                                            style={mono}
                                        >
                                            02 / More Pieces
                                        </p>

                                        <h2
                                            className="text-[clamp(1.5rem,2.5vw,2.25rem)] font-light text-[#211E1A]"
                                            style={serif}
                                        >
                                            More from the Collection
                                        </h2>
                                    </div>

                                    <Link
                                        to="/"
                                        className="hidden sm:inline-block text-[9px] uppercase tracking-[0.22em] text-[#211E1A] border-b border-[#211E1A] pb-1.5 hover:text-[#9D782F] hover:border-[#9D782F] transition-colors duration-300"
                                        style={mono}
                                    >
                                        View All
                                    </Link>
                                </div>

                                {/* Related Grid */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-[clamp(1rem,2vw,1.5rem)] gap-y-[clamp(1.5rem,3vh,2.5rem)]">

                                    {relatedProducts.map((rp) => {
                                        const rpCover = rp.images?.[0]?.url
                                        const rpWishlisted = wishlist.includes(rp._id)

                                        return (
                                            <article
                                                key={rp._id}
                                                className="group min-w-0"
                                            >
                                                {/* Image */}
                                                <Link
                                                    to={`/product/${rp._id}`}
                                                    className="
                                    block
                                    relative
                                    aspect-[4/5]
                                    overflow-hidden
                                    bg-[#F3EFEA]
                                    border border-[#DDD7CC]
                                    mb-[clamp(0.75rem,1.5vh,1.25rem)]
                                    transition-all
                                    duration-500
                                    group-hover:border-[#9D782F]/40
                                "
                                                >
                                                    {rpCover ? (
                                                        <img
                                                            src={rpCover}
                                                            alt={rp.title}
                                                            className="
                                            w-full
                                            h-full
                                            object-cover
                                            object-top
                                            transition-transform
                                            duration-700
                                            ease-out
                                            group-hover:scale-[1.03]
                                        "
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full flex flex-col items-center justify-center text-[#9A9287]">
                                                            <Package className="w-8 h-8 mb-2 stroke-[1]" />

                                                            <span
                                                                className="text-[8px] uppercase tracking-[0.2em]"
                                                                style={mono}
                                                            >
                                                                No Image
                                                            </span>
                                                        </div>
                                                    )}

                                                    {/* Wishlist */}
                                                    <button
                                                        type="button"
                                                        onClick={(e) => {
                                                            e.preventDefault()
                                                            toggleWishlist(rp._id, e)
                                                        }}
                                                        className="
                                        absolute
                                        top-3
                                        right-3
                                        w-8
                                        h-8
                                        flex
                                        items-center
                                        justify-center
                                        bg-white/90
                                        backdrop-blur-sm
                                        border
                                        border-[#DDD7CC]
                                        hover:border-[#9D782F]
                                        transition-all
                                        duration-300
                                        z-10
                                    "
                                                        aria-label={
                                                            rpWishlisted
                                                                ? 'Remove from wishlist'
                                                                : 'Add to wishlist'
                                                        }
                                                    >
                                                        <Heart
                                                            className={`w-3 h-3 transition-all duration-300 ${rpWishlisted
                                                                    ? 'fill-[#9D782F] text-[#9D782F]'
                                                                    : 'text-[#756E63]'
                                                                }`}
                                                        />
                                                    </button>
                                                </Link>

                                                {/* Info */}
                                                <div className="px-1">
                                                    <Link
                                                        to={`/product/${rp._id}`}
                                                        className="block"
                                                    >
                                                        <h3
                                                            className="
                                            text-[clamp(0.9rem,1.3vw,1.125rem)]
                                            font-normal
                                            leading-[1.15]
                                            text-[#211E1A]
                                            mb-1
                                            group-hover:text-[#9D782F]
                                            transition-colors
                                            duration-300
                                            line-clamp-2
                                        "
                                                            style={serif}
                                                        >
                                                            {rp.title}
                                                        </h3>
                                                    </Link>

                                                    <span
                                                        className="text-[clamp(0.9rem,1.3vw,1.125rem)] text-[#9D782F]"
                                                        style={serif}
                                                    >
                                                        {formatPrice(rp.price)}
                                                    </span>
                                                </div>
                                            </article>
                                        )
                                    })}
                                </div>
                            </div>
                        </section>
                    )}
                </main>

                {/* =================================================
                    5. FOOTER
                ================================================= */}
                {renderFooter()}
            </div>
        </>
    )
}

export default ProductDetails

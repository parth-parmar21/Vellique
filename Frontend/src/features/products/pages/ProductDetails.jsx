import React, { useEffect, useState, useCallback } from 'react'
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

/* ─────────────────────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────────────────────── */

const CURRENCY_SYMBOLS = {
    INR: '₹',
    USD: '$',
    EUR: '€',
    GBP: '£',
    AED: 'AED ',
    JPY: '¥',
}

const formatPrice = (priceObj) => {
    if (!priceObj) return 'N/A'
    const amount = priceObj.amount ?? 0
    const currency = priceObj.currency || 'INR'
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

/**
 * Normalize variant attributes from MongoDB Map (may arrive as plain object
 * or as a Map-like structure after JSON serialization).
 */
const normalizeAttributes = (attrs) => {
    if (!attrs) return {}
    if (attrs instanceof Map) return Object.fromEntries(attrs)
    // If it serialized as { [key]: value } plain object — already fine
    if (typeof attrs === 'object' && !Array.isArray(attrs)) return attrs
    return {}
}

/* ─────────────────────────────────────────────────────────────
   FONT SHORTHANDS (module-level so sub-components can use them)
───────────────────────────────────────────────────────────── */
const serif = { fontFamily: "'Cormorant Garamond', serif" }
const mono = { fontFamily: "'DM Mono', monospace" }
const sans = { fontFamily: "'Inter', sans-serif" }

/* ─────────────────────────────────────────────────────────────
   SUB-COMPONENT: VariantOption
   A single selectable option button (rectangular, no pill).
───────────────────────────────────────────────────────────── */
const VariantOption = ({ value, isSelected, isDisabled, onClick }) => {
    return (
        <button
            type="button"
            disabled={isDisabled}
            onClick={onClick}
            className="relative px-4 py-2 text-[9px] uppercase tracking-[0.18em] transition-all duration-300 border"
            style={{
                ...mono,
                borderColor: isSelected ? '#9D782F' : '#DDD6CA',
                backgroundColor: isSelected ? '#F3EFEA' : 'transparent',
                color: isDisabled ? '#C5BFB5' : '#211E1A',
                opacity: isDisabled ? 0.45 : 1,
                cursor: isDisabled ? 'not-allowed' : 'pointer',
                textDecoration: isDisabled ? 'line-through' : 'none',
                textDecorationColor: '#C5BFB5',
            }}
            aria-pressed={isSelected}
            aria-disabled={isDisabled}
            onMouseEnter={(e) => {
                if (!isDisabled && !isSelected) {
                    e.currentTarget.style.borderColor = '#9D782F'
                }
            }}
            onMouseLeave={(e) => {
                if (!isDisabled && !isSelected) {
                    e.currentTarget.style.borderColor = '#DDD6CA'
                }
            }}
        >
            {value}
        </button>
    )
}

/* ─────────────────────────────────────────────────────────────
   SUB-COMPONENT: VariantAttributeGroup
   Renders one attribute key with all its unique values.
───────────────────────────────────────────────────────────── */
const VariantAttributeGroup = ({
    attributeKey,
    values,
    selectedValue,
    isOptionAvailable,
    onSelect,
}) => {
    return (
        <div className="mb-5">
            <span
                className="text-[8px] uppercase tracking-[0.25em] text-[#999083] block mb-3"
                style={mono}
            >
                {attributeKey}
            </span>

            <div className="flex flex-wrap gap-2">
                {values.map((value) => (
                    <VariantOption
                        key={value}
                        value={value}
                        isSelected={selectedValue === value}
                        isDisabled={!isOptionAvailable(attributeKey, value)}
                        onClick={() => onSelect(attributeKey, value)}
                    />
                ))}
            </div>
        </div>
    )
}

/* ─────────────────────────────────────────────────────────────
   SUB-COMPONENT: StockStatus
───────────────────────────────────────────────────────────── */
const StockStatus = ({ stock }) => {
    if (stock === undefined || stock === null) return null

    let label, color
    if (stock === 0) {
        label = 'Sold Out'
        color = '#999083'
    } else if (stock <= 5) {
        label = `Only ${stock} Remaining`
        color = '#9D782F'
    } else {
        label = 'In Stock'
        color = '#756E63'
    }

    return (
        <span
            className="text-[8px] uppercase tracking-[0.22em]"
            style={{ ...mono, color }}
        >
            {label}
        </span>
    )
}

/* ─────────────────────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────────────────────── */
const ProductDetails = () => {
    const { id } = useParams()
    const navigate = useNavigate()
    const { handleGetAllProducts } = useProducts()

    const user = useSelector((s) => s.auth.user)
    const allProducts = useSelector((s) => s.product.allProducts) || []

    /* ── Local state ── */
    const [product, setProduct] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [selectedImage, setSelectedImage] = useState(0)
    const [wishlist, setWishlist] = useState([])
    const [selectedAttributes, setSelectedAttributes] = useState({})
    const [selectedVariant, setSelectedVariant] = useState(null)

    /* ── Fetch single product ── */
    useEffect(() => {
        let isMounted = true

        async function fetchProduct() {
            setLoading(true)
            setError(null)
            setSelectedAttributes({})
            setSelectedVariant(null)
            setSelectedImage(0)

            try {
                const data = await getProductById(id)
                if (isMounted) setProduct(data.product)
            } catch (err) {
                console.error('Failed to load product:', err)
                if (isMounted) setError(err)
            } finally {
                if (isMounted) setLoading(false)
            }
        }

        fetchProduct()
        window.scrollTo(0, 0)
        return () => { isMounted = false }
    }, [id])

    /* ── Fetch all products for "More from Collection" ── */
    useEffect(() => {
        if (allProducts.length === 0) {
            handleGetAllProducts().catch((err) =>
                console.error('Failed to load collection:', err)
            )
        }
    }, []) // eslint-disable-line

    /* ── Derive selectedVariant whenever selectedAttributes changes ── */
    useEffect(() => {
        if (!product?.variants?.length) {
            setSelectedVariant(null)
            return
        }

        const attributeGroups = [
            ...new Set(
                product.variants.flatMap((v) =>
                    Object.keys(normalizeAttributes(v.attributes))
                )
            ),
        ]

        // Only consider a full match when all attribute groups are selected
        const allSelected = attributeGroups.every(
            (key) => selectedAttributes[key] !== undefined
        )

        if (!allSelected) {
            setSelectedVariant(null)
            return
        }

        const match = product.variants.find((v) => {
            const attrs = normalizeAttributes(v.attributes)
            return attributeGroups.every(
                (key) => attrs[key] === selectedAttributes[key]
            )
        })

        setSelectedVariant(match || null)
    }, [selectedAttributes, product])

    /* ── Reset image index when active image set changes ── */
    const activeImages =
        selectedVariant?.images?.length
            ? selectedVariant.images
            : product?.images || []

    const prevActiveRef = React.useRef(activeImages)
    useEffect(() => {
        if (prevActiveRef.current !== activeImages) {
            setSelectedImage(0)
            prevActiveRef.current = activeImages
        }
    }, [activeImages])

    /* ── Related products ── */
    const relatedProducts = allProducts
        .filter((p) => p._id !== id)
        .slice(0, 4)

    /* ── Wishlist ── */
    const toggleWishlist = useCallback((productId, e) => {
        if (e) e.stopPropagation()
        setWishlist((prev) =>
            prev.includes(productId)
                ? prev.filter((item) => item !== productId)
                : [...prev, productId]
        )
    }, [])

    const isWishlisted = wishlist.includes(id)

    /* ── Variant helpers ── */
    const attributeGroups = product?.variants?.length
        ? [
            ...new Set(
                product.variants.flatMap((v) =>
                    Object.keys(normalizeAttributes(v.attributes))
                )
            ),
        ]
        : []

    const uniqueValuesForKey = (key) => [
        ...new Set(
            product?.variants
                ?.map((v) => normalizeAttributes(v.attributes)[key])
                .filter(Boolean)
        ),
    ]

    /**
     * Returns true if selecting `value` for `attributeKey`
     * is compatible with at least one existing variant,
     * given the OTHER already-selected attributes.
     */
    const isOptionAvailable = useCallback(
        (attributeKey, value) => {
            if (!product?.variants) return true
            const hypothetical = { ...selectedAttributes, [attributeKey]: value }
            return product.variants.some((v) => {
                const attrs = normalizeAttributes(v.attributes)
                return Object.entries(hypothetical).every(
                    ([k, val]) => attrs[k] === val
                )
            })
        },
        [selectedAttributes, product]
    )

    const handleAttributeSelect = (key, value) => {
        setSelectedAttributes((prev) => {
            // If already selected, deselect
            if (prev[key] === value) {
                const next = { ...prev }
                delete next[key]
                return next
            }
            return { ...prev, [key]: value }
        })
    }

    /* ── Derived display values ── */
    const displayPrice = selectedVariant?.price?.amount ? selectedVariant.price : product?.price
    const hasVariants = product?.variants?.length > 0
    const allAttrsChosen = attributeGroups.length > 0
        && attributeGroups.every((k) => selectedAttributes[k] !== undefined)

    const addToBagState = (() => {
        if (!hasVariants) return 'enabled'
        if (!allAttrsChosen) return 'select'
        const stockToCheck = selectedVariant ? (selectedVariant.stock ?? product?.stock) : null
        if (selectedVariant && stockToCheck === 0) return 'soldout'
        if (selectedVariant) return 'enabled'
        return 'select'
    })()

    const stockToShow = selectedVariant?.stock ?? product?.stock

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

                        {/* Navigation */}
                        <nav className="hidden lg:flex items-center gap-10">
                            {['COLLECTION', 'NEW ARRIVALS', 'ABOUT'].map((label) => (
                                <Link
                                    to="/"
                                    key={label}
                                    className="text-[9px] uppercase tracking-[0.2em] text-[#756E63] hover:text-[#9D782F] transition-colors duration-300"
                                    style={mono}
                                >
                                    {label}
                                </Link>
                            ))}
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
                                            {user.fullName || user.email?.split('@')[0]}
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
                        <div className="text-center md:text-left">
                            <span
                                className="text-[15px] tracking-[0.35em] uppercase font-normal text-[#211E1A] block mb-2"
                                style={serif}
                            >
                                Vellique.
                            </span>
                            <p className="text-[11px] text-[#756E63] font-light">
                                Curated luxury fashion &amp; tailored catalog pieces.
                            </p>
                        </div>

                        <div className="flex flex-col sm:flex-row items-center gap-6 sm:gap-8">
                            {['Collection', 'About', 'Contact'].map((label) => (
                                <span
                                    key={label}
                                    className="text-[9px] uppercase tracking-[0.18em] text-[#999083] hover:text-[#9D782F] transition-colors duration-300 cursor-pointer"
                                    style={mono}
                                >
                                    {label}
                                </span>
                            ))}
                        </div>
                    </div>

                    <div className="mt-10 pt-6 border-t border-[#DDD6CA]">
                        <p
                            className="text-[8px] uppercase tracking-[0.2em] text-[#999083] text-center"
                            style={mono}
                        >
                            © {new Date().getFullYear()} Vellique. All Rights Reserved.
                        </p>
                    </div>
                </div>
            </footer>
        )
    }

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
                    className="min-h-screen flex flex-col"
                    style={{ backgroundColor: '#F8F5F0', ...sans }}
                >
                    <header className="sticky top-0 z-40 bg-[#F8F5F0]/95 backdrop-blur-md border-b border-[#DDD6CA]">
                        <div className="max-w-[1400px] mx-auto px-6 sm:px-10 lg:px-14">
                            <div className="h-[72px] flex items-center">
                                <Link to="/" className="group">
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
                    <div className="border-b border-[#EBE5DA]">
                        <div className="max-w-[1400px] mx-auto px-6 sm:px-10 lg:px-14 py-5">
                            <div className="animate-pulse h-2.5 bg-[#EBE5DA] w-48 rounded-none" />
                        </div>
                    </div>

                    {/* Content skeleton */}
                    <div className="max-w-[1400px] mx-auto px-6 sm:px-10 lg:px-14 py-10 sm:py-14 lg:py-16 w-full">
                        <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-10 lg:gap-16 items-start">
                            {/* Image skeleton */}
                            <div className="animate-pulse">
                                <div className="aspect-[4/5] bg-[#EBE5DA]" />
                                <div className="flex gap-3 mt-4">
                                    {[1, 2, 3].map((i) => (
                                        <div key={i} className="w-[76px] h-[76px] bg-[#EBE5DA]" />
                                    ))}
                                </div>
                            </div>

                            {/* Info skeleton */}
                            <div className="animate-pulse space-y-6 pt-2">
                                <div className="h-2.5 bg-[#EBE5DA] w-36" />
                                <div className="space-y-3">
                                    <div className="h-10 bg-[#EBE5DA] w-4/5" />
                                    <div className="h-10 bg-[#EBE5DA] w-3/5" />
                                </div>
                                <div className="h-2.5 bg-[#EBE5DA] w-28" />
                                <div className="h-9 bg-[#EBE5DA] w-32" />
                                <div className="h-px bg-[#EBE5DA]" />
                                <div className="space-y-2">
                                    <div className="h-2.5 bg-[#EBE5DA] w-24" />
                                    <div className="h-2.5 bg-[#EBE5DA] w-full" />
                                    <div className="h-2.5 bg-[#EBE5DA] w-full" />
                                    <div className="h-2.5 bg-[#EBE5DA] w-3/4" />
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

                            <p className="text-[12px] text-[#756E63] font-light mb-10 leading-relaxed" style={sans}>
                                Something went wrong while loading this product. Please try again.
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
                                Product not found.
                            </h1>

                            <p className="text-[12px] text-[#756E63] font-light mb-10 leading-relaxed" style={sans}>
                                The piece you're looking for may have been removed or is no longer available.
                            </p>

                            <Link
                                to="/"
                                className="inline-block text-[9px] uppercase tracking-[0.22em] text-[#211E1A] border-b border-[#211E1A] pb-1.5 hover:text-[#9D782F] hover:border-[#9D782F] transition-colors duration-300"
                                style={mono}
                            >
                                Back to Collection
                            </Link>
                        </div>
                    </div>

                    {renderFooter()}
                </div>
            </>
        )
    }

    /* ================================================================
       MAIN RENDER — PRODUCT FOUND
    ================================================================ */
    return (
        <>
            {/* Google Fonts */}
            <link
                href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400&family=Inter:wght@300;400;500;600&family=DM+Mono:wght@300;400;500&display=swap"
                rel="stylesheet"
            />

            <div
                className="min-h-screen flex flex-col selection:bg-[#9D782F]/20"
                style={{ backgroundColor: '#F8F5F0', ...sans }}
            >
                {/* ─────────────────────────────────────────────────────
                    1. HEADER
                ───────────────────────────────────────────────────── */}
                {renderHeader()}

                {/* ─────────────────────────────────────────────────────
                    2. BREADCRUMB
                ───────────────────────────────────────────────────── */}
                <div className="border-b border-[#EBE5DA]">
                    <div className="max-w-[1400px] mx-auto px-6 sm:px-10 lg:px-14 py-5 flex items-center gap-3">
                        <button
                            onClick={() => navigate(-1)}
                            className="flex items-center text-[#756E63] hover:text-[#9D782F] transition-colors duration-300"
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
                                Vellique Collection
                            </Link>
                            <span className="mx-2 text-[#DDD6CA]">/</span>
                            <span className="text-[#9D782F]">Product</span>
                        </span>
                    </div>
                </div>

                {/* ─────────────────────────────────────────────────────
                    3. MAIN PRODUCT AREA
                ───────────────────────────────────────────────────── */}
                <main className="grow">
                    <div className="max-w-[1400px] mx-auto px-6 sm:px-10 lg:px-14 py-10 sm:py-14 lg:py-16">
                        <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-10 lg:gap-16 items-start">

                            {/* ─────────────────────────────────────────
                                LEFT — IMAGE GALLERY
                            ───────────────────────────────────────── */}
                            <div>
                                {/* Main Image */}
                                <div className="relative aspect-[4/5] overflow-hidden bg-[#F3EFEA] border border-[#DDD6CA] group cursor-crosshair">
                                    {activeImages?.[selectedImage]?.url ? (
                                        <img
                                            key={activeImages[selectedImage].url}
                                            src={activeImages[selectedImage].url}
                                            alt={`${product.title} — Image ${selectedImage + 1}`}
                                            className="w-full h-full object-cover object-top transition-all duration-700 ease-out group-hover:scale-[1.02]"
                                            style={{ transition: 'opacity 0.4s ease, transform 0.7s ease' }}
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

                                    {/* Prev / Next — fade in on hover */}
                                    {activeImages?.length > 1 && (
                                        <>
                                            <button
                                                onClick={() =>
                                                    setSelectedImage((prev) =>
                                                        prev === 0 ? activeImages.length - 1 : prev - 1
                                                    )
                                                }
                                                className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center bg-white/90 backdrop-blur-sm border border-[#DDD6CA] text-[#756E63] hover:text-[#211E1A] hover:border-[#9D782F] opacity-0 group-hover:opacity-100 transition-all duration-300"
                                                aria-label="Previous image"
                                            >
                                                <ChevronLeft className="w-4 h-4" />
                                            </button>

                                            <button
                                                onClick={() =>
                                                    setSelectedImage((prev) =>
                                                        prev === activeImages.length - 1 ? 0 : prev + 1
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
                                                    className="text-[8px] tracking-[0.15em] text-[#756E63]"
                                                    style={mono}
                                                >
                                                    {String(selectedImage + 1).padStart(2, '0')}
                                                    {' / '}
                                                    {String(activeImages.length).padStart(2, '0')}
                                                </span>
                                            </div>
                                        </>
                                    )}
                                </div>

                                {/* Thumbnail Strip */}
                                {activeImages?.length > 1 && (
                                    <div className="flex items-center gap-3 mt-4 overflow-x-auto pb-1">
                                        {activeImages.map((img, idx) => (
                                            <button
                                                key={img._id || img.url || idx}
                                                onClick={() => setSelectedImage(idx)}
                                                className="w-[72px] h-[72px] shrink-0 border overflow-hidden transition-all duration-300"
                                                style={{
                                                    borderColor: selectedImage === idx ? '#9D782F' : '#DDD6CA',
                                                    opacity: selectedImage === idx ? 1 : 0.55,
                                                }}
                                                aria-label={`View image ${idx + 1}`}
                                            >
                                                <img
                                                    src={img.url}
                                                    alt=""
                                                    className="w-full h-full object-cover object-top hover:opacity-100 transition-opacity duration-300"
                                                />
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* ─────────────────────────────────────────
                                RIGHT — PRODUCT INFORMATION
                            ───────────────────────────────────────── */}
                            <div className="flex flex-col lg:pt-2">

                                {/* Collection Label */}
                                <span
                                    className="text-[9px] uppercase tracking-[0.28em] text-[#9D782F] block mb-4"
                                    style={mono}
                                >
                                    Vellique Collection
                                </span>

                                {/* Product Title */}
                                <h1
                                    className="text-[2.4rem] sm:text-[2.8rem] lg:text-[3.25rem] font-light leading-[1.06] text-[#211E1A] mb-4"
                                    style={serif}
                                >
                                    {product.title}
                                </h1>

                                {/* Item Reference */}
                                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mb-4">
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
                                            <span className="text-[#DDD6CA]">·</span>
                                            <span
                                                className="text-[8px] uppercase tracking-[0.15em] text-[#9A9287]"
                                                style={mono}
                                            >
                                                {formatDate(product.createdAt)}
                                            </span>
                                        </>
                                    )}
                                </div>

                                {/* Divider */}
                                <div className="w-full h-px bg-[#EBE5DA] mb-5" />

                                {/* Price */}
                                <div className="mb-5">
                                    <span
                                        className="text-[8px] uppercase tracking-[0.2em] text-[#999083] block mb-2"
                                        style={mono}
                                    >
                                        Price
                                    </span>
                                    <span
                                        className="text-[2rem] sm:text-[2.25rem] text-[#9D782F] leading-none"
                                        style={serif}
                                    >
                                        {formatPrice(displayPrice)}
                                    </span>
                                </div>

                                {/* Divider */}
                                <div className="w-full h-px bg-[#EBE5DA] mb-5" />

                                {/* Description */}
                                {product.description && (
                                    <div className="mb-5">
                                        <span
                                            className="text-[8px] uppercase tracking-[0.2em] text-[#999083] block mb-2.5"
                                            style={mono}
                                        >
                                            Description
                                        </span>
                                        <p
                                            className="text-[13px] text-[#756E63] font-light leading-[1.75] max-h-[9.5rem] overflow-y-auto pr-1"
                                            style={sans}
                                        >
                                            {product.description}
                                        </p>
                                    </div>
                                )}

                                {/* Divider */}
                                <div className="w-full h-px bg-[#EBE5DA] mb-5" />

                                {/* ─────────────────────────────────────
                                    VARIANT SELECTOR
                                ───────────────────────────────────── */}
                                {hasVariants && (
                                    <div className="mb-5">
                                        {attributeGroups.map((key) => (
                                            <VariantAttributeGroup
                                                key={key}
                                                attributeKey={key}
                                                values={uniqueValuesForKey(key)}
                                                selectedValue={selectedAttributes[key]}
                                                isOptionAvailable={isOptionAvailable}
                                                onSelect={handleAttributeSelect}
                                            />
                                        ))}

                                        {/* Divider */}
                                        <div className="w-full h-px bg-[#EBE5DA] mt-2 mb-5" />
                                    </div>
                                )}

                                {/* Stock Status */}
                                <div className="mb-5 min-h-[1.25rem]">
                                {hasVariants && allAttrsChosen && selectedVariant ? (
                                        <StockStatus stock={stockToShow} />
                                    ) : !hasVariants ? (
                                        <span
                                            className="text-[8px] uppercase tracking-[0.22em] text-[#756E63]"
                                            style={mono}
                                        >
                                            In Stock
                                        </span>
                                    ) : hasVariants && allAttrsChosen && !selectedVariant ? (
                                        <span
                                            className="text-[8px] uppercase tracking-[0.22em] text-[#999083]"
                                            style={mono}
                                        >
                                            Combination unavailable
                                        </span>
                                    ) : null}
                                </div>

                                {/* ─────────────────────────────────────
                                    ADD TO BAG + WISHLIST
                                ───────────────────────────────────── */}
                                <div className="space-y-3">
                                    <div className="flex items-center gap-3">
                                        {/* Add to Bag */}
                                        <button
                                            disabled={addToBagState === 'select' || addToBagState === 'soldout'}
                                            className="grow h-[52px] text-[9px] uppercase tracking-[0.22em] transition-all duration-300 flex items-center justify-center gap-2.5"
                                            style={{
                                                ...mono,
                                                backgroundColor:
                                                    addToBagState === 'select' || addToBagState === 'soldout'
                                                        ? '#EBE5DA'
                                                        : '#211E1A',
                                                color:
                                                    addToBagState === 'select' || addToBagState === 'soldout'
                                                        ? '#999083'
                                                        : '#FFFFFF',
                                                cursor:
                                                    addToBagState === 'select' || addToBagState === 'soldout'
                                                        ? 'not-allowed'
                                                        : 'pointer',
                                            }}
                                            onMouseEnter={(e) => {
                                                if (addToBagState === 'enabled') {
                                                    e.currentTarget.style.backgroundColor = '#9D782F'
                                                    e.currentTarget.style.color = '#211E1A'
                                                }
                                            }}
                                            onMouseLeave={(e) => {
                                                if (addToBagState === 'enabled') {
                                                    e.currentTarget.style.backgroundColor = '#211E1A'
                                                    e.currentTarget.style.color = '#FFFFFF'
                                                }
                                            }}
                                            aria-label={
                                                addToBagState === 'soldout'
                                                    ? 'Sold out'
                                                    : addToBagState === 'select'
                                                        ? 'Select options'
                                                        : 'Add to bag'
                                            }
                                        >
                                            {addToBagState === 'soldout' ? (
                                                'Sold Out'
                                            ) : addToBagState === 'select' ? (
                                                'Select Options'
                                            ) : (
                                                <>
                                                    <ShoppingBag className="w-3.5 h-3.5" />
                                                    Add to Bag
                                                </>
                                            )}
                                        </button>

                                        {/* Wishlist */}
                                        <button
                                            onClick={(e) => toggleWishlist(id, e)}
                                            className="shrink-0 w-[52px] h-[52px] flex items-center justify-center border border-[#DDD6CA] hover:border-[#9D782F] transition-all duration-300"
                                            aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
                                        >
                                            <Heart
                                                className={`w-4 h-4 transition-all duration-300 ${isWishlisted
                                                        ? 'fill-[#9D782F] text-[#9D782F]'
                                                        : 'text-[#756E63]'
                                                    }`}
                                            />
                                        </button>
                                    </div>

                                    {/* Back to Collection */}
                                    <Link
                                        to="/"
                                        className="block w-full py-3 text-center bg-transparent hover:bg-[#F3EFEA] text-[#211E1A] text-[9px] uppercase tracking-[0.22em] border border-[#DDD6CA] transition-colors duration-300"
                                        style={mono}
                                    >
                                        Back to Collection
                                    </Link>
                                </div>

                                {/* Divider */}
                                <div className="w-full h-px bg-[#EBE5DA] mt-6 mb-5" />

                                {/* Seller */}
                                {product.seller && (
                                    <div>
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
                                                product.seller.email?.split('@')[0] ||
                                                'Vellique Atelier'}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* ─────────────────────────────────────────────────────
                        4. MORE FROM THE COLLECTION
                    ───────────────────────────────────────────────────── */}
                    {relatedProducts.length > 0 && (
                        <section className="border-t border-[#EBE5DA]">
                            <div className="w-full max-w-[1400px] mx-auto px-6 sm:px-10 lg:px-14 xl:px-16 py-16 sm:py-20">

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

                                {/* Related Products Grid */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-[clamp(1rem,2vw,1.5rem)] gap-y-[clamp(1.5rem,3vh,2.5rem)]">
                                    {relatedProducts.map((rp) => {
                                        const rpCover = rp.images?.[0]?.url
                                        const rpWishlisted = wishlist.includes(rp._id)

                                        return (
                                            <article key={rp._id} className="group min-w-0">
                                                {/* Image */}
                                                <Link
                                                    to={`/product/${rp._id}`}
                                                    className="block relative aspect-[4/5] overflow-hidden bg-[#F3EFEA] border border-[#DDD7CC] mb-[clamp(0.75rem,1.5vh,1.25rem)] transition-all duration-500 group-hover:border-[#9D782F]/40"
                                                >
                                                    {rpCover ? (
                                                        <img
                                                            src={rpCover}
                                                            alt={rp.title}
                                                            className="w-full h-full object-cover object-top transition-transform duration-700 ease-out group-hover:scale-[1.03]"
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

                                                    {/* Wishlist button on card */}
                                                    <button
                                                        type="button"
                                                        onClick={(e) => {
                                                            e.preventDefault()
                                                            toggleWishlist(rp._id, e)
                                                        }}
                                                        className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center bg-white/90 backdrop-blur-sm border border-[#DDD7CC] hover:border-[#9D782F] transition-all duration-300 z-10"
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

                                                {/* Card Info */}
                                                <div className="px-1">
                                                    <Link
                                                        to={`/product/${rp._id}`}
                                                        className="block"
                                                    >
                                                        <h3
                                                            className="text-[clamp(0.9rem,1.3vw,1.125rem)] font-normal leading-[1.15] text-[#211E1A] mb-1 group-hover:text-[#9D782F] transition-colors duration-300 line-clamp-2"
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

                {/* ─────────────────────────────────────────────────────
                    5. FOOTER
                ───────────────────────────────────────────────────── */}
                {renderFooter()}
            </div>
        </>
    )
}

export default ProductDetails

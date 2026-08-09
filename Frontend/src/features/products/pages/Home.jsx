import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { useProducts } from '../hook/useProduct'
import { Link } from 'react-router-dom'
import {
    Search,
    ShoppingBag,
    Heart,
    Eye,
    X,
    ArrowUpDown,
    Package,
    User,
    Sparkles,
    Check,
    SlidersHorizontal,
} from 'lucide-react'

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

const Home = () => {
    const { handleGetAllProducts } = useProducts()

    const products = useSelector((state) => state.product.allProducts) || []
    const user = useSelector((state) => state.auth.user)

    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [sortBy, setSortBy] = useState('newest')
    const [selectedProduct, setSelectedProduct] = useState(null)
    const [selectedModalImage, setSelectedModalImage] = useState(0)
    const [wishlist, setWishlist] = useState([])

    useEffect(() => {
        let isMounted = true

        async function fetchProducts() {
            setLoading(true)

            try {
                await handleGetAllProducts()
            } catch (err) {
                console.error('Failed to load products:', err)
            } finally {
                if (isMounted) {
                    setLoading(false)
                }
            }
        }

        fetchProducts()

        return () => {
            isMounted = false
        }
    }, [])

    const toggleWishlist = (id, e) => {
        if (e) e.stopPropagation()

        setWishlist((prev) =>
            prev.includes(id)
                ? prev.filter((item) => item !== id)
                : [...prev, id]
        )
    }

    // Filter Products
    const filteredProducts = products.filter((product) => {
        const query = searchTerm.toLowerCase().trim()

        if (!query) return true

        return (
            product.title?.toLowerCase().includes(query) ||
            product.description?.toLowerCase().includes(query) ||
            product._id?.toLowerCase().includes(query)
        )
    })

    // Sort Products
    const sortedProducts = [...filteredProducts].sort((a, b) => {
        if (sortBy === 'newest') {
            return (
                new Date(b.createdAt || 0) -
                new Date(a.createdAt || 0)
            )
        }

        if (sortBy === 'price-low') {
            return (
                (a.price?.amount || 0) -
                (b.price?.amount || 0)
            )
        }

        if (sortBy === 'price-high') {
            return (
                (b.price?.amount || 0) -
                (a.price?.amount || 0)
            )
        }

        if (sortBy === 'title') {
            return (a.title || '').localeCompare(b.title || '')
        }

        return 0
    })

    return (
        <>
            {/* Fonts */}
            <link
                href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400&family=Inter:wght@300;400;500;600&family=DM+Mono:wght@300;400;500&display=swap"
                rel="stylesheet"
            />

            <div
                className="min-h-screen flex flex-col selection:bg-[#9D782F]/20"
                style={{
                    backgroundColor: '#F8F5F0',
                    fontFamily: "'Inter', sans-serif",
                }}
            >
                {/* =====================================================
                    1. NAVIGATION
                ====================================================== */}
                <header className="sticky top-0 z-40 bg-[#F8F5F0]/95 backdrop-blur-md border-b border-[#DDD6CA]">
                    <div className="max-w-[1400px] mx-auto px-6 sm:px-10 lg:px-14">
                        <div className="h-[72px] flex items-center justify-between">

                            {/* Brand */}
                            <Link to="/" className="group shrink-0">
                                <span
                                    className="text-[15px] tracking-[0.35em] uppercase font-normal text-[#211E1A] group-hover:text-[#9D782F] transition-colors duration-300"
                                    style={{
                                        fontFamily:
                                            "'Cormorant Garamond', serif",
                                    }}
                                >
                                    Vellique.
                                </span>
                            </Link>

                            {/* Navigation Links */}
                            <nav className="hidden lg:flex items-center gap-10">
                                {[
                                    'COLLECTION',
                                    'NEW ARRIVALS',
                                    'ABOUT',
                                ].map((label) => (
                                    <span
                                        key={label}
                                        className="text-[9px] uppercase tracking-[0.2em] text-[#756E63] hover:text-[#9D782F] transition-colors duration-300 cursor-pointer"
                                        style={{
                                            fontFamily:
                                                "'DM Mono', monospace",
                                        }}
                                    >
                                        {label}
                                    </span>
                                ))}
                            </nav>

                            {/* Actions */}
                            <div className="flex items-center gap-5">
                                {user?.role === 'seller' && (
                                    <Link
                                        to="/seller/dashboard"
                                        className="hidden sm:inline-flex items-center gap-1.5 text-[9px] uppercase tracking-[0.18em] text-[#9D782F] border border-[#9D782F]/30 px-4 py-2 hover:bg-[#9D782F] hover:text-white transition-all duration-300"
                                        style={{
                                            fontFamily:
                                                "'DM Mono', monospace",
                                        }}
                                    >
                                        <Sparkles className="w-3 h-3" />
                                        Seller Studio
                                    </Link>
                                )}

                                {user ? (
                                    <div className="flex items-center gap-4">
                                        <span
                                            className="text-[11px] text-[#756E63] font-light hidden md:inline"
                                            style={{
                                                fontFamily:
                                                    "'Inter', sans-serif",
                                            }}
                                        >
                                            Welcome,{' '}
                                            <span className="text-[#211E1A] font-medium">
                                                {user.fullName ||
                                                    user.email?.split('@')[0]}
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
                                            style={{
                                                fontFamily:
                                                    "'DM Mono', monospace",
                                            }}
                                        >
                                            Sign In
                                        </Link>

                                        <Link
                                            to="/register"
                                            className="px-5 py-2.5 bg-[#211E1A] hover:bg-[#302C27] text-white text-[9px] uppercase tracking-[0.18em] transition-colors duration-300"
                                            style={{
                                                fontFamily:
                                                    "'DM Mono', monospace",
                                            }}
                                        >
                                            Register
                                        </Link>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </header>

                {/* =====================================================
                    2. EDITORIAL HERO
                ====================================================== */}
                <section className="border-b border-[#DDD6CA]">
                    <div className="max-w-[1400px] mx-auto px-6 sm:px-10 lg:px-14 py-20 sm:py-28 lg:py-36">
                        <div className="max-w-3xl">

                            {/* Eyebrow */}
                            <p
                                className="text-[10px] uppercase tracking-[0.3em] mb-6 text-[#9D782F]"
                                style={{
                                    fontFamily:
                                        "'DM Mono', monospace",
                                }}
                            >
                                Vellique Collection
                            </p>

                            {/* Hero Heading */}
                            <h1
                                className="text-[2.8rem] sm:text-[3.6rem] lg:text-[4.5rem] font-light leading-[1.05] text-[#211E1A] mb-8"
                                style={{
                                    fontFamily:
                                        "'Cormorant Garamond', serif",
                                }}
                            >
                                Dress the story
                                <br />
                                you want to <em>tell.</em>
                            </h1>

                            {/* Supporting Copy */}
                            <p className="text-[13px] sm:text-sm text-[#756E63] font-light leading-relaxed max-w-lg mb-12">
                                Discover carefully selected pieces designed
                                for those who appreciate timeless form,
                                refined detail, and quiet luxury.
                            </p>

                            {/* CTA */}
                            <a
                                href="#collection"
                                className="inline-block text-[9px] uppercase tracking-[0.22em] text-[#211E1A] border-b border-[#211E1A] pb-1.5 hover:text-[#9D782F] hover:border-[#9D782F] transition-colors duration-300"
                                style={{
                                    fontFamily:
                                        "'DM Mono', monospace",
                                }}
                            >
                                Explore Collection
                            </a>
                        </div>
                    </div>
                </section>

                {/* =====================================================
                    3. COLLECTION INTRO
                ====================================================== */}
                <section
                    id="collection"
                    className="border-b border-[#EBE5DA]"
                >
                    <div className="max-w-[1400px] mx-auto px-6 sm:px-10 lg:px-14 py-14 sm:py-16 flex flex-col sm:flex-row sm:items-end justify-between gap-6">
                        <div>
                            <span
                                className="text-[9px] uppercase tracking-[0.25em] text-[#999083] block mb-3"
                                style={{
                                    fontFamily:
                                        "'DM Mono', monospace",
                                }}
                            >
                                01 / The Collection
                            </span>

                            <h2
                                className="text-2xl sm:text-3xl font-light text-[#211E1A]"
                                style={{
                                    fontFamily:
                                        "'Cormorant Garamond', serif",
                                }}
                            >
                                Pieces chosen for the modern wardrobe.
                            </h2>
                        </div>

                        <p className="text-[11px] text-[#756E63] font-light max-w-sm leading-relaxed">
                            Each piece in the Vellique catalog has been
                            selected for its craftsmanship, material
                            integrity, and enduring design.
                        </p>
                    </div>
                </section>

                {/* =====================================================
                    4. SEARCH + SORT CONTROLS
                ====================================================== */}
                <div className="border-b border-[#EBE5DA]">
                    <div className="max-w-[1400px] mx-auto px-6 sm:px-10 lg:px-14 py-5 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">

                        {/* Search */}
                        <div className="relative w-full sm:w-80">
                            <Search className="w-3.5 h-3.5 absolute left-0 top-1/2 -translate-y-1/2 text-[#999083]" />

                            <input
                                type="text"
                                placeholder="Search the collection..."
                                value={searchTerm}
                                onChange={(e) =>
                                    setSearchTerm(e.target.value)
                                }
                                className="w-full bg-transparent border-b border-[#DDD6CA] focus:border-[#9D782F] pl-6 pr-8 py-2.5 text-[12px] text-[#211E1A] placeholder-[#999083] outline-none transition-colors duration-300"
                                style={{
                                    fontFamily:
                                        "'Inter', sans-serif",
                                }}
                            />

                            {searchTerm && (
                                <button
                                    onClick={() => setSearchTerm('')}
                                    className="absolute right-0 top-1/2 -translate-y-1/2 text-[#999083] hover:text-[#211E1A] transition-colors"
                                >
                                    <X className="w-3.5 h-3.5" />
                                </button>
                            )}
                        </div>

                        {/* Right Controls */}
                        <div className="flex items-center gap-6 sm:gap-8">

                            {/* Count */}
                            <span
                                className="text-[9px] uppercase tracking-[0.2em] text-[#999083] hidden md:inline"
                                style={{
                                    fontFamily:
                                        "'DM Mono', monospace",
                                }}
                            >
                                {String(sortedProducts.length).padStart(
                                    2,
                                    '0'
                                )}{' '}
                                {sortedProducts.length === 1
                                    ? 'Piece'
                                    : 'Pieces'}
                            </span>

                            {/* Sort */}
                            <div className="flex items-center gap-2.5">
                                <span
                                    className="text-[9px] uppercase tracking-[0.18em] text-[#999083]"
                                    style={{
                                        fontFamily:
                                            "'DM Mono', monospace",
                                    }}
                                >
                                    Sort
                                </span>

                                <select
                                    value={sortBy}
                                    onChange={(e) =>
                                        setSortBy(e.target.value)
                                    }
                                    className="bg-transparent border-b border-[#DDD6CA] focus:border-[#9D782F] py-1.5 pr-2 text-[11px] text-[#211E1A] outline-none cursor-pointer transition-colors duration-300"
                                    style={{
                                        fontFamily:
                                            "'Inter', sans-serif",
                                    }}
                                >
                                    <option value="newest">
                                        Newest Arrivals
                                    </option>
                                    <option value="price-low">
                                        Price: Low → High
                                    </option>
                                    <option value="price-high">
                                        Price: High → Low
                                    </option>
                                    <option value="title">
                                        Title: A – Z
                                    </option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                {/* =====================================================
                    5. PRODUCT GRID / LOADING / EMPTY
                ====================================================== */}
                <main className="grow">
                    <div className="max-w-[1400px] mx-auto px-6 sm:px-10 lg:px-14 py-12 sm:py-16">

                        {loading ? (
                            /* Loading Skeleton */
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-10">
                                {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                                    <div
                                        key={i}
                                        className="animate-pulse"
                                    >
                                        <div className="aspect-[4/5] bg-[#EBE5DA] mb-5" />

                                        <div className="space-y-3 px-1">
                                            <div className="h-2 bg-[#EBE5DA] w-20" />
                                            <div className="h-5 bg-[#EBE5DA] w-3/4" />
                                            <div className="h-3 bg-[#EBE5DA] w-full" />
                                            <div className="h-3 bg-[#EBE5DA] w-2/3" />
                                            <div className="h-px bg-[#EBE5DA] mt-4" />
                                            <div className="h-5 bg-[#EBE5DA] w-1/3" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : sortedProducts.length === 0 ? (
                            /* Empty State */
                            <div className="py-24 sm:py-32 text-center max-w-md mx-auto">
                                <p
                                    className="text-[10px] uppercase tracking-[0.3em] text-[#9D782F] mb-5"
                                    style={{
                                        fontFamily:
                                            "'DM Mono', monospace",
                                    }}
                                >
                                    The Collection Awaits
                                </p>

                                <h3
                                    className="text-3xl sm:text-4xl font-light text-[#211E1A] mb-4"
                                    style={{
                                        fontFamily:
                                            "'Cormorant Garamond', serif",
                                    }}
                                >
                                    {searchTerm
                                        ? 'No pieces found.'
                                        : 'The catalog is empty.'}
                                </h3>

                                <p className="text-[12px] text-[#756E63] font-light mb-10 leading-relaxed">
                                    {searchTerm
                                        ? `Nothing matches "${searchTerm}". Try adjusting your search.`
                                        : 'New collections are being curated. Please check back soon.'}
                                </p>

                                {searchTerm && (
                                    <button
                                        onClick={() => setSearchTerm('')}
                                        className="text-[9px] uppercase tracking-[0.22em] text-[#211E1A] border-b border-[#211E1A] pb-1 hover:text-[#9D782F] hover:border-[#9D782F] transition-colors duration-300"
                                        style={{
                                            fontFamily:
                                                "'DM Mono', monospace",
                                        }}
                                    >
                                        Clear Search
                                    </button>
                                )}
                            </div>
                        ) : (
                            /* Product Grid */
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-x-6 gap-y-14">
                                {sortedProducts.map((product, index) => {
                                    const coverImg =
                                        product.images?.[0]?.url

                                    const isWishlisted =
                                        wishlist.includes(product._id)

                                    return (
                                        <article
                                            key={product._id}
                                            className="aspect-square border border-[#DDD7CC] relative flex flex-col"
                                            style={{
                                                animation: `productReveal 0.6s ease-out ${index * 0.06}s both`,
                                            }}
                                        >
                                            {/* Image Container */}
                                            <div
                                                className="relative aspect-square overflow-hidden cursor-pointer bg-[#fbf9f6] border border-[#DDD7CC] transition-all duration-500 group-hover:border-[#9D782F]"
                                                onClick={() => {
                                                    setSelectedProduct(product)
                                                    setSelectedModalImage(0)
                                                }}
                                            >
                                                {/* Product Image */}
                                                {coverImg ? (
                                                    <img
                                                        src={coverImg}
                                                        alt={product.title}
                                                        className="absolute inset-0 w-full h-full object-cover object-top transition-transform duration-700 ease-out group-hover:scale-[1.045]"
                                                    />
                                                ) : (
                                                    <div className="absolute inset-0 flex flex-col items-center justify-center text-[#9A9287]">
                                                        <Package className="w-8 h-8 mb-3 stroke-[1]" />

                                                        <span
                                                            className="text-[9px] uppercase tracking-[0.25em]"
                                                            style={{
                                                                fontFamily:
                                                                    "'DM Mono', monospace",
                                                            }}
                                                        >
                                                            No Image
                                                        </span>
                                                    </div>
                                                )}

                                                {/* Image Hover Wash */}
                                                <div className="absolute inset-0 bg-[#211E1A]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                                                {/* New Badge */}
                                                {index < 3 && (
                                                    <div className="absolute top-3 left-3 px-2.5 py-1 bg-white/90 backdrop-blur-sm border border-[#DDD7CC] text-[#211E1A]">
                                                        <span
                                                            className="text-[8px] uppercase tracking-[0.2em]"
                                                            style={{
                                                                fontFamily:
                                                                    "'DM Mono', monospace",
                                                            }}
                                                        >
                                                            New
                                                        </span>
                                                    </div>
                                                )}

                                                {/* Wishlist */}
                                                <button
                                                    type="button"
                                                    onClick={(e) =>
                                                        toggleWishlist(
                                                            product._id,
                                                            e
                                                        )
                                                    }
                                                    className="absolute top-3 right-3 w-9    h-9 flex items-center justify-center bg-white/90 backdrop-blur-sm border border-[#DDD7CC] hover:border-[#9D782F] transition-all duration-300 z-10"
                                                    title={
                                                        isWishlisted
                                                            ? 'Remove from wishlist'
                                                            : 'Add to wishlist'
                                                    }
                                                >
                                                    <Heart
                                                        className={`w-3.5 h-3.5 transition-all duration-300 ${
                                                            isWishlisted
                                                                ? 'fill-[#9D782F] text-[#9D782F] scale-110'
                                                                : 'text-[#756E63]'
                                                        }`}
                                                    />
                                                </button>

                                                {/* Image Count */}
                                                {product.images?.length >
                                                    1 && (
                                                    <div className="absolute bottom-3 left-3 px-2.5 py-1 bg-white/90 backdrop-blur-sm border border-[#DDD7CC]">
                                                        <span
                                                            className="text-[8px] uppercase tracking-[0.15em] text-[#756E63]"
                                                            style={{
                                                                fontFamily:
                                                                    "'DM Mono', monospace",
                                                            }}
                                                        >
                                                            {String(
                                                                product
                                                                    .images
                                                                    .length
                                                            ).padStart(
                                                                2,
                                                                '0'
                                                            )}{' '}
                                                            Photos
                                                        </span>
                                                    </div>
                                                )}

                                                {/* View Piece */}
                                                <div className="absolute bottom-5 left-1/2 -translate-x-1/2 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 z-10">
                                                    <span
                                                        className="block whitespace-nowrap bg-white/95 backdrop-blur-sm border border-[#DDD7CC] px-7 py-3 text-[#211E1A]"
                                                        style={{
                                                            fontFamily:
                                                                "'DM Mono', monospace",
                                                            fontSize: '9px',
                                                            letterSpacing:
                                                                '0.2em',
                                                        }}
                                                    >
                                                        VIEW PIECE
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Product Information */}
                                            <div className="py-5 px-5 flex flex-col flex-1 bg-white">

                                                {/* Date + Product Number */}
                                                <div className="flex items-center justify-between mb-2.5">
                                                    <span
                                                        className="text-[8px] uppercase tracking-[0.2em] text-[#9A9287]"
                                                        style={{
                                                            fontFamily:
                                                                "'DM Mono', monospace",
                                                        }}
                                                    >
                                                        {formatDate(
                                                            product.createdAt
                                                        )}
                                                    </span>

                                                    <span
                                                        className="text-[8px] uppercase tracking-[0.15em] text-[#B0A99F]"
                                                        style={{
                                                            fontFamily:
                                                                "'DM Mono', monospace",
                                                        }}
                                                    >
                                                        {String(
                                                            index + 1
                                                        ).padStart(2, '0')}
                                                    </span>
                                                </div>

                                                {/* Title */}
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setSelectedProduct(
                                                            product
                                                        )
                                                        setSelectedModalImage(
                                                            0
                                                        )
                                                    }}
                                                    className="text-left w-fit relative group/title mb-2"
                                                >
                                                    <h3
                                                        className="text-[24px] sm:text-[25px] font-normal leading-[1.1] text-[#211E1A] transition-colors duration-300 group-hover:text-[#9D782F]"
                                                        style={{
                                                            fontFamily:
                                                                "'Cormorant Garamond', serif",
                                                        }}
                                                    >
                                                        {product.title}
                                                    </h3>

                                                    {/* Gold Underline */}
                                                    <span className="absolute left-0 bottom-[-4px] h-px w-0 bg-[#9D782F] transition-all duration-500 group-hover/title:w-full" />
                                                </button>

                                                {/* Description */}
                                                <p className="text-[11px] text-[#756E63] font-light leading-[1.65] line-clamp-2 mb-5 min-h-[36px]">
                                                    {product.description ||
                                                        'Crafted with premium materials for timeless elegance.'}
                                                </p>

                                                {/* Divider */}
                                                <div className="w-full h-px bg-[#DDD7CC] mb-4 transition-colors duration-500 group-hover:bg-[#9D782F]/40" />

                                                {/* Bottom Info */}
                                                <div className="flex items-end justify-between mt-auto">

                                                    {/* Price */}
                                                    <div>
                                                        <span
                                                            className="block text-[8px] uppercase tracking-[0.2em] text-[#9A9287] mb-1"
                                                            style={{
                                                                fontFamily:
                                                                    "'DM Mono', monospace",
                                                            }}
                                                        >
                                                            Price
                                                        </span>

                                                        <span
                                                            className="text-[23px] text-[#9D782F] leading-none"
                                                            style={{
                                                                fontFamily:
                                                                    "'Cormorant Garamond', serif",
                                                            }}
                                                        >
                                                            {formatPrice(
                                                                product.price
                                                            )}
                                                        </span>
                                                    </div>

                                                    {/* Quick View */}
                                                    <button
                                                        type="button"
                                                        onClick={(e) => {
                                                            e.stopPropagation()

                                                            setSelectedProduct(
                                                                product
                                                            )
                                                            setSelectedModalImage(
                                                                0
                                                            )
                                                        }}
                                                        className="flex items-center gap-2 text-[8px] uppercase tracking-[0.18em] text-[#756E63] hover:text-[#9D782F] transition-colors duration-300 pb-1"
                                                        style={{
                                                            fontFamily:
                                                                "'DM Mono', monospace",
                                                        }}
                                                    >
                                                        <Eye className="w-3 h-3 stroke-[1.5]" />
                                                        Quick View
                                                    </button>
                                                </div>
                                            </div>
                                        </article>
                                    )
                                })}
                            </div>
                        )}
                    </div>
                </main>

                {/* =====================================================
                    6. PRODUCT QUICK VIEW MODAL
                ====================================================== */}
                {selectedProduct && (
                    <div
                        className="fixed inset-0 z-50 bg-black/30 backdrop-blur-[2px] flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
                        onClick={() => setSelectedProduct(null)}
                    >
                        <div
                            className="bg-white border border-[#DDD6CA] max-w-4xl w-full relative my-8"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Close */}
                            <button
                                onClick={() =>
                                    setSelectedProduct(null)
                                }
                                className="absolute top-5 right-5 z-10 p-2 text-[#756E63] hover:text-[#211E1A] border border-[#DDD6CA] bg-white/90 transition-colors duration-300"
                            >
                                <X className="w-4 h-4" />
                            </button>

                            <div className="grid grid-cols-1 md:grid-cols-2">

                                {/* Gallery */}
                                <div className="bg-[#F3EFEA] border-b md:border-b-0 md:border-r border-[#DDD6CA]">
                                    <div className="aspect-[4/5] overflow-hidden">
                                        {selectedProduct.images?.[
                                            selectedModalImage
                                        ]?.url ? (
                                            <img
                                                src={
                                                    selectedProduct.images[
                                                        selectedModalImage
                                                    ].url
                                                }
                                                alt={
                                                    selectedProduct.title
                                                }
                                                className="w-full h-full object-cover object-top"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex flex-col items-center justify-center text-[#999083]">
                                                <Package className="w-12 h-12 mb-3 stroke-[1]" />

                                                <span
                                                    className="text-[9px] uppercase tracking-[0.2em]"
                                                    style={{
                                                        fontFamily:
                                                            "'DM Mono', monospace",
                                                    }}
                                                >
                                                    No Image
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Thumbnails */}
                                    {selectedProduct.images?.length > 1 && (
                                        <div className="flex items-center gap-2 p-4 overflow-x-auto">
                                            {selectedProduct.images.map(
                                                (img, idx) => (
                                                    <button
                                                        key={
                                                            img._id || idx
                                                        }
                                                        onClick={() =>
                                                            setSelectedModalImage(
                                                                idx
                                                            )
                                                        }
                                                        className="w-14 h-14 border overflow-hidden shrink-0 transition-all duration-300"
                                                        style={{
                                                            borderColor:
                                                                selectedModalImage ===
                                                                idx
                                                                    ? '#9D782F'
                                                                    : '#DDD6CA',
                                                            opacity:
                                                                selectedModalImage ===
                                                                idx
                                                                    ? 1
                                                                    : 0.55,
                                                        }}
                                                    >
                                                        <img
                                                            src={img.url}
                                                            alt=""
                                                            className="w-full h-full object-cover"
                                                        />
                                                    </button>
                                                )
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* Details */}
                                <div className="p-8 sm:p-10 flex flex-col justify-between">
                                    <div className="space-y-6">

                                        {/* Eyebrow + Title */}
                                        <div>
                                            <span
                                                className="text-[9px] uppercase tracking-[0.25em] text-[#9D782F] block mb-2.5"
                                                style={{
                                                    fontFamily:
                                                        "'DM Mono', monospace",
                                                }}
                                            >
                                                Vellique Collection
                                            </span>

                                            <h2
                                                className="text-2xl sm:text-[2rem] font-light text-[#211E1A] leading-snug"
                                                style={{
                                                    fontFamily:
                                                        "'Cormorant Garamond', serif",
                                                }}
                                            >
                                                {selectedProduct.title}
                                            </h2>
                                        </div>

                                        {/* Price */}
                                        <div>
                                            <span
                                                className="text-[8px] uppercase tracking-[0.2em] text-[#999083] block mb-1"
                                                style={{
                                                    fontFamily:
                                                        "'DM Mono', monospace",
                                                }}
                                            >
                                                Price
                                            </span>

                                            <span
                                                className="text-2xl text-[#9D782F]"
                                                style={{
                                                    fontFamily:
                                                        "'Cormorant Garamond', serif",
                                                }}
                                            >
                                                {formatPrice(
                                                    selectedProduct.price
                                                )}
                                            </span>
                                        </div>

                                        {/* Description */}
                                        <div className="pt-5 border-t border-[#EBE5DA]">
                                            <span
                                                className="text-[8px] uppercase tracking-[0.2em] text-[#999083] block mb-2"
                                                style={{
                                                    fontFamily:
                                                        "'DM Mono', monospace",
                                                }}
                                            >
                                                Description
                                            </span>

                                            <p className="text-[12px] text-[#756E63] font-light leading-relaxed max-h-40 overflow-y-auto pr-2">
                                                {selectedProduct.description ||
                                                    'Crafted with fine craftsmanship and premium selection for Vellique.'}
                                            </p>
                                        </div>

                                        {/* Item Reference */}
                                        <div className="pt-4 border-t border-[#EBE5DA]">
                                            <div className="flex justify-between items-center">
                                                <span
                                                    className="text-[8px] uppercase tracking-[0.18em] text-[#999083]"
                                                    style={{
                                                        fontFamily:
                                                            "'DM Mono', monospace",
                                                    }}
                                                >
                                                    Item Ref
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="space-y-3 mt-10">
                                        <button
                                            onClick={() => {
                                                alert(
                                                    `Added "${selectedProduct.title}" to cart!`
                                                )
                                                setSelectedProduct(null)
                                            }}
                                            className="w-full py-3.5 bg-[#211E1A] hover:bg-[#302C27] text-white text-[9px] uppercase tracking-[0.22em] transition-colors duration-300"
                                            style={{
                                                fontFamily:
                                                    "'DM Mono', monospace",
                                            }}
                                        >
                                            Add to Bag
                                        </button>

                                        <button
                                            onClick={() =>
                                                setSelectedProduct(null)
                                            }
                                            className="w-full py-3 bg-transparent hover:bg-[#F3EFEA] text-[#211E1A] text-[9px] uppercase tracking-[0.22em] border border-[#DDD6CA] transition-colors duration-300"
                                            style={{
                                                fontFamily:
                                                    "'DM Mono', monospace",
                                            }}
                                        >
                                            Close
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* =====================================================
                    7. EDITORIAL FOOTER
                ====================================================== */}
                <footer className="border-t border-[#DDD6CA] bg-[#F3EFEA]">
                    <div className="max-w-[1400px] mx-auto px-6 sm:px-10 lg:px-14 py-14 sm:py-16">
                        <div className="flex flex-col md:flex-row items-center md:items-end justify-between gap-8">

                            {/* Brand */}
                            <div className="text-center md:text-left">
                                <span
                                    className="text-[15px] tracking-[0.35em] uppercase font-normal text-[#211E1A] block mb-2"
                                    style={{
                                        fontFamily:
                                            "'Cormorant Garamond', serif",
                                    }}
                                >
                                    Vellique.
                                </span>

                                <p className="text-[11px] text-[#756E63] font-light">
                                    Curated luxury fashion & tailored
                                    catalog pieces.
                                </p>
                            </div>

                            {/* Footer Links */}
                            <div className="flex flex-col sm:flex-row items-center gap-6 sm:gap-8">
                                {[
                                    'Collection',
                                    'About',
                                    'Contact',
                                ].map((label) => (
                                    <span
                                        key={label}
                                        className="text-[9px] uppercase tracking-[0.18em] text-[#999083] hover:text-[#9D782F] transition-colors duration-300 cursor-pointer"
                                        style={{
                                            fontFamily:
                                                "'DM Mono', monospace",
                                        }}
                                    >
                                        {label}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* Copyright */}
                        <div className="mt-10 pt-6 border-t border-[#DDD6CA]">
                            <p
                                className="text-[8px] uppercase tracking-[0.2em] text-[#999083] text-center"
                                style={{
                                    fontFamily:
                                        "'DM Mono', monospace",
                                }}
                            >
                                © {new Date().getFullYear()} Vellique. All
                                Rights Reserved.
                            </p>
                        </div>
                    </div>
                </footer>
            </div>
        </>
    )
}

export default Home


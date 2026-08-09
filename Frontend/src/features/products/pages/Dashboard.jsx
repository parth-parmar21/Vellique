import React, { useEffect, useState } from 'react'
import { useProducts } from '../hook/useProduct'
import { useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import {
    Search,
    LayoutGrid,
    List,
    X,
    Check,
    Package
} from 'lucide-react'

const CURRENCY_SYMBOLS = {
    INR: '₹',
    USD: '$',
    EUR: '€',
    GBP: '£',
    AED: 'AED '
}

const formatPrice = (priceObj) => {
    if (!priceObj) return 'N/A'
    const amount = priceObj.amount ?? 0
    const currency = priceObj.currency || 'USD'
    const symbol = CURRENCY_SYMBOLS[currency] || `${currency} `
    return `${symbol}${Number(amount).toLocaleString()}`
}

const formatDate = (isoString) => {
    if (!isoString) return 'N/A'
    try {
        return new Date(isoString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        }).toUpperCase()
    } catch {
        return isoString
    }
}

const Dashboard = () => {
    const { handleGetSellerProduct } = useProducts()
    const sellerProducts = useSelector(state => state.product.sellerProducts) || []

    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [sortBy, setSortBy] = useState('newest')
    const [viewMode, setViewMode] = useState('grid')
    const [selectedProduct, setSelectedProduct] = useState(null)
    const [copiedId, setCopiedId] = useState(null)
    const [selectedModalImage, setSelectedModalImage] = useState(0)

    useEffect(() => {
        let isMounted = true
        async function fetchProducts() {
            setLoading(true)
            try {
                await handleGetSellerProduct()
            } catch (err) {
                console.error("Failed to load seller products:", err)
            } finally {
                if (isMounted) setLoading(false)
            }
        }
        fetchProducts()
        return () => { isMounted = false }
    }, [])

    const handleCopyId = (id, e) => {
        if (e) e.stopPropagation()
        navigator.clipboard.writeText(id)
        setCopiedId(id)
        setTimeout(() => setCopiedId(null), 2000)
    }

    const filteredProducts = sellerProducts.filter(product => {
        const query = searchTerm.toLowerCase().trim()
        if (!query) return true
        return (
            product.title?.toLowerCase().includes(query) ||
            product.description?.toLowerCase().includes(query) ||
            product._id?.toLowerCase().includes(query)
        )
    })

    const sortedProducts = [...filteredProducts].sort((a, b) => {
        if (sortBy === 'newest') {
            return new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
        }
        if (sortBy === 'price-low') {
            return (a.price?.amount || 0) - (b.price?.amount || 0)
        }
        if (sortBy === 'price-high') {
            return (b.price?.amount || 0) - (a.price?.amount || 0)
        }
        if (sortBy === 'title') {
            return (a.title || '').localeCompare(b.title || '')
        }
        return 0
    })

    const totalProducts = sellerProducts.length
    const totalImages = sellerProducts.reduce((acc, curr) => acc + (curr.images?.length || 0), 0)
    const totalValuation = sellerProducts.reduce((acc, curr) => acc + (curr.price?.amount || 0), 0)

    return (
        <>
            <link
                href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400&family=Inter:wght@300;400;500;600&display=swap"
                rel="stylesheet"
            />

            <div className="min-h-screen selection:bg-[#9D782F]/30" style={{ backgroundColor: '#fbf9f6', fontFamily: "'Inter', sans-serif" }}>

                <header className="w-full px-6 py-8 sm:px-12 flex items-center justify-between border-b border-[#DDD7CC]">
                    <span
                        className="text-sm font-normal tracking-[0.3em] uppercase"
                        style={{ fontFamily: "'Cormorant Garamond', serif", color: '#9D782F' }}
                    >
                        Vellique.
                    </span>
                    <div className="flex items-center gap-6">
                        <span className="text-[10px] uppercase tracking-[0.2em] font-medium" style={{ color: '#211E1A' }}>
                            Seller Studio
                        </span>
                    </div>
                </header>

                <main className="max-w-6xl mx-auto px-5 sm:px-8 lg:px-12 pb-24">

                    <div className="mt-12 mb-16 flex flex-col md:flex-row md:items-end justify-between gap-8">
                        <div>
                            <p className="text-[10px] uppercase tracking-[0.2em] mb-4 font-medium" style={{ color: '#756E63' }}>
                                YOUR ATELIER
                            </p>
                            <h1
                                className="text-4xl sm:text-5xl lg:text-6xl font-light mb-4 text-[#211E1A]"
                                style={{ fontFamily: "'Cormorant Garamond', serif" }}
                            >
                                Your Collection
                            </h1>
                            <p className="text-sm font-light max-w-md" style={{ color: '#9A9287', lineHeight: '1.6' }}>
                                Manage the pieces that define your Vellique collection.
                            </p>
                        </div>

                        <div>
                            <Link
                                to="/seller/create-product"
                                className="inline-flex py-4 px-8 text-[11px] uppercase tracking-[0.25em] font-medium transition-all duration-300"
                                style={{
                                    backgroundColor: '#211E1A',
                                    color: '#FFFFFF',
                                    border: '1px solid #211E1A'
                                }}
                                onMouseEnter={e => {
                                    e.currentTarget.style.backgroundColor = '#9D782F';
                                    e.currentTarget.style.borderColor = '#9D782F';
                                    e.currentTarget.style.color = '#211E1A';
                                }}
                                onMouseLeave={e => {
                                    e.currentTarget.style.backgroundColor = '#211E1A';
                                    e.currentTarget.style.borderColor = '#211E1A';
                                    e.currentTarget.style.color = '#FFFFFF';
                                }}
                            >
                                + ADD NEW PIECE
                            </Link>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 bg-white border mb-16" style={{ borderColor: '#DDD7CC' }}>
                        <div className="flex flex-col items-center justify-center p-10 border-b md:border-b-0 md:border-r" style={{ borderColor: '#DDD7CC' }}>
                            <span className="text-[10px] uppercase tracking-[0.2em] mb-3" style={{ color: '#756E63' }}>
                                TOTAL PIECES
                            </span>
                            <span className="text-5xl font-light text-[#211E1A]" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                                {loading ? '—' : totalProducts}
                            </span>
                        </div>
                        <div className="flex flex-col items-center justify-center p-10 border-b md:border-b-0 md:border-r" style={{ borderColor: '#DDD7CC' }}>
                            <span className="text-[10px] uppercase tracking-[0.2em] mb-3" style={{ color: '#756E63' }}>
                                COLLECTION VALUE
                            </span>
                            <span className="text-5xl font-light text-[#211E1A]" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                                {loading ? '—' : `₹${totalValuation.toLocaleString()}`}
                            </span>
                        </div>
                        <div className="flex flex-col items-center justify-center p-10">
                            <span className="text-[10px] uppercase tracking-[0.2em] mb-3" style={{ color: '#756E63' }}>
                                GALLERY IMAGES
                            </span>
                            <span className="text-5xl font-light text-[#211E1A]" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                                {loading ? '—' : totalImages}
                            </span>
                        </div>
                    </div>

                    <div className="bg-white border p-4 sm:p-6 mb-12 flex flex-col md:flex-row items-center justify-between gap-6" style={{ borderColor: '#DDD7CC' }}>
                        <div className="relative w-full md:w-96 flex items-center">
                            <Search className="absolute left-0 w-4 h-4" style={{ color: '#9A9287' }} />
                            <input
                                type="text"
                                placeholder="Search your collection..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full bg-transparent outline-none py-2 pl-8 pr-8 text-sm transition-colors duration-300"
                                style={{
                                    color: '#211E1A',
                                    borderBottom: '1px solid #DDD7CC'
                                }}
                                onFocus={e => e.target.style.borderBottomColor = '#9D782F'}
                                onBlur={e => e.target.style.borderBottomColor = '#DDD7CC'}
                            />
                            {searchTerm && (
                                <button
                                    onClick={() => setSearchTerm('')}
                                    className="absolute right-0 p-1 opacity-60 hover:opacity-100 transition-opacity"
                                >
                                    <X className="w-3.5 h-3.5" />
                                </button>
                            )}
                        </div>

                        <div className="flex flex-col sm:flex-row items-center w-full md:w-auto gap-8">
                            <div className="flex items-center gap-3 w-full sm:w-auto">
                                <span className="text-[10px] uppercase tracking-[0.2em] whitespace-nowrap" style={{ color: '#756E63' }}>SORT BY</span>
                                <div className="relative w-full sm:w-48">
                                    <select
                                        value={sortBy}
                                        onChange={(e) => setSortBy(e.target.value)}
                                        className="w-full bg-transparent outline-none py-2 text-sm transition-colors duration-300 appearance-none cursor-pointer"
                                        style={{
                                            color: '#211E1A',
                                            borderBottom: '1px solid #DDD7CC'
                                        }}
                                        onFocus={e => e.target.style.borderBottomColor = '#9D782F'}
                                        onBlur={e => e.target.style.borderBottomColor = '#DDD7CC'}
                                    >
                                        <option value="newest">Newest</option>
                                        <option value="price-low">Price: Low → High</option>
                                        <option value="price-high">Price: High → Low</option>
                                        <option value="title">Title: A → Z</option>
                                    </select>
                                    <div className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: '#756E63' }}>
                                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                <button
                                    onClick={() => setViewMode('grid')}
                                    className="text-[10px] uppercase tracking-[0.2em] font-medium transition-colors duration-300 flex items-center gap-1.5"
                                    style={{ color: viewMode === 'grid' ? '#211E1A' : '#9A9287' }}
                                >
                                    <LayoutGrid className="w-3.5 h-3.5" />
                                    <span className="hidden sm:inline">GRID</span>
                                </button>
                                <button
                                    onClick={() => setViewMode('list')}
                                    className="text-[10px] uppercase tracking-[0.2em] font-medium transition-colors duration-300 flex items-center gap-1.5"
                                    style={{ color: viewMode === 'list' ? '#211E1A' : '#9A9287' }}
                                >
                                    <List className="w-3.5 h-3.5" />
                                    <span className="hidden sm:inline">LIST</span>
                                </button>
                            </div>
                        </div>
                    </div>

                    {loading ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="animate-pulse bg-white border p-4" style={{ borderColor: '#DDD7CC' }}>
                                    <div className="aspect-square mb-6" style={{ backgroundColor: '#f7f4ee' }} />
                                    <div className="h-2 w-16 mb-4" style={{ backgroundColor: '#EBE5DA' }} />
                                    <div className="h-5 w-3/4 mb-3" style={{ backgroundColor: '#EBE5DA' }} />
                                    <div className="h-3 w-full mb-1" style={{ backgroundColor: '#EBE5DA' }} />
                                    <div className="h-3 w-4/5 mb-6" style={{ backgroundColor: '#EBE5DA' }} />
                                    <div className="h-5 w-1/4" style={{ backgroundColor: '#EBE5DA' }} />
                                </div>
                            ))}
                        </div>
                    ) : sortedProducts.length === 0 ? (
                        <div className="bg-white border py-24 px-6 text-center mx-auto" style={{ borderColor: '#DDD7CC' }}>
                            <h3 className="text-3xl font-light mb-4 text-[#211E1A]" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                                {searchTerm ? 'No pieces found' : 'Your collection is empty'}
                            </h3>
                            <p className="text-sm font-light mb-8 max-w-sm mx-auto" style={{ color: '#756E63' }}>
                                {searchTerm
                                    ? `No items found matching "${searchTerm}". Try adjusting your filters.`
                                    : 'Begin building your Vellique collection with your first piece.'}
                            </p>
                            {searchTerm ? (
                                <button
                                    onClick={() => setSearchTerm('')}
                                    className="inline-flex py-3 px-8 text-[10px] uppercase tracking-[0.2em] font-medium transition-all duration-300"
                                    style={{
                                        backgroundColor: 'transparent',
                                        color: '#756E63',
                                        border: '1px solid #DDD7CC'
                                    }}
                                    onMouseEnter={e => {
                                        e.currentTarget.style.borderColor = '#9D782F';
                                        e.currentTarget.style.color = '#9D782F';
                                    }}
                                    onMouseLeave={e => {
                                        e.currentTarget.style.borderColor = '#DDD7CC';
                                        e.currentTarget.style.color = '#756E63';
                                    }}
                                >
                                    CLEAR SEARCH
                                </button>
                            ) : (
                                <Link
                                    to="/seller/create-product"
                                    className="inline-flex py-4 px-8 text-[11px] uppercase tracking-[0.25em] font-medium transition-all duration-300"
                                    style={{
                                        backgroundColor: '#211E1A',
                                        color: '#FFFFFF',
                                        border: '1px solid #211E1A'
                                    }}
                                    onMouseEnter={e => {
                                        e.currentTarget.style.backgroundColor = '#9D782F';
                                        e.currentTarget.style.borderColor = '#9D782F';
                                        e.currentTarget.style.color = '#211E1A';
                                    }}
                                    onMouseLeave={e => {
                                        e.currentTarget.style.backgroundColor = '#211E1A';
                                        e.currentTarget.style.borderColor = '#211E1A';
                                        e.currentTarget.style.color = '#FFFFFF';
                                    }}
                                >
                                    CREATE YOUR FIRST PIECE
                                </Link>
                            )}
                        </div>
                    ) : viewMode === 'grid' ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-x-5 gap-y-8">
                            {sortedProducts.map((product) => {
                                const coverImg = product.images?.[0]?.url

                                return (
                                    <div
                                        key={product._id}
                                        className="group bg-white border border-[#DDD6CA] hover:border-[#9D782F] transition-all duration-300 flex flex-col h-[100%]">
                                        {/* IMAGE */}
                                        <div className="relative aspect-square bg-[#F8F5F0] overflow-hidden border-b border-[#DDD6CA]">
                                            {coverImg ? (
                                                <img
                                                    src={coverImg}
                                                    alt={product.title}
                                                    className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex flex-col items-center justify-center text-[#999083]">
                                                    <Package className="w-6 h-6 mb-2 stroke-[1]" />
                                                    <span className="text-[8px] font-mono uppercase tracking-[0.2em]">
                                                        No Image
                                                    </span>
                                                </div>
                                            )}

                                            {/* Subtle hover overlay */}
                                            <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                                            {/* View button */}
                                            <div className="absolute bottom-5 left-0 w-full flex justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-2 group-hover:translate-y-0">
                                                <button
                                                    onClick={() => {
                                                        setSelectedProduct(product)
                                                        setSelectedModalImage(0)
                                                    }}
                                                    className="bg-white/95 backdrop-blur-sm text-[#211E1A] text-[9px] uppercase font-medium py-2.5 px-7 border border-[#DDD6CA] hover:text-[#9D782F] hover:border-[#9D782F] transition-all duration-300"
                                                    style={{ fontFamily: "'DM Mono', monospace" }}
                                                >
                                                    VIEW PIECE
                                                </button>
                                            </div>
                                        </div>

                                        {/* CONTENT */}
                                        <div className="px-4.5 py-4 flex flex-col flex-1">

                                            {/* DATE */}
                                            <div className="mb-2">
                                                <span
                                                    className="text-[12px] font-medium uppercase tracking-tight text-[#9A9287]"
                                                    style={{ fontFamily: "'DM Mono', monospace" }}
                                                >
                                                    {formatDate(product.createdAt)}
                                                </span>
                                            </div>

                                            {/* TITLE */}
                                            <h3
                                                className="text-2xl leading-[1.2] font-medium mb-4 text-[#211E1A] line-clamp-2 transition-colors duration-300 group-hover:text-[#9D782F]"
                                                style={{
                                                    fontFamily: "'Cormorant Garamond', serif"
                                                }}
                                            >
                                                {product.title}
                                            </h3>

                                            {/* DESCRIPTION */}
                                            <p
                                                className="text-[11px] font-normal text-[#756E63] line-clamp-2 flex-grow mb-5"
                                                style={{
                                                    fontFamily: "'Inter', sans-serif",
                                                    lineHeight: '1.5'
                                                }}
                                            >
                                                {product.description || 'No description provided.'}
                                            </p>

                                            {/* FOOTER */}
                                            <div className="flex items-end justify-between pt-3.5 border-t border-[#EBE5DA] mt-auto">

                                                {/* PRICE */}
                                                <div>
                                                    <span
                                                        className="text-[10px] font-medium uppercase tracking-[0.1em] text-[#999083] block mb-1"
                                                        style={{ fontFamily: "'DM Mono', monospace" }}
                                                    >
                                                        PRICE
                                                    </span>

                                                    <span
                                                        className="text-2xl leading-none font-normal text-[#211E1A]"
                                                        style={{
                                                            fontFamily: "'Cormorant Garamond', serif"
                                                        }}
                                                    >
                                                        {formatPrice(product.price)}
                                                    </span>
                                                </div>

                                                {/* COPY ID */}
                                                <button
                                                    onClick={(e) => handleCopyId(product._id, e)}
                                                    className="text-[8px] font-medium uppercase tracking-[0.12em] flex items-center gap-1.5 transition-colors duration-300 hover:text-[#9D782F]"
                                                    style={{
                                                        fontFamily: "'DM Mono', monospace",
                                                        color: copiedId === product._id
                                                            ? '#9D782F'
                                                            : '#999083'
                                                    }}
                                                >
                                                    {copiedId === product._id ? (
                                                        <>
                                                            <Check className="w-3 h-3" />
                                                            COPIED
                                                        </>
                                                    ) : (
                                                        'COPY ID'
                                                    )}
                                                </button>

                                            </div>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    ) : (
                        <div className="bg-white border overflow-x-auto" style={{ borderColor: '#DDD7CC' }}>
                            <table className="w-full text-left border-collapse min-w-[800px]">
                                <thead>
                                    <tr className="border-b" style={{ borderColor: '#DDD7CC', backgroundColor: '#fcfaf6' }}>
                                        <th className="py-5 px-6 text-[10px] uppercase tracking-[0.2em] font-medium" style={{ color: '#756E63' }}>PIECE</th>
                                        <th className="py-5 px-6 text-[10px] uppercase tracking-[0.2em] font-medium hidden md:table-cell" style={{ color: '#756E63' }}>DESCRIPTION</th>
                                        <th className="py-5 px-6 text-[10px] uppercase tracking-[0.2em] font-medium" style={{ color: '#756E63' }}>PRICE</th>
                                        <th className="py-5 px-6 text-[10px] uppercase tracking-[0.2em] font-medium hidden sm:table-cell" style={{ color: '#756E63' }}>CREATED</th>
                                        <th className="py-5 px-6 text-[10px] uppercase tracking-[0.2em] font-medium text-right" style={{ color: '#756E63' }}>ACTION</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {sortedProducts.map((product) => {
                                        const coverImg = product.images?.[0]?.url
                                        return (
                                            <tr key={product._id} className="border-b last:border-0 hover:bg-[#fcfaf6] transition-colors duration-300" style={{ borderColor: '#EBE5DA' }}>
                                                <td className="py-4 px-6">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-16 h-16 bg-[#f7f4ee] border overflow-hidden shrink-0" style={{ borderColor: '#DDD7CC' }}>
                                                            {coverImg ? (
                                                                <img src={coverImg} alt={product.title} className="w-full h-full object-cover object-top" />
                                                            ) : (
                                                                <div className="w-full h-full flex items-center justify-center text-[#9A9287]">
                                                                    <span className="text-[8px] uppercase tracking-[0.2em]">NO IMG</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div>
                                                            <h4 className="text-lg font-light text-[#211E1A] line-clamp-1 mb-1" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                                                                {product.title}
                                                            </h4>
                                                            <span className="text-[9px] uppercase tracking-[0.15em] text-[#9A9287]">ID: {product._id?.slice(-8)}</span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="py-4 px-6 text-sm font-light hidden md:table-cell max-w-xs" style={{ color: '#756E63', lineHeight: '1.5' }}>
                                                    <p className="line-clamp-2">{product.description || '—'}</p>
                                                </td>
                                                <td className="py-4 px-6 font-medium whitespace-nowrap" style={{ color: '#9D782F' }}>
                                                    {formatPrice(product.price)}
                                                </td>
                                                <td className="py-4 px-6 text-[11px] uppercase tracking-[0.1em] hidden sm:table-cell whitespace-nowrap" style={{ color: '#9A9287' }}>
                                                    {formatDate(product.createdAt)}
                                                </td>
                                                <td className="py-4 px-6 text-right">
                                                    <div className="flex items-center justify-end gap-6">
                                                        <button
                                                            onClick={(e) => handleCopyId(product._id, e)}
                                                            className="text-[9px] uppercase tracking-[0.2em] font-medium transition-colors"
                                                            style={{ color: copiedId === product._id ? '#2e5235' : '#756E63' }}
                                                        >
                                                            {copiedId === product._id ? 'COPIED' : 'COPY'}
                                                        </button>
                                                        <button
                                                            onClick={() => {
                                                                setSelectedProduct(product)
                                                                setSelectedModalImage(0)
                                                            }}
                                                            className="text-[9px] uppercase tracking-[0.2em] font-medium transition-colors hover:text-[#9D782F]"
                                                            style={{ color: '#211E1A' }}
                                                        >
                                                            VIEW →
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </main>

                {selectedProduct && (
                    <div
                        className="fixed inset-0 z-50 bg-[#211E1A]/40 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
                        onClick={() => setSelectedProduct(null)}
                    >
                        <div
                            className="bg-white border max-w-4xl w-full p-6 sm:p-10 relative my-auto shadow-2xl flex flex-col lg:flex-row gap-10"
                            style={{ borderColor: '#DDD7CC' }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <button
                                onClick={() => setSelectedProduct(null)}
                                className="absolute top-6 right-6 text-[10px] uppercase tracking-[0.2em] font-medium transition-colors hover:text-[#211E1A]"
                                style={{ color: '#9A9287' }}
                            >
                                CLOSE ✕
                            </button>

                            <div className="w-full lg:w-1/2 flex flex-col gap-4">
                                <div className="aspect-square bg-[#f7f4ee] border overflow-hidden" style={{ borderColor: '#DDD7CC' }}>
                                    {selectedProduct.images?.[selectedModalImage]?.url ? (
                                        <img
                                            src={selectedProduct.images[selectedModalImage].url}
                                            alt={selectedProduct.title}
                                            className="w-full h-full object-cover object-top"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-[#9A9287]">
                                            <span className="text-[10px] uppercase tracking-[0.2em]">NO IMAGE PROVIDED</span>
                                        </div>
                                    )}
                                </div>
                                {selectedProduct.images?.length > 1 && (
                                    <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-hide">
                                        {selectedProduct.images.map((img, idx) => (
                                            <button
                                                key={img._id || idx}
                                                onClick={() => setSelectedModalImage(idx)}
                                                className="w-16 h-16 border overflow-hidden shrink-0 transition-colors duration-300"
                                                style={{
                                                    borderColor: selectedModalImage === idx ? '#9D782F' : '#DDD7CC',
                                                    opacity: selectedModalImage === idx ? 1 : 0.6
                                                }}
                                            >
                                                <img src={img.url} alt="" className="w-full h-full object-cover object-top" />
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="w-full lg:w-1/2 flex flex-col justify-between pt-2">
                                <div>
                                    <span className="text-[10px] uppercase tracking-[0.2em] font-medium block mb-4" style={{ color: '#756E63' }}>
                                        PRODUCT DETAILS
                                    </span>
                                    <h2 className="text-3xl sm:text-4xl font-light mb-6 text-[#211E1A]" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                                        {selectedProduct.title}
                                    </h2>

                                    <div className="mb-8">
                                        <span className="text-2xl font-medium" style={{ color: '#9D782F' }}>
                                            {formatPrice(selectedProduct.price)}
                                        </span>
                                    </div>

                                    <div className="mb-10">
                                        <p className="text-sm font-light leading-relaxed max-h-48 overflow-y-auto pr-2" style={{ color: '#756E63' }}>
                                            {selectedProduct.description || 'No description provided.'}
                                        </p>
                                    </div>
                                </div>

                                <div className="border-t pt-6 space-y-4" style={{ borderColor: '#EBE5DA' }}>
                                    <div className="flex justify-between items-center text-[10px] uppercase tracking-[0.15em]">
                                        <span style={{ color: '#9A9287' }}>PRODUCT ID</span>
                                        <span style={{ color: '#211E1A', fontWeight: '500' }}>{selectedProduct._id}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-[10px] uppercase tracking-[0.15em]">
                                        <span style={{ color: '#9A9287' }}>CREATED</span>
                                        <span style={{ color: '#211E1A', fontWeight: '500' }}>{formatDate(selectedProduct.createdAt)}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-[10px] uppercase tracking-[0.15em]">
                                        <span style={{ color: '#9A9287' }}>IMAGES</span>
                                        <span style={{ color: '#211E1A', fontWeight: '500' }}>{selectedProduct.images?.length || 0}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    )
}

export default Dashboard
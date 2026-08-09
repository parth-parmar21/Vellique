import React, { useEffect, useState } from 'react'
import { useProducts } from '../hook/useProduct'
import { useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import {
    Plus,
    Search,
    LayoutGrid,
    List,
    Eye,
    Copy,
    Check,
    Package,
    X,
    Calendar,
    ArrowUpDown,
    ShoppingBag
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
        })
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

    // Filter & Sort Logic
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

    // Metrics
    const totalProducts = sellerProducts.length
    const totalImages = sellerProducts.reduce((acc, curr) => acc + (curr.images?.length || 0), 0)
    const totalValuation = sellerProducts.reduce((acc, curr) => acc + (curr.price?.amount || 0), 0)

    return (
        <div className="min-h-screen bg-[#F8F5F0] text-[#211E1A] font-sans antialiased selection:bg-[#9D782F] selection:text-white flex flex-col">
            <main className="grow max-w-6xl w-full mx-auto px-6 sm:px-10 py-10 sm:py-14">
                
                {/* ════════════════════════════════════════
                    HEADER SECTION — Minimal Editorial Style
                ════════════════════════════════════════ */}
                <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-[#EBE5DA] pb-8 gap-6">
                    <div>
                        <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#9D782F] font-semibold block mb-2">
                            SELLER DASHBOARD
                        </span>
                        <h1 className="text-3xl sm:text-4xl font-serif text-[#211E1A] font-normal tracking-tight">
                            Your Product Collection
                        </h1>
                        <p className="mt-2 text-xs sm:text-sm text-[#756E63] font-light max-w-md leading-relaxed">
                            Overview of your luxury products, inventory details, and catalog metrics.
                        </p>
                    </div>

                    <div>
                        <Link
                            to="/seller/create-product"
                            className="inline-flex items-center gap-2 px-6 py-3 bg-[#9D782F] hover:bg-[#8A6827] text-white font-mono text-[10px] font-bold tracking-[0.18em] uppercase transition-colors duration-200 shadow-xs"
                        >
                            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                            <span>Add Product</span>
                        </Link>
                    </div>
                </div>

                {/* ════════════════════════════════════════
                    METRICS SUMMARY ROW — Simple White Cards
                ════════════════════════════════════════ */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 my-10">
                    <div className="bg-white border border-[#DDD6CA] p-6 flex flex-col justify-between">
                        <span className="text-[9px] font-semibold font-mono tracking-[0.18em] uppercase text-[#756E63]">
                            TOTAL PRODUCTS
                        </span>
                        <h3 className="text-3xl font-serif text-[#211E1A] font-normal mt-3">
                            {loading ? '—' : totalProducts}
                        </h3>
                    </div>

                    <div className="bg-white border border-[#DDD6CA] p-6 flex flex-col justify-between">
                        <span className="text-[9px] font-semibold font-mono tracking-[0.18em] uppercase text-[#756E63]">
                            CATALOG VALUE
                        </span>
                        <h3 className="text-3xl font-serif text-[#211E1A] font-normal mt-3 font-mono">
                            {loading ? '—' : `₹${totalValuation.toLocaleString()}`}
                        </h3>
                    </div>

                    <div className="bg-white border border-[#DDD6CA] p-6 flex flex-col justify-between">
                        <span className="text-[9px] font-semibold font-mono tracking-[0.18em] uppercase text-[#756E63]">
                            MEDIA GALLERY ITEMS
                        </span>
                        <h3 className="text-3xl font-serif text-[#211E1A] font-normal mt-3">
                            {loading ? '—' : totalImages}
                        </h3>
                    </div>
                </div>

                {/* ════════════════════════════════════════
                    SEARCH & FILTER CONTROLS — Spacious Bar
                ════════════════════════════════════════ */}
                <div className="bg-white border border-[#DDD6CA] p-4 sm:p-5 mb-10 flex flex-col sm:flex-row items-center justify-between gap-4">
                    {/* Search Bar */}
                    <div className="relative w-full sm:w-80">
                        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#999083]" />
                        <input
                            type="text"
                            placeholder="Search title, description or ID..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full h-10 bg-white border border-[#DDD6CA] pl-9 pr-8 text-xs text-[#211E1A] placeholder-[#999083] outline-none focus:border-[#9D782F] transition-colors"
                        />
                        {searchTerm && (
                            <button
                                onClick={() => setSearchTerm('')}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#999083] hover:text-[#211E1A]"
                            >
                                <X className="w-3.5 h-3.5" />
                            </button>
                        )}
                    </div>

                    {/* Controls Right */}
                    <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-4">
                        {/* Sort Dropdown */}
                        <div className="flex items-center gap-2">
                            <ArrowUpDown className="w-3.5 h-3.5 text-[#999083] hidden sm:block" />
                            <span className="text-[10px] font-mono uppercase tracking-wider text-[#756E63] hidden sm:inline">SORT:</span>
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="h-10 bg-white border border-[#DDD6CA] px-3 text-xs text-[#211E1A] outline-none focus:border-[#9D782F] cursor-pointer"
                            >
                                <option value="newest">Newest First</option>
                                <option value="price-low">Price: Low to High</option>
                                <option value="price-high">Price: High to Low</option>
                                <option value="title">Title: A - Z</option>
                            </select>
                        </div>

                        {/* View Switcher */}
                        <div className="flex items-center bg-[#F8F5F0] border border-[#DDD6CA] p-1">
                            <button
                                onClick={() => setViewMode('grid')}
                                className={`p-1.5 transition-colors ${viewMode === 'grid' ? 'bg-[#9D782F] text-white' : 'text-[#756E63] hover:text-[#211E1A]'}`}
                                title="Grid View"
                            >
                                <LayoutGrid className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => setViewMode('list')}
                                className={`p-1.5 transition-colors ${viewMode === 'list' ? 'bg-[#9D782F] text-white' : 'text-[#756E63] hover:text-[#211E1A]'}`}
                                title="List View"
                            >
                                <List className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* ════════════════════════════════════════
                    PRODUCT LISTING AREA
                ════════════════════════════════════════ */}
                {loading ? (
                    /* Loading Skeleton */
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="bg-white border border-[#DDD6CA] overflow-hidden animate-pulse">
                                <div className="aspect-square bg-[#EBE5DA]" />
                                <div className="p-6 space-y-3">
                                    <div className="h-4 bg-[#EBE5DA] w-3/4" />
                                    <div className="h-3 bg-[#EBE5DA] w-full" />
                                    <div className="h-4 bg-[#EBE5DA] w-1/3 pt-2" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : sortedProducts.length === 0 ? (
                    /* Empty State */
                    <div className="bg-white border border-[#DDD6CA] py-16 px-6 text-center max-w-lg mx-auto my-8">
                        <div className="w-14 h-14 bg-[#F8F5F0] border border-[#DDD6CA] rounded-full flex items-center justify-center text-[#9D782F] mx-auto mb-4">
                            <ShoppingBag className="w-6 h-6" />
                        </div>
                        <h3 className="text-xl font-serif text-[#211E1A] font-normal mb-2">
                            {searchTerm ? 'No products match your search' : 'No products in your store'}
                        </h3>
                        <p className="text-xs text-[#756E63] font-light mb-6">
                            {searchTerm
                                ? `No items found matching "${searchTerm}".`
                                : 'You have not added any products to your catalog yet.'}
                        </p>
                        {searchTerm ? (
                            <button
                                onClick={() => setSearchTerm('')}
                                className="px-5 py-2.5 border border-[#DDD6CA] hover:border-[#9D782F] text-[10px] font-mono uppercase tracking-wider text-[#211E1A] transition-colors"
                            >
                                Clear Search
                            </button>
                        ) : (
                            <Link
                                to="/seller/create-product"
                                className="inline-flex items-center gap-2 px-6 py-3 bg-[#9D782F] hover:bg-[#8A6827] text-white font-mono text-[10px] font-bold tracking-[0.18em] uppercase transition-colors"
                            >
                                <Plus className="w-3.5 h-3.5" />
                                <span>Create Product</span>
                            </Link>
                        )}
                    </div>
                ) : viewMode === 'grid' ? (
                    /* Grid View */
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                        {sortedProducts.map((product) => {
                            const coverImg = product.images?.[0]?.url
                            return (
                                <div
                                    key={product._id}
                                    className="group bg-white border border-[#DDD6CA] hover:border-[#9D782F] transition-all duration-200 flex flex-col justify-between"
                                >
                                    {/* Image Box */}
                                    <div className="relative aspect-square bg-[#F8F5F0] border-b border-[#DDD6CA] overflow-hidden">
                                        {coverImg ? (
                                            <img
                                                src={coverImg}
                                                alt={product.title}
                                                className="w-full h-full object-cover object-top group-hover:scale-103 transition-transform duration-300"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex flex-col items-center justify-center text-[#999083]">
                                                <Package className="w-8 h-8 mb-2" />
                                                <span className="text-[9px] font-mono uppercase tracking-widest">No Image</span>
                                            </div>
                                        )}

                                        {/* Date Badge */}
                                        <div className="absolute top-3 left-3 bg-white/90 border border-[#DDD6CA] px-2 py-0.5 text-[9px] font-mono text-[#756E63] uppercase">
                                            {formatDate(product.createdAt)}
                                        </div>
                                    </div>

                                    {/* Info Box */}
                                    <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                                        <div>
                                            <h3 className="font-serif text-lg text-[#211E1A] font-normal group-hover:text-[#9D782F] transition-colors line-clamp-1">
                                                {product.title}
                                            </h3>
                                            <p className="mt-1.5 text-xs text-[#756E63] font-light line-clamp-2 leading-relaxed">
                                                {product.description || 'No description available.'}
                                            </p>
                                        </div>

                                        <div className="pt-4 border-t border-[#EBE5DA] flex items-center justify-between">
                                            <div>
                                                <span className="text-[9px] font-mono uppercase tracking-wider text-[#999083] block">PRICE</span>
                                                <span className="text-base font-mono font-semibold text-[#9D782F]">
                                                    {formatPrice(product.price)}
                                                </span>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => handleCopyId(product._id)}
                                                    className="p-2 border border-[#DDD6CA] hover:border-[#9D782F] text-[#756E63] hover:text-[#211E1A] bg-white transition-colors"
                                                    title="Copy ID"
                                                >
                                                    {copiedId === product._id ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
                                                </button>

                                                <button
                                                    onClick={() => {
                                                        setSelectedProduct(product)
                                                        setSelectedModalImage(0)
                                                    }}
                                                    className="px-3 py-1.5 border border-[#9D782F] text-[#9D782F] hover:bg-[#9D782F] hover:text-white font-mono text-[9px] uppercase font-bold tracking-widest transition-colors flex items-center gap-1"
                                                >
                                                    <Eye className="w-3 h-3" />
                                                    <span>View</span>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                ) : (
                    /* List / Table View */
                    <div className="bg-white border border-[#DDD6CA] overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-[#F8F5F0] border-b border-[#DDD6CA] text-[9px] font-mono uppercase tracking-[0.18em] text-[#9D782F]">
                                        <th className="py-4 px-6 font-semibold">PRODUCT</th>
                                        <th className="py-4 px-6 font-semibold hidden md:table-cell">DESCRIPTION</th>
                                        <th className="py-4 px-6 font-semibold">PRICE</th>
                                        <th className="py-4 px-6 font-semibold hidden sm:table-cell">CREATED</th>
                                        <th className="py-4 px-6 font-semibold text-right">ACTIONS</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[#EBE5DA] text-xs">
                                    {sortedProducts.map((product) => {
                                        const coverImg = product.images?.[0]?.url
                                        return (
                                            <tr key={product._id} className="hover:bg-[#F8F5F0]/60 transition-colors">
                                                <td className="py-4 px-6">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-12 h-12 bg-[#F8F5F0] border border-[#DDD6CA] overflow-hidden shrink-0">
                                                            {coverImg ? (
                                                                <img src={coverImg} alt={product.title} className="w-full h-full object-cover" />
                                                            ) : (
                                                                <div className="w-full h-full flex items-center justify-center text-[#999083]">
                                                                    <Package className="w-4 h-4" />
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div>
                                                            <h4 className="font-serif text-[#211E1A] font-normal text-sm line-clamp-1">{product.title}</h4>
                                                            <span className="font-mono text-[9px] text-[#999083]">ID: {product._id?.slice(-8)}</span>
                                                        </div>
                                                    </div>
                                                </td>

                                                <td className="py-4 px-6 text-[#756E63] font-light hidden md:table-cell max-w-xs">
                                                    <p className="line-clamp-2">{product.description || '—'}</p>
                                                </td>

                                                <td className="py-4 px-6 font-mono font-semibold text-[#9D782F] whitespace-nowrap">
                                                    {formatPrice(product.price)}
                                                </td>

                                                <td className="py-4 px-6 text-[#756E63] font-mono text-xs hidden sm:table-cell whitespace-nowrap">
                                                    {formatDate(product.createdAt)}
                                                </td>

                                                <td className="py-4 px-6 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <button
                                                            onClick={(e) => handleCopyId(product._id, e)}
                                                            className="p-1.5 border border-[#DDD6CA] hover:border-[#9D782F] text-[#756E63] hover:text-[#211E1A] bg-white transition-colors"
                                                            title="Copy ID"
                                                        >
                                                            {copiedId === product._id ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
                                                        </button>
                                                        <button
                                                            onClick={() => {
                                                                setSelectedProduct(product)
                                                                setSelectedModalImage(0)
                                                            }}
                                                            className="px-3 py-1.5 border border-[#9D782F] text-[#9D782F] hover:bg-[#9D782F] hover:text-white font-mono text-[9px] uppercase font-bold tracking-widest transition-colors flex items-center gap-1"
                                                        >
                                                            <Eye className="w-3 h-3" />
                                                            <span>View</span>
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </main>

            {/* ════════════════════════════════════════
                QUICK VIEW MODAL — Clean Warm Palette
            ════════════════════════════════════════ */}
            {selectedProduct && (
                <div
                    className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
                    onClick={() => setSelectedProduct(null)}
                >
                    <div
                        className="bg-white border border-[#DDD6CA] max-w-2xl w-full p-6 sm:p-8 relative shadow-xl space-y-6 my-8"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            onClick={() => setSelectedProduct(null)}
                            className="absolute top-4 right-4 text-[#756E63] hover:text-[#211E1A] p-1 border border-[#DDD6CA] bg-white"
                        >
                            <X className="w-4 h-4" />
                        </button>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            {/* Gallery */}
                            <div className="space-y-3">
                                <div className="aspect-square bg-[#F8F5F0] border border-[#DDD6CA] overflow-hidden">
                                    {selectedProduct.images?.[selectedModalImage]?.url ? (
                                        <img
                                            src={selectedProduct.images[selectedModalImage].url}
                                            alt={selectedProduct.title}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex flex-col items-center justify-center text-[#999083]">
                                            <Package className="w-10 h-10 mb-2" />
                                            <span className="text-[9px] font-mono uppercase">No Image</span>
                                        </div>
                                    )}
                                </div>

                                {selectedProduct.images?.length > 1 && (
                                    <div className="flex items-center gap-2 overflow-x-auto pb-1">
                                        {selectedProduct.images.map((img, idx) => (
                                            <button
                                                key={img._id || idx}
                                                onClick={() => setSelectedModalImage(idx)}
                                                className={`w-12 h-12 border overflow-hidden shrink-0 ${selectedModalImage === idx ? 'border-[#9D782F]' : 'border-[#DDD6CA] opacity-60'}`}
                                            >
                                                <img src={img.url} alt="" className="w-full h-full object-cover" />
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Details */}
                            <div className="flex flex-col justify-between space-y-4">
                                <div className="space-y-3">
                                    <span className="text-[9px] font-mono uppercase tracking-[0.25em] text-[#9D782F] font-semibold block">
                                        PRODUCT DETAILS
                                    </span>
                                    <h2 className="text-2xl font-serif text-[#211E1A] font-normal">{selectedProduct.title}</h2>

                                    <div>
                                        <span className="text-[9px] font-mono uppercase tracking-wider text-[#999083] block">PRICE</span>
                                        <span className="text-lg font-mono font-bold text-[#9D782F]">
                                            {formatPrice(selectedProduct.price)}
                                        </span>
                                    </div>

                                    <div>
                                        <span className="text-[9px] font-mono uppercase tracking-wider text-[#999083] block mb-1">DESCRIPTION</span>
                                        <p className="text-xs text-[#756E63] font-light leading-relaxed max-h-36 overflow-y-auto">
                                            {selectedProduct.description || 'No description provided.'}
                                        </p>
                                    </div>

                                    <div className="space-y-1 pt-3 border-t border-[#EBE5DA] text-[10px] font-mono text-[#756E63]">
                                        <div className="flex justify-between">
                                            <span>ID:</span>
                                            <span className="text-[#211E1A] font-semibold">{selectedProduct._id}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>CREATED:</span>
                                            <span className="text-[#211E1A]">{formatDate(selectedProduct.createdAt)}</span>
                                        </div>
                                    </div>
                                </div>

                                <button
                                    onClick={() => setSelectedProduct(null)}
                                    className="w-full py-2.5 bg-[#F8F5F0] hover:bg-[#EBE5DA] text-[#211E1A] text-[10px] font-mono uppercase font-bold tracking-[0.18em] border border-[#DDD6CA] transition-colors"
                                >
                                    Close Window
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default Dashboard
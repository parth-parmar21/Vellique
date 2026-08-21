import React, { useState } from 'react'
import { useSelector } from 'react-redux'
import { Link, useNavigate } from 'react-router-dom'
import { Trash2, ShoppingBag, Plus, Minus, ArrowLeft, Package, Sparkles } from 'lucide-react'
import { useCart } from '../hook/useCart'

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
    const currency = priceObj.currency || 'INR'
    const symbol = CURRENCY_SYMBOLS[currency] || `${currency} `
    return `${symbol}${Number(amount).toLocaleString()}`
}

const CartPage = () => {
    const navigate = useNavigate()
    const { handleRemoveItem, handleIncrementCartItem, handleDecrementCartItem } = useCart()

    const user = useSelector((state) => state.auth.user)
    const cartItems = useSelector((state) => state.cart.items) || []

    const [actionLoading, setActionLoading] = useState(null) // tracks if an item is being updated
    const [checkoutComplete, setCheckoutComplete] = useState(false)

    // Helper: Find selected variant attributes
    const getVariantDetails = (item) => {
        if (!item.product?.variants) return null
        const variantObj = item.product.variants.find(v => v._id === item.variant)
        if (!variantObj || !variantObj.attributes) return null

        // If attributes is a Map-like structure
        const attrs = variantObj.attributes
        return Object.entries(attrs)
            .map(([key, val]) => `${key.toUpperCase()}: ${val}`)
            .join('  |  ')
    }

    // Helper: Get product image (variant image if available, else cover image)
    const getProductImage = (item) => {
        if (!item.product?.variants) return null
        const variantObj = item.product.variants.find(v => v._id === item.variant)
        if (variantObj && variantObj.images?.[0]?.url) {
            return variantObj.images[0].url
        }
        return item.product?.images?.[0]?.url || null
    }

    // Handlers
    // const updateQty = async (item, newQty) => {
    //     console.log(item);

    //     if (newQty < 1) return
    //     setActionLoading(`${item.product._id}-${item.variant}`)
    //     try {
    //         await handleUpdateItemQty({
    //             productId: item.product._id,
    //             variantId: item.variant,
    //             quantity: newQty
    //         })
    //     } catch (err) {
    //         console.error(err)
    //     } finally {
    //         setActionLoading(null)
    //     }
    // }

    const removeItem = async (item) => {
        setActionLoading(`${item.product._id}-${item.variant}`)
        try {
            await handleRemoveItem({
                productId: item.product._id,
                variantId: item.variant
            })
        } catch (err) {
            console.error(err)
        } finally {
            setActionLoading(null)
        }
    }

    // Math
    const calculateSubtotal = () => {
        return cartItems.reduce((acc, item) => {
            const price = item.price?.amount || 0
            return acc + price * item.quantity
        }, 0)
    }

    const subtotal = calculateSubtotal()
    const currency = cartItems[0]?.price?.currency || 'INR'
    const formattedSubtotal = formatPrice({ amount: subtotal, currency })

    // Styling Tokens
    const serif = { fontFamily: "'Cormorant Garamond', serif" }
    const mono = { fontFamily: "'DM Mono', monospace" }
    const sans = { fontFamily: "'Inter', sans-serif" }

    if (checkoutComplete) {
        return (
            <div className="min-h-screen flex flex-col selection:bg-[#9D782F]/20" style={{ backgroundColor: '#F8F5F0', ...sans }}>
                <main className="grow flex items-center justify-center px-6">
                    <div className="text-center max-w-md py-20 animate-fade-in">
                        <span className="text-[10px] uppercase tracking-[0.3em] text-[#9D782F] block mb-5" style={mono}>
                            Order Confirmed
                        </span>
                        <h1 className="text-4xl sm:text-5xl font-light text-[#211E1A] mb-5" style={serif}>
                            Thank you for your purchase.
                        </h1>
                        <p className="text-[12px] text-[#756E63] font-light leading-relaxed mb-10">
                            Your order has been received and is being prepared. An confirmation email has been sent to you.
                        </p>
                        <Link
                            to="/"
                            className="inline-block px-8 py-3.5 bg-[#211E1A] hover:bg-[#9D782F] hover:text-[#211E1A] text-white text-[9px] uppercase tracking-[0.2em] transition-all duration-300"
                            style={mono}
                        >
                            Continue Shopping
                        </Link>
                    </div>
                </main>
            </div>
        )
    }

    return (
        <div className="min-h-screen flex flex-col selection:bg-[#9D782F]/20" style={{ backgroundColor: '#F8F5F0', ...sans }}>

            {/* Breadcrumbs */}
            <div className="border-b border-[#EBE5DA]">
                <div className="max-w-[1400px] mx-auto px-6 sm:px-10 lg:px-14 py-5 flex items-center gap-3">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center text-[#756E63] hover:text-[#9D782F] transition-colors duration-300"
                        aria-label="Go back"
                    >
                        <ArrowLeft className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-[9px] uppercase tracking-[0.2em] text-[#9A9287]" style={mono}>
                        <Link to="/" className="hover:text-[#9D782F] transition-colors duration-300">
                            Vellique Collection
                        </Link>
                        <span className="mx-2 text-[#DDD6CA]">/</span>
                        <span className="text-[#9D782F]">Your Bag</span>
                    </span>
                </div>
            </div>

            {/* Content area */}
            <main className="grow py-12 sm:py-16">
                <div className="max-w-[1400px] mx-auto px-6 sm:px-10 lg:px-14">

                    <h1 className="text-4xl sm:text-5xl font-light text-[#211E1A] mb-10" style={serif}>
                        Shopping Bag
                    </h1>

                    {!user ? (
                        /* Not Logged In */
                        <div className="py-20 text-center max-w-sm mx-auto border border-[#DDD6CA] bg-white p-8">
                            <ShoppingBag className="w-8 h-8 text-[#9A9287] mx-auto mb-4 stroke-[1]" />
                            <h3 className="text-xl font-light text-[#211E1A] mb-3" style={serif}>
                                Please sign in to view your bag.
                            </h3>
                            <p className="text-[12px] text-[#756E63] font-light mb-6">
                                We hold items in your shopping bag for you when you are signed in.
                            </p>
                            <Link
                                to="/login"
                                className="block w-full py-3 bg-[#211E1A] hover:bg-[#9D782F] hover:text-[#211E1A] text-white text-[9px] uppercase tracking-[0.2em] text-center transition-all duration-300"
                                style={mono}
                            >
                                Sign In
                            </Link>
                        </div>
                    ) : cartItems.length === 0 ? (
                        /* Empty Cart */
                        <div className="py-20 text-center max-w-sm mx-auto border border-[#DDD6CA] bg-white p-8">
                            <ShoppingBag className="w-8 h-8 text-[#9A9287] mx-auto mb-4 stroke-[1]" />
                            <h3 className="text-xl font-light text-[#211E1A] mb-3" style={serif}>
                                Your bag is empty.
                            </h3>
                            <p className="text-[12px] text-[#756E63] font-light mb-8">
                                Browse our collection to discover quiet luxury fashion pieces.
                            </p>
                            <Link
                                to="/"
                                className="block w-full py-3 bg-[#211E1A] hover:bg-[#9D782F] hover:text-[#211E1A] text-white text-[9px] uppercase tracking-[0.2em] text-center transition-all duration-300"
                                style={mono}
                            >
                                Explore Collection
                            </Link>
                        </div>
                    ) : (
                        /* Cart Grid */
                        <div className="grid grid-cols-1 lg:grid-cols-[1.3fr_0.7fr] gap-12 lg:gap-16 items-start">

                            {/* Left Pane: Items List */}
                            <div className="space-y-6">
                                {cartItems.map((item, index) => {
                                    const image = getProductImage(item)
                                    const variantText = getVariantDetails(item)
                                    const isItemLoading = actionLoading === `${item.product._id}-${item.variant}`
                                    const itemSubtotal = (item.price?.amount || 0) * item.quantity

                                    return (
                                        <article
                                            key={`${item.product._id}-${item.variant}-${index}`}
                                            className={`flex flex-col sm:flex-row gap-6 p-5 border border-[#DDD6CA] bg-white relative transition-opacity duration-300 ${isItemLoading ? 'opacity-50' : 'opacity-100'}`}
                                        >
                                            {/* Image */}
                                            <div className="w-24 h-30 sm:w-28 sm:h-35 shrink-0 bg-[#F3EFEA] border border-[#DDD6CA] overflow-hidden">
                                                {image ? (
                                                    <img
                                                        src={image}
                                                        alt={item.product?.title}
                                                        className="w-full h-full object-cover object-top"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex flex-col items-center justify-center text-[#9A9287]">
                                                        <Package className="w-6 h-6 mb-1 stroke-[1]" />
                                                        <span className="text-[7px] uppercase tracking-widest" style={mono}>No Image</span>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Details */}
                                            <div className="flex-1 flex flex-col justify-between py-1">
                                                <div>
                                                    <div className="flex justify-between items-start gap-4">
                                                        <Link
                                                            to={`/product/${item.product._id}`}
                                                            className="text-lg font-light text-[#211E1A] hover:text-[#9D782F] transition-colors leading-tight"
                                                            style={serif}
                                                        >
                                                            {item.product?.title || 'Unknown Product'}
                                                        </Link>

                                                        <span className="text-base font-normal text-[#211E1A] whitespace-nowrap" style={serif}>
                                                            {formatPrice({ amount: itemSubtotal, currency })}
                                                        </span>
                                                    </div>

                                                    {/* Variant Attributes */}
                                                    {variantText && (
                                                        <p className="text-[9px] text-[#9D782F] font-light mt-2.5 tracking-wider" style={mono}>
                                                            {variantText}
                                                        </p>
                                                    )}

                                                    <p className="text-[11px] text-[#756E63] font-light mt-1 max-w-md line-clamp-2">
                                                        {item.product?.description}
                                                    </p>
                                                    {
                                                        item.product.variants[0].price.amount !== item.price.amount && (
                                                            <>
                                                                {item.product.variants[0].price.amount > item.price.amount ?
                                                                    <p className="text-md text-red-800 font-light mt-2 max-w-md line-clamp-2">
                                                                        This product is now more expensive {formatPrice({ amount: item.product.variants[0].price.amount - item.price.amount, currency })}
                                                                    </p> : <p className="text-md text-green-800 font-light mt-2 max-w-md line-clamp-2">
                                                                        You have saved {formatPrice({ amount: Math.abs(item.product.variants[0].price.amount - item.price.amount), currency })} on this product
                                                                    </p>}
                                                            </>
                                                        )
                                                    }
                                                </div>

                                                {/* Actions / Quantity control */}
                                                <div className="flex items-center justify-between mt-6 pt-4 border-t border-[#EBE5DA] gap-4">

                                                    {/* Qty Adjustment */}
                                                    <div className="flex items-center border border-[#DDD6CA] h-[36px]">
                                                        <button
                                                            disabled={item.quantity <= 1 || isItemLoading}
                                                            onClick={() =>
                                                                handleDecrementCartItem({
                                                                    productId: item.product._id,
                                                                    variantId: item.variant
                                                                })
                                                            }
                                                            className="px-2.5 text-[#756E63] hover:text-[#211E1A] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                                                            title="Decrease Quantity"
                                                        >
                                                            <Minus className="w-3 h-3" />
                                                        </button>
                                                        <span className="px-4 text-[11px] font-medium text-[#211E1A]" style={mono}>
                                                            {item.quantity}
                                                        </span>
                                                        <button
                                                            disabled={isItemLoading}
                                                            onClick={() =>
                                                                handleIncrementCartItem({
                                                                    productId: item.product._id,
                                                                    variantId: item.variant
                                                                })
                                                            }
                                                            className="px-2.5 text-[#756E63] hover:text-[#211E1A] disabled:opacity-30 transition-colors"
                                                            title="Increase Quantity"
                                                        >
                                                            <Plus className="w-3 h-3" />
                                                        </button>
                                                    </div>

                                                    {/* Remove Button */}
                                                    <button
                                                        disabled={isItemLoading}
                                                        onClick={() => removeItem(item)}
                                                        className="text-[9px] uppercase tracking-[0.18em] text-[#756E63] hover:text-[#ff3b30] flex items-center gap-1.5 transition-colors border-b border-transparent hover:border-[#ff3b30] pb-0.5"
                                                        style={mono}
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5 stroke-[1.5]" />
                                                        Remove
                                                    </button>

                                                </div>
                                            </div>
                                        </article>
                                    )
                                })}
                            </div>

                            {/* Right Pane: Summary Card */}
                            <aside className="sticky top-28 border border-[#DDD6CA] bg-white p-6 sm:p-8">
                                <h2 className="text-[10px] uppercase tracking-[0.25em] text-[#211E1A] border-b border-[#EBE5DA] pb-4 mb-6 font-semibold" style={mono}>
                                    Order Summary
                                </h2>

                                <div className="space-y-4 mb-6">
                                    <div className="flex justify-between items-center text-[12px] text-[#756E63] font-light">
                                        <span>Subtotal</span>
                                        <span className="text-[#211E1A] font-medium">{formattedSubtotal}</span>
                                    </div>

                                    <div className="flex justify-between items-center text-[12px] text-[#756E63] font-light">
                                        <span>Shipping</span>
                                        <span className="text-[#9D782F] font-light uppercase tracking-widest text-[9px]" style={mono}>Complimentary</span>
                                    </div>

                                    <div className="w-full h-px bg-[#EBE5DA]" />

                                    <div className="flex justify-between items-end">
                                        <span className="text-[10px] uppercase tracking-[0.2em] text-[#211E1A]" style={mono}>Total</span>
                                        <span className="text-2xl text-[#9D782F] font-normal leading-none" style={serif}>
                                            {formattedSubtotal}
                                        </span>
                                    </div>
                                </div>

                                <button
                                    onClick={() => setCheckoutComplete(true)}
                                    className="w-full h-[52px] bg-[#211E1A] hover:bg-[#9D782F] text-white hover:text-[#211E1A] text-[9px] uppercase tracking-[0.22em] transition-all duration-300 font-semibold flex items-center justify-center gap-2 rounded-none"
                                    style={mono}
                                >
                                    Proceed to Checkout
                                </button>

                                <Link
                                    to="/"
                                    className="block w-full py-3.5 mt-3 text-center border border-[#DDD6CA] hover:bg-[#F3EFEA] text-[#211E1A] text-[9px] uppercase tracking-[0.22em] transition-colors duration-300"
                                    style={mono}
                                >
                                    Continue Shopping
                                </Link>
                            </aside>

                        </div>
                    )}
                </div>
            </main>

            {/* Footer */}
            <footer className="border-t border-[#DDD6CA] bg-[#F3EFEA] selection:bg-[#9D782F]/20 ">
                <div className="max-w-[1400px] mx-auto px-6 sm:px-10 lg:px-14 py-14 sm:py-16">
                    <div className="flex flex-col md:flex-row items-center md:items-end justify-between gap-8">
                        <div className="text-center md:text-left">
                            <span className="text-[15px] tracking-[0.35em] uppercase font-normal text-[#211E1A] block mb-2" style={serif}>
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
                        <p className="text-[8px] uppercase tracking-[0.2em] text-[#999083] text-center" style={mono}>
                            © {new Date().getFullYear()} Vellique. All Rights Reserved.
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    )
}

export default CartPage

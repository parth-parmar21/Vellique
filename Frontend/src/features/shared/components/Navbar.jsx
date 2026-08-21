import React, { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Search, ShoppingBag, Sparkles, X } from 'lucide-react'
import { setSearchQuery } from '../../products/state/product.slice'
import { useCart } from '../../cart/hook/useCart'

const Navbar = () => {
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const location = useLocation()
    const { handleGetCart } = useCart()

    const user = useSelector((state) => state.auth.user)
    const searchQuery = useSelector((state) => state.product.searchQuery) || ''
    const cartItems = useSelector((state) => state.cart.items) || []
    
    // Sum of quantity of all cart items
    const cartCount = cartItems.reduce((total, item) => total + (item.quantity || 0), 0)

    // Fetch cart on mount / user change
    useEffect(() => {
        if (user) {
            handleGetCart()
        }
    }, [user])

    const handleSearchChange = (e) => {
        const val = e.target.value
        dispatch(setSearchQuery(val))
        
        // If not on Home page, navigate to Home page so user can see search results
        if (location.pathname !== '/') {
            navigate('/')
        }
    }

    const handleClearSearch = () => {
        dispatch(setSearchQuery(''))
    }

    const serif = { fontFamily: "'Cormorant Garamond', serif" }
    const mono = { fontFamily: "'DM Mono', monospace" }
    const sans = { fontFamily: "'Inter', sans-serif" }

    return (
        <header className="sticky top-0 z-40 bg-[#F8F5F0]/95 backdrop-blur-md border-b border-[#DDD6CA] w-full selection:bg-[#9D782F]/20">
            <div className="max-w-[1400px] mx-auto px-6 sm:px-10 lg:px-14">
                <div className="h-[76px] flex items-center justify-between gap-4">
                    
                    {/* Left: Brand & Nav Links */}
                    <div className="flex items-center gap-8 lg:gap-12 shrink-0">
                        <Link to="/" className="group">
                            <span
                                className="text-[16px] tracking-[0.35em] uppercase font-normal text-[#211E1A] group-hover:text-[#9D782F] transition-colors duration-300"
                                style={serif}
                            >
                                Vellique.
                            </span>
                        </Link>
                        
                        <nav className="hidden md:flex items-center gap-6 lg:gap-8">
                            {[
                                { label: 'COLLECTION', path: '/' },
                                { label: 'NEW ARRIVALS', path: '/' },
                                { label: 'ABOUT', path: '/' },
                            ].map((item) => (
                                <Link
                                    key={item.label}
                                    to={item.path}
                                    className="text-[9px] uppercase tracking-[0.2em] text-[#756E63] hover:text-[#9D782F] transition-colors duration-300"
                                    style={mono}
                                >
                                    {item.label}
                                </Link>
                            ))}
                        </nav>
                    </div>

                    {/* Middle: Search Bar */}
                    <div className="flex-1 max-w-sm md:max-w-md mx-4">
                        <div className="relative w-full">
                            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#999083]" />
                            <input
                                type="text"
                                placeholder="Search products by name..."
                                value={searchQuery}
                                onChange={handleSearchChange}
                                className="w-full bg-transparent border border-[#DDD6CA] focus:border-[#9D782F] pl-9 pr-8 py-2 text-[11px] text-[#211E1A] placeholder-[#999083] outline-none transition-all duration-300 rounded-none"
                                style={sans}
                            />
                            {searchQuery && (
                                <button
                                    onClick={handleClearSearch}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#999083] hover:text-[#211E1A] transition-colors"
                                >
                                    <X className="w-3.5 h-3.5" />
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Right: Actions */}
                    <div className="flex items-center gap-3 sm:gap-5 shrink-0">
                        {user?.role === 'seller' && (
                            <Link
                                to="/seller/dashboard"
                                className="hidden lg:inline-flex items-center gap-1.5 text-[9px] uppercase tracking-[0.18em] text-[#9D782F] border border-[#9D782F]/30 px-3.5 py-1.5 hover:bg-[#9D782F] hover:text-white transition-all duration-300"
                                style={mono}
                            >
                                <Sparkles className="w-3 h-3" />
                                Seller Studio
                            </Link>
                        )}

                        {user ? (
                            <div className="flex items-center gap-3">
                                <span
                                    className="text-[11px] text-[#756E63] font-light hidden sm:inline"
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
                                        className="lg:hidden p-1.5 text-[#9D782F] border border-[#DDD6CA]"
                                        title="Seller Dashboard"
                                    >
                                        <Sparkles className="w-4 h-4" />
                                    </Link>
                                )}
                            </div>
                        ) : (
                            <div className="flex items-center gap-3">
                                <Link
                                    to="/login"
                                    className="text-[9px] uppercase tracking-[0.18em] text-[#211E1A] hover:text-[#9D782F] transition-colors duration-300"
                                    style={mono}
                                >
                                    Sign In
                                </Link>

                                <Link
                                    to="/register"
                                    className="px-3.5 py-2 bg-[#211E1A] hover:bg-[#302C27] text-white text-[9px] uppercase tracking-[0.18em] transition-colors duration-300"
                                    style={mono}
                                >
                                    Register
                                </Link>
                            </div>
                        )}

                        {/* Cart Bag Icon with Floating Badge */}
                        <Link
                            to="/cart"
                            className="relative w-10 h-10 flex items-center justify-center border border-[#DDD6CA] hover:border-[#9D782F] transition-all duration-300 text-[#756E63] hover:text-[#9D782F] bg-transparent"
                            title="Shopping Bag"
                        >
                            <ShoppingBag className="w-[18px] h-[18px] stroke-[1.5]" />
                            
                            {cartCount > 0 && (
                                <span className="absolute -top-1.5 -right-1.5 bg-[#9D782F] text-white text-[8px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-[#F8F5F0]">
                                    {cartCount}
                                </span>
                            )}
                        </Link>
                    </div>

                </div>
            </div>
        </header>
    )
}

export default Navbar

import { useState, useRef, useEffect } from 'react'
import { useParams, useNavigate, data } from 'react-router-dom'
import { useProducts } from '../hook/useProduct.js'

// ─── Constants ────────────────────────────────────────────────────────────────

const CURRENCIES = ['USD', 'EUR', 'INR', 'JPY', 'GBP']

const CURRENCY_SYMBOLS = { USD: '$', EUR: '€', GBP: '£', INR: '₹', JPY: '¥' }

const MAX_PRODUCT_IMAGES = 7
const MAX_IMAGE_SIZE = 5 * 1024 * 1024 // 5 MB

// ─── Design Tokens ────────────────────────────────────────────────────────────

const C = {
    bg: '#F7F3EC',
    white: '#FFFFFF',
    text: '#211E1A',
    textSec: '#756E63',
    textMuted: '#999083',
    border: '#DDD6CA',
    borderLight: '#EBE5DA',
    accent: '#9D782F',
    surface: '#F3EFEA',
    error: '#c25a5a',
}

const LABEL = {
    fontSize: '9px',
    letterSpacing: '0.18em',
    textTransform: 'uppercase',
    color: C.textMuted,
    fontFamily: "'Inter', sans-serif",
    fontWeight: 500,
    display: 'block',
    marginBottom: '8px',
}

const SECTION_LABEL = {
    fontSize: '9px',
    letterSpacing: '0.22em',
    textTransform: 'uppercase',
    color: C.textMuted,
    fontFamily: "'Inter', sans-serif",
    fontWeight: 600,
}

const INPUT_BASE = {
    background: 'transparent',
    outline: 'none',
    fontSize: '14px',
    color: C.text,
    fontFamily: "'Inter', sans-serif",
    padding: '10px 0',
    border: 'none',
    borderBottom: `1px solid ${C.border}`,
    transition: 'border-color 0.2s',
    display: 'block',
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const genId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`

const normalizeAttributes = (attrs) => {
    if (!attrs) return {}
    if (attrs instanceof Map) return Object.fromEntries(attrs)
    return { ...attrs }
}

const attrsToArray = (attrs) =>
    Object.entries(normalizeAttributes(attrs)).map(([key, value]) => ({
        _id: genId(),
        key,
        value,
    }))

const arrayToAttrs = (arr) => {
    const obj = {}
    arr.forEach(({ key, value }) => {
        if (key.trim()) obj[key.trim()] = value
    })
    return obj
}

const normalizeVariant = (v) => {
    let rawAttrs = v.attributes ? (Array.isArray(v.attributes) ? v.attributes : attrsToArray(v.attributes)) : []
    if (rawAttrs.length === 0) {
        rawAttrs = [{ _id: genId(), key: 'Color', value: '' }]
    }
    return {
        _localId: genId(),
        stock: v.stock ?? 0,
        price: {
            amount: v.price?.amount ?? '',
            currency: v.price?.currency ?? 'INR',
        },
        attributes: rawAttrs,
        existingImages: (v.images || []).map(img => ({ _localId: genId(), url: img.url })),
        newImages: [],
    }
}

const formatDate = (iso) => {
    if (!iso) return '—'
    return new Date(iso).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    }).toUpperCase()
}

const formatPrice = (priceObj) => {
    if (!priceObj || priceObj.amount == null || priceObj.amount === '') return '—'
    const sym = CURRENCY_SYMBOLS[priceObj.currency] || `${priceObj.currency} `
    return `${sym}${Number(priceObj.amount).toLocaleString()}`
}

const summarizeAttrs = (attrArray) => {
    if (!attrArray || attrArray.length === 0) return 'No attributes defined'
    const filled = attrArray.filter(a => a.key.trim() && a.value.trim())
    if (filled.length === 0) return 'No attributes defined'
    return filled.map(a => a.value).join(' · ')
}

// ─── Shared hover helpers ─────────────────────────────────────────────────────

const onFocusGold = (e) => { e.target.style.borderColor = C.accent }
const onBlurBorder = (e) => { e.target.style.borderColor = C.border }

// ─── SkeletonLoader ───────────────────────────────────────────────────────────

function SkeletonLoader() {
    return (
        <div style={{ backgroundColor: C.bg, minHeight: '100vh' }}>
            <style>{`
                @keyframes vq-shimmer {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.38; }
                }
                .vq-skel { background-color: ${C.borderLight}; animation: vq-shimmer 1.6s ease-in-out infinite; }
            `}</style>
            {/* Header */}
            <div style={{ borderBottom: `1px solid ${C.border}`, padding: '22px 48px', backgroundColor: C.white, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <div className="vq-skel" style={{ height: '9px', width: '160px', marginBottom: '12px' }} />
                    <div className="vq-skel" style={{ height: '26px', width: '260px', marginBottom: '8px' }} />
                    <div className="vq-skel" style={{ height: '11px', width: '220px' }} />
                </div>
                <div className="vq-skel" style={{ height: '40px', width: '128px' }} />
            </div>
            {/* Body */}
            <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '48px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: '48px', marginBottom: '56px' }}>
                    <div className="vq-skel" style={{ height: '420px' }} />
                    <div>
                        <div className="vq-skel" style={{ height: '9px', width: '80px', marginBottom: '14px' }} />
                        <div className="vq-skel" style={{ height: '16px', marginBottom: '28px' }} />
                        <div className="vq-skel" style={{ height: '9px', width: '80px', marginBottom: '14px' }} />
                        <div className="vq-skel" style={{ height: '72px', marginBottom: '28px' }} />
                        <div className="vq-skel" style={{ height: '9px', width: '80px', marginBottom: '14px' }} />
                        <div className="vq-skel" style={{ height: '16px', width: '50%' }} />
                    </div>
                </div>
                <div className="vq-skel" style={{ height: '1px', marginBottom: '48px' }} />
                <div className="vq-skel" style={{ height: '240px' }} />
            </div>
        </div>
    )
}

// ─── ProductNotFound ──────────────────────────────────────────────────────────

function ProductNotFound({ onBack }) {
    return (
        <div style={{
            backgroundColor: C.bg,
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: "'Inter', sans-serif",
            textAlign: 'center',
            padding: '32px',
        }}>
            <p style={{ ...SECTION_LABEL, marginBottom: '20px' }}>Error · Not Found</p>
            <h1 style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: '36px',
                fontWeight: 300,
                color: C.text,
                marginBottom: '12px',
            }}>
                Product Not Found
            </h1>
            <p style={{ fontSize: '14px', color: C.textSec, marginBottom: '40px', maxWidth: '320px', lineHeight: '1.65' }}>
                The product you're looking for could not be found, or you may not have access to it.
            </p>
            <button
                onClick={onBack}
                style={{
                    backgroundColor: C.text,
                    color: C.white,
                    border: 'none',
                    padding: '13px 28px',
                    fontSize: '10px',
                    letterSpacing: '0.2em',
                    textTransform: 'uppercase',
                    cursor: 'pointer',
                    fontFamily: "'Inter', sans-serif",
                    transition: 'background-color 0.25s',
                }}
                onMouseEnter={e => (e.currentTarget.style.backgroundColor = C.accent)}
                onMouseLeave={e => (e.currentTarget.style.backgroundColor = C.text)}
            >
                Back to Dashboard
            </button>
        </div>
    )
}

// ─── AttributeEditor ─────────────────────────────────────────────────────────

function AttributeEditor({ attributes, onChange, readOnly }) {
    const addAttr = () =>
        onChange([...attributes, { _id: genId(), key: '', value: '' }])

    const setAttr = (id, field, val) =>
        onChange(attributes.map(a => (a._id === id ? { ...a, [field]: val } : a)))

    const removeAttr = (id) =>
        onChange(attributes.filter(a => a._id !== id))

    if (readOnly) {
        const filled = attributes.filter(a => a.key.trim() || a.value.trim())
        return (
            <div>
                <p style={LABEL}>Attributes</p>
                {filled.length === 0 ? (
                    <p style={{ fontSize: '13px', color: C.textMuted, fontStyle: 'italic', fontFamily: "'Inter', sans-serif" }}>
                        None
                    </p>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {filled.map((attr) => (
                            <div key={attr._id} style={{ display: 'flex', gap: '8px', alignItems: 'baseline' }}>
                                <span style={{ fontSize: '11px', color: C.textMuted, textTransform: 'uppercase', letterSpacing: '0.08em', fontFamily: "'Inter', sans-serif" }}>
                                    {attr.key || 'Attr'}:
                                </span>
                                <span style={{ fontSize: '14px', color: C.text, fontFamily: "'Inter', sans-serif", fontWeight: 500 }}>
                                    {attr.value || '—'}
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        )
    }

    return (
        <div>
            <p style={LABEL}>Attributes</p>

            {attributes.length === 0 && (
                <p style={{ fontSize: '12px', color: C.textMuted, fontStyle: 'italic', marginBottom: '10px', fontFamily: "'Inter', sans-serif" }}>
                    No attributes yet. Add one below.
                </p>
            )}

            {attributes.map((attr) => (
                <div
                    key={attr._id}
                    style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr auto',
                        gap: '10px',
                        alignItems: 'end',
                        marginBottom: '10px',
                    }}
                >
                    <div>
                        <p style={{ ...LABEL, marginBottom: '5px' }}>Name</p>
                        <input
                            type="text"
                            value={attr.key}
                            onChange={e => setAttr(attr._id, 'key', e.target.value)}
                            placeholder="e.g. Color"
                            style={{ ...INPUT_BASE, width: '100%' }}
                            onFocus={onFocusGold}
                            onBlur={onBlurBorder}
                        />
                    </div>
                    <div>
                        <p style={{ ...LABEL, marginBottom: '5px' }}>Value</p>
                        <input
                            type="text"
                            value={attr.value}
                            onChange={e => setAttr(attr._id, 'value', e.target.value)}
                            placeholder="e.g. Black"
                            style={{ ...INPUT_BASE, width: '100%' }}
                            onFocus={onFocusGold}
                            onBlur={onBlurBorder}
                        />
                    </div>
                    <button
                        type="button"
                        onClick={() => removeAttr(attr._id)}
                        title="Remove attribute"
                        style={{
                            width: '28px',
                            height: '28px',
                            border: `1px solid ${C.border}`,
                            backgroundColor: 'transparent',
                            color: C.textMuted,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '14px',
                            flexShrink: 0,
                            marginBottom: '1px',
                            transition: 'all 0.2s',
                        }}
                        onMouseEnter={e => {
                            e.currentTarget.style.borderColor = C.error
                            e.currentTarget.style.color = C.error
                        }}
                        onMouseLeave={e => {
                            e.currentTarget.style.borderColor = C.border
                            e.currentTarget.style.color = C.textMuted
                        }}
                    >
                        ×
                    </button>
                </div>
            ))}

            <button
                type="button"
                onClick={addAttr}
                style={{
                    fontSize: '10px',
                    letterSpacing: '0.14em',
                    color: C.accent,
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '4px 0',
                    fontFamily: "'Inter', sans-serif",
                    transition: 'color 0.2s',
                    textTransform: 'uppercase',
                }}
                onMouseEnter={e => (e.currentTarget.style.color = C.text)}
                onMouseLeave={e => (e.currentTarget.style.color = C.accent)}
            >
                + Add Attribute
            </button>
        </div>
    )
}

// ─── VariantImages ────────────────────────────────────────────────────────────

function VariantImages({ existingImages, newImages, onRemoveExisting, onRemoveNew, onAdd, readOnly }) {
    const fileInputRef = useRef(null)

    const all = [
        ...existingImages.map(i => ({ ...i, _src: i.url, _isExisting: true })),
        ...newImages.map(i => ({ ...i, _src: i.previewUrl, _isExisting: false })),
    ]

    const handleFiles = (e) => {
        const files = Array.from(e.target.files || [])
            .filter(f => f.type.startsWith('image/') && f.size <= MAX_IMAGE_SIZE)
        if (files.length) {
            onAdd(files.map(f => ({ _localId: genId(), file: f, previewUrl: URL.createObjectURL(f) })))
        }
        e.target.value = ''
    }

    return (
        <div>
            <p style={LABEL}>Variant Images</p>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {all.map(img => (
                    <div
                        key={img._localId}
                        style={{
                            position: 'relative',
                            width: '60px',
                            height: '60px',
                            border: `1px solid ${C.border}`,
                            backgroundColor: C.surface,
                            flexShrink: 0,
                            overflow: 'hidden',
                        }}
                    >
                        <img
                            src={img._src}
                            alt=""
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                        {!readOnly && (
                            <button
                                type="button"
                                onClick={() => img._isExisting ? onRemoveExisting(img._localId) : onRemoveNew(img._localId)}
                                style={{
                                    position: 'absolute',
                                    inset: 0,
                                    width: '100%',
                                    height: '100%',
                                    backgroundColor: 'rgba(33,30,26,0)',
                                    border: 'none',
                                    cursor: 'pointer',
                                    color: 'transparent',
                                    fontSize: '18px',
                                    transition: 'background-color 0.2s, color 0.2s',
                                }}
                                onMouseEnter={e => {
                                    e.currentTarget.style.backgroundColor = 'rgba(33,30,26,0.6)'
                                    e.currentTarget.style.color = C.white
                                }}
                                onMouseLeave={e => {
                                    e.currentTarget.style.backgroundColor = 'rgba(33,30,26,0)'
                                    e.currentTarget.style.color = 'transparent'
                                }}
                            >
                                ×
                            </button>
                        )}
                    </div>
                ))}

                {!readOnly && (
                    <>
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            style={{
                                width: '60px',
                                height: '60px',
                                border: `1px dashed ${C.border}`,
                                backgroundColor: C.surface,
                                color: C.textMuted,
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                fontSize: '18px',
                                fontWeight: 300,
                                flexShrink: 0,
                                gap: '2px',
                                transition: 'border-color 0.2s, color 0.2s',
                            }}
                            onMouseEnter={e => {
                                e.currentTarget.style.borderColor = C.accent
                                e.currentTarget.style.color = C.accent
                            }}
                            onMouseLeave={e => {
                                e.currentTarget.style.borderColor = C.border
                                e.currentTarget.style.color = C.textMuted
                            }}
                        >
                            <span>+</span>
                            <span style={{ fontSize: '7px', letterSpacing: '0.1em', textTransform: 'uppercase', fontFamily: "'Inter', sans-serif" }}>Add</span>
                        </button>

                        <input
                            ref={fileInputRef}
                            type="file"
                            multiple
                            accept="image/*"
                            onChange={handleFiles}
                            style={{ display: 'none' }}
                        />
                    </>
                )}
            </div>
        </div>
    )
}

// ─── VariantCard ──────────────────────────────────────────────────────────────

function VariantCard({ variant, index, onUpdate, onRemove, onDuplicate, productId, handleUpdateProduct, formData, error }) {
    const [isDone, setIsDone] = useState(true)
    const fileInputRef = useRef(null)

    useEffect(() => {
        if (error) setIsDone(false)
    }, [error])

    // First image preview
    const firstImgUrl = variant.existingImages[0]?.url || variant.newImages[0]?.previewUrl || null
    const totalImagesCount = variant.existingImages.length + variant.newImages.length

    const stockNum = parseInt(variant.stock, 10)
    const isOutOfStock = !isNaN(stockNum) && stockNum === 0
    const stockLabel = isNaN(stockNum)
        ? '—'
        : isOutOfStock
            ? 'Out of Stock'
            : `${stockNum} in Stock`

    const colorVal = variant.attributes.find(a => a.key.trim().toLowerCase() === 'color')?.value || summarizeAttrs(variant.attributes)

    const set = (path, value) => {
        if (path.includes('.')) {
            const [p, c] = path.split('.')
            onUpdate({ ...variant, [p]: { ...variant[p], [c]: value } })
        } else {
            onUpdate({ ...variant, [path]: value })
        }
    }

    const handleStockChange = (e) => {
        const raw = e.target.value
        if (raw === '') { set('stock', ''); return }
        const n = parseInt(raw, 10)
        if (!isNaN(n) && n >= 0) set('stock', n)
    }

    const addVariantImages = (e) => {
        const files = Array.from(e.target.files || [])
            .filter(f => f.type.startsWith('image/') && f.size <= MAX_IMAGE_SIZE)
        if (files.length) {
            const newObjs = files.map(f => ({ _localId: genId(), file: f, previewUrl: URL.createObjectURL(f) }))
            onUpdate({ ...variant, newImages: [...variant.newImages, ...newObjs] })
        }
        e.target.value = ''
    }

    const DoneBtnClick = async () => {
        try {
            const fd = new FormData()

            fd.append(
                "priceAmount",
                String(variant.price.amount)
            )

            fd.append(
                "priceCurrency",
                variant.price.currency
            )

            fd.append(
                "stock",
                String(variant.stock)
            )

            fd.append(
                "attributes",
                JSON.stringify(variant.attributes)
            )

            variant.existingImages.forEach((img) => {
                fd.append("existingImageUrls", img.url)
            })

            variant.newImages.forEach((img) => {
                if (img.file instanceof File) {
                    fd.append("images", img.file)
                }
            })

            console.log("FD BEFORE HOOK:", fd)

            for (const [key, value] of fd.entries()) {
                console.log(key, value)
            }

            await handleUpdateProduct(productId, fd)

            setIsDone(true)

        } catch (error) {
            console.error(error)
        }
    }
    const removeExistingImg = (id) =>
        onUpdate({ ...variant, existingImages: variant.existingImages.filter(i => i._localId !== id) })

    const removeNewImg = (id) => {
        const img = variant.newImages.find(i => i._localId === id)
        if (img?.previewUrl) URL.revokeObjectURL(img.previewUrl)
        onUpdate({ ...variant, newImages: variant.newImages.filter(i => i._localId !== id) })
    }

    // ── COMPACT READ-ONLY STATE ─────────────────────────────────────────────
    if (isDone) {
        return (
            <div
                style={{
                    border: `1px solid ${error ? C.error : C.borderLight}`,
                    backgroundColor: C.surface,
                    marginBottom: '16px',
                    padding: '14px 20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '16px',
                    flexWrap: 'wrap',
                    transition: 'all 0.2s',
                }}
            >
                {/* Left side: Cover Image + Details (Color, Price, Stock) */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px', minWidth: 0, flex: 1 }}>
                    {/* Variant Number Tag */}
                    <span
                        style={{
                            fontSize: '9px',
                            letterSpacing: '0.18em',
                            fontWeight: 600,
                            textTransform: 'uppercase',
                            color: C.accent,
                            fontFamily: "'Inter', sans-serif",
                            flexShrink: 0,
                        }}
                    >
                        V{String(index + 1).padStart(2, '0')}
                    </span>

                    {/* Cover Image */}
                    <div
                        style={{
                            width: '52px',
                            height: '52px',
                            border: `1px solid ${C.border}`,
                            backgroundColor: C.white,
                            flexShrink: 0,
                            overflow: 'hidden',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        {firstImgUrl ? (
                            <img src={firstImgUrl} alt="Cover Image" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                            <span style={{ fontSize: '8px', color: C.textMuted, textTransform: 'uppercase', letterSpacing: '0.05em' }}>No Img</span>
                        )}
                    </div>

                    {/* Color, Price, Stock Details */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '28px', flexWrap: 'wrap', minWidth: 0 }}>
                        {/* Color */}
                        <div>
                            <p style={{ ...LABEL, marginBottom: '2px', fontSize: '8px' }}>Color</p>
                            <p style={{ fontSize: '13px', color: C.text, fontFamily: "'Inter', sans-serif", fontWeight: 500 }}>
                                {colorVal || '—'}
                            </p>
                        </div>

                        {/* Price */}
                        <div>
                            <p style={{ ...LABEL, marginBottom: '2px', fontSize: '8px' }}>Price</p>
                            <p style={{ fontSize: '13px', color: C.text, fontFamily: "'Cormorant Garamond', serif", fontWeight: 600 }}>
                                {formatPrice(variant.price)}
                            </p>
                        </div>

                        {/* Stock */}
                        <div>
                            <p style={{ ...LABEL, marginBottom: '2px', fontSize: '8px' }}>Stock</p>
                            <p style={{ fontSize: '12px', color: isOutOfStock ? C.error : C.textSec, fontFamily: "'Inter', sans-serif" }}>
                                {stockLabel}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Right side: Edit & Discard controls */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
                    <button
                        type="button"
                        onClick={() => setIsDone(false)}
                        style={{
                            padding: '6px 16px',
                            fontSize: '9px',
                            letterSpacing: '0.14em',
                            textTransform: 'uppercase',
                            backgroundColor: 'transparent',
                            color: C.text,
                            border: `1px solid ${C.border}`,
                            cursor: 'pointer',
                            fontFamily: "'Inter', sans-serif",
                            fontWeight: 500,
                            transition: 'all 0.2s',
                        }}
                        onMouseEnter={e => {
                            e.currentTarget.style.borderColor = C.accent
                            e.currentTarget.style.color = C.accent
                        }}
                        onMouseLeave={e => {
                            e.currentTarget.style.borderColor = C.border
                            e.currentTarget.style.color = C.text
                        }}
                    >
                        Edit
                    </button>

                    <button
                        type="button"
                        onClick={onRemove}
                        title="Discard variant"
                        style={{
                            width: '24px',
                            height: '24px',
                            borderRadius: '50%',
                            border: `1px solid ${C.border}`,
                            backgroundColor: C.white,
                            color: C.textMuted,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '14px',
                            lineHeight: 1,
                            transition: 'all 0.2s',
                        }}
                        onMouseEnter={e => {
                            e.currentTarget.style.borderColor = C.error
                            e.currentTarget.style.backgroundColor = C.error
                            e.currentTarget.style.color = C.white
                        }}
                        onMouseLeave={e => {
                            e.currentTarget.style.borderColor = C.border
                            e.currentTarget.style.backgroundColor = C.white
                            e.currentTarget.style.color = C.textMuted
                        }}
                    >
                        ×
                    </button>
                </div>
            </div>
        )
    }

    // ── EDITABLE EXPANDED STATE ─────────────────────────────────────────────
    return (
        <div
            style={{
                border: `1px solid ${error ? C.error : C.border}`,
                backgroundColor: C.white,
                marginBottom: '20px',
                position: 'relative',
                transition: 'all 0.2s',
                boxShadow: '0 2px 6px rgba(0,0,0,0.02)',
            }}
        >
            {/* ── CARD TOP BAR ───────────────────────────────────────────── */}
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '12px 20px',
                    borderBottom: `1px solid ${C.borderLight}`,
                    backgroundColor: C.surface,
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                    <span
                        style={{
                            fontSize: '9px',
                            letterSpacing: '0.18em',
                            fontWeight: 600,
                            textTransform: 'uppercase',
                            color: C.accent,
                            fontFamily: "'Inter', sans-serif",
                        }}
                    >
                        Variant {String(index + 1).padStart(2, '0')}
                    </span>
                    {summarizeAttrs(variant.attributes) !== 'No attributes defined' && (
                        <span
                            style={{
                                fontSize: '11px',
                                fontFamily: "'Cormorant Garamond', serif",
                                color: C.textSec,
                                fontStyle: 'italic',
                            }}
                        >
                            — {summarizeAttrs(variant.attributes)}
                        </span>
                    )}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexShrink: 0 }}>
                    {/* Duplicate */}
                    <button
                        type="button"
                        onClick={onDuplicate}
                        title="Duplicate variant"
                        style={{
                            fontSize: '9px',
                            letterSpacing: '0.15em',
                            textTransform: 'uppercase',
                            color: C.textMuted,
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            fontFamily: "'Inter', sans-serif",
                            padding: '3px 0',
                            transition: 'color 0.2s',
                        }}
                        onMouseEnter={e => (e.currentTarget.style.color = C.accent)}
                        onMouseLeave={e => (e.currentTarget.style.color = C.textMuted)}
                    >
                        Duplicate
                    </button>

                    {/* Discard / Remove Variant Cross Button (×) */}
                    <button
                        type="button"
                        onClick={onRemove}
                        title="Discard variant"
                        style={{
                            width: '26px',
                            height: '26px',
                            borderRadius: '50%',
                            border: `1px solid ${C.border}`,
                            backgroundColor: C.white,
                            color: C.textMuted,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '16px',
                            lineHeight: 1,
                            transition: 'all 0.2s',
                        }}
                        onMouseEnter={e => {
                            e.currentTarget.style.borderColor = C.error
                            e.currentTarget.style.backgroundColor = C.error
                            e.currentTarget.style.color = C.white
                        }}
                        onMouseLeave={e => {
                            e.currentTarget.style.borderColor = C.border
                            e.currentTarget.style.backgroundColor = C.white
                            e.currentTarget.style.color = C.textMuted
                        }}
                    >
                        x
                    </button>
                </div>
            </div>

            {/* ── RECTANGULAR CARD BODY ── */}
            <div className="vq-variant-card-grid" style={{ padding: '20px' }}>
                {/* 1. FIRST IMAGE OF VARIANT */}
                <div>
                    <p style={{ ...LABEL, marginBottom: '8px' }}>First Image</p>
                    <div
                        style={{
                            width: '100px',
                            height: '100px',
                            border: `1px solid ${C.border}`,
                            backgroundColor: C.surface,
                            position: 'relative',
                            overflow: 'hidden',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            transition: 'border-color 0.2s',
                        }}
                        onClick={() => fileInputRef.current?.click()}
                        onMouseEnter={e => (e.currentTarget.style.borderColor = C.accent)}
                        onMouseLeave={e => (e.currentTarget.style.borderColor = C.border)}
                    >
                        {firstImgUrl ? (
                            <>
                                <img
                                    src={firstImgUrl}
                                    alt="Variant First Image"
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                />
                                <div
                                    style={{
                                        position: 'absolute',
                                        inset: 0,
                                        backgroundColor: 'rgba(33,30,26,0.6)',
                                        color: C.white,
                                        opacity: 0,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '9px',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.12em',
                                        transition: 'opacity 0.2s',
                                        fontFamily: "'Inter', sans-serif",
                                    }}
                                    onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
                                    onMouseLeave={e => (e.currentTarget.style.opacity = '0')}
                                >
                                    Change
                                </div>
                                {totalImagesCount > 1 && (
                                    <span
                                        style={{
                                            position: 'absolute',
                                            bottom: '4px',
                                            right: '4px',
                                            backgroundColor: 'rgba(33,30,26,0.75)',
                                            color: C.white,
                                            fontSize: '9px',
                                            padding: '2px 5px',
                                            borderRadius: '2px',
                                            fontFamily: "'Inter', sans-serif",
                                        }}
                                    >
                                        +{totalImagesCount - 1}
                                    </span>
                                )}
                            </>
                        ) : (
                            <div
                                style={{
                                    textAlign: 'center',
                                    color: C.textMuted,
                                    padding: '8px',
                                }}
                            >
                                <span style={{ fontSize: '20px', display: 'block', lineHeight: 1, marginBottom: '4px' }}>+</span>
                                <span style={{ fontSize: '8px', letterSpacing: '0.1em', textTransform: 'uppercase', fontFamily: "'Inter', sans-serif" }}>
                                    Upload Image
                                </span>
                            </div>
                        )}
                    </div>
                    <input
                        ref={fileInputRef}
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={addVariantImages}
                        style={{ display: 'none' }}
                    />
                </div>

                {/* 2. COLOR & ATTRIBUTES */}
                <div style={{ minWidth: 0 }}>
                    <AttributeEditor
                        attributes={variant.attributes}
                        onChange={(updated) => onUpdate({ ...variant, attributes: updated })}
                    />
                </div>

                {/* 3. PRICE */}
                <div>
                    <label style={LABEL}>Variant Price</label>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-end' }}>
                        <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={variant.price.amount}
                            onChange={e => set('price.amount', e.target.value)}
                            placeholder="0.00"
                            style={{ ...INPUT_BASE, width: '100%' }}
                            onFocus={onFocusGold}
                            onBlur={onBlurBorder}
                        />
                        <select
                            value={variant.price.currency}
                            onChange={e => set('price.currency', e.target.value)}
                            style={{
                                background: 'transparent',
                                border: 'none',
                                borderBottom: `1px solid ${C.border}`,
                                color: C.text,
                                fontSize: '13px',
                                padding: '10px 0',
                                outline: 'none',
                                cursor: 'pointer',
                                fontFamily: "'Inter', sans-serif",
                                minWidth: '50px',
                                flexShrink: 0,
                                transition: 'border-color 0.2s',
                            }}
                            onFocus={onFocusGold}
                            onBlur={onBlurBorder}
                        >
                            {CURRENCIES.map(c => (
                                <option key={c} value={c}>{c}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* 4. STOCK */}
                <div>
                    <label style={LABEL}>Stock</label>
                    <input
                        type="number"
                        min="0"
                        step="1"
                        value={variant.stock}
                        onChange={handleStockChange}
                        placeholder="0"
                        style={{ ...INPUT_BASE, width: '100%' }}
                        onFocus={onFocusGold}
                        onBlur={onBlurBorder}
                    />
                    <p
                        style={{
                            fontSize: '10px',
                            color: isOutOfStock ? C.textMuted : C.textSec,
                            marginTop: '5px',
                            fontFamily: "'Inter', sans-serif",
                        }}
                    >
                        {stockLabel}
                    </p>
                </div>
            </div>

            {/* Additional Images thumbnail strip if images exist */}
            {totalImagesCount > 0 && (
                <div style={{ padding: '0 20px 16px', borderTop: `1px dashed ${C.borderLight}`, paddingTop: '12px' }}>
                    <VariantImages
                        existingImages={variant.existingImages}
                        newImages={variant.newImages}
                        onRemoveExisting={removeExistingImg}
                        onRemoveNew={removeNewImg}
                        onAdd={(imgs) => onUpdate({ ...variant, newImages: [...variant.newImages, ...imgs] })}
                    />
                </div>
            )}

            {/* Error banner */}
            {error && (
                <div
                    style={{
                        padding: '10px 20px',
                        backgroundColor: '#fdf6f6',
                        borderTop: `1px solid ${C.borderLight}`,
                    }}
                >
                    <p style={{ fontSize: '11px', color: C.error, fontFamily: "'Inter', sans-serif" }}>
                        {error}
                    </p>
                </div>
            )}

            {/* ── CARD BOTTOM RIGHT DONE ACTION ────────────────────── */}
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'flex-end',
                    padding: '10px 20px 16px',
                    borderTop: `1px solid ${C.borderLight}`,
                }}
            >
                <button
                    type="button"
                    onClick={DoneBtnClick}
                    style={{
                        padding: '8px 22px',
                        fontSize: '10px',
                        letterSpacing: '0.16em',
                        textTransform: 'uppercase',
                        backgroundColor: C.text,
                        color: C.white,
                        border: `1px solid ${C.text}`,
                        cursor: 'pointer',
                        fontFamily: "'Inter', sans-serif",
                        fontWeight: 500,
                        transition: 'all 0.2s',
                    }}
                    onMouseEnter={e => {
                        e.currentTarget.style.backgroundColor = C.accent
                        e.currentTarget.style.borderColor = C.accent
                    }}
                    onMouseLeave={e => {
                        e.currentTarget.style.backgroundColor = C.text
                        e.currentTarget.style.borderColor = C.text
                    }}
                >
                    Done
                </button>
            </div>
        </div>
    )
}

// ─── EmptyVariantsState ───────────────────────────────────────────────────────

function EmptyVariantsState({ onAdd }) {
    return (
        <div
            style={{
                border: `1px dashed ${C.border}`,
                backgroundColor: C.surface,
                padding: '72px 32px',
                textAlign: 'center',
            }}
        >
            <p style={{ ...SECTION_LABEL, marginBottom: '20px' }}>No Variants Yet</p>
            <h3
                style={{
                    fontFamily: "'Cormorant Garamond', serif",
                    fontSize: '26px',
                    fontWeight: 300,
                    color: C.text,
                    marginBottom: '12px',
                }}
            >
                No Variations Added
            </h3>
            <p
                style={{
                    fontSize: '13px',
                    color: C.textSec,
                    lineHeight: '1.65',
                    fontFamily: "'Inter', sans-serif",
                    maxWidth: '340px',
                    margin: '0 auto 32px',
                }}
            >
                Add variants for different sizes, colours, materials, or any other attribute combinations.
            </p>
            <button
                type="button"
                onClick={onAdd}
                style={{
                    backgroundColor: C.text,
                    color: C.white,
                    border: 'none',
                    padding: '13px 28px',
                    fontSize: '10px',
                    letterSpacing: '0.2em',
                    textTransform: 'uppercase',
                    cursor: 'pointer',
                    fontFamily: "'Inter', sans-serif",
                    transition: 'background-color 0.25s',
                }}
                onMouseEnter={e => (e.currentTarget.style.backgroundColor = C.accent)}
                onMouseLeave={e => (e.currentTarget.style.backgroundColor = C.text)}
            >
                + Add First Variant
            </button>
        </div>
    )
}

// ─── SellerProductDetail (main page) ─────────────────────────────────────────

export default function SellerProductDetail() {
    const { productId } = useParams()
    const navigate = useNavigate()
    const { handleGetProductById, handleUpdateProduct, handleGetVariants } = useProducts()

    // ── Core state ────────────────────────────────────────────────────────────
    const [pageState, setPageState] = useState('loading') // 'loading' | 'ready' | 'not_found'
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [status, setStatus] = useState(null) // { type: 'success'|'error', text: string }

    const [product, setProduct] = useState(null) // raw server data (read-only)
    const [formData, setFormData] = useState(null) // editable local copy
    console.log(formData);

    // ── Images ────────────────────────────────────────────────────────────────
    const [selectedImgIdx, setSelectedImgIdx] = useState(0)
    const productImgInputRef = useRef(null)

    // ── Errors ────────────────────────────────────────────────────────────────
    const [fieldErrors, setFieldErrors] = useState({})
    const [variantErrors, setVariantErrors] = useState({})
    // ── Fetch ─────────────────────────────────────────────────────────────────
    useEffect(() => {
        let mounted = true
        async function fetchProduct() {
            try {
                const p = await handleGetProductById(productId)
                if (!mounted) return
                if (!p) { setPageState('not_found'); return }

                console.log("PRODUCT FROM API:", p)
                console.log("VARIANTS FROM API:", p.variants)
                setProduct(p)
                setFormData(buildFormData(p))
                setPageState('ready')
            } catch {
                if (mounted) setPageState('not_found')
            }
        }
        fetchProduct()
        return () => { mounted = false }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [productId])

    function buildFormData(p) {
        return {
            title: p.title || '',
            description: p.description || '',
            price: {
                amount: p.price?.amount ?? '',
                currency: p.price?.currency ?? 'INR',
            },
            existingImages: (p.images || []).map(img => ({ _localId: genId(), url: img.url })),
            newImages: [],
            // backend field name preserved:
            varients: (p.variants || []).map(normalizeVariant),
        }
    }

    // ── Derived: all product images in display order ───────────────────────────
    const allProductImages = formData ? [
        ...formData.existingImages.map(i => ({ ...i, _src: i.url, _isExisting: true })),
        ...formData.newImages.map(i => ({ ...i, _src: i.previewUrl, _isExisting: false })),
    ] : []

    const safeIdx = Math.min(selectedImgIdx, allProductImages.length - 1)
    const displayImg = allProductImages[safeIdx] || null

    // ── Product image handlers ────────────────────────────────────────────────
    const handleProductFiles = (files) => {
        const slots = MAX_PRODUCT_IMAGES - allProductImages.length
        if (slots <= 0) return
        const valid = Array.from(files)
            .filter(f => f.type.startsWith('image/') && f.size <= MAX_IMAGE_SIZE)
            .slice(0, slots)
        if (!valid.length) return
        const newObjs = valid.map(f => ({ _localId: genId(), file: f, previewUrl: URL.createObjectURL(f) }))
        setFormData(prev => ({ ...prev, newImages: [...prev.newImages, ...newObjs] }))
    }

    const removeProductImage = (localId, isExisting) => {
        setFormData(prev => {
            if (isExisting) {
                return { ...prev, existingImages: prev.existingImages.filter(i => i._localId !== localId) }
            }
            const img = prev.newImages.find(i => i._localId === localId)
            if (img?.previewUrl) URL.revokeObjectURL(img.previewUrl)
            return { ...prev, newImages: prev.newImages.filter(i => i._localId !== localId) }
        })
        setSelectedImgIdx(0)
    }

    // ── Variant handlers ──────────────────────────────────────────────────────
    const addVariant = () => {
        const v = normalizeVariant({
            images: [],
            stock: 0,
            attributes: { Color: '' },
            price: {
                amount: formData?.price?.amount ?? '',
                currency: formData?.price?.currency ?? 'INR',
            },
        })
        setFormData(prev => ({ ...prev, varients: [...prev.varients, v] }))
    }

    const updateVariant = (localId, updated) =>
        setFormData(prev => ({
            ...prev,
            varients: prev.varients.map(v => v._localId === localId ? { ...updated, _localId: localId } : v),
        }))

    const removeVariant = (localId) => {
        setFormData(prev => ({
            ...prev,
            varients: prev.varients.filter(v => v._localId !== localId),
        }))
        setVariantErrors(prev => {
            const next = { ...prev }
            delete next[localId]
            return next
        })
    }

    const duplicateVariant = (localId) => {
        const orig = formData.varients.find(v => v._localId === localId)
        if (!orig) return
        const dupe = {
            ...orig,
            _localId: genId(),
            attributes: orig.attributes.map(a => ({ ...a, _id: genId() })),
            existingImages: orig.existingImages.map(i => ({ ...i, _localId: genId() })),
            newImages: [],
        }
        setFormData(prev => {
            const idx = prev.varients.findIndex(v => v._localId === localId)
            const next = [...prev.varients]
            next.splice(idx + 1, 0, dupe)
            return { ...prev, varients: next }
        })
    }

    // ── Validation ────────────────────────────────────────────────────────────
    const validate = () => {
        const fErr = {}
        if (!formData.title.trim()) fErr.title = 'Product title is required.'
        if (!formData.description.trim()) fErr.description = 'Description is required.'
        const baseAmt = Number(formData.price.amount)
        if (formData.price.amount === '' || isNaN(baseAmt) || baseAmt <= 0)
            fErr.price = 'A valid base price is required.'

        const vErr = {}
        const attrSigs = []

        formData.varients.forEach(v => {
            const issues = []

            // Empty attribute names
            v.attributes.forEach(a => {
                if (!a.key.trim()) issues.push('Attribute names cannot be empty.')
                if (a.key.trim() && !a.value.trim()) issues.push(`Value for "${a.key}" cannot be empty.`)
            })

            // Duplicate attribute keys within same variant
            const keys = v.attributes.map(a => a.key.trim().toLowerCase()).filter(Boolean)
            const dupKey = keys.find((k, i) => keys.indexOf(k) !== i)
            if (dupKey) issues.push(`Duplicate attribute name: "${dupKey}".`)

            // Stock
            const sn = parseInt(v.stock, 10)
            if (isNaN(sn) || sn < 0) issues.push('Stock must be a non-negative integer.')

            // Variant price
            const va = Number(v.price.amount)
            if (v.price.amount === '' || isNaN(va) || va < 0)
                issues.push('Variant price is required.')

            // Duplicate combination (compared across variants)
            const sig = JSON.stringify(
                v.attributes
                    .map(a => [a.key.trim().toLowerCase(), a.value.trim().toLowerCase()])
                    .filter(([k]) => k)
                    .sort(([a], [b]) => a.localeCompare(b))
            )
            if (attrSigs.includes(sig)) {
                issues.push('This variant attribute combination already exists.')
            } else {
                attrSigs.push(sig)
            }

            if (issues.length > 0) vErr[v._localId] = issues[0]
        })

        setFieldErrors(fErr)
        setVariantErrors(vErr)
        return Object.keys(fErr).length === 0 && Object.keys(vErr).length === 0
    }

    // ── Save ──────────────────────────────────────────────────────────────────
    const handleSave = async () => {
        setStatus(null)
        if (!validate()) {
            setStatus({ type: 'error', text: 'Please correct the highlighted errors before saving.' })
            window.scrollTo({ top: 0, behavior: 'smooth' })
            return
        }

        setIsSubmitting(true)
        try {
            const fd = new FormData()
            fd.append('title', formData.title.trim())
            fd.append('description', formData.description.trim())
            fd.append('priceAmount', formData.price.amount)
            fd.append('priceCurrency', formData.price.currency)

            // Existing product image URLs (to keep)
            fd.append('existingImageUrls', JSON.stringify(
                formData.existingImages.map(i => i.url)
            ))

            // New product image files
            formData.newImages.forEach(img => {
                if (img.file) fd.append('images', img.file)
            })

            // Variants payload (backend field name: varients)
            const variantsPayload = formData.varients.map((v, idx) => ({
                stock: parseInt(v.stock, 10) || 0,
                price: { amount: Number(v.price.amount), currency: v.price.currency },
                attributes: arrayToAttrs(v.attributes),
                existingImageUrls: v.existingImages.map(i => i.url),
                variantImageIndex: idx, // lets backend match new images
            }))
            fd.append('varients', JSON.stringify(variantsPayload))

            // New variant image files, keyed by variant index
            formData.varients.forEach((v, idx) => {
                v.newImages.forEach(img => {
                    if (img.file) fd.append(`variantImages_${idx}`, img.file)
                })
            })

            await handleUpdateProduct(productId, fd)

            setStatus({ type: 'success', text: 'Product saved successfully.' })
            window.scrollTo({ top: 0, behavior: 'smooth' })
        } catch (err) {
            console.error('Failed to update product:', err)
            setStatus({
                type: 'error',
                text: err?.response?.data?.message || err?.message || 'Failed to save. Please try again.',
            })
            window.scrollTo({ top: 0, behavior: 'smooth' })
        } finally {
            setIsSubmitting(false)
        }
    }

    // ── Early returns ─────────────────────────────────────────────────────────
    if (pageState === 'loading') return <SkeletonLoader />
    if (pageState === 'not_found') return <ProductNotFound onBack={() => navigate('/seller/dashboard')} />
    if (!formData) return null

    // ── Render ────────────────────────────────────────────────────────────────
    return (
        <>
            <link
                href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400&family=Inter:wght@300;400;500;600&display=swap"
                rel="stylesheet"
            />

            <style>{`
                * { box-sizing: border-box; }
                input[type=number] { -moz-appearance: textfield; }
                input[type=number]::-webkit-inner-spin-button,
                input[type=number]::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; }
                @keyframes vq-spin {
                    from { transform: rotate(0deg); } to { transform: rotate(360deg); }
                }
                @keyframes vq-shimmer {
                    0%, 100% { opacity: 1; } 50% { opacity: 0.38; }
                }
                .vq-skel { background-color: #EBE5DA; animation: vq-shimmer 1.6s ease-in-out infinite; }

                /* Variant rectangular card grid */
                .vq-variant-card-grid {
                    display: grid;
                    grid-template-columns: 110px 1.2fr 1fr 1fr;
                    gap: 20px;
                    align-items: start;
                }
                @media (max-width: 900px) {
                    .vq-variant-card-grid {
                        grid-template-columns: 1fr 1fr !important;
                    }
                }
                @media (max-width: 540px) {
                    .vq-variant-card-grid {
                        grid-template-columns: 1fr !important;
                    }
                }

                /* Responsive: product info grid */
                @media (max-width: 1023px) {
                    .vq-product-grid { grid-template-columns: 1fr !important; }
                }
                /* Responsive: header layout */
                @media (max-width: 767px) {
                    .vq-header { padding: 16px 20px !important; flex-direction: column !important; align-items: flex-start !important; gap: 14px !important; }
                    .vq-header-actions { width: 100% !important; justify-content: flex-end !important; }
                    .vq-main { padding: 28px 20px 80px !important; }
                    .vq-status-wrap { padding: 12px 20px 0 !important; }
                    .vq-variant-fields { grid-template-columns: 1fr !important; }
                    .vq-thumb-strip { overflow-x: auto !important; flex-wrap: nowrap !important; }
                }
            `}</style>

            <div style={{ backgroundColor: C.bg, minHeight: '100vh', fontFamily: "'Inter', sans-serif" }}>

                {/* ── STICKY HEADER ──────────────────────────────────────────── */}
                <header
                    className="vq-header"
                    style={{
                        borderBottom: `1px solid ${C.border}`,
                        padding: '20px 48px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        backgroundColor: C.white,
                        position: 'sticky',
                        top: 0,
                        zIndex: 40,
                    }}
                >
                    <div>
                        {/* Breadcrumb */}
                        <p style={{ ...SECTION_LABEL, marginBottom: '6px' }}>
                            <span
                                onClick={() => navigate('/seller/dashboard')}
                                style={{ cursor: 'pointer', transition: 'color 0.2s' }}
                                onMouseEnter={e => (e.currentTarget.style.color = C.accent)}
                                onMouseLeave={e => (e.currentTarget.style.color = C.textMuted)}
                            >
                                Seller
                            </span>
                            {' / '}
                            <span
                                onClick={() => navigate('/seller/dashboard')}
                                style={{ cursor: 'pointer', transition: 'color 0.2s' }}
                                onMouseEnter={e => (e.currentTarget.style.color = C.accent)}
                                onMouseLeave={e => (e.currentTarget.style.color = C.textMuted)}
                            >
                                Products
                            </span>
                            {' / Edit'}
                        </p>
                        <h1
                            style={{
                                fontFamily: "'Cormorant Garamond', serif",
                                fontSize: '26px',
                                fontWeight: 300,
                                color: C.text,
                                marginBottom: '2px',
                                maxWidth: '480px',
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                            }}
                        >
                            {formData.title || 'Edit Product'}
                        </h1>
                        <p style={{ fontSize: '12px', color: C.textSec }}>
                            Manage product information, inventory and variations.
                        </p>
                    </div>

                    {/* Header actions */}
                    <div
                        className="vq-header-actions"
                        style={{ display: 'flex', gap: '10px', alignItems: 'center', flexShrink: 0 }}
                    >
                        <button
                            type="button"
                            onClick={() => navigate('/seller/dashboard')}
                            style={{
                                padding: '10px 18px',
                                fontSize: '10px',
                                letterSpacing: '0.16em',
                                textTransform: 'uppercase',
                                border: `1px solid ${C.border}`,
                                backgroundColor: 'transparent',
                                color: C.textSec,
                                cursor: 'pointer',
                                fontFamily: "'Inter', sans-serif",
                                transition: 'all 0.2s',
                            }}
                            onMouseEnter={e => {
                                e.currentTarget.style.borderColor = C.accent
                                e.currentTarget.style.color = C.accent
                            }}
                            onMouseLeave={e => {
                                e.currentTarget.style.borderColor = C.border
                                e.currentTarget.style.color = C.textSec
                            }}
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            onClick={handleSave}
                            disabled={isSubmitting}
                            style={{
                                padding: '10px 22px',
                                fontSize: '10px',
                                letterSpacing: '0.16em',
                                textTransform: 'uppercase',
                                border: `1px solid ${C.text}`,
                                backgroundColor: C.text,
                                color: C.white,
                                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                                fontFamily: "'Inter', sans-serif",
                                opacity: isSubmitting ? 0.7 : 1,
                                transition: 'all 0.2s',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                            }}
                            onMouseEnter={e => {
                                if (!isSubmitting) {
                                    e.currentTarget.style.backgroundColor = C.accent
                                    e.currentTarget.style.borderColor = C.accent
                                    e.currentTarget.style.color = C.text
                                }
                            }}
                            onMouseLeave={e => {
                                if (!isSubmitting) {
                                    e.currentTarget.style.backgroundColor = C.text
                                    e.currentTarget.style.borderColor = C.text
                                    e.currentTarget.style.color = C.white
                                }
                            }}
                        >
                            {isSubmitting && (
                                <svg
                                    style={{ width: '12px', height: '12px', animation: 'vq-spin 0.8s linear infinite' }}
                                    viewBox="0 0 24 24"
                                    fill="none"
                                >
                                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.25" />
                                    <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                                </svg>
                            )}
                            {isSubmitting ? 'Saving…' : 'Save Changes'}
                        </button>
                    </div>
                </header>

                {/* ── STATUS BANNER ───────────────────────────────────────────── */}
                {status && (
                    <div
                        className="vq-status-wrap"
                        style={{ maxWidth: '1440px', margin: '0 auto', padding: '16px 48px 0' }}
                    >
                        <div
                            style={{
                                padding: '12px 16px',
                                border: `1px solid ${status.type === 'success' ? '#c3dec7' : '#ecc7c7'}`,
                                backgroundColor: status.type === 'success' ? '#f4f7f4' : '#fdf6f6',
                                color: status.type === 'success' ? '#2c5234' : '#913232',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                fontSize: '13px',
                                fontFamily: "'Inter', sans-serif",
                            }}
                        >
                            <span>{status.text}</span>
                            <button
                                type="button"
                                onClick={() => setStatus(null)}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    cursor: 'pointer',
                                    opacity: 0.55,
                                    fontSize: '16px',
                                    color: 'inherit',
                                    lineHeight: 1,
                                    padding: '0 4px',
                                }}
                            >
                                ×
                            </button>
                        </div>
                    </div>
                )}

                {/* ── MAIN ───────────────────────────────────────────────────── */}
                <main
                    className="vq-main"
                    style={{
                        maxWidth: '1440px',
                        margin: '0 auto',
                        padding: '44px 48px 96px',
                    }}
                >

                    {/* ── PRODUCT INFO TWO-COLUMN ─────────────────────────────── */}
                    <div
                        className="vq-product-grid"
                        style={{
                            display: 'grid',
                            gridTemplateColumns: '1.1fr 0.9fr',
                            gap: '48px',
                            marginBottom: '60px',
                        }}
                    >

                        {/* LEFT: Product Images ──────────────────────────── */}
                        <div>
                            <p style={{ ...SECTION_LABEL, marginBottom: '16px' }}>Product Images</p>

                            {/* Primary viewer */}
                            <div
                                style={{
                                    width: '100%',
                                    aspectRatio: '4 / 3',
                                    border: `1px solid ${C.border}`,
                                    backgroundColor: C.surface,
                                    marginBottom: '10px',
                                    position: 'relative',
                                    overflow: 'hidden',
                                }}
                            >
                                {displayImg ? (
                                    <>
                                        <img
                                            src={displayImg._src}
                                            alt="Product"
                                            style={{
                                                width: '100%',
                                                height: '100%',
                                                objectFit: 'cover',
                                                transition: 'opacity 0.3s',
                                            }}
                                        />
                                        {/* Counter */}
                                        <div
                                            style={{
                                                position: 'absolute',
                                                bottom: '10px',
                                                left: '10px',
                                                backgroundColor: 'rgba(33,30,26,0.65)',
                                                color: C.white,
                                                fontSize: '9px',
                                                letterSpacing: '0.14em',
                                                textTransform: 'uppercase',
                                                padding: '3px 8px',
                                                fontFamily: "'Inter', sans-serif",
                                            }}
                                        >
                                            {safeIdx + 1} / {allProductImages.length}
                                        </div>
                                        {/* Remove btn */}
                                        <button
                                            type="button"
                                            onClick={() => removeProductImage(displayImg._localId, displayImg._isExisting)}
                                            title="Remove image"
                                            style={{
                                                position: 'absolute',
                                                top: '10px',
                                                right: '10px',
                                                width: '28px',
                                                height: '28px',
                                                backgroundColor: 'rgba(33,30,26,0.75)',
                                                color: C.white,
                                                border: 'none',
                                                cursor: 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                fontSize: '16px',
                                                lineHeight: 1,
                                                transition: 'background-color 0.2s',
                                            }}
                                            onMouseEnter={e => (e.currentTarget.style.backgroundColor = C.error)}
                                            onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'rgba(33,30,26,0.75)')}
                                        >
                                            ×
                                        </button>
                                    </>
                                ) : (
                                    /* Empty image slot — click to add */
                                    <div
                                        onClick={() => productImgInputRef.current?.click()}
                                        style={{
                                            width: '100%',
                                            height: '100%',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            cursor: 'pointer',
                                            color: C.textMuted,
                                            gap: '10px',
                                            transition: 'color 0.2s',
                                        }}
                                        onMouseEnter={e => (e.currentTarget.style.color = C.accent)}
                                        onMouseLeave={e => (e.currentTarget.style.color = C.textMuted)}
                                    >
                                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                                            <rect x="3" y="3" width="18" height="18" />
                                            <path d="M3 15l5-5 4 4 3-3 6 6" strokeLinejoin="round" />
                                        </svg>
                                        <p style={{ fontSize: '10px', letterSpacing: '0.18em', textTransform: 'uppercase', fontFamily: "'Inter', sans-serif" }}>
                                            Add Product Images
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Thumbnail strip */}
                            <div
                                className="vq-thumb-strip"
                                style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}
                            >
                                {allProductImages.map((img, idx) => (
                                    <button
                                        key={img._localId}
                                        type="button"
                                        onClick={() => setSelectedImgIdx(idx)}
                                        style={{
                                            width: '60px',
                                            height: '60px',
                                            border: `1px solid ${safeIdx === idx ? C.accent : C.border}`,
                                            backgroundColor: C.surface,
                                            overflow: 'hidden',
                                            cursor: 'pointer',
                                            padding: 0,
                                            flexShrink: 0,
                                            transition: 'border-color 0.2s',
                                        }}
                                    >
                                        <img
                                            src={img._src}
                                            alt=""
                                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                        />
                                    </button>
                                ))}

                                {/* Add slot */}
                                {allProductImages.length < MAX_PRODUCT_IMAGES && (
                                    <button
                                        type="button"
                                        onClick={() => productImgInputRef.current?.click()}
                                        style={{
                                            width: '60px',
                                            height: '60px',
                                            border: `1px dashed ${C.border}`,
                                            backgroundColor: C.surface,
                                            color: C.textMuted,
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            cursor: 'pointer',
                                            fontSize: '16px',
                                            fontWeight: 300,
                                            flexShrink: 0,
                                            gap: '2px',
                                            transition: 'border-color 0.2s, color 0.2s',
                                        }}
                                        onMouseEnter={e => {
                                            e.currentTarget.style.borderColor = C.accent
                                            e.currentTarget.style.color = C.accent
                                        }}
                                        onMouseLeave={e => {
                                            e.currentTarget.style.borderColor = C.border
                                            e.currentTarget.style.color = C.textMuted
                                        }}
                                    >
                                        <span>+</span>
                                        <span style={{ fontSize: '7px', letterSpacing: '0.1em', textTransform: 'uppercase', fontFamily: "'Inter', sans-serif" }}>Add</span>
                                    </button>
                                )}
                            </div>

                            <input
                                ref={productImgInputRef}
                                type="file"
                                multiple
                                accept="image/*"
                                onChange={e => {
                                    if (e.target.files?.length) handleProductFiles(e.target.files)
                                    e.target.value = ''
                                }}
                                style={{ display: 'none' }}
                            />
                        </div>

                        {/* RIGHT: Product Information Form ───────────────── */}
                        <div>
                            <p style={{ ...SECTION_LABEL, marginBottom: '24px' }}>Product Information</p>

                            {/* Title */}
                            <div style={{ marginBottom: '24px' }}>
                                <label style={LABEL}>Product Title</label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    maxLength={100}
                                    onChange={e => {
                                        setFormData(prev => ({ ...prev, title: e.target.value }))
                                        if (fieldErrors.title) setFieldErrors(prev => ({ ...prev, title: null }))
                                    }}
                                    placeholder="Handcrafted Linen Overshirt"
                                    style={{
                                        ...INPUT_BASE,
                                        width: '100%',
                                        borderBottomColor: fieldErrors.title ? C.error : C.border,
                                    }}
                                    onFocus={e => { if (!fieldErrors.title) e.target.style.borderColor = C.accent }}
                                    onBlur={e => { if (!fieldErrors.title) e.target.style.borderColor = C.border }}
                                />
                                {fieldErrors.title && (
                                    <p style={{ fontSize: '10px', color: C.error, marginTop: '5px', fontFamily: "'Inter', sans-serif" }}>
                                        {fieldErrors.title}
                                    </p>
                                )}
                            </div>

                            {/* Description */}
                            <div style={{ marginBottom: '24px' }}>
                                <label style={LABEL}>Description</label>
                                <textarea
                                    value={formData.description}
                                    rows={5}
                                    onChange={e => {
                                        setFormData(prev => ({ ...prev, description: e.target.value }))
                                        if (fieldErrors.description) setFieldErrors(prev => ({ ...prev, description: null }))
                                    }}
                                    placeholder="Describe the craftsmanship, materials, origin, drape and care…"
                                    style={{
                                        ...INPUT_BASE,
                                        width: '100%',
                                        resize: 'vertical',
                                        lineHeight: '1.65',
                                        borderBottomColor: fieldErrors.description ? C.error : C.border,
                                    }}
                                    onFocus={e => { if (!fieldErrors.description) e.target.style.borderColor = C.accent }}
                                    onBlur={e => { if (!fieldErrors.description) e.target.style.borderColor = C.border }}
                                />
                                {fieldErrors.description && (
                                    <p style={{ fontSize: '10px', color: C.error, marginTop: '5px', fontFamily: "'Inter', sans-serif" }}>
                                        {fieldErrors.description}
                                    </p>
                                )}
                            </div>

                            {/* Base Price */}
                            <div style={{ marginBottom: '32px' }}>
                                <label style={LABEL}>Base Price</label>
                                <div style={{ display: 'flex', gap: '10px' }}>
                                    <input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={formData.price.amount}
                                        onChange={e => {
                                            setFormData(prev => ({ ...prev, price: { ...prev.price, amount: e.target.value } }))
                                            if (fieldErrors.price) setFieldErrors(prev => ({ ...prev, price: null }))
                                        }}
                                        placeholder="0.00"
                                        style={{
                                            ...INPUT_BASE,
                                            flex: 1,
                                            borderBottomColor: fieldErrors.price ? C.error : C.border,
                                        }}
                                        onFocus={e => { if (!fieldErrors.price) e.target.style.borderColor = C.accent }}
                                        onBlur={e => { if (!fieldErrors.price) e.target.style.borderColor = C.border }}
                                    />
                                    <select
                                        value={formData.price.currency}
                                        onChange={e => setFormData(prev => ({ ...prev, price: { ...prev.price, currency: e.target.value } }))}
                                        style={{
                                            background: 'transparent',
                                            border: 'none',
                                            borderBottom: `1px solid ${C.border}`,
                                            color: C.text,
                                            fontSize: '13px',
                                            padding: '10px 0',
                                            outline: 'none',
                                            cursor: 'pointer',
                                            fontFamily: "'Inter', sans-serif",
                                            minWidth: '56px',
                                            flexShrink: 0,
                                            transition: 'border-color 0.2s',
                                        }}
                                        onFocus={onFocusGold}
                                        onBlur={onBlurBorder}
                                    >
                                        {CURRENCIES.map(c => (
                                            <option key={c} value={c}>{c}</option>
                                        ))}
                                    </select>
                                </div>
                                {fieldErrors.price && (
                                    <p style={{ fontSize: '10px', color: C.error, marginTop: '5px', fontFamily: "'Inter', sans-serif" }}>
                                        {fieldErrors.price}
                                    </p>
                                )}
                            </div>

                            {/* Product Metadata */}
                            {product && (
                                <div style={{ borderTop: `1px solid ${C.borderLight}`, paddingTop: '24px' }}>
                                    <p style={{ ...SECTION_LABEL, marginBottom: '16px' }}>Metadata</p>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                        <div>
                                            <p style={LABEL}>Product ID</p>
                                            <p
                                                style={{
                                                    fontSize: '10px',
                                                    color: C.textSec,
                                                    fontFamily: "'Inter', sans-serif",
                                                    wordBreak: 'break-all',
                                                    letterSpacing: '0.04em',
                                                    lineHeight: 1.5,
                                                }}
                                            >
                                                {product._id || '—'}
                                            </p>
                                        </div>
                                        <div>
                                            <p style={LABEL}>Variants</p>
                                            <p style={{ fontSize: '12px', color: C.textSec, fontFamily: "'Inter', sans-serif" }}>
                                                {formData.varients.length}{' '}
                                                {formData.varients.length === 1 ? 'variant' : 'variants'}
                                            </p>
                                        </div>
                                        <div>
                                            <p style={LABEL}>Created</p>
                                            <p style={{ fontSize: '12px', color: C.textSec, fontFamily: "'Inter', sans-serif" }}>
                                                {formatDate(product.createdAt)}
                                            </p>
                                        </div>
                                        <div>
                                            <p style={LABEL}>Last Updated</p>
                                            <p style={{ fontSize: '12px', color: C.textSec, fontFamily: "'Inter', sans-serif" }}>
                                                {formatDate(product.updatedAt)}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* ── SECTION DIVIDER ─────────────────────────────────────── */}
                    <div style={{ height: '1px', backgroundColor: C.border, marginBottom: '56px' }} />

                    {/* ── VARIANTS SECTION ────────────────────────────────────── */}
                    <div>
                        {/* Section heading */}
                        <div
                            style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'flex-end',
                                marginBottom: '32px',
                                flexWrap: 'wrap',
                                gap: '16px',
                            }}
                        >
                            <div>
                                <p style={{ ...SECTION_LABEL, marginBottom: '8px' }}>
                                    {String(formData.varients.length).padStart(2, '0')} / Product Variants
                                </p>
                                <h2
                                    style={{
                                        fontFamily: "'Cormorant Garamond', serif",
                                        fontSize: '28px',
                                        fontWeight: 300,
                                        color: C.text,
                                        marginBottom: '5px',
                                    }}
                                >
                                    Manage Variants
                                </h2>
                                <p style={{ fontSize: '13px', color: C.textSec, lineHeight: '1.5', fontFamily: "'Inter', sans-serif" }}>
                                    Create combinations of attributes, pricing and inventory for this product.
                                </p>
                            </div>

                            {formData.varients.length > 0 && (
                                <button
                                    type="button"
                                    onClick={addVariant}
                                    style={{
                                        padding: '10px 20px',
                                        fontSize: '10px',
                                        letterSpacing: '0.16em',
                                        textTransform: 'uppercase',
                                        border: `1px solid ${C.text}`,
                                        backgroundColor: C.text,
                                        color: C.white,
                                        cursor: 'pointer',
                                        fontFamily: "'Inter', sans-serif",
                                        transition: 'all 0.2s',
                                        flexShrink: 0,
                                    }}
                                    onMouseEnter={e => {
                                        e.currentTarget.style.backgroundColor = C.accent
                                        e.currentTarget.style.borderColor = C.accent
                                        e.currentTarget.style.color = C.text
                                    }}
                                    onMouseLeave={e => {
                                        e.currentTarget.style.backgroundColor = C.text
                                        e.currentTarget.style.borderColor = C.text
                                        e.currentTarget.style.color = C.white
                                    }}
                                >
                                    + Add Variant
                                </button>
                            )}
                        </div>

                        {/* Empty state */}
                        {formData.varients.length === 0 ? (
                            <EmptyVariantsState onAdd={addVariant} />
                        ) : (
                            <>
                                {formData.varients.map((v, idx) => (
                                    <VariantCard
                                        key={v._localId}
                                        variant={v}
                                        index={idx}
                                        error={variantErrors[v._localId] || null}
                                        onUpdate={(updated) => updateVariant(v._localId, updated)}
                                        onRemove={() => removeVariant(v._localId)}
                                        onDuplicate={() => duplicateVariant(v._localId)}
                                        productId={productId}
                                        handleUpdateProduct={handleUpdateProduct}
                                        formData={formData}
                                    />
                                ))}

                                {/* Add another variant row */}
                                <button
                                    type="button"
                                    onClick={addVariant}
                                    style={{
                                        width: '100%',
                                        padding: '16px',
                                        border: `1px dashed ${C.border}`,
                                        backgroundColor: 'transparent',
                                        color: C.textSec,
                                        cursor: 'pointer',
                                        fontSize: '10px',
                                        letterSpacing: '0.16em',
                                        textTransform: 'uppercase',
                                        fontFamily: "'Inter', sans-serif",
                                        transition: 'all 0.2s',
                                        marginTop: '4px',
                                    }}
                                    onMouseEnter={e => {
                                        e.currentTarget.style.borderColor = C.accent
                                        e.currentTarget.style.color = C.accent
                                    }}
                                    onMouseLeave={e => {
                                        e.currentTarget.style.borderColor = C.border
                                        e.currentTarget.style.color = C.textSec
                                    }}
                                >
                                    + Add Another Variant
                                </button>
                            </>
                        )}
                    </div>
                </main>
            </div>
        </>
    )
}

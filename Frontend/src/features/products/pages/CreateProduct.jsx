import { useProducts } from '../hook/useProduct.js'
import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function CreateProduct() {
    const CURRENCIES = [
        { code: 'USD', symbol: '$', name: 'US Dollar ($)' },
        { code: 'EUR', symbol: '€', name: 'Euro (€)' },
        { code: 'GBP', symbol: '£', name: 'British Pound (£)' },
        { code: 'INR', symbol: '₹', name: 'Indian Rupee (₹)' },
        { code: 'AED', symbol: 'AED', name: 'Dirham (AED)' },
    ];
    const MAX_IMAGES = 7;
    const MAX_IMAGE_SIZE = 5 * 1024 * 1024; //5 MB

    const { handleCreateProduct } = useProducts();
    const navigate = useNavigate();

    // Form State
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [priceAmount, setPriceAmount] = useState('');
    const [priceCurrency, setPriceCurrency] = useState('USD');

    // Images state: array of { id, file, previewUrl, isCover }
    const [images, setImages] = useState([]);
    const [dragActive, setDragActive] = useState(false);
    // Status & Feedback State
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [statusMessage, setStatusMessage] = useState(null); // { type: 'success' | 'error', text: string }
    const [errors, setErrors] = useState({});
    const fileInputRef = useRef(null);
    // Clean up all preview URLs when the component unmounts.
    useEffect(() => {
        return () => {
            setImages((currentImages) => {
                currentImages.forEach((img) => {
                    if (img.previewUrl) URL.revokeObjectURL(img.previewUrl);
                });
                return currentImages;
            });
        };
    }, []);
    // Handle adding image files
    const handleFiles = (files) => {
        const fileList = Array.from(files || []);

        if (fileList.length === 0) {
            return;
        }

        const invalidTypeFiles = fileList.filter((file) => !file.type.startsWith('image/'));
        const oversizedFiles = fileList.filter((file) => file.size > MAX_IMAGE_SIZE);

        if (invalidTypeFiles.length > 0 || oversizedFiles.length > 0) {
            const messages = [];

            if (invalidTypeFiles.length > 0) {
                messages.push(`${invalidTypeFiles.length} file(s) are not valid image files.`);
            }

            if (oversizedFiles.length > 0) {
                messages.push(`${oversizedFiles.length} image(s) exceed the 5MB limit.`);
            }

            setStatusMessage({
                type: 'error',
                text: messages.join(' '),
            });
        }

        const existingFiles = new Set(
            images.map((img) => `${img.file?.name}:${img.file?.size}:${img.file?.lastModified}`)
        );

        const validFiles = fileList.filter((file) => {
            const key = `${file.name}:${file.size}:${file.lastModified}`;
            return (
                file.type.startsWith('image/') &&
                file.size <= MAX_IMAGE_SIZE &&
                !existingFiles.has(key)
            );
        });

        const availableSlots = MAX_IMAGES - images.length;

        if (availableSlots <= 0) {
            setStatusMessage({
                type: 'error',
                text: `You can only upload a maximum of ${MAX_IMAGES} images.`,
            });
            return;
        }

        if (validFiles.length > availableSlots) {
            setStatusMessage({
                type: 'error',
                text: `Only ${availableSlots} more image(s) can be added. The remaining files were skipped.`,
            });
        }

        const filesToUpload = validFiles.slice(0, availableSlots);

        if (filesToUpload.length === 0) {
            if (!statusMessage) {
                setStatusMessage({
                    type: 'error',
                    text: 'No new valid images were added.',
                });
            }
            return;
        }

        const newImageObjs = filesToUpload.map((file, index) => ({
            id: `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`,
            file,
            previewUrl: URL.createObjectURL(file),
            isCover: images.length === 0 && index === 0,
        }));

        setImages((prev) => {
            const updated = [...prev, ...newImageObjs];

            if (updated.length > 0 && !updated.some((img) => img.isCover)) {
                updated[0] = { ...updated[0], isCover: true };
            }

            return updated;
        });

        setErrors((prev) => ({ ...prev, images: null }));

        // Clear a stale error when at least one image was successfully added.
        if (invalidTypeFiles.length === 0 && oversizedFiles.length === 0 && validFiles.length <= availableSlots) {
            setStatusMessage(null);
        }
    };

    const handleFileInputChange = (e) => {
        if (e.target.files && e.target.files.length > 0) {
            handleFiles(e.target.files);
            // Reset input value so re-uploading same file works
            e.target.value = '';
        }
    };
    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    };
    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            handleFiles(e.dataTransfer.files);
        }
    };
    const removeImage = (idToRemove) => {
        setImages((prev) => {
            const imageToRemove = prev.find((img) => img.id === idToRemove);
            const filtered = prev.filter((img) => img.id !== idToRemove);

            if (imageToRemove?.previewUrl) {
                URL.revokeObjectURL(imageToRemove.previewUrl);
            }

            if (filtered.length > 0 && !filtered.some((img) => img.isCover)) {
                filtered[0] = { ...filtered[0], isCover: true };
            }

            if (filtered.length === 0) {
                setErrors((currentErrors) => ({ ...currentErrors, images: null }));
            }

            return filtered;
        });
    };

    const setCoverImage = (idToCover) => {
        setImages((prev) =>
            prev.map((img) => ({
                ...img,
                isCover: img.id === idToCover,
            }))
        );
    };
    // Form Validation
    const validateForm = () => {
        const newErrors = {};
        if (!title.trim()) {
            newErrors.title = 'Product title is required.';
        } else if (title.trim().length < 3) {
            newErrors.title = 'Title must be at least 3 characters.';
        }
        if (!description.trim()) {
            newErrors.description = 'Product description is required.';
        }
        if (!priceAmount || isNaN(Number(priceAmount)) || Number(priceAmount) <= 0) {
            newErrors.priceAmount = 'Please enter a valid price greater than 0.';
        }
        if (images.length === 0) {
            newErrors.images = 'At least one product image is required.';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };
    // Handle Submit
    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatusMessage(null);
        if (!validateForm()) {
            setStatusMessage({
                type: 'error',
                text: 'Please correct the highlighted fields before submitting.',
            });
            return;
        }
        setIsSubmitting(true);
        try {
            // Build FormData payload
            const formData = new FormData();
            formData.append('title', title.trim());
            formData.append('description', description.trim());
            formData.append('priceAmount', priceAmount);
            formData.append('priceCurrency', priceCurrency);
            // Append images, ensuring cover image is appended first if needed
            const sortedImages = [...images].sort((a, b) => (b.isCover ? 1 : 0) - (a.isCover ? 1 : 0));
            sortedImages.forEach((imgObj) => {
                if (imgObj.file) {
                    formData.append('images', imgObj.file);
                }
            });
            await handleCreateProduct(formData);

            // Release local preview URLs before clearing the image state.
            images.forEach((img) => {
                if (img.previewUrl) URL.revokeObjectURL(img.previewUrl);
            });

            setStatusMessage({
                type: 'success',
                text: 'Product created successfully! Redirecting...',
            });

            setTitle('');
            setDescription('');
            setPriceAmount('');
            setPriceCurrency('USD');
            setImages([]);
            setErrors({});
            setIsSubmitting(false);

        } catch (error) {
            console.error('Failed to create product:', error);
            setStatusMessage({
                type: 'error',
                text: error?.response?.data?.message || error?.message || 'Failed to create product. Please try again.',
            });
            setIsSubmitting(false);
        }
    };
    
    const inputStyle = {
        fontFamily: "'Inter', sans-serif"
    };

    return (
        <>
            {/* Google Fonts */}
            <link
                href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400&family=Inter:wght@300;400;500;600&display=swap"
                rel="stylesheet"
            />
            
            <div className="min-h-screen selection:bg-[#9D782F]/30" style={{ backgroundColor: '#fbf9f6', fontFamily: "'Inter', sans-serif" }}>
                
                {/* ── HEADER ── */}
                <header className="w-full px-6 py-8 sm:px-12 flex items-center justify-between">
                    <span
                        className="text-sm font-normal tracking-[0.3em] uppercase"
                        style={{ fontFamily: "'Cormorant Garamond', serif", color: '#9D782F' }}
                    >
                        Vellique.
                    </span>
                    <div className="flex flex-col items-end">
                        <span className="text-[10px] uppercase tracking-[0.2em] font-medium" style={{ color: '#211E1A' }}>
                            Seller Studio
                        </span>
                        <span className="text-[9px] uppercase tracking-[0.1em]" style={{ color: '#9A9287' }}>
                            Create Product
                        </span>
                    </div>
                </header>

                {/* ── MAIN CONTENT ── */}
                <main className="max-w-5xl mx-auto px-5 sm:px-8 lg:px-12 pb-24">
                    
                    {/* Page Introduction */}
                    <div className="mt-8 mb-12 text-center sm:text-left">
                        <p className="text-[10px] uppercase tracking-[0.2em] mb-4 font-medium" style={{ color: '#756E63' }}>
                            Seller Studio
                        </p>
                        <h1 
                            className="text-4xl sm:text-5xl lg:text-6xl font-light mb-4 text-[#211E1A]" 
                            style={{ fontFamily: "'Cormorant Garamond', serif" }}
                        >
                            Create Something <br className="hidden sm:block" />
                            <em style={{ color: '#9D782F' }}>Beautiful.</em>
                        </h1>
                        <p className="text-sm font-light max-w-md mx-auto sm:mx-0" style={{ color: '#9A9287', lineHeight: '1.6' }}>
                            Curate a new piece for the Vellique collection. Add the details, pricing, and imagery that define its character.
                        </p>
                    </div>

                    <div className="w-full h-px mb-12" style={{ backgroundColor: '#DDD7CC' }}></div>

                    {/* Status Message */}
                    {statusMessage && (
                        <div
                            className={`mb-8 p-4 border text-sm flex items-start gap-3 transition-all duration-300 ${
                                statusMessage.type === 'success'
                                    ? 'bg-[#f4f7f4] border-[#c3dec7] text-[#2c5234]'
                                    : 'bg-[#fdf6f6] border-[#ecc7c7] text-[#913232]'
                            }`}
                        >
                            {statusMessage.type === 'success' ? (
                                <svg className="w-5 h-5 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 13l4 4L19 7" />
                                </svg>
                            ) : (
                                <svg className="w-5 h-5 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                            )}
                            <div className="flex-1">
                                <p className="font-medium" style={{ fontFamily: "'Inter', sans-serif" }}>{statusMessage.text}</p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setStatusMessage(null)}
                                className="text-xs opacity-60 hover:opacity-100 transition-opacity"
                            >
                                ✕
                            </button>
                        </div>
                    )}

                    {/* Form Container */}
                    <form
                        onSubmit={handleSubmit}
                        className="bg-white border p-6 sm:p-10 lg:p-12"
                        style={{ borderColor: '#DDD7CC' }}
                    >
                        
                        {/* ── DETAILS SECTION ── */}
                        <div className="mb-14">
                            <div className="mb-8">
                                <h2 className="text-2xl sm:text-3xl font-light text-[#211E1A]" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                                    Product Details
                                </h2>
                                <p className="text-xs mt-1" style={{ color: '#9A9287' }}>
                                    Tell customers what makes this piece distinctive.
                                </p>
                            </div>

                            <div className="space-y-8">
                                {/* Title Field */}
                                <div className="flex flex-col gap-2">
                                    <div className="flex justify-between items-end">
                                        <label
                                            htmlFor="title"
                                            className="text-[10px] uppercase tracking-[0.18em] font-medium"
                                            style={{ color: '#756E63' }}
                                        >
                                            Product Title
                                        </label>
                                        <span className="text-[10px]" style={{ color: '#9A9287' }}>
                                            {String(title).length > 9 ? title.length : `0${title.length}`} / 100
                                        </span>
                                    </div>
                                    <input
                                        id="title"
                                        type="text"
                                        maxLength={100}
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        aria-invalid={Boolean(errors.title)}
                                        aria-describedby={errors.title ? 'title-error' : undefined}
                                        placeholder="Obsidian Cashmere Trench Coat"
                                        className="w-full bg-transparent outline-none py-3 text-sm transition-colors duration-300"
                                        style={{
                                            ...inputStyle,
                                            color: '#211E1A',
                                            borderBottom: `1px solid ${errors.title ? '#c25a5a' : '#DDD7CC'}`
                                        }}
                                        onFocus={e => !errors.title && (e.target.style.borderBottomColor = '#9D782F')}
                                        onBlur={e => !errors.title && (e.target.style.borderBottomColor = '#DDD7CC')}
                                    />
                                    {errors.title && (
                                        <p id="title-error" className="text-[10px] text-[#c25a5a] mt-1">{errors.title}</p>
                                    )}
                                </div>

                                {/* Description Field */}
                                <div className="flex flex-col gap-2">
                                    <label
                                        htmlFor="description"
                                        className="text-[10px] uppercase tracking-[0.18em] font-medium"
                                        style={{ color: '#756E63' }}
                                    >
                                        Description
                                    </label>
                                    <textarea
                                        id="description"
                                        rows={4}
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        aria-invalid={Boolean(errors.description)}
                                        aria-describedby={errors.description ? 'description-error' : undefined}
                                        placeholder="Describe the craftsmanship, materials, origin, drape, and care..."
                                        className="w-full bg-transparent outline-none py-3 text-sm transition-colors duration-300 resize-y"
                                        style={{
                                            ...inputStyle,
                                            color: '#211E1A',
                                            borderBottom: `1px solid ${errors.description ? '#c25a5a' : '#DDD7CC'}`,
                                            lineHeight: '1.6'
                                        }}
                                        onFocus={e => !errors.description && (e.target.style.borderBottomColor = '#9D782F')}
                                        onBlur={e => !errors.description && (e.target.style.borderBottomColor = '#DDD7CC')}
                                    />
                                    {errors.description && (
                                        <p id="description-error" className="text-[10px] text-[#c25a5a] mt-1">{errors.description}</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* ── PRICING SECTION ── */}
                        <div className="mb-16">
                            <div className="mb-8 border-t pt-10" style={{ borderColor: '#DDD7CC' }}>
                                <h2 className="text-2xl sm:text-3xl font-light text-[#211E1A]" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                                    Pricing
                                </h2>
                                <p className="text-xs mt-1" style={{ color: '#9A9287' }}>
                                    Set the value of this piece.
                                </p>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                                {/* Price Amount */}
                                <div className="flex flex-col gap-2">
                                    <label
                                        htmlFor="priceAmount"
                                        className="text-[10px] uppercase tracking-[0.18em] font-medium"
                                        style={{ color: '#756E63' }}
                                    >
                                        Price
                                    </label>
                                    <div className="relative flex items-center">
                                        <span className="absolute left-0 text-sm" style={{ color: '#211E1A' }}>
                                            {CURRENCIES.find((c) => c.code === priceCurrency)?.symbol || '$'}
                                        </span>
                                        <input
                                            id="priceAmount"
                                            type="number"
                                            step="0.01"
                                            min="0.01"
                                            inputMode="decimal"
                                            aria-invalid={Boolean(errors.priceAmount)}
                                            value={priceAmount}
                                            onChange={(e) => setPriceAmount(e.target.value)}
                                            placeholder="0.00"
                                            className="w-full bg-transparent outline-none py-3 pl-6 text-sm transition-colors duration-300 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                                            style={{
                                                ...inputStyle,
                                                color: '#211E1A',
                                                borderBottom: `1px solid ${errors.priceAmount ? '#c25a5a' : '#DDD7CC'}`
                                            }}
                                            onFocus={e => !errors.priceAmount && (e.target.style.borderBottomColor = '#9D782F')}
                                            onBlur={e => !errors.priceAmount && (e.target.style.borderBottomColor = '#DDD7CC')}
                                        />
                                    </div>
                                    {errors.priceAmount && (
                                        <p className="text-[10px] text-[#c25a5a] mt-1">{errors.priceAmount}</p>
                                    )}
                                </div>

                                {/* Price Currency */}
                                <div className="flex flex-col gap-2">
                                    <label
                                        htmlFor="priceCurrency"
                                        className="text-[10px] uppercase tracking-[0.18em] font-medium"
                                        style={{ color: '#756E63' }}
                                    >
                                        Currency
                                    </label>
                                    <div className="relative">
                                        <select
                                            id="priceCurrency"
                                            value={priceCurrency}
                                            onChange={(e) => setPriceCurrency(e.target.value)}
                                            className="w-full bg-transparent outline-none py-3 text-sm transition-colors duration-300 appearance-none cursor-pointer"
                                            style={{
                                                ...inputStyle,
                                                color: '#211E1A',
                                                borderBottom: '1px solid #DDD7CC'
                                            }}
                                            onFocus={e => e.target.style.borderBottomColor = '#9D782F'}
                                            onBlur={e => e.target.style.borderBottomColor = '#DDD7CC'}
                                        >
                                            {CURRENCIES.map((curr) => (
                                                <option key={curr.code} value={curr.code}>
                                                    {curr.code} — {curr.name}
                                                </option>
                                            ))}
                                        </select>
                                        <div className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: '#756E63' }}>
                                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7" />
                                            </svg>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* ── IMAGES SECTION ── */}
                        <div className="mb-16">
                            <div className="mb-8 border-t pt-10 flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4" style={{ borderColor: '#DDD7CC' }}>
                                <div>
                                    <h2 className="text-2xl sm:text-3xl font-light text-[#211E1A]" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                                        Product Imagery
                                    </h2>
                                    <p className="text-xs mt-1" style={{ color: '#9A9287' }}>
                                        Provide up to 7 high-quality images.
                                    </p>
                                </div>
                                <span className="text-[10px] uppercase tracking-widest" style={{ color: '#9A9287' }}>
                                    {String(images.length).padStart(2, '0')} / {String(MAX_IMAGES).padStart(2, '0')} IMAGES
                                </span>
                            </div>

                            {/* Uploader */}
                            {images.length < MAX_IMAGES && (
                                <div
                                    onDragEnter={handleDrag}
                                    onDragLeave={handleDrag}
                                    onDragOver={handleDrag}
                                    onDrop={handleDrop}
                                    onClick={() => fileInputRef.current?.click()}
                                    className="mb-8 w-full py-16 sm:py-20 flex flex-col items-center justify-center cursor-pointer transition-all duration-300"
                                    style={{
                                        border: `1px dashed ${dragActive ? '#9D782F' : errors.images ? '#c25a5a' : '#DDD7CC'}`,
                                        backgroundColor: dragActive ? '#fcfaf6' : '#f7f4ee',
                                    }}
                                    onMouseEnter={e => {
                                        if(!dragActive && !errors.images) {
                                            e.currentTarget.style.borderColor = '#9D782F';
                                            e.currentTarget.style.backgroundColor = '#fcfaf6';
                                        }
                                    }}
                                    onMouseLeave={e => {
                                        if(!dragActive && !errors.images) {
                                            e.currentTarget.style.borderColor = '#DDD7CC';
                                            e.currentTarget.style.backgroundColor = '#f7f4ee';
                                        }
                                    }}
                                >
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        multiple
                                        accept="image/jpeg,image/png,image/webp,image/avif"
                                        onChange={handleFileInputChange}
                                        className="hidden"
                                    />
                                    <div className="flex flex-col items-center gap-4 px-4 text-center">
                                        <svg className="w-6 h-6" style={{ color: '#9D782F' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 4v16m8-8H4" />
                                        </svg>
                                        <div className="space-y-2">
                                            <p className="text-[11px] uppercase tracking-[0.2em] font-medium" style={{ color: '#211E1A' }}>
                                                ADD PRODUCT IMAGERY
                                            </p>
                                            <p className="text-sm" style={{ color: '#756E63' }}>
                                                Drop your images here <br className="sm:hidden" />
                                                <span className="hidden sm:inline"> or </span>
                                                <span style={{ color: '#9D782F', textDecoration: 'underline', textUnderlineOffset: '2px' }}>Browse files</span>
                                            </p>
                                        </div>
                                        <p className="text-[10px]" style={{ color: '#9A9287' }}>
                                            PNG, JPG, WEBP or AVIF · Up to 5MB each · Maximum {MAX_IMAGES} images
                                        </p>
                                    </div>
                                </div>
                            )}

                            {errors.images && (
                                <p className="text-[10px] text-[#c25a5a] mb-8">{errors.images}</p>
                            )}

                            {/* Gallery */}
                            {images.length > 0 && (
                                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                                    {images.map((img, idx) => (
                                        <div
                                            key={img.id}
                                            className="group relative aspect-square bg-[#fbf9f6] transition-all duration-300"
                                            style={{
                                                border: `1px solid ${img.isCover ? '#9D782F' : '#DDD7CC'}`
                                            }}
                                        >
                                            <img
                                                src={img.previewUrl}
                                                alt={`Preview ${idx + 1}`}
                                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                                            />
                                            
                                            {/* Hover overlay */}
                                            <div className="absolute inset-0 bg-[#211E1A]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

                                            {img.isCover ? (
                                                <div 
                                                    className="absolute top-3 left-3 text-[9px] uppercase tracking-[0.2em] px-2 py-1"
                                                    style={{ backgroundColor: '#9D782F', color: '#211E1A', fontWeight: '500' }}
                                                >
                                                    COVER
                                                </div>
                                            ) : (
                                                <button
                                                    type="button"
                                                    onClick={() => setCoverImage(img.id)}
                                                    className="absolute top-3 left-3 opacity-0 group-hover:opacity-100 text-[9px] uppercase tracking-[0.2em] px-2 py-1 transition-all duration-300"
                                                    style={{ backgroundColor: '#ffffff', color: '#211E1A', border: '1px solid #DDD7CC' }}
                                                    onMouseEnter={e => {
                                                        e.currentTarget.style.backgroundColor = '#211E1A';
                                                        e.currentTarget.style.color = '#ffffff';
                                                        e.currentTarget.style.borderColor = '#211E1A';
                                                    }}
                                                    onMouseLeave={e => {
                                                        e.currentTarget.style.backgroundColor = '#ffffff';
                                                        e.currentTarget.style.color = '#211E1A';
                                                        e.currentTarget.style.borderColor = '#DDD7CC';
                                                    }}
                                                >
                                                    MAKE COVER
                                                </button>
                                            )}

                                            <button
                                                type="button"
                                                onClick={() => removeImage(img.id)}
                                                className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 w-6 h-6 flex items-center justify-center transition-all duration-300"
                                                style={{ backgroundColor: '#ffffff', color: '#211E1A', border: '1px solid #DDD7CC' }}
                                                onMouseEnter={e => {
                                                    e.currentTarget.style.backgroundColor = '#c25a5a';
                                                    e.currentTarget.style.color = '#ffffff';
                                                    e.currentTarget.style.borderColor = '#c25a5a';
                                                }}
                                                onMouseLeave={e => {
                                                    e.currentTarget.style.backgroundColor = '#ffffff';
                                                    e.currentTarget.style.color = '#211E1A';
                                                    e.currentTarget.style.borderColor = '#DDD7CC';
                                                }}
                                            >
                                                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                            </button>
                                        </div>
                                    ))}

                                    {/* Empty Slots */}
                                    {Array.from({ length: MAX_IMAGES - images.length }).map((_, index) => (
                                        <div
                                            key={`empty-${index}`}
                                            onClick={() => fileInputRef.current?.click()}
                                            className="aspect-square flex flex-col items-center justify-center cursor-pointer transition-all duration-300"
                                            style={{ backgroundColor: '#fbf9f6', border: '1px dashed #DDD7CC', color: '#9A9287' }}
                                            onMouseEnter={e => {
                                                e.currentTarget.style.borderColor = '#9D782F';
                                                e.currentTarget.style.color = '#9D782F';
                                            }}
                                            onMouseLeave={e => {
                                                e.currentTarget.style.borderColor = '#DDD7CC';
                                                e.currentTarget.style.color = '#9A9287';
                                            }}
                                        >
                                            <span className="text-xl font-light mb-1">+</span>
                                            <span className="text-[9px] uppercase tracking-[0.2em]">ADD IMAGE</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* ── FORM ACTIONS ── */}
                        <div className="pt-10 border-t flex flex-col-reverse sm:flex-row items-center justify-end gap-4" style={{ borderColor: '#DDD7CC' }}>
                            <button
                                type="button"
                                disabled={isSubmitting}
                                onClick={() => {
                                    if (window.confirm('Discard changes and return?')) {
                                        navigate(-1);
                                    }
                                }}
                                className="w-full sm:w-auto py-4 px-8 text-[11px] uppercase tracking-[0.25em] font-medium transition-all duration-300"
                                style={{
                                    backgroundColor: 'transparent',
                                    color: '#756E63',
                                    border: '1px solid #DDD7CC'
                                }}
                                onMouseEnter={e => {
                                    if(!isSubmitting) {
                                        e.currentTarget.style.borderColor = '#9D782F';
                                        e.currentTarget.style.color = '#9D782F';
                                    }
                                }}
                                onMouseLeave={e => {
                                    if(!isSubmitting) {
                                        e.currentTarget.style.borderColor = '#DDD7CC';
                                        e.currentTarget.style.color = '#756E63';
                                    }
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full sm:w-auto py-4 px-10 text-[11px] uppercase tracking-[0.25em] font-medium transition-all duration-300 flex items-center justify-center gap-3 disabled:opacity-70"
                                style={{
                                    backgroundColor: '#211E1A',
                                    color: '#FFFFFF',
                                    border: '1px solid #211E1A'
                                }}
                                onMouseEnter={e => {
                                    if(!isSubmitting) {
                                        e.currentTarget.style.backgroundColor = '#9D782F';
                                        e.currentTarget.style.borderColor = '#9D782F';
                                        e.currentTarget.style.color = '#211E1A';
                                    }
                                }}
                                onMouseLeave={e => {
                                    if(!isSubmitting) {
                                        e.currentTarget.style.backgroundColor = '#211E1A';
                                        e.currentTarget.style.borderColor = '#211E1A';
                                        e.currentTarget.style.color = '#FFFFFF';
                                    }
                                }}
                            >
                                {isSubmitting ? (
                                    <>
                                        <svg className="animate-spin w-3 h-3 text-current" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                        </svg>
                                        <span>PUBLISHING...</span>
                                    </>
                                ) : (
                                    <span>PUBLISH PRODUCT</span>
                                )}
                            </button>
                        </div>

                    </form>
                </main>
            </div>
        </>
    );
}

export default CreateProduct;
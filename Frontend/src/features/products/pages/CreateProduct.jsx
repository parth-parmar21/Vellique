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
    return (
        <div className="min-h-screen bg-[#0d0d0d] text-on-surface font-sans antialiased flex flex-col selection:bg-primary-container selection:text-black">
            {/* Main Content Area */}
            <main className="grow max-w-4xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-8">
                {/* Page Header with Quiet Luxury Typography */}
                <div className="text-center sm:text-left border-b border-[#262626] pb-8">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#1a1a1a] border border-[#333333] rounded-full mb-4">
                        <span className="w-2 h-2 rounded-full bg-primary-container animate-pulse" />
                        <span className="text-[11px] font-mono uppercase tracking-widest text-on-surface-variant">
                            New Collection Item
                        </span>
                    </div>
                    <h1 className="text-3xl sm:text-4xl font-serif tracking-tight text-[#ffffff] font-medium">
                        Create Product
                    </h1>
                    <p className="mt-2 text-sm sm:text-base text-outline max-w-xl font-light">
                        Add a new luxury piece to your Vellique catalog. Curate titles, descriptions, pricing, and visual presentation.
                    </p>
                </div>
                {/* Status Notification Banner */}
                {statusMessage && (
                    <div
                        className={`mb-8 p-4 rounded-sm border text-sm flex items-start gap-3 transition-all ${statusMessage.type === 'success'
                            ? 'bg-[#1c281e] border-[#2e5235] text-[#86efac]'
                            : 'bg-[#2a1719] border-[#592225] text-[#fca5a5]'
                            }`}
                    >
                        {statusMessage.type === 'success' ? (
                            <svg className="w-5 h-5 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        ) : (
                            <svg className="w-5 h-5 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        )}
                        <div className="flex-1">
                            <p className="font-medium">{statusMessage.text}</p>
                        </div>
                        <button
                            type="button"
                            onClick={() => setStatusMessage(null)}
                            className="text-xs opacity-70 hover:opacity-100"
                        >
                            ✕
                        </button>
                    </div>
                )}
                {/* Product Creation Form Card */}
                <form
                    onSubmit={handleSubmit}
                    className="bg-[#141414] border border-[#262626] rounded-md p-6 sm:p-10 space-y-10 shadow-2xl relative"
                >
                    {/* SECTION 1: Basic Information */}
                    <div className="space-y-6">
                        <div className="border-b border-[#262626] pb-3">
                            <h2 className="text-xs font-mono uppercase tracking-widest text-primary-container font-semibold">
                                01. Details
                            </h2>
                        </div>
                        {/* Title Field */}
                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <label
                                    htmlFor="title"
                                    className="block text-xs uppercase tracking-wider text-on-surface-variant font-medium"
                                >
                                    Product Title <span className="text-primary-container">*</span>
                                </label>
                                <span className="text-[11px] text-outline">
                                    {title.length}/100
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
                                placeholder="e.g. Obsidian Cashmere Trench Coat"
                                className={`w-full bg-[#0d0d0d] border ${errors.title ? 'border-red-500' : 'border-[#262626] focus:border-primary-container'
                                    } rounded-sm px-4 py-3 text-sm text-[#ffffff] placeholder-[#555555] outline-none transition-colors duration-200`}
                            />
                            {errors.title && (
                                <p id="title-error" className="text-xs text-red-400 mt-1">{errors.title}</p>
                            )}
                        </div>
                        {/* Description Field */}
                        <div className="space-y-2">
                            <label
                                htmlFor="description"
                                className="block text-xs uppercase tracking-wider text-on-surface-variant font-medium"
                            >
                                Description <span className="text-primary-container">*</span>
                            </label>
                            <textarea
                                id="description"
                                rows={5}
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                aria-invalid={Boolean(errors.description)}
                                aria-describedby={errors.description ? 'description-error' : undefined}
                                placeholder="Describe the craftsmanship, materials, origin, drape, and care instructions..."
                                className={`w-full bg-[#0d0d0d] border ${errors.description ? 'border-red-500' : 'border-[#262626] focus:border-primary-container'
                                    } rounded-sm p-4 text-sm text-[#ffffff] placeholder-[#555555] outline-none transition-colors duration-200 resize-y min-h-30`}
                            />
                            {errors.description && (
                                <p id="description-error" className="text-xs text-red-400 mt-1">{errors.description}</p>
                            )}
                        </div>
                    </div>
                    {/* SECTION 2: Pricing */}
                    <div className="space-y-6">
                        <div className="border-b border-[#262626] pb-3">
                            <h2 className="text-xs font-mono uppercase tracking-widest text-primary-container font-semibold">
                                02. Pricing
                            </h2>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
                            {/* Price Amount */}
                            <div className="sm:col-span-2 space-y-2">
                                <label
                                    htmlFor="priceAmount"
                                    className="block text-xs uppercase tracking-wider text-on-surface-variant font-medium"
                                >
                                    Price Amount <span className="text-primary-container">*</span>
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-outline font-mono text-sm">
                                        {CURRENCIES.find((c) => c.code === priceCurrency)?.symbol || '$'}
                                    </div>
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
                                        className={`w-full bg-[#0d0d0d] border ${errors.priceAmount
                                            ? 'border-red-500'
                                            : 'border-[#262626] focus:border-primary-container'
                                            } rounded-sm pl-10 pr-4 py-3 text-sm text-[#ffffff]
                                                font-mono placeholder-[#555555] outline-none transition-colors duration-200
                                                [appearance:textfield]
                                                [&::-webkit-inner-spin-button]:appearance-none
                                                [&::-webkit-outer-spin-button]:appearance-none`
                                        }
                                    />
                                </div>
                                {errors.priceAmount && (
                                    <p className="text-xs text-red-400 mt-1">{errors.priceAmount}</p>
                                )}
                            </div>
                            {/* Price Currency */}
                            <div className="space-y-2">
                                <label
                                    htmlFor="priceCurrency"
                                    className="block text-xs uppercase tracking-wider text-on-surface-variant font-medium"
                                >
                                    Currency <span className="text-primary-container">*</span>
                                </label>
                                <select
                                    id="priceCurrency"
                                    value={priceCurrency}
                                    onChange={(e) => setPriceCurrency(e.target.value)}
                                    className="w-full bg-[#0d0d0d] border border-[#262626] focus:border-primary-container rounded-sm px-4 py-3 text-sm text-[#ffffff] outline-none transition-colors duration-200 appearance-none cursor-pointer"
                                >
                                    {CURRENCIES.map((curr) => (
                                        <option key={curr.code} value={curr.code} className="bg-[#141414] text-[#ffffff]">
                                            {curr.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>
                    {/* SECTION 3: Product Images (Up to 7) */}
                    <div className="space-y-6">
                        <div className="border-b border-[#262626] pb-3 flex justify-between items-center">
                            <h2 className="text-xs font-mono uppercase tracking-widest text-primary-container font-semibold">
                                03. Product Imagery
                            </h2>
                            <span className="text-xs font-mono text-outline">
                                {images.length} / {MAX_IMAGES} Uploaded
                            </span>
                        </div>
                        {/* Drag and Drop Zone */}
                        {images.length < MAX_IMAGES && (
                            <div
                                onDragEnter={handleDrag}
                                onDragLeave={handleDrag}
                                onDragOver={handleDrag}
                                onDrop={handleDrop}
                                onClick={() => fileInputRef.current?.click()}
                                className={`border-2 border-dashed rounded-md p-8 sm:p-10 text-center cursor-pointer transition-all duration-200 ${dragActive
                                    ? 'border-primary-container bg-primary-container/5 scale-[0.99]'
                                    : errors.images
                                        ? 'border-red-500 bg-red-950/10'
                                        : 'border-[#333333] hover:border-primary-container bg-[#0d0d0d] hover:bg-[#1a1a1a]'
                                    }`}
                            >
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    multiple
                                    accept="image/jpeg,image/png,image/webp,image/avif"
                                    onChange={handleFileInputChange}
                                    className="hidden"
                                />
                                <div className="flex flex-col items-center gap-3">
                                    <div className="w-12 h-12 rounded-full bg-[#1e1e1e] border border-[#333333] flex items-center justify-center text-primary-container">
                                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-sm font-medium text-on-surface">
                                            <span className="text-primary-container underline underline-offset-4">Click to browse</span> or drag and drop image files
                                        </p>
                                        <p className="text-xs text-outline font-light">
                                            Supports PNG, JPG, WEBP up to 5MB each. First image becomes the Cover.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                        {errors.images && (
                            <p className="text-xs text-red-400 mt-1">{errors.images}</p>
                        )}
                        {/* Images Grid */}
                        {images.length > 0 && (
                            <div className="space-y-3">
                                <p className="text-xs font-mono uppercase tracking-wider text-outline">
                                    Gallery Preview ({images.length})
                                </p>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                    {images.map((img, idx) => (
                                        <div
                                            key={img.id}
                                            className={`group relative aspect-square rounded-sm overflow-hidden border bg-[#0d0d0d] transition-all ${img.isCover
                                                ? 'border-primary-container ring-1 ring-primary-container/30'
                                                : 'border-[#262626] hover:border-[#555555]'
                                                }`}
                                        >
                                            <img
                                                src={img.previewUrl}
                                                alt={`Product preview ${idx + 1}`}
                                                className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
                                            />
                                            {/* Cover Badge */}
                                            {img.isCover ? (
                                                <div className="absolute top-2 left-2 bg-primary-container text-[#0d0d0d] font-mono text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-sm shadow-md">
                                                    Cover
                                                </div>
                                            ) : (
                                                <button
                                                    type="button"
                                                    onClick={() => setCoverImage(img.id)}
                                                    className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 bg-on-surface/80 hover:bg-primary-container text-white hover:text-[#0d0d0d] text-[10px] uppercase font-mono tracking-wider px-2 py-0.5 rounded-sm transition-all border border-[#333333]"
                                                >
                                                    Make Cover
                                                </button>
                                            )}
                                            {/* Action overlay */}
                                            <button
                                                type="button"
                                                onClick={() => removeImage(img.id)}
                                                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 bg-red-950/80 hover:bg-red-600 text-white w-7 h-7 rounded-full flex items-center justify-center transition-all border border-red-500/50"
                                                title="Remove image"
                                            >
                                                ✕
                                            </button>
                                            <div className="absolute bottom-2 right-2 bg-on-surface/80 text-on-surface font-mono text-[10px] px-1.5 py-0.5 rounded-sm border border-[#333333]">
                                                #{idx + 1}
                                            </div>
                                        </div>
                                    ))}
                                    {/* Empty Slot Placeholders */}
                                    {Array.from({ length: MAX_IMAGES - images.length }).map((_, index) => (
                                        <div
                                            key={`empty-${index}`}
                                            onClick={() => fileInputRef.current?.click()}
                                            className="aspect-square rounded-sm border border-dashed border-[#262626] bg-[#0d0d0d]/40 flex flex-col items-center justify-center text-[#444444] hover:text-[#777777] hover:border-[#333333] cursor-pointer transition-colors"
                                        >
                                            <svg className="w-6 h-6 mb-1 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
                                            </svg>
                                            <span className="text-[10px] font-mono uppercase tracking-wider">
                                                Slot {images.length + index + 1}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                    {/* Form Actions Footer */}
                    <div className="pt-6 border-t border-[#262626] flex flex-col sm:flex-row items-center justify-end gap-4">
                        <button
                            type="button"
                            disabled={isSubmitting}
                            onClick={() => {
                                if (window.confirm('Discard changes and return?')) {
                                    navigate(-1);
                                }
                            }}
                            className="w-full sm:w-auto px-6 py-3 border border-[#333333] hover:border-[#666666] text-on-surface hover:text-primary-container text-xs font-mono uppercase tracking-widest rounded-sm transition-colors disabled:opacity-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full sm:w-auto px-8 py-3 bg-primary-container hover:bg-on-surface/30 text-[#0d0d0d] text-xs font-mono uppercase font-bold tracking-widest rounded-sm shadow-lg hover:shadow-primary-container/30 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                        >
                            {isSubmitting ? (
                                <>
                                    <svg className="animate-spin w-4 h-4 text-[#0d0d0d]" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                    </svg>
                                    <span>Publishing...</span>
                                </>
                            ) : (
                                <span>Publish Product</span>
                            )}
                        </button>
                    </div>
                </form>
            </main>
        </div>
    );
};
export default CreateProduct;
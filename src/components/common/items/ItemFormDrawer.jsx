import { useEffect, useState } from "react";
import { X, Check, Upload } from "lucide-react";
import Modal from "../../../modal/Modal.jsx";

/* Constants */
const EMPTY_FORM = {
    name:        "",
    nameKh:      "",
    categoryId:  "",
    price:       "",
    description: "",
    imageUrl:    "",
    status:      true,
};

/* Utility */
/** Returns Tailwind classes for form inputs, with red styling on error. */
function inputCls(error) {
    return `w-full px-3 py-2 rounded-xl text-sm border outline-none transition-colors bg-cream-50
            focus:bg-white focus:border-forest-400 ${
        error ? "border-red-300 bg-red-50" : "border-cream-200"
    }`;
}

/* Sub-components */
/** Labeled form field wrapper with optional required marker and error message. */
function Field({ label, required, error, children }) {
    return (
        <div className="flex flex-col gap-1.5">
            <label className="text-[11px] uppercase tracking-wider font-medium text-gray-400">
                {label}
                {required && <span className="text-red-400 ml-0.5">*</span>}
            </label>
            {children}
            {error && <p className="text-xs text-red-500">{error}</p>}
        </div>
    );
}

/** Horizontal divider with a centered text label. */
function Divider({ label }) {
    return (
        <div className="flex items-center gap-2 text-[11px] text-gray-300 uppercase tracking-wider">
            <span className="flex-1 h-px bg-cream-200" />
            {label}
            <span className="flex-1 h-px bg-cream-200" />
        </div>
    );
}

/** Availability toggle row — green tint when on, neutral when off. */
function StatusToggle({ value, onToggle }) {
    return (
        <div className={`flex items-center justify-between px-3 py-3 rounded-xl border transition-all ${
            value ? "bg-emerald-50/60 border-emerald-200" : "bg-cream-50 border-cream-200"
        }`}>
            {/* Left: dot + label + description */}
            <div className="flex items-center gap-2.5">
                <span className={`w-2 h-2 rounded-full shrink-0 ${
                    value ? "bg-emerald-500" : "bg-gray-300"
                }`} />
                <div>
                    <p className={`text-sm font-medium ${value ? "text-forest-800" : "text-gray-600"}`}>
                        {value ? "Available" : "Unavailable"}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                        {value
                            ? "Visible and orderable by customers"
                            : "Hidden from customers until re-enabled"}
                    </p>
                </div>
            </div>

            {/* Right: On/Off badge + toggle switch */}
            <div className="flex items-center gap-2.5 shrink-0">
                <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${
                    value ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-500"
                }`}>
                    {value ? "On" : "Off"}
                </span>

                <button
                    role="switch"
                    aria-checked={value}
                    onClick={onToggle}
                    className={`relative w-9 h-5 rounded-full transition-colors shrink-0 ${
                        value ? "bg-forest-700" : "bg-gray-200"
                    }`}
                >
                    <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${
                        value ? "translate-x-4" : "translate-x-0"
                    }`} />
                </button>
            </div>
        </div>
    );
}

/** Image preview (with remove button) or upload drop zone. */
function ImageUpload({ imageUrl, onChange, onClear }) {
    if (imageUrl) {
        return (
            <div className="relative">
                <img
                    src={imageUrl}
                    alt="preview"
                    className="w-full h-36 object-cover rounded-xl border border-cream-200"
                />
                <button
                    onClick={onClear}
                    className="absolute top-2 right-2 p-1 bg-white rounded-lg border border-cream-200 text-gray-400 hover:text-red-500 transition-colors"
                    title="Remove image"
                >
                    <X size={12} />
                </button>
            </div>
        );
    }

    return (
        <label className="flex flex-col items-center gap-2 p-5 rounded-xl border border-dashed border-cream-300 bg-cream-50 cursor-pointer hover:border-forest-400 hover:bg-forest-50/30 transition-colors">
            <div className="w-8 h-8 rounded-lg bg-cream-100 flex items-center justify-center text-gray-400">
                <Upload size={15} />
            </div>
            <div className="text-center">
                <p className="text-xs text-gray-500">
                    <span className="text-forest-700 font-medium">Click to upload</span> or drag and drop
                </p>
                <p className="text-xs text-gray-400 mt-0.5">PNG, JPG up to 2MB</p>
            </div>
            <input type="file" accept="image/*" className="hidden" onChange={onChange} />
        </label>
    );
}

/* Main Component */
export default function ItemFormDrawer({ open, onClose, onSubmit, item, categories }) {
    const isEdit = !!item;

    const [form,   setForm]   = useState(EMPTY_FORM);
    const [errors, setErrors] = useState({});
    const [saving, setSaving] = useState(false);

    /* Populate form fields when the modal opens.
       Resets to empty state when adding a new item. */
    useEffect(() => {
        if (!open) return;
        setForm(item ? {
            name:        item.name        ?? "",
            nameKh:      item.nameKh      ?? "",
            categoryId:  item.categoryId  ?? "",
            price:       item.price       ?? "",
            description: item.description ?? "",
            imageUrl:    item.imageUrl    ?? "",
            status:      item.status      ?? true,
        } : EMPTY_FORM);
        setErrors({});
    }, [open, item]);

    /* Generic field change handler — clears the field's error on change. */
    const setField = (field) => (e) => {
        setForm((prev)   => ({ ...prev, [field]: e.target.value }));
        setErrors((prev) => ({ ...prev, [field]: undefined }));
    };

    /* Toggle availability status between true / false. */
    const toggleStatus = () =>
        setForm((prev) => ({ ...prev, status: !prev.status }));

    /* Clear the selected image from the form. */
    const clearImage = () =>
        setForm((prev) => ({ ...prev, imageUrl: "" }));

    /* Convert the selected file to an object URL for preview. */
    const handleImageChange = (e) => {
        const file = e.target.files?.[0];
        if (file) setForm((prev) => ({ ...prev, imageUrl: URL.createObjectURL(file) }));
    };

    /* Validate required fields and return an error map. */
    const validate = () => {
        const errs = {};
        if (!form.name.trim())                      errs.name       = "Name is required";
        if (!form.categoryId)                       errs.categoryId = "Please select a category";
        if (!form.price || Number(form.price) <= 0) errs.price      = "Enter a valid price";
        return errs;
    };

    /* Run validation, then call onSubmit with the cleaned form data. */
    const handleSubmit = async () => {
        const errs = validate();
        if (Object.keys(errs).length) { setErrors(errs); return; }
        setSaving(true);
        try {
            await onSubmit({ ...form, price: Number(form.price) });
        } finally {
            setSaving(false);
        }
    };

    /* ── Render ── */
    return (
        <Modal
            open={open}
            onClose={onClose}
            title={isEdit ? "Edit item" : "Add menu item"}
            subtitle={isEdit ? `Editing "${item?.name}"` : "Fill in the details below"}
            size="lg"
        >
            {/* ── Body ── */}
            <div className="p-5 space-y-4 overflow-y-auto max-h-[60vh]">

                {/* Name + Khmer name */}
                <div className="grid grid-cols-2 gap-3">
                    <Field label="Name" required error={errors.name}>
                        <input
                            type="text"
                            value={form.name}
                            onChange={setField("name")}
                            placeholder="e.g. Fresh Orange Juice"
                            className={inputCls(errors.name)}
                        />
                    </Field>
                    <Field label="Khmer name">
                        <input
                            type="text"
                            value={form.nameKh}
                            onChange={setField("nameKh")}
                            placeholder="ឈ្មោះជាភាសាខ្មែរ"
                            className={inputCls()}
                        />
                    </Field>
                </div>

                {/* Category + Price */}
                <div className="grid grid-cols-2 gap-3">
                    <Field label="Category" required error={errors.categoryId}>
                        <select
                            value={form.categoryId}
                            onChange={setField("categoryId")}
                            className={inputCls(errors.categoryId)}
                        >
                            <option value="">Select category</option>
                            {categories.map((c) => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                        </select>
                    </Field>
                    <Field label="Price ($)" required error={errors.price}>
                        <input
                            type="number"
                            value={form.price}
                            onChange={setField("price")}
                            placeholder="0.00"
                            step="0.01"
                            min="0"
                            className={inputCls(errors.price)}
                        />
                    </Field>
                </div>

                {/* Description */}
                <Field label="Description">
                    <textarea
                        value={form.description}
                        onChange={setField("description")}
                        placeholder="Describe this item…"
                        rows={3}
                        className={`${inputCls()} resize-none`}
                    />
                </Field>

                <Divider label="Image" />

                {/* Image upload / preview */}
                <ImageUpload
                    imageUrl={form.imageUrl}
                    onChange={handleImageChange}
                    onClear={clearImage}
                />

                <Divider label="Availability" />

                {/* Availability toggle */}
                <StatusToggle value={form.status} onToggle={toggleStatus} />

            </div>

            {/* ── Footer ── */}
            <div className="px-5 py-4 border-t border-cream-200 bg-cream-50/50 flex items-center justify-between">
                <button
                    onClick={onClose}
                    disabled={saving}
                    className="px-4 py-2 rounded-xl text-sm text-gray-500 border border-cream-200 hover:bg-cream-100 transition-colors disabled:opacity-50"
                >
                    Cancel
                </button>
                <button
                    onClick={handleSubmit}
                    disabled={saving}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-white text-sm font-medium transition-colors disabled:opacity-60"
                    style={{ backgroundColor: "#1a4731" }}
                    onMouseOver={(e) => !saving && (e.currentTarget.style.backgroundColor = "#153d29")}
                    onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "#1a4731")}
                >
                    <Check size={13} />
                    {saving ? "Saving…" : isEdit ? "Save changes" : "Save item"}
                </button>
            </div>
        </Modal>
    );
}
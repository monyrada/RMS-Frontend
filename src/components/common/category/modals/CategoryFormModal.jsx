import { useState, useEffect } from "react";
import Modal from "../../../../modal/Modal.jsx";

const PRESET_COLORS = [
    "#1a4731", "#2d6a4f", "#40916c",
    "#e76f51", "#f4a261", "#e9c46a",
    "#264653", "#457b9d", "#6d6875",
];

const defaultForm = {
    name: "",
    description: "",
    color: "#1a4731",
    isActive: true,
};

export default function CategoryFormModal({
                                              open,
                                              onClose,
                                              onSubmit,
                                              initial = null,
                                              mode,
                                          }) {
    const [form, setForm] = useState(defaultForm);
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (open) {
            setForm(
                initial
                    ? {
                        name: initial.name,
                        description: initial.description ?? "",
                        color: initial.color ?? "#1a4731",
                        isActive: initial.isActive,
                    }
                    : defaultForm
            );
            setErrors({});
        }
    }, [open, initial]);

    function validate() {
        const errs = {};
        if (!form.name.trim()) errs.name = "Category name is required.";
        else if (form.name.length > 50) errs.name = "Name must be 50 characters or fewer.";
        return errs;
    }

    async function handleSubmit() {
        const errs = validate();
        if (Object.keys(errs).length > 0) { setErrors(errs); return; }
        setLoading(true);
        try {
            await onSubmit(form);
            onClose();
        } finally {
            setLoading(false);
        }
    }

    const set = (key, val) => setForm((f) => ({ ...f, [key]: val }));

    return (
        <Modal
            open={open}
            onClose={onClose}
            title={mode === "create" ? "Add category" : "Edit category"}
            subtitle={mode === "edit" && initial?.name ? `Editing "${initial.name}"` : undefined}
            size="md"
        >
            <div className="px-6 py-5 space-y-5">
                {/* Name */}
                <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                        Name <span className="text-red-400">*</span>
                    </label>
                    <input
                        type="text"
                        value={form.name}
                        onChange={(e) => set("name", e.target.value)}
                        placeholder="e.g. Main Course"
                        className={`w-full px-3 py-2.5 text-sm rounded-lg border transition-colors outline-none focus:ring-2 ${
                            errors.name
                                ? "border-red-300 focus:ring-red-100"
                                : "border-gray-200 focus:ring-[#1a4731]/20 focus:border-[#1a4731]"
                        }`}
                    />
                    {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
                </div>

                {/* Description */}
                <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                        Description{" "}
                        <span className="text-gray-400 font-normal">(optional)</span>
                    </label>
                    <textarea
                        value={form.description}
                        onChange={(e) => set("description", e.target.value)}
                        placeholder="Short description of this category..."
                        rows={3}
                        className="w-full px-3 py-2.5 text-sm rounded-lg border border-gray-200 focus:ring-2 focus:ring-[#1a4731]/20 focus:border-[#1a4731] outline-none transition-colors resize-none"
                    />
                </div>

                {/* Color */}
                <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-2">
                        Color label
                    </label>
                    <div className="flex items-center gap-2 flex-wrap">
                        {PRESET_COLORS.map((c) => (
                            <button
                                key={c}
                                type="button"
                                onClick={() => set("color", c)}
                                className="w-7 h-7 rounded-full border-2 transition-all"
                                style={{
                                    backgroundColor: c,
                                    borderColor: form.color === c ? "#111" : "transparent",
                                    transform: form.color === c ? "scale(1.15)" : "scale(1)",
                                }}
                                aria-label={`Color ${c}`}
                            />
                        ))}
                        <input
                            type="color"
                            value={form.color}
                            onChange={(e) => set("color", e.target.value)}
                            className="w-7 h-7 rounded-full cursor-pointer border border-gray-200"
                            title="Custom color"
                        />
                    </div>
                </div>

                {/* Status toggle */}
                <div className="flex items-center justify-between py-3 border-t border-gray-100">
                    <div>
                        <p className="text-sm font-medium text-gray-700">Active</p>
                        <p className="text-xs text-gray-400 mt-0.5">
                            Inactive categories won't appear in menus
                        </p>
                    </div>
                    <button
                        type="button"
                        role="switch"
                        aria-checked={form.isActive}
                        onClick={() => set("isActive", !form.isActive)}
                        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                            form.isActive ? "bg-[#1a4731]" : "bg-gray-200"
                        }`}
                    >
            <span
                className={`inline-block h-3.5 w-3.5 rounded-full bg-white shadow transition-transform ${
                    form.isActive ? "translate-x-[18px]" : "translate-x-[2px]"
                }`}
            />
                    </button>
                </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 rounded-b-xl flex justify-end gap-3">
                <button
                    onClick={onClose}
                    disabled={loading}
                    className="px-4 py-2 text-sm font-medium rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-100 transition-colors disabled:opacity-50"
                >
                    Cancel
                </button>
                <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="px-5 py-2 text-sm font-medium rounded-lg text-white transition-colors disabled:opacity-60"
                    style={{ backgroundColor: "#1a4731" }}
                    onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "#153d29")}
                    onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "#1a4731")}
                >
                    {loading
                        ? "Saving..."
                        : mode === "create"
                            ? "Add category"
                            : "Save changes"}
                </button>
            </div>
        </Modal>
    );
}
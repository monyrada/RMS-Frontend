import { useState, useEffect } from "react";
import Modal from "../../../modal/Modal.jsx";

const UNITS = ["g", "kg", "ml", "L", "pcs", "slice", "cup", "tbsp", "tsp", "oz", "lb"];

const STATUS_OPTIONS = [
    { label: "In Stock",     value: "IN_STOCK"     },
    { label: "Low Stock",    value: "LOW_STOCK"    },
    { label: "Out of Stock", value: "OUT_OF_STOCK" },
];

const defaultForm = {
    name: "",
    nameKh: "",
    description: "",
    unit: "g",
    stockStatus: "IN_STOCK",
};

export default function IngredientFormDrawer({ open, onClose, onSubmit, ingredient }) {
    const mode = ingredient ? "edit" : "create";
    const [form, setForm] = useState(defaultForm);
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (open) {
            setForm(
                ingredient
                    ? {
                        name: ingredient.name,
                        nameKh: ingredient.nameKh ?? "",
                        description: ingredient.description ?? "",
                        unit: ingredient.unit,
                        stockStatus: ingredient.stockStatus ?? "IN_STOCK",
                    }
                    : defaultForm
            );
            setErrors({});
        }
    }, [open, ingredient]);

    function validate() {
        const errs = {};
        if (!form.name.trim()) errs.name = "Ingredient name is required.";
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
            title={mode === "create" ? "Add ingredient" : "Edit ingredient"}
            subtitle={mode === "edit" && ingredient?.name ? `Editing "${ingredient.name}"` : undefined}
            size="md"
        >
            <div className="px-6 py-5 space-y-5">
                {/* Name (EN) + Name (KH) */}
                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                            Name <span className="text-red-400">*</span>
                        </label>
                        <input
                            type="text"
                            value={form.name}
                            onChange={(e) => set("name", e.target.value)}
                            placeholder="e.g. Cheese"
                            className={`w-full px-3 py-2.5 text-sm rounded-lg border transition-colors outline-none focus:ring-2 ${
                                errors.name
                                    ? "border-red-300 focus:ring-red-100"
                                    : "border-cream-200 focus:ring-forest-400/20 focus:border-forest-400"
                            }`}
                        />
                        {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                            Name (Khmer) <span className="text-gray-400 font-normal">(optional)</span>
                        </label>
                        <input
                            type="text"
                            value={form.nameKh}
                            onChange={(e) => set("nameKh", e.target.value)}
                            placeholder="e.g. ឈីស"
                            className="w-full px-3 py-2.5 text-sm rounded-lg border border-cream-200 focus:ring-2 focus:ring-forest-400/20 focus:border-forest-400 outline-none transition-colors"
                        />
                    </div>
                </div>

                {/* Description */}
                <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">Description</label>
                    <textarea
                        value={form.description}
                        onChange={(e) => set("description", e.target.value)}
                        placeholder="e.g. Measured in kilograms (kg). Mozzarella cheese used for pizza and burgers."
                        rows={2}
                        className="w-full px-3 py-2.5 text-sm rounded-lg border border-cream-200 focus:ring-2 focus:ring-forest-400/20 focus:border-forest-400 outline-none transition-colors resize-none"
                    />
                </div>

                {/* Unit + Stock status */}
                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1.5">Unit</label>
                        <select
                            value={form.unit}
                            onChange={(e) => set("unit", e.target.value)}
                            className="w-full px-3 py-2.5 text-sm rounded-lg border border-cream-200 focus:ring-2 focus:ring-forest-400/20 focus:border-forest-400 outline-none transition-colors bg-white"
                        >
                            {UNITS.map((u) => (
                                <option key={u} value={u}>{u}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1.5">Stock status</label>
                        <select
                            value={form.stockStatus}
                            onChange={(e) => set("stockStatus", e.target.value)}
                            className="w-full px-3 py-2.5 text-sm rounded-lg border border-cream-200 focus:ring-2 focus:ring-forest-400/20 focus:border-forest-400 outline-none transition-colors bg-white"
                        >
                            {STATUS_OPTIONS.map((o) => (
                                <option key={o.value} value={o.value}>{o.label}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-cream-200 bg-cream-50 rounded-b-xl flex justify-end gap-3">
                <button
                    onClick={onClose}
                    disabled={loading}s
                    className="px-4 py-2 text-sm font-medium rounded-lg border border-cream-200 text-gray-700 hover:bg-cream-100 transition-colors disabled:opacity-50"
                >
                    Cancel
                </button>
                <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="btn-primary px-5 py-2 text-sm disabled:opacity-60"
                >
                    {loading ? "Saving..." : mode === "create" ? "Add ingredient" : "Save changes"}
                </button>
            </div>
        </Modal>
    );
}
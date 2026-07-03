import { useState, useEffect } from "react";
import Modal from "../../../modal/Modal.jsx";

const UNITS = ["g", "kg", "ml", "L", "pcs", "slice", "cup", "tbsp", "tsp", "oz", "lb"];

const defaultForm = {
    name: "",
    unit: "g",
    stockQuantity: 0,
    minStockLevel: 0,
    costPerUnit: 0,
    isActive: true,
    notes: "",
};

function NumberField({ label, value, onChange, prefix, suffix, step = 1, min = 0, error }) {
    return (
        <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">{label}</label>
            <div
                className={`flex items-center border rounded-lg overflow-hidden transition-colors focus-within:ring-2 ${
                    error
                        ? "border-red-300 focus-within:ring-red-100"
                        : "border-gray-200 focus-within:ring-[#1a4731]/20 focus-within:border-[#1a4731]"
                }`}
            >
                {prefix && (
                    <span className="px-2.5 py-2.5 text-sm text-gray-400 bg-gray-50 border-r border-gray-200">
            {prefix}
          </span>
                )}
                <input
                    type="number"
                    value={value}
                    min={min}
                    step={step}
                    onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
                    className="flex-1 px-3 py-2.5 text-sm outline-none bg-white"
                />
                {suffix && (
                    <span className="px-2.5 py-2.5 text-sm text-gray-400 bg-gray-50 border-l border-gray-200">
            {suffix}
          </span>
                )}
            </div>
            {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
        </div>
    );
}

export default function IngredientFormModal({
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
                        unit: initial.unit,
                        stockQuantity: initial.stockQuantity,
                        minStockLevel: initial.minStockLevel,
                        costPerUnit: initial.costPerUnit,
                        isActive: initial.isActive,
                        notes: initial.notes ?? "",
                    }
                    : defaultForm
            );
            setErrors({});
        }
    }, [open, initial]);

    function validate() {
        const errs = {};
        if (!form.name.trim()) errs.name = "Ingredient name is required.";
        if (form.costPerUnit < 0) errs.costPerUnit = "Cost cannot be negative.";
        if (form.minStockLevel < 0) errs.minStockLevel = "Min stock cannot be negative.";
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
            subtitle={mode === "edit" && initial?.name ? `Editing "${initial.name}"` : undefined}
            size="md"
        >
            <div className="px-6 py-5 space-y-5">
                {/* Name + Unit */}
                <div className="grid grid-cols-3 gap-3">
                    <div className="col-span-2">
                        <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                            Name <span className="text-red-400">*</span>
                        </label>
                        <input
                            type="text"
                            value={form.name}
                            onChange={(e) => set("name", e.target.value)}
                            placeholder="e.g. Salmon fillet"
                            className={`w-full px-3 py-2.5 text-sm rounded-lg border transition-colors outline-none focus:ring-2 ${
                                errors.name
                                    ? "border-red-300 focus:ring-red-100"
                                    : "border-gray-200 focus:ring-[#1a4731]/20 focus:border-[#1a4731]"
                            }`}
                        />
                        {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1.5">Unit</label>
                        <select
                            value={form.unit}
                            onChange={(e) => set("unit", e.target.value)}
                            className="w-full px-3 py-2.5 text-sm rounded-lg border border-gray-200 focus:ring-2 focus:ring-[#1a4731]/20 focus:border-[#1a4731] outline-none transition-colors bg-white"
                        >
                            {UNITS.map((u) => (
                                <option key={u} value={u}>{u}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Stock numbers */}
                <div className="grid grid-cols-2 gap-3">
                    <NumberField
                        label="Current stock"
                        value={form.stockQuantity}
                        onChange={(v) => set("stockQuantity", v)}
                        suffix={form.unit}
                        step={0.1}
                    />
                    <NumberField
                        label="Min stock level"
                        value={form.minStockLevel}
                        onChange={(v) => set("minStockLevel", v)}
                        suffix={form.unit}
                        step={0.1}
                        error={errors.minStockLevel}
                    />
                </div>

                {/* Cost */}
                <NumberField
                    label="Cost per unit"
                    value={form.costPerUnit}
                    onChange={(v) => set("costPerUnit", v)}
                    prefix="$"
                    step={0.01}
                    error={errors.costPerUnit}
                />

                {/* Notes */}
                <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                        Notes <span className="text-gray-400 font-normal">(optional)</span>
                    </label>
                    <textarea
                        value={form.notes}
                        onChange={(e) => set("notes", e.target.value)}
                        placeholder="Storage instructions, supplier notes..."
                        rows={2}
                        className="w-full px-3 py-2.5 text-sm rounded-lg border border-gray-200 focus:ring-2 focus:ring-[#1a4731]/20 focus:border-[#1a4731] outline-none transition-colors resize-none"
                    />
                </div>

                {/* Status toggle */}
                <div className="flex items-center justify-between py-3 border-t border-gray-100">
                    <div>
                        <p className="text-sm font-medium text-gray-700">Active</p>
                        <p className="text-xs text-gray-400 mt-0.5">
                            Inactive ingredients won't be used in recipes
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
                            ? "Add ingredient"
                            : "Save changes"}
                </button>
            </div>
        </Modal>
    );
}
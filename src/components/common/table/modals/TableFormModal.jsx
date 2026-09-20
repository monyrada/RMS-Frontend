import { useState, useEffect } from "react";
import Modal from "../../../../modal/Modal.jsx";

const STATUS_OPTIONS = [
    { value: "AVAILABLE", label: "Available" },
    { value: "OCCUPIED",  label: "Occupied" },
    { value: "RESERVED",  label: "Reserved" },
    { value: "CLEANING",  label: "Cleaning" },
    { value: "INACTIVE",  label: "Inactive" },
];

const defaultForm = {
    tableNumber: "",
    capacity: "",
    location: "",
    status: "AVAILABLE",
    isActive: true,
    currentGuestName: "",
};

export default function TableFormModal({
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
                        tableNumber: initial.tableNumber ?? "",
                        capacity: initial.capacity ?? "",
                        location: initial.location ?? "",
                        status: initial.status ?? "AVAILABLE",
                        isActive: initial.isActive ?? true,
                        currentGuestName: initial.currentGuestName ?? "",
                    }
                    : defaultForm
            );
            setErrors({});
        }
    }, [open, initial]);

    function validate() {
        const errs = {};
        if (!form.tableNumber.trim()) errs.tableNumber = "Table number is required.";

        if (!form.location.trim()) errs.location = "Location is required.";

        const capacity = Number(form.capacity);
        if (!form.capacity && form.capacity !== 0) errs.capacity = "Capacity is required.";
        else if (!Number.isInteger(capacity) || capacity < 1) errs.capacity = "Capacity must be a whole number of 1 or more.";

        return errs;
    }

    async function handleSubmit() {
        const errs = validate();
        if (Object.keys(errs).length > 0) { setErrors(errs); return; }
        setLoading(true);
        try {
            await onSubmit({
                ...form,
                tableNumber: form.tableNumber.trim(),
                location: form.location.trim(),
                capacity: Number(form.capacity),
                currentGuestName: form.currentGuestName.trim() || undefined,
            });
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
            title={mode === "create" ? "Add table" : "Edit table"}
            subtitle={mode === "edit" && initial?.tableNumber ? `Editing "${initial.tableNumber}"` : undefined}
            size="md"
        >
            <div className="px-6 py-5 space-y-5">
                {/* Table number + Capacity */}
                <div className="grid grid-cols-3 gap-3">
                    <div className="col-span-2">
                        <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                            Table number <span className="text-red-400">*</span>
                        </label>
                        <input
                            type="text"
                            value={form.tableNumber}
                            onChange={(e) => set("tableNumber", e.target.value)}
                            placeholder="e.g. T-01"
                            className={`w-full px-3 py-2.5 text-sm rounded-lg border transition-colors outline-none focus:ring-2 ${
                                errors.tableNumber
                                    ? "border-red-300 focus:ring-red-100"
                                    : "border-gray-200 focus:ring-[#1a4731]/20 focus:border-[#1a4731]"
                            }`}
                        />
                        {errors.tableNumber && <p className="text-xs text-red-500 mt-1">{errors.tableNumber}</p>}
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                            Capacity <span className="text-red-400">*</span>
                        </label>
                        <input
                            type="number"
                            min={1}
                            value={form.capacity}
                            onChange={(e) => set("capacity", e.target.value)}
                            placeholder="4"
                            className={`w-full px-3 py-2.5 text-sm rounded-lg border transition-colors outline-none focus:ring-2 ${
                                errors.capacity
                                    ? "border-red-300 focus:ring-red-100"
                                    : "border-gray-200 focus:ring-[#1a4731]/20 focus:border-[#1a4731]"
                            }`}
                        />
                        {errors.capacity && <p className="text-xs text-red-500 mt-1">{errors.capacity}</p>}
                    </div>
                </div>

                {/* Location */}
                <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                        Location <span className="text-red-400">*</span>
                    </label>
                    <input
                        type="text"
                        value={form.location}
                        onChange={(e) => set("location", e.target.value)}
                        placeholder="e.g. Main hall, Patio, 2nd floor"
                        className={`w-full px-3 py-2.5 text-sm rounded-lg border transition-colors outline-none focus:ring-2 ${
                            errors.location
                                ? "border-red-300 focus:ring-red-100"
                                : "border-gray-200 focus:ring-[#1a4731]/20 focus:border-[#1a4731]"
                        }`}
                    />
                    {errors.location && <p className="text-xs text-red-500 mt-1">{errors.location}</p>}
                </div>

                {/* Status */}
                <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">Status</label>
                    <select
                        value={form.status}
                        onChange={(e) => set("status", e.target.value)}
                        className="w-full px-3 py-2.5 text-sm rounded-lg border border-gray-200 focus:ring-2 focus:ring-[#1a4731]/20 focus:border-[#1a4731] outline-none transition-colors bg-white"
                    >
                        {STATUS_OPTIONS.map((o) => (
                            <option key={o.value} value={o.value}>{o.label}</option>
                        ))}
                    </select>
                </div>

                {/* Current guest name — relevant when the table is occupied */}
                {form.status === "OCCUPIED" && (
                    <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                            Guest name <span className="text-gray-400 font-normal">(optional)</span>
                        </label>
                        <input
                            type="text"
                            value={form.currentGuestName}
                            onChange={(e) => set("currentGuestName", e.target.value)}
                            placeholder="e.g. Sokha"
                            className="w-full px-3 py-2.5 text-sm rounded-lg border border-gray-200 focus:ring-2 focus:ring-[#1a4731]/20 focus:border-[#1a4731] outline-none transition-colors"
                        />
                    </div>
                )}

                {/* Active toggle */}
                <div className="flex items-center justify-between py-3 border-t border-gray-100">
                    <div>
                        <p className="text-sm font-medium text-gray-700">Active</p>
                        <p className="text-xs text-gray-400 mt-0.5">
                            Inactive tables won't be available for QR ordering
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
                            ? "Add table"
                            : "Save changes"}
                </button>
            </div>
        </Modal>
    );
}

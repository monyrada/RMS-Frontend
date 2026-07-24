import { useState, useEffect } from "react";
import Modal from "../../../../modal/Modal.jsx";

const defaultForm = {
    code: "",
    name: "",
    nameKh: "",
    description: "",
    status: true,
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
                        code: initial.code ?? "",
                        name: initial.name ?? "",
                        nameKh: initial.nameKh ?? "",
                        description: initial.description ?? "",
                        status: initial.status ?? true,
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

        if (!form.code.trim()) errs.code = "Code is required.";
        else if (!/^[A-Z0-9_-]+$/i.test(form.code.trim())) {
            errs.code = "Code can only contain letters, numbers, - and _.";
        }

        return errs;
    }

    async function handleSubmit() {
        const errs = validate();
        if (Object.keys(errs).length > 0) { setErrors(errs); return; }
        setLoading(true);
        try {
            await onSubmit({ ...form, code: form.code.trim().toUpperCase() });
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
                {/* Name + Code */}
                <div className="grid grid-cols-3 gap-3">
                    <div className="col-span-2">
                        <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                            Name <span className="text-red-400">*</span>
                        </label>
                        <input
                            type="text"
                            value={form.name}
                            onChange={(e) => set("name", e.target.value)}
                            placeholder="e.g. Appetizers"
                            className={`w-full px-3 py-2.5 text-sm rounded-lg border transition-colors outline-none focus:ring-2 ${
                                errors.name
                                    ? "border-red-300 focus:ring-red-100"
                                    : "border-gray-200 focus:ring-[#1a4731]/20 focus:border-[#1a4731]"
                            }`}
                        />
                        {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                            Code <span className="text-red-400">*</span>
                        </label>
                        <input
                            type="text"
                            value={form.code}
                            onChange={(e) => set("code", e.target.value)}
                            placeholder="APP"
                            className={`w-full px-3 py-2.5 text-sm rounded-lg border uppercase transition-colors outline-none focus:ring-2 ${
                                errors.code
                                    ? "border-red-300 focus:ring-red-100"
                                    : "border-gray-200 focus:ring-[#1a4731]/20 focus:border-[#1a4731]"
                            }`}
                        />
                        {errors.code && <p className="text-xs text-red-500 mt-1">{errors.code}</p>}
                    </div>
                </div>

                {/* Khmer name */}
                <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                        Khmer name <span className="text-gray-400 font-normal">(optional)</span>
                    </label>
                    <input
                        type="text"
                        value={form.nameKh}
                        onChange={(e) => set("nameKh", e.target.value)}
                        placeholder="ម្ហូបបើកចំណង់"
                        className="w-full px-3 py-2.5 text-sm rounded-lg border border-gray-200 focus:ring-2 focus:ring-[#1a4731]/20 focus:border-[#1a4731] outline-none transition-colors"
                    />
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
                        aria-checked={form.status}
                        onClick={() => set("status", !form.status)}
                        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                            form.status ? "bg-[#1a4731]" : "bg-gray-200"
                        }`}
                    >
            <span
                className={`inline-block h-3.5 w-3.5 rounded-full bg-white shadow transition-transform ${
                    form.status ? "translate-x-[18px]" : "translate-x-[2px]"
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
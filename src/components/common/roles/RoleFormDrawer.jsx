import { useEffect, useState } from "react";
import { Check, ShieldCheck } from "lucide-react";
import Modal from "../../../modal/Modal.jsx";

/* Constants */
const EMPTY_FORM = {
    name:        "",
    description: "",
    enabled:     true,
};

/* Utility */
/** Returns Tailwind classes for form inputs, with red styling on error. */
function inputCls(error, disabled) {
    return `w-full px-3 py-2 rounded-xl text-sm border outline-none transition-colors bg-cream-50
            focus:bg-white focus:border-forest-400 ${
        error ? "border-red-300 bg-red-50" : "border-cream-200"
    } ${disabled ? "bg-cream-100 text-gray-400 cursor-not-allowed" : ""}`;
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

/** Enabled/Disabled toggle row — green tint when on, neutral when off. */
function StatusToggle({ value, onToggle }) {
    return (
        <div className={`flex items-center justify-between px-3 py-3 rounded-xl border transition-all ${
            value ? "bg-emerald-50/60 border-emerald-200" : "bg-cream-50 border-cream-200"
        }`}>
            <div className="flex items-center gap-2.5">
                <span className={`w-2 h-2 rounded-full shrink-0 ${
                    value ? "bg-emerald-500" : "bg-gray-300"
                }`} />
                <div>
                    <p className={`text-sm font-medium ${value ? "text-forest-800" : "text-gray-600"}`}>
                        {value ? "Enabled" : "Disabled"}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                        {value
                            ? "Role can be assigned to users"
                            : "Role is hidden from assignment"}
                    </p>
                </div>
            </div>

            <div className="flex items-center gap-2.5 shrink-0">
                <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${
                    value ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-500"
                }`}>
                    {value ? "On" : "Off"}
                </span>

                <button
                    type="button"
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

/** Circular icon preview — static placeholder in place of AvatarUpload (roles have no image). */
function RoleIconPreview() {
    return (
        <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-cream-100 border border-cream-200 flex items-center justify-center shrink-0">
                <ShieldCheck size={22} className="text-gray-300" />
            </div>
            <p className="text-xs text-gray-400">
                Roles are identified by name only — no photo needed.
            </p>
        </div>
    );
}

/* Validation — mirrors UserFormDrawer's validate() pattern */
function validate(form) {
    const errors = {};
    if (!form.name.trim()) errors.name = "Role name is required";
    if (form.name.trim().length > 50) errors.name = "Role name must be 50 characters or fewer";

    if (form.description && form.description.length > 255) {
        errors.description = "Description must be 255 characters or fewer";
    }

    return errors;
}

/* Main Component */
export default function RoleFormDrawer({ open, onClose, onSubmit, role }) {
    const isEdit = !!role;

    const [form,   setForm]   = useState(EMPTY_FORM);
    const [errors, setErrors] = useState({});
    const [saving, setSaving] = useState(false);

    /* Populate form fields when the modal opens.
       Resets to empty state when adding a new role. */
    useEffect(() => {
        if (!open) return;
        setForm(role ? {
            name:        role.name        ?? "",
            description: role.description ?? "",
            enabled:     role.enabled     ?? true,
        } : EMPTY_FORM);
        setErrors({});
    }, [open, role]);

    /* Generic field change handler — clears the field's error on change. */
    const setField = (field) => (e) => {
        const value = e.target.value;
        setForm((prev)   => ({ ...prev, [field]: value }));
        setErrors((prev) => ({ ...prev, [field]: undefined }));
    };

    /* Toggle enabled status between true / false. */
    const toggleEnabled = () =>
        setForm((prev) => ({ ...prev, enabled: !prev.enabled }));

    /* Run validation, then call onSubmit with the cleaned form data. */
    const handleSubmit = async () => {
        const errs = validate(form);
        if (Object.keys(errs).length) { setErrors(errs); return; }

        setSaving(true);
        try {
            await onSubmit({ ...form });
        } finally {
            setSaving(false);
        }
    };

    /* ── Render ── */
    return (
        <Modal
            open={open}
            onClose={onClose}
            title={isEdit ? "Edit role" : "Add role"}
            subtitle={isEdit ? `Editing "${role?.name}"` : "Fill in the details below"}
            size="lg"
        >
            {/* ── Body ── */}
            <div className="p-5 space-y-4 overflow-y-auto max-h-[60vh]">

                <RoleIconPreview />

                <Divider label="Details" />

                <Field label="Role name" required error={errors.name}>
                    <input
                        type="text"
                        value={form.name}
                        onChange={setField("name")}
                        placeholder="e.g. MANAGER"
                        className={inputCls(errors.name)}
                    />
                </Field>

                <Field label="Description" error={errors.description}>
                    <textarea
                        value={form.description}
                        onChange={setField("description")}
                        placeholder="What this role is for…"
                        rows={3}
                        className={inputCls(errors.description) + " resize-none"}
                    />
                </Field>

                <Divider label="Access" />

                {/* Enabled toggle */}
                <StatusToggle value={form.enabled} onToggle={toggleEnabled} />

            </div>

            {/* ── Footer ── */}
            <div className="px-5 py-4 border-t border-cream-200 bg-cream-50/50 flex items-center justify-between">
                <button
                    type="button"
                    onClick={onClose}
                    disabled={saving}
                    className="px-4 py-2 rounded-xl text-sm text-gray-500 border border-cream-200 hover:bg-cream-100 transition-colors disabled:opacity-50"
                >
                    Cancel
                </button>
                <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={saving}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-white text-sm font-medium transition-colors disabled:opacity-60"
                    style={{ backgroundColor: "#1a4731" }}
                    onMouseOver={(e) => !saving && (e.currentTarget.style.backgroundColor = "#153d29")}
                    onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "#1a4731")}
                >
                    <Check size={13} />
                    {saving ? "Saving…" : isEdit ? "Save changes" : "Create role"}
                </button>
            </div>
        </Modal>
    );
}
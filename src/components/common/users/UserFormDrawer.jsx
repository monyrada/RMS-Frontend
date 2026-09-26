import { useEffect, useState } from "react";
import { X, Check, Upload, User as UserIcon } from "lucide-react";
import Modal from "../../../modal/Modal.jsx";

/* Constants */
const GENDER_OPTIONS = ["MALE", "FEMALE"];

const EMPTY_FORM = {
    username:     "",
    firstname:    "",
    lastname:     "",
    email:        "",
    phoneNumber:  "",
    gender:       "MALE",
    dateOfBirth:  "",
    status:       true,
    profileImage: "",
    password:     "", // only used on create
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

/** Active/Inactive toggle row — green tint when on, neutral when off. */
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
                        {value ? "Active" : "Inactive"}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                        {value
                            ? "User can sign in and use the system"
                            : "User is blocked from signing in"}
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

/** Circular avatar preview (with remove button) or upload drop zone. */
function AvatarUpload({ imageUrl, onChange, onClear }) {
    const [broken, setBroken] = useState(false);

    // Re-attempt loading whenever the URL itself changes (new upload, different user, etc.)
    useEffect(() => setBroken(false), [imageUrl]);

    const showImage = imageUrl && !broken;

    return (
        <div className="flex items-center gap-4">
            <div className="relative w-16 h-16 shrink-0">
                <div className="w-16 h-16 rounded-full bg-cream-100 border border-cream-200 flex items-center justify-center overflow-hidden">
                    {showImage ? (
                        <img
                            src={imageUrl}
                            alt=""
                            className="w-full h-full object-cover"
                            onError={() => setBroken(true)}
                        />
                    ) : (
                        <UserIcon size={22} className="text-gray-300" />
                    )}
                </div>
                {showImage && (
                    <button
                        type="button"
                        onClick={onClear}
                        className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center bg-white rounded-full border border-cream-200 text-gray-400 shadow-sm hover:text-red-500 hover:border-red-200 transition-colors"
                        title="Remove photo"
                    >
                        <X size={11} />
                    </button>
                )}
            </div>

            <label className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm border border-dashed border-cream-300 bg-cream-50 cursor-pointer hover:border-forest-400 hover:bg-forest-50/30 transition-colors">
                <Upload size={14} className="text-gray-400" />
                <span className="text-gray-500">
                    <span className="text-forest-700 font-medium">Upload photo</span> · PNG/JPG up to 2MB
                </span>
                <input type="file" accept="image/*" className="hidden" onChange={onChange} />
            </label>
        </div>
    );
}

/* Validation — mirrors ItemFormDrawer's validate() pattern */
function validate(form, isEdit) {
    const errors = {};
    if (!form.username.trim())  errors.username  = "Username is required";
    if (!form.firstname.trim()) errors.firstname = "First name is required";
    if (!form.lastname.trim())  errors.lastname  = "Last name is required";

    if (!form.email.trim()) {
        errors.email = "Email is required";
    } else if (!/^\S+@\S+\.\S+$/.test(form.email)) {
        errors.email = "Enter a valid email address";
    }

    if (form.phoneNumber && !/^\+?[0-9\s-]{6,}$/.test(form.phoneNumber)) {
        errors.phoneNumber = "Enter a valid phone number";
    }

    if (!isEdit && form.password.length < 8) {
        errors.password = "Password must be at least 8 characters";
    }

    return errors;
}

/* Main Component */
export default function UserFormDrawer({ open, onClose, onSubmit, user }) {
    const isEdit = !!user;

    const [form,   setForm]   = useState(EMPTY_FORM);
    const [errors, setErrors] = useState({});
    const [saving, setSaving] = useState(false);

    /* Populate form fields when the modal opens.
       Resets to empty state when adding a new user. */
    useEffect(() => {
        if (!open) return;
        setForm(user ? {
            username:     user.username     ?? "",
            firstname:    user.firstname    ?? "",
            lastname:     user.lastname     ?? "",
            email:        user.email        ?? "",
            phoneNumber:  user.phoneNumber  ?? "",
            gender:       user.gender       ?? "MALE",
            dateOfBirth:  user.dateOfBirth  ?? "",
            status:       user.status ? user.status === "ACTIVE" : true,
            profileImage: user.profileImage ?? "",
            password:     "",
        } : EMPTY_FORM);
        setErrors({});
    }, [open, user]);

    /* Generic field change handler — clears the field's error on change. */
    const setField = (field) => (e) => {
        const value = e.target.value;
        setForm((prev)   => ({ ...prev, [field]: value }));
        setErrors((prev) => ({ ...prev, [field]: undefined }));
    };

    /* Toggle active status between true / false. */
    const toggleStatus = () =>
        setForm((prev) => ({ ...prev, status: !prev.status }));

    /* Clear the selected avatar image from the form. */
    const clearImage = () =>
        setForm((prev) => ({ ...prev, profileImage: "" }));

    /* Read the selected file as a data URL for preview.
       NOTE: wire this up to the real upload endpoint before going to production. */
    const handleImageChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => setForm((prev) => ({ ...prev, profileImage: reader.result }));
        reader.readAsDataURL(file);
    };

    /* Run validation, then call onSubmit with the cleaned form data. */
    const handleSubmit = async () => {
        const errs = validate(form, isEdit);
        if (Object.keys(errs).length) { setErrors(errs); return; }

        setSaving(true);
        try {
            const payload = {
                ...form,
                status: form.status ? "ACTIVE" : "INACTIVE",
            };
            if (isEdit) delete payload.password; // never send blank password on edit
            await onSubmit(payload);
        } finally {
            setSaving(false);
        }
    };

    /* ── Render ── */
    return (
        <Modal
            open={open}
            onClose={onClose}
            title={isEdit ? "Edit user" : "Add user"}
            subtitle={isEdit ? `Editing "${user?.username}"` : "Fill in the details below"}
            size="lg"
        >
            {/* ── Body ── */}
            <div className="p-5 space-y-4 overflow-y-auto max-h-[60vh]">

                <AvatarUpload
                    imageUrl={form.profileImage}
                    onChange={handleImageChange}
                    onClear={clearImage}
                />

                <Divider label="Account" />

                {/* Username + Email */}
                <div className="grid grid-cols-2 gap-3">
                    <Field label="Username" required error={errors.username}>
                        <input
                            type="text"
                            value={form.username}
                            onChange={setField("username")}
                            disabled={isEdit} // usernames are immutable after creation
                            placeholder="username"
                            className={inputCls(errors.username, isEdit)}
                        />
                    </Field>
                    <Field label="Email" required error={errors.email}>
                        <input
                            type="email"
                            value={form.email}
                            onChange={setField("email")}
                            placeholder="name@example.com"
                            className={inputCls(errors.email)}
                        />
                    </Field>
                </div>

                {!isEdit && (
                    <Field label="Temporary password" required error={errors.password}>
                        <input
                            type="password"
                            value={form.password}
                            onChange={setField("password")}
                            placeholder="Min. 8 characters"
                            className={inputCls(errors.password)}
                        />
                    </Field>
                )}

                <Divider label="Profile" />

                {/* First + Last name */}
                <div className="grid grid-cols-2 gap-3">
                    <Field label="First name" required error={errors.firstname}>
                        <input
                            type="text"
                            value={form.firstname}
                            onChange={setField("firstname")}
                            className={inputCls(errors.firstname)}
                        />
                    </Field>
                    <Field label="Last name" required error={errors.lastname}>
                        <input
                            type="text"
                            value={form.lastname}
                            onChange={setField("lastname")}
                            className={inputCls(errors.lastname)}
                        />
                    </Field>
                </div>

                {/* Phone + DOB */}
                <div className="grid grid-cols-2 gap-3">
                    <Field label="Phone number" error={errors.phoneNumber}>
                        <input
                            type="text"
                            value={form.phoneNumber}
                            onChange={setField("phoneNumber")}
                            placeholder="+855 10 987 654"
                            className={inputCls(errors.phoneNumber)}
                        />
                    </Field>
                    <Field label="Date of birth">
                        <input
                            type="date"
                            value={form.dateOfBirth}
                            onChange={setField("dateOfBirth")}
                            className={inputCls()}
                        />
                    </Field>
                </div>

                {/* Gender */}
                <Field label="Gender">
                    <select
                        value={form.gender}
                        onChange={setField("gender")}
                        className={inputCls()}
                    >
                        {GENDER_OPTIONS.map((g) => (
                            <option key={g} value={g}>{g.charAt(0) + g.slice(1).toLowerCase()}</option>
                        ))}
                    </select>
                </Field>

                <Divider label="Access" />

                {/* Status toggle */}
                <StatusToggle value={form.status} onToggle={toggleStatus} />

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
                    {saving ? "Saving…" : isEdit ? "Save changes" : "Create user"}
                </button>
            </div>
        </Modal>
    );
}
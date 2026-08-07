import { useState } from "react";
import { X, Lock, Eye, EyeOff, Loader2 } from "lucide-react";
import { changePassword } from "../../api/user/user.api.additions.js";
import { toast } from "react-hot-toast"; // swap for whatever toast lib you use elsewhere

export default function ChangePasswordModal({ userId, isOpen, onClose }) {
    const [form, setForm] = useState({ oldPassword: "", newPassword: "", confirmPassword: "" });
    const [visible, setVisible] = useState({ old: false, new: false, confirm: false });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const validate = () => {
        const e = {};
        if (!form.oldPassword) e.oldPassword = "Current password is required";
        if (!form.newPassword) e.newPassword = "New password is required";
        else if (form.newPassword.length < 8) e.newPassword = "Must be at least 8 characters";
        if (form.newPassword !== form.confirmPassword) e.confirmPassword = "Passwords do not match";
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleSubmit = async (ev) => {
        ev.preventDefault();
        if (!validate()) return;

        setLoading(true);
        try {
            await changePassword(userId, {
                oldPassword: form.oldPassword,
                newPassword: form.newPassword,
            });
            toast.success("Password updated successfully");
            setForm({ oldPassword: "", newPassword: "", confirmPassword: "" });
            setErrors({});
            onClose();
        } catch (err) {
            const message = err?.response?.data?.message || "Failed to update password";
            setErrors({ submit: message });
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setForm({ oldPassword: "", newPassword: "", confirmPassword: "" });
        setErrors({});
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-forest-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-cream-200">
                    <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-forest-800 flex items-center justify-center">
                            <Lock size={14} className="text-white" />
                        </div>
                        <h2 className="text-base font-semibold text-forest-900">Change Password</h2>
                    </div>
                    <button
                        onClick={handleClose}
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:bg-cream-100 hover:text-forest-900 transition-colors"
                        aria-label="Close"
                    >
                        <X size={16} />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
                    <PasswordField
                        label="Current Password"
                        value={form.oldPassword}
                        onChange={(v) => setForm({ ...form, oldPassword: v })}
                        error={errors.oldPassword}
                        visible={visible.old}
                        onToggleVisible={() => setVisible({ ...visible, old: !visible.old })}
                    />
                    <PasswordField
                        label="New Password"
                        value={form.newPassword}
                        onChange={(v) => setForm({ ...form, newPassword: v })}
                        error={errors.newPassword}
                        visible={visible.new}
                        onToggleVisible={() => setVisible({ ...visible, new: !visible.new })}
                    />
                    <PasswordField
                        label="Confirm New Password"
                        value={form.confirmPassword}
                        onChange={(v) => setForm({ ...form, confirmPassword: v })}
                        error={errors.confirmPassword}
                        visible={visible.confirm}
                        onToggleVisible={() => setVisible({ ...visible, confirm: !visible.confirm })}
                    />

                    {errors.submit && (
                        <div className="bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                            <p className="text-xs text-red-600">{errors.submit}</p>
                        </div>
                    )}

                    <div className="flex justify-end gap-2 pt-2">
                        <button
                            type="button"
                            onClick={handleClose}
                            className="px-4 py-2 rounded-xl border border-cream-200 text-sm font-medium text-gray-600 hover:bg-cream-50 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-forest-800 text-white text-sm font-medium hover:bg-forest-700 disabled:opacity-50 transition-colors"
                        >
                            {loading && <Loader2 size={14} className="animate-spin" />}
                            {loading ? "Saving..." : "Save Changes"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

function PasswordField({ label, value, onChange, error, visible, onToggleVisible }) {
    return (
        <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">{label}</label>
            <div className="relative">
                <input
                    type={visible ? "text" : "password"}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className={`w-full border rounded-xl pl-3 pr-10 py-2.5 text-sm text-forest-900 bg-cream-50/50 focus:outline-none focus:ring-2 focus:ring-forest-800/20 focus:border-forest-800 transition-colors ${
                        error ? "border-red-300" : "border-cream-200"
                    }`}
                />
                <button
                    type="button"
                    onClick={onToggleVisible}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-forest-800 transition-colors"
                    tabIndex={-1}
                >
                    {visible ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
            </div>
            {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
        </div>
    );
}
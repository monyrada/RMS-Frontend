import { ShieldCheck, FileText, Clock, Info, Pencil } from "lucide-react";
import Modal from "../../../modal/Modal.jsx";

/* ── Helpers ── */
function formatDate(raw, withTime = false) {
    if (!raw) return null;
    const d = new Date(raw);
    if (isNaN(d)) return raw;
    return withTime
        ? d.toLocaleString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })
        : d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

function Badge({ enabled }) {
    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
            enabled ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-600"
        }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${enabled ? "bg-emerald-500" : "bg-red-500"}`} />
            {enabled ? "Enabled" : "Disabled"}
        </span>
    );
}

function InfoCard({ icon, label, value }) {
    return (
        <div className="bg-cream-50 rounded-xl p-3.5">
            <div className="flex items-center gap-1.5 text-gray-400 mb-1.5">
                {icon}
                <span className="text-[11px] uppercase tracking-wider font-medium">{label}</span>
            </div>
            <div className="text-sm font-medium text-gray-900">{value || "—"}</div>
        </div>
    );
}

/* Circular icon badge — static, since roles have no photo (in place of Avatar). */
function RoleBadgeIcon() {
    return (
        <div className="w-16 h-16 rounded-full bg-forest-900 text-white flex items-center justify-center shrink-0">
            <ShieldCheck size={24} />
        </div>
    );
}

/* ── Component ── */

export default function RoleDetailModal({ open, onClose, role, onEdit }) {
    return (
        <Modal
            open={open}
            onClose={onClose}
            title={role ? role.name : ""}
            subtitle={role ? "Role details" : ""}
            size="lg"
        >
            {role && (
                <>
                    <div className="p-5 space-y-4">

                        {/* ── Icon + Status ── */}
                        <div className="flex items-center justify-between">
                            <RoleBadgeIcon />
                            <Badge enabled={role.enabled} />
                        </div>

                        {/* ── Description ── */}
                        <InfoCard
                            icon={<FileText size={13} />}
                            label="Description"
                            value={role.description}
                        />

                        {/* ── Meta ── */}
                        {(role.createdAt || role.updatedAt) && (
                            <div className="flex flex-col gap-1.5 pt-3 border-t border-cream-200">
                                {role.createdAt && (
                                    <div className="flex items-center gap-2 text-xs text-gray-400">
                                        <Clock size={12} />
                                        Created: {formatDate(role.createdAt)}
                                    </div>
                                )}
                                {role.updatedAt && (
                                    <div className="flex items-center gap-2 text-xs text-gray-400">
                                        <Info size={12} />
                                        Updated: {formatDate(role.updatedAt)}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* ── Footer ── */}
                    {onEdit && (
                        <div className="px-5 py-4 border-t border-cream-200 bg-cream-50/50 flex items-center justify-between">
                            <button
                                onClick={onClose}
                                className="px-4 py-2 rounded-xl text-sm text-gray-500 border border-cream-200 hover:bg-cream-100 transition-colors"
                            >
                                Close
                            </button>
                            <button
                                onClick={() => { onClose(); onEdit(role); }}
                                className="flex items-center gap-2 px-4 py-2 rounded-xl text-white text-sm font-medium transition-colors"
                                style={{ backgroundColor: "#1a4731" }}
                                onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "#153d29")}
                                onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "#1a4731")}
                            >
                                <Pencil size={13} />
                                Edit role
                            </button>
                        </div>
                    )}
                </>
            )}
        </Modal>
    );
}
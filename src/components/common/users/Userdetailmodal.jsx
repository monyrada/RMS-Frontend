import { useState } from "react";
import { Mail, Phone, Calendar, Clock, Info, Pencil, VenetianMask } from "lucide-react";
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

const fullName = (u) => `${u?.firstname ?? ""} ${u?.lastname ?? ""}`.trim() || u?.username;

const initials = (u) =>
    `${(u?.firstname?.[0] ?? "")}${(u?.lastname?.[0] ?? "")}`.toUpperCase() || u?.username?.[0]?.toUpperCase() || "?";

function Badge({ status }) {
    const active = status === "ACTIVE";
    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
            active ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-600"
        }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${active ? "bg-emerald-500" : "bg-red-500"}`} />
            {active ? "Active" : "Inactive"}
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

/* Circular avatar with graceful fallback to initials — a truthy
   profileImage can still 404 (placeholder/seed URLs), so onError has
   to demote it, not just a null-check up front. */
function Avatar({ user }) {
    const [imgFailed, setImgFailed] = useState(false);
    const showImage = user?.profileImage && !imgFailed;

    return (
        <div className="w-16 h-16 rounded-full bg-forest-900 text-white flex items-center justify-center text-lg font-semibold overflow-hidden shrink-0">
            {showImage ? (
                <img
                    src={user.profileImage}
                    alt=""
                    onError={() => setImgFailed(true)}
                    className="w-full h-full object-cover"
                />
            ) : (
                initials(user)
            )}
        </div>
    );
}

/* ── Component ── */

export default function UserDetailModal({ open, onClose, user, onEdit }) {
    return (
        <Modal
            open={open}
            onClose={onClose}
            title={user ? fullName(user) : ""}
            subtitle={user ? `@${user.username}` : ""}
            size="lg"
        >
            {user && (
                <>
                    <div className="p-5 space-y-4">

                        {/* ── Avatar + Status ── */}
                        <div className="flex items-center justify-between">
                            <Avatar user={user} />
                            <Badge status={user.status} />
                        </div>

                        {/* ── Info Cards ── */}
                        <div className="grid grid-cols-2 gap-2.5">
                            <InfoCard
                                icon={<Mail size={13} />}
                                label="Email"
                                value={user.email}
                            />
                            <InfoCard
                                icon={<Phone size={13} />}
                                label="Phone"
                                value={user.phoneNumber}
                            />
                            <InfoCard
                                icon={<VenetianMask size={13} />}
                                label="Gender"
                                value={user.gender ? user.gender.charAt(0) + user.gender.slice(1).toLowerCase() : null}
                            />
                            <InfoCard
                                icon={<Calendar size={13} />}
                                label="Date of Birth"
                                value={formatDate(user.dateOfBirth)}
                            />
                        </div>

                        {/* ── Last login ── */}
                        <InfoCard
                            icon={<Clock size={13} />}
                            label="Last Login"
                            value={user.lastLoginAt ? formatDate(user.lastLoginAt, true) : "Never"}
                        />

                        {/* ── Meta ── */}
                        {(user.createdAt || user.updatedAt) && (
                            <div className="flex flex-col gap-1.5 pt-3 border-t border-cream-200">
                                {user.createdAt && (
                                    <div className="flex items-center gap-2 text-xs text-gray-400">
                                        <Clock size={12} />
                                        Created: {formatDate(user.createdAt)}
                                    </div>
                                )}
                                {user.updatedAt && (
                                    <div className="flex items-center gap-2 text-xs text-gray-400">
                                        <Info size={12} />
                                        Updated: {formatDate(user.updatedAt)}
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
                                onClick={() => { onClose(); onEdit(user); }}
                                className="flex items-center gap-2 px-4 py-2 rounded-xl text-white text-sm font-medium transition-colors"
                                style={{ backgroundColor: "#1a4731" }}
                                onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "#153d29")}
                                onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "#1a4731")}
                            >
                                <Pencil size={13} />
                                Edit user
                            </button>
                        </div>
                    )}
                </>
            )}
        </Modal>
    );
}
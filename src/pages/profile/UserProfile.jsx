import { useEffect, useState } from "react";
import { getCurrentUser } from "../../api/user/user.api.additions.js";
import ChangePasswordModal from "../../components/profile/ChangePasswordModal.jsx";

import {
    User,
    Mail,
    Shield,
    KeyRound,
    ChevronRight,
    AtSign,
    Phone,
    UserRound,
    VenusAndMars, BadgeCheck
} from "lucide-react";


export default function UserProfile() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showPasswordModal, setShowPasswordModal] = useState(false);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const response = await getCurrentUser();
                setUser(response.data);
            } catch (error) {
                console.error("Failed to load user profile:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchUser();
    }, []);

    // Combine first name and last name
    const fullName = [
        user?.firstName ?? user?.firstname,
        user?.lastName ?? user?.lastname,
    ]
        .filter(Boolean)
        .join(" ");

    // Generate initials
    const initials =
        fullName
            ?.split(" ")
            .filter(Boolean)
            .map((word) => word.charAt(0))
            .join("")
            .toUpperCase()
            .slice(0, 2) || "?";

    if (loading) {
        return (
            <div className="max-w-2xl mx-auto p-6">
                <div className="h-6 w-32 bg-cream-100 rounded-lg animate-pulse mb-6" />
                <div className="h-40 bg-cream-100 rounded-2xl animate-pulse" />
            </div>
        );
    }

    if (!user) {
        return (
            <div className="max-w-2xl mx-auto p-6">
                <p className="text-sm text-gray-500">
                    Could not load profile.
                </p>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto p-6">
            <h1 className="text-xl font-semibold text-forest-900 mb-6">
                My Profile
            </h1>

            {/* Identity Card */}
            <div className="bg-white rounded-2xl border border-cream-200 p-6 flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-forest-800 flex items-center justify-center text-white text-lg font-semibold shrink-0">
                    {initials}
                </div>

                <div className="min-w-0">
                    <p className="text-base font-semibold text-forest-900 truncate">
                        {fullName || "—"}
                    </p>
                    <p className="text-sm text-gray-400 truncate">
                        @{user.username}
                    </p>
                </div>

                <span className="ml-auto shrink-0 px-3 py-1 rounded-full bg-cream-50 border border-cream-200 text-xs font-medium text-forest-800 capitalize">
                    {user.role || "—"}
                </span>
            </div>

            {/* Account Details */}
            <div className="mt-4 bg-white rounded-2xl border border-cream-200 overflow-hidden">
                <div className="px-6 py-3 border-b border-cream-100">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                        Account Details
                    </p>
                </div>

                <ProfileRow
                    icon={<AtSign size={14} />}
                    label="Username"
                    value={user.username}
                />

                <ProfileRow
                    icon={<Mail size={14} />}
                    label="Email"
                    value={user.email}
                />

                <ProfileRow
                    icon={<BadgeCheck size={14} />}
                    label="Status"
                    value={
                        <span
                            className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium ${
                                user.status
                                    ? "bg-green-100 text-green-700"
                                    : "bg-red-100 text-red-700"
                            }`}
                        >
                    <span className={`h-2 w-2 rounded-full ${user.status ? "bg-green-500" : "bg-red-500"}`}/>{user.status ? "Active" : "Inactive"}</span>}
                />

                <ProfileRow
                    icon={<UserRound size={14} />}
                    label="Full Name"
                    value={fullName}
                />

                <ProfileRow
                    icon={<VenusAndMars size={14} />}
                    label="Gender"
                    value={user.gender}
                />

                <ProfileRow
                    icon={<Phone size={14} />}
                    label="Phone Number"
                    value={user.phoneNumber}
                />

                <ProfileRow
                    icon={<Shield size={14} />}
                    label="Role"
                    value={user.role}
                    last
                />
            </div>

            {/* Security */}
            <div className="mt-4 bg-white rounded-2xl border border-cream-200 overflow-hidden">
                <div className="px-6 py-3 border-b border-cream-100">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                        Security
                    </p>
                </div>

                <button
                    onClick={() => setShowPasswordModal(true)}
                    className="w-full flex items-center justify-between px-6 py-4 hover:bg-cream-50 transition-colors group"
                >
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-cream-50 border border-cream-200 flex items-center justify-center group-hover:bg-cream-100 transition-colors">
                            <KeyRound
                                size={15}
                                className="text-forest-800"
                            />
                        </div>

                        <div className="text-left">
                            <p className="text-sm font-medium text-forest-900">
                                Password
                            </p>
                            <p className="text-xs text-gray-400">
                                Keep your account secure
                            </p>
                        </div>
                    </div>

                    <ChevronRight
                        size={16}
                        className="text-gray-300 group-hover:text-forest-800 transition-colors"
                    />
                </button>
            </div>

            <ChangePasswordModal
                isOpen={showPasswordModal}
                onClose={() => setShowPasswordModal(false)}
            />
        </div>
    );
}

function ProfileRow({ icon, label, value, last = false }) {
    return (
        <div
            className={`flex items-center gap-3 px-6 py-3.5 ${
                last ? "" : "border-b border-cream-100"
            }`}
        >
            <span className="text-gray-300">{icon}</span>

            <span className="text-sm text-gray-500 w-24 shrink-0">
                {label}
            </span>

            <span className="text-sm font-medium text-forest-900 truncate">
                {value || "—"}
            </span>
        </div>
    );
}
import { Save, Store, Clock, Users, Globe, Bell, Shield, Printer } from "lucide-react";

const sections = [
  {
    icon: Store, title: "Restaurant Info", desc: "Basic details about your restaurant",
    fields: [
      { label: "Restaurant Name", placeholder: "The Green Table", type: "text", span: 2 },
      { label: "Address", placeholder: "123 Main St, Phnom Penh", type: "text", span: 2 },
      { label: "Phone", placeholder: "+855 23 456 789", type: "tel" },
      { label: "Email", placeholder: "info@greentable.com", type: "email" },
    ],
  },
  {
    icon: Clock, title: "Operating Hours", desc: "When is your restaurant open?",
    fields: [
      { label: "Opening Time", placeholder: "07:00", type: "time" },
      { label: "Closing Time", placeholder: "22:00", type: "time" },
      { label: "Last Order", placeholder: "21:30", type: "time" },
      { label: "Break Start", placeholder: "14:00", type: "time" },
    ],
  },
  {
    icon: Globe, title: "Locale & Currency", desc: "Regional settings",
    fields: [
      { label: "Currency Symbol", placeholder: "$", type: "text" },
      { label: "Currency Code", placeholder: "USD", type: "text" },
      { label: "Timezone", placeholder: "Asia/Phnom_Penh", type: "text" },
      { label: "Language", placeholder: "English", type: "text" },
    ],
  },
  {
    icon: Users, title: "Staff & Access", desc: "Manage roles and PIN codes",
    fields: [
      { label: "Admin PIN", placeholder: "••••", type: "password" },
      { label: "Manager PIN", placeholder: "••••", type: "password" },
      { label: "Max Tables", placeholder: "20", type: "number" },
      { label: "Service Charge %", placeholder: "10", type: "number" },
    ],
  },
];

const toggles = [
  { label: "Order Notifications", desc: "Get notified when new orders arrive", icon: Bell, on: true },
  { label: "Auto-print Receipts", desc: "Automatically print on order completion", icon: Printer, on: false },
  { label: "Two-factor Auth", desc: "Extra security for admin logins", icon: Shield, on: false },
];

export default function Settings() {
  return (
    <div className="max-w-3xl space-y-4 fade-in">
      {sections.map((sec) => (
        <div key={sec.title} className="card p-4 sm:p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-xl bg-forest-900 flex items-center justify-center shrink-0">
              <sec.icon size={15} className="text-forest-400" />
            </div>
            <div>
              <h3 className="font-semibold text-forest-900 text-sm sm:text-base">{sec.title}</h3>
              <p className="text-xs text-gray-400">{sec.desc}</p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {sec.fields.map((f) => (
              <div key={f.label} className={f.span === 2 ? "sm:col-span-2" : ""}>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">{f.label}</label>
                <input type={f.type} placeholder={f.placeholder} className="input" />
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Toggles */}
      <div className="card p-4 sm:p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 rounded-xl bg-forest-900 flex items-center justify-center shrink-0">
            <Bell size={15} className="text-forest-400" />
          </div>
          <div>
            <h3 className="font-semibold text-forest-900">Preferences</h3>
            <p className="text-xs text-gray-400">Toggle features on or off</p>
          </div>
        </div>
        <div className="space-y-3">
          {toggles.map((t) => (
            <div key={t.label} className="flex items-center justify-between py-2 border-b border-cream-100 last:border-0">
              <div className="flex items-center gap-3">
                <t.icon size={15} className="text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-forest-900">{t.label}</p>
                  <p className="text-xs text-gray-400">{t.desc}</p>
                </div>
              </div>
              <button className={`relative w-11 h-6 rounded-full transition-colors ${t.on ? "bg-forest-600" : "bg-gray-200"}`}>
                <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${t.on ? "translate-x-5" : "translate-x-0.5"}`}></span>
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end pb-6">
        <button className="btn-primary flex items-center gap-2 px-6 py-3 text-sm font-bold rounded-xl">
          <Save size={15} /> Save Changes
        </button>
      </div>
    </div>
  );
}

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Leaf, Eye, EyeOff, AlertCircle, ArrowRight } from "lucide-react";

export default function AdminLogin() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    await new Promise((r) => setTimeout(r, 600)); // simulate network
    const result = login(form.email, form.password);
    setLoading(false);
    if (result.ok) navigate("/admin/dashboard");
    else setError(result.error);
  };

  return (
    <div className="min-h-screen bg-forest-950 flex flex-col lg:flex-row">
      {/* Left Panel — Branding */}
      <div className="hidden lg:flex lg:w-1/2 xl:w-3/5 flex-col justify-between p-12 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-32 -left-32 w-96 h-96 bg-forest-800 rounded-full opacity-40" />
          <div className="absolute top-1/2 -right-24 w-72 h-72 bg-forest-700 rounded-full opacity-20" />
          <div className="absolute -bottom-20 left-1/3 w-80 h-80 bg-amber-rms/10 rounded-full" />
          {/* Grid pattern */}
          <div
            className="absolute inset-0 opacity-5"
            style={{
              backgroundImage: "linear-gradient(#9adcb8 1px, transparent 1px), linear-gradient(90deg, #9adcb8 1px, transparent 1px)",
              backgroundSize: "48px 48px",
            }}
          />
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-rms rounded-xl flex items-center justify-center shadow-lg shadow-amber-rms/30">
              <Leaf size={20} className="text-forest-950" strokeWidth={2.5} />
            </div>
            <div>
              <p className="text-white font-bold text-lg leading-none">RMS</p>
              <p className="text-forest-400 text-xs">Restaurant Manager</p>
            </div>
          </div>
        </div>

        <div className="relative z-10">
          <h1 className="text-4xl xl:text-5xl font-black text-white leading-tight mb-4">
            Manage your<br />
            <span className="text-amber-rms">restaurant</span><br />
            with confidence.
          </h1>
          <p className="text-forest-400 text-lg max-w-md leading-relaxed">
            Full visibility across orders, tables, menu, payments — in one clean dashboard built for speed.
          </p>
        </div>

        <div className="relative z-10 flex gap-6">
          {[["20+", "Tables"], ["500+", "Orders/day"], ["99.9%", "Uptime"]].map(([val, label]) => (
            <div key={label}>
              <p className="text-amber-rms font-black text-2xl">{val}</p>
              <p className="text-forest-400 text-sm">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Right Panel — Form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-10 lg:p-12">
        <div className="w-full max-w-sm fade-in">
          {/* Mobile logo */}
          <div className="flex items-center gap-3 mb-8 lg:hidden">
            <div className="w-9 h-9 bg-amber-rms rounded-xl flex items-center justify-center">
              <Leaf size={18} className="text-forest-950" strokeWidth={2.5} />
            </div>
            <p className="text-white font-bold text-lg">RMS Admin</p>
          </div>

          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">Welcome back</h2>
          <p className="text-forest-400 text-sm mb-8">Sign in to your admin account</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-forest-400 mb-2 uppercase tracking-wider">Email</label>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="admin@rms.com"
                className="w-full px-4 py-3.5 rounded-xl bg-forest-900 border border-forest-800 text-white text-sm placeholder:text-forest-600 outline-none focus:border-forest-500 focus:ring-2 focus:ring-forest-500/20 transition-all"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold text-forest-400 mb-2 uppercase tracking-wider">Password</label>
              <div className="relative">
                <input
                  type={showPw ? "text" : "password"}
                  required
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="••••••••"
                  className="w-full px-4 py-3.5 pr-12 rounded-xl bg-forest-900 border border-forest-800 text-white text-sm placeholder:text-forest-600 outline-none focus:border-forest-500 focus:ring-2 focus:ring-forest-500/20 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPw((v) => !v)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-forest-500 hover:text-forest-300 transition-colors"
                >
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-center gap-2 px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
                <AlertCircle size={15} className="shrink-0" />
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-amber-rms hover:bg-amber-light active:scale-95 disabled:opacity-60 text-forest-950 font-bold py-3.5 rounded-xl transition-all text-sm mt-2"
            >
              {loading ? (
                <span className="w-4 h-4 border-2 border-forest-900/30 border-t-forest-900 rounded-full animate-spin" />
              ) : (
                <>Sign In <ArrowRight size={15} /></>
              )}
            </button>
          </form>

          {/* Demo hint */}
          <div className="mt-6 p-4 rounded-xl bg-forest-900/50 border border-forest-800">
            <p className="text-forest-400 text-xs font-semibold mb-2 uppercase tracking-wider">Demo credentials</p>
            <div className="space-y-1 text-xs text-forest-300">
              <p><span className="text-forest-500">Admin:</span> admin@rms.com / admin123</p>
              <p><span className="text-forest-500">Manager:</span> manager@rms.com / manager123</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

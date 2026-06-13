import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar
} from "recharts";
import {
  DollarSign, ShoppingBag, LayoutGrid, TrendingUp,
  TrendingDown, ArrowUpRight, Users, ChefHat
} from "lucide-react";
import { dashboardStats, revenueData, topItems, orders } from "../../data/mockData";

const iconMap = { DollarSign, ShoppingBag, LayoutGrid, TrendingUp };

const statusColors = {
  preparing: "bg-amber-100 text-amber-800",
  served: "bg-blue-100 text-blue-800",
  pending: "bg-gray-100 text-gray-700",
  paid: "bg-forest-300/30 text-forest-800",
  cancelled: "bg-red-100 text-red-700",
};

export default function Dashboard() {
  return (
    <div className="space-y-4 sm:space-y-5 fade-in">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
        {dashboardStats.map((stat) => {
          const Icon = iconMap[stat.icon];
          return (
            <div key={stat.label} className="card flex flex-col gap-3 p-4 sm:p-5">
              <div className="flex items-center justify-between">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-forest-900 flex items-center justify-center shrink-0">
                  <Icon size={16} className="text-forest-400" />
                </div>
                <span className={`flex items-center gap-1 text-xs font-semibold ${stat.positive ? "text-forest-600" : "text-red-500"}`}>
                  {stat.positive ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
                  {stat.change}
                </span>
              </div>
              <div>
                <p className="text-xl sm:text-2xl font-bold text-forest-900">{stat.value}</p>
                <p className="text-xs text-gray-500 mt-0.5 leading-tight">{stat.label}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Actions — mobile only */}
      <div className="grid grid-cols-3 gap-3 sm:hidden">
        {[
          { icon: ShoppingBag, label: "New Order", color: "bg-forest-700 text-white" },
          { icon: Users, label: "Tables", color: "bg-amber-rms text-forest-950" },
          { icon: ChefHat, label: "Kitchen", color: "bg-white border border-cream-200 text-forest-900" },
        ].map(({ icon: Icon, label, color }) => (
          <button key={label} className={`${color} rounded-2xl p-3 flex flex-col items-center gap-1.5 font-semibold text-xs transition-all active:scale-95`}>
            <Icon size={18} />
            {label}
          </button>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className="card xl:col-span-2 p-4 sm:p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-forest-900 text-sm sm:text-base">Weekly Revenue</h3>
              <p className="text-xs text-gray-500">Last 7 days</p>
            </div>
            <button className="btn-secondary text-xs px-3 py-1.5">This Week</button>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={revenueData}>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2d6a4f" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#2d6a4f" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2d9c8" />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v}`} width={50} />
              <Tooltip contentStyle={{ borderRadius: "12px", border: "1px solid #e2d9c8", fontSize: 12 }} formatter={(v) => [`$${v}`, "Revenue"]} />
              <Area type="monotone" dataKey="revenue" stroke="#2d6a4f" strokeWidth={2.5} fill="url(#revGrad)" dot={{ fill: "#2d6a4f", r: 3 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="card p-4 sm:p-5">
          <div className="mb-4">
            <h3 className="font-semibold text-forest-900 text-sm sm:text-base">Daily Orders</h3>
            <p className="text-xs text-gray-500">Order count by day</p>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={revenueData} barSize={20}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2d9c8" vertical={false} />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} width={30} />
              <Tooltip contentStyle={{ borderRadius: "12px", border: "1px solid #e2d9c8", fontSize: 12 }} />
              <Bar dataKey="orders" fill="#e8a020" radius={[5, 5, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Top Items */}
        <div className="card p-4 sm:p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-forest-900">Top Items</h3>
            <button className="text-xs text-forest-600 hover:text-forest-700 font-medium flex items-center gap-1">
              View all <ArrowUpRight size={12} />
            </button>
          </div>
          <div className="overflow-x-auto -mx-4 sm:mx-0">
            <table className="w-full min-w-[320px]">
              <thead>
                <tr>
                  <th className="table-th">Item</th>
                  <th className="table-th text-right">Orders</th>
                  <th className="table-th text-right">Revenue</th>
                </tr>
              </thead>
              <tbody>
                {topItems.map((item, i) => (
                  <tr key={i}>
                    <td className="table-td">
                      <div>
                        <p className="font-medium text-forest-900 text-xs sm:text-sm">{item.name}</p>
                        <p className="text-xs text-gray-400">{item.category}</p>
                      </div>
                    </td>
                    <td className="table-td text-right font-semibold text-forest-700 text-sm">{item.orders}</td>
                    <td className="table-td text-right font-semibold text-sm">{item.revenue}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Orders */}
        <div className="card p-4 sm:p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-forest-900">Recent Orders</h3>
            <button className="text-xs text-forest-600 hover:text-forest-700 font-medium flex items-center gap-1">
              View all <ArrowUpRight size={12} />
            </button>
          </div>
          <div className="space-y-2.5">
            {orders.slice(0, 5).map((order) => (
              <div key={order.id} className="flex items-center justify-between py-2 border-b border-cream-100 last:border-0">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-xl bg-forest-900 flex items-center justify-center shrink-0">
                    <ShoppingBag size={13} className="text-forest-400" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-xs sm:text-sm text-forest-900 truncate">{order.id}</p>
                    <p className="text-xs text-gray-400 truncate">{order.table} · {order.items} items</p>
                  </div>
                </div>
                <div className="text-right shrink-0 ml-2">
                  <p className="font-semibold text-sm">${order.total}</p>
                  <span className={`badge text-xs ${statusColors[order.status]}`}>{order.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

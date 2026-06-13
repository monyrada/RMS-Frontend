// Dashboard Stats
export const dashboardStats = [
  { label: "Today's Revenue", value: "$3,842", change: "+12%", positive: true, icon: "DollarSign" },
  { label: "Orders Today", value: "147", change: "+8%", positive: true, icon: "ShoppingBag" },
  { label: "Tables Active", value: "12/20", change: "60%", positive: true, icon: "LayoutGrid" },
  { label: "Avg. Order Value", value: "$26.1", change: "-2%", positive: false, icon: "TrendingUp" },
];

export const revenueData = [
  { day: "Mon", revenue: 2800, orders: 92 },
  { day: "Tue", revenue: 3200, orders: 110 },
  { day: "Wed", revenue: 2950, orders: 98 },
  { day: "Thu", revenue: 3600, orders: 124 },
  { day: "Fri", revenue: 4200, orders: 155 },
  { day: "Sat", revenue: 4900, orders: 178 },
  { day: "Sun", revenue: 3842, orders: 147 },
];

export const topItems = [
  { name: "Grilled Salmon", orders: 48, revenue: "$720", category: "Main Course" },
  { name: "Caesar Salad", orders: 41, revenue: "$369", category: "Starters" },
  { name: "Beef Burger", orders: 38, revenue: "$456", category: "Main Course" },
  { name: "Tiramisu", orders: 35, revenue: "$245", category: "Desserts" },
  { name: "Mojito", orders: 33, revenue: "$198", category: "Drinks" },
];

// Menu Data
export const categories = [
  { id: 1, name: "Starters", icon: "🥗", itemCount: 8, active: true },
  { id: 2, name: "Main Course", icon: "🍽️", itemCount: 14, active: true },
  { id: 3, name: "Desserts", icon: "🍮", itemCount: 6, active: true },
  { id: 4, name: "Drinks", icon: "🍹", itemCount: 12, active: true },
  { id: 5, name: "Specials", icon: "⭐", itemCount: 4, active: false },
];

export const menuItems = [
  { id: 1, name: "Grilled Salmon", category: "Main Course", price: 18.5, cost: 7.2, status: "available", ingredients: ["Salmon fillet", "Lemon", "Herbs", "Olive oil"] },
  { id: 2, name: "Caesar Salad", category: "Starters", price: 9.0, cost: 2.8, status: "available", ingredients: ["Romaine lettuce", "Parmesan", "Croutons", "Caesar dressing"] },
  { id: 3, name: "Beef Burger", category: "Main Course", price: 14.0, cost: 5.5, status: "available", ingredients: ["Beef patty", "Brioche bun", "Cheddar", "Lettuce", "Tomato"] },
  { id: 4, name: "Tiramisu", category: "Desserts", price: 7.5, cost: 2.1, status: "available", ingredients: ["Mascarpone", "Espresso", "Ladyfingers", "Cocoa"] },
  { id: 5, name: "Mojito", category: "Drinks", price: 6.0, cost: 1.4, status: "available", ingredients: ["Rum", "Lime", "Mint", "Sugar", "Soda water"] },
  { id: 6, name: "Mushroom Risotto", category: "Main Course", price: 16.0, cost: 5.8, status: "unavailable", ingredients: ["Arborio rice", "Mushrooms", "Parmesan", "White wine"] },
  { id: 7, name: "Chocolate Lava Cake", category: "Desserts", price: 8.5, cost: 2.4, status: "available", ingredients: ["Dark chocolate", "Butter", "Eggs", "Flour"] },
  { id: 8, name: "Tom Yum Soup", category: "Starters", price: 10.0, cost: 3.2, status: "available", ingredients: ["Shrimp", "Lemongrass", "Galangal", "Chili", "Lime"] },
];

export const ingredients = [
  { id: 1, name: "Salmon fillet", unit: "kg", stock: 8.5, minStock: 3, cost: 22.0, supplier: "Ocean Fresh" },
  { id: 2, name: "Beef patty", unit: "kg", stock: 12.0, minStock: 5, cost: 14.0, supplier: "Prime Meats" },
  { id: 3, name: "Arborio rice", unit: "kg", stock: 4.2, minStock: 5, cost: 3.5, supplier: "Pantry Co." },
  { id: 4, name: "Dark chocolate", unit: "kg", stock: 2.8, minStock: 2, cost: 18.0, supplier: "Sweet House" },
  { id: 5, name: "Romaine lettuce", unit: "pcs", stock: 32, minStock: 10, cost: 1.2, supplier: "Farm Fresh" },
  { id: 6, name: "Parmesan", unit: "kg", stock: 3.5, minStock: 2, cost: 28.0, supplier: "Dairy King" },
];

// Orders
export const orders = [
  { id: "#ORD-1042", table: "T-05", items: 4, total: 68.5, status: "preparing", time: "12:34", server: "Ana R." },
  { id: "#ORD-1041", table: "T-02", items: 2, total: 31.0, status: "served", time: "12:28", server: "Tom K." },
  { id: "#ORD-1040", table: "T-08", items: 6, total: 95.0, status: "pending", time: "12:22", server: "Mia L." },
  { id: "#ORD-1039", table: "T-11", items: 3, total: 44.5, status: "paid", time: "12:10", server: "Ana R." },
  { id: "#ORD-1038", table: "T-03", items: 5, total: 78.0, status: "preparing", time: "12:05", server: "Jake S." },
  { id: "#ORD-1037", table: "T-07", items: 2, total: 26.5, status: "cancelled", time: "11:58", server: "Tom K." },
];

// Tables
export const tables = [
  { id: 1, name: "T-01", seats: 2, status: "available", orderId: null, server: null },
  { id: 2, name: "T-02", seats: 4, status: "occupied", orderId: "#ORD-1041", server: "Tom K." },
  { id: 3, name: "T-03", seats: 4, status: "occupied", orderId: "#ORD-1038", server: "Jake S." },
  { id: 4, name: "T-04", seats: 6, status: "reserved", orderId: null, server: null },
  { id: 5, name: "T-05", seats: 4, status: "occupied", orderId: "#ORD-1042", server: "Ana R." },
  { id: 6, name: "T-06", seats: 2, status: "available", orderId: null, server: null },
  { id: 7, name: "T-07", seats: 4, status: "available", orderId: null, server: null },
  { id: 8, name: "T-08", seats: 8, status: "occupied", orderId: "#ORD-1040", server: "Mia L." },
  { id: 9, name: "T-09", seats: 6, status: "reserved", orderId: null, server: null },
  { id: 10, name: "T-10", seats: 2, status: "available", orderId: null, server: null },
  { id: 11, name: "T-11", seats: 4, status: "cleaning", orderId: null, server: null },
  { id: 12, name: "T-12", seats: 4, status: "available", orderId: null, server: null },
  { id: 13, name: "T-13", seats: 6, status: "available", orderId: null, server: null },
  { id: 14, name: "T-14", seats: 2, status: "available", orderId: null, server: null },
  { id: 15, name: "T-15", seats: 4, status: "occupied", orderId: "#ORD-1045", server: "Ana R." },
  { id: 16, name: "T-16", seats: 8, status: "available", orderId: null, server: null },
  { id: 17, name: "T-17", seats: 2, status: "reserved", orderId: null, server: null },
  { id: 18, name: "T-18", seats: 4, status: "available", orderId: null, server: null },
  { id: 19, name: "T-19", seats: 6, status: "cleaning", orderId: null, server: null },
  { id: 20, name: "T-20", seats: 4, status: "available", orderId: null, server: null },
];

// Payments
export const payments = [
  { id: "#PAY-0882", orderId: "#ORD-1039", table: "T-11", amount: 44.5, method: "Card", status: "completed", time: "12:15", cashier: "Ana R." },
  { id: "#PAY-0881", orderId: "#ORD-1034", table: "T-06", amount: 58.0, method: "Cash", status: "completed", time: "11:45", cashier: "Tom K." },
  { id: "#PAY-0880", orderId: "#ORD-1030", table: "T-14", amount: 32.5, method: "QR Pay", status: "completed", time: "11:12", cashier: "Mia L." },
  { id: "#PAY-0879", orderId: "#ORD-1027", table: "T-03", amount: 91.0, method: "Card", status: "refunded", time: "10:52", cashier: "Jake S." },
  { id: "#PAY-0878", orderId: "#ORD-1025", table: "T-09", amount: 47.5, method: "Cash", status: "completed", time: "10:30", cashier: "Ana R." },
];

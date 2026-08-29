"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  LayoutDashboard, Network, Cpu, Package, ShoppingCart, 
  Users, MessageSquare, CreditCard, FileText, Coins, 
  Sliders, Globe, LogOut, Search, UserCheck
} from "lucide-react";

interface Order {
  ref: string;
  user: string;
  service: string;
  price: string;
  status: "Pending" | "Processing" | "Success" | "Rejected";
  date: string;
  topicSlug?: string;
}

const INITIAL_ORDERS: Order[] = [
  { ref: "ORD-310725-1001", user: "GenTechPro", service: "Samsung KG Unlock", price: "₹2,500.00", status: "Pending", date: "31-07-2025 12:42 PM", topicSlug: "samsung-kg-unlock" },
  { ref: "ORD-310725-1002", user: "MobileFixer01", service: "Xiaomi Bootloader Unlock", price: "₹1,800.00", status: "Pending", date: "31-07-2025 12:30 PM", topicSlug: "xiaomi-bootloader-unlock" },
  { ref: "ORD-310725-1003", user: "UnlockMaster", service: "Oppo IMEI Repair", price: "₹3,200.00", status: "Pending", date: "31-07-2025 12:35 PM", topicSlug: "oppo-imei-repair" },
  { ref: "ORD-310725-1004", user: "TechSolution", service: "OnePlus FRP Remove", price: "₹900.00", status: "Pending", date: "31-07-2025 12:28 PM", topicSlug: "oneplus-frp-remove" },
  { ref: "ORD-310725-1005", user: "AndroidGuru", service: "Realme IMEI Repair", price: "₹3,000.00", status: "Pending", date: "31-07-2025 12:25 PM", topicSlug: "realme-imei-repair" },
  { ref: "ORD-310725-1006", user: "ToolDealer", service: "Unlock Tool Activation (1 Year)", price: "₹4,500.00", status: "Pending", date: "31-07-2025 12:20 PM", topicSlug: "unlock-tool-activation" },
  { ref: "ORD-310725-1007", user: "GsmClinic", service: "iCloud Bypass (Full)", price: "₹2,700.00", status: "Pending", date: "31-07-2025 12:15 PM", topicSlug: "icloud-bypass-full" },
  { ref: "ORD-310725-1008", user: "FlashKing", service: "CPU / eMMC Reprogramming", price: "₹2,200.00", status: "Pending", date: "31-07-2025 12:10 PM", topicSlug: "cpu-emmc-reprogramming" }
];

export default function AdminDashboardPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"Pending" | "Processing" | "Success" | "Rejected">("Pending");

  // Filtering orders dynamically based on search query and status tabs
  const filteredOrders = useMemo(() => {
    return INITIAL_ORDERS.filter(order => {
      const matchesSearch = 
        order.ref.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.service.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = order.status === activeTab;
      return matchesSearch && matchesStatus;
    });
  }, [searchQuery, activeTab]);

  return (
    <div className="flex min-h-screen w-full bg-[#f4f6f9] text-[#333333] font-sans overflow-x-hidden antialiased">
      {/* ── SIDEBAR ── */}
      <aside className="w-64 bg-[#1a1c23] text-white/80 flex-shrink-0 flex flex-col justify-between border-r border-[#2d313c] z-10">
        <div>
          {/* Brand Header */}
          <div className="h-16 flex items-center px-6 gap-3 border-b border-[#2d313c]">
            <div className="w-2.5 h-2.5 rounded-full bg-[#10E39B]" />
            <span className="font-bold text-sm tracking-wider uppercase text-white">Admin Panel</span>
          </div>

          {/* Sidebar Menu */}
          <nav className="p-4 space-y-1">
            <Link href="/" className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-white bg-[#2d313c]/30 border-l-4 border-[#10E39B] transition-all text-xs font-semibold">
              <LayoutDashboard className="w-4 h-4 text-[#10E39B]" />
              <span>Dashboard</span>
            </Link>
            
            <Link href="/modules" className="flex items-center gap-3 px-4 py-2.5 rounded-lg hover:bg-white/5 transition-all text-xs text-white/70 hover:text-white">
              <Network className="w-4 h-4" />
              <span>API Providers</span>
            </Link>

            <Link href="/modules" className="flex items-center gap-3 px-4 py-2.5 rounded-lg hover:bg-white/5 transition-all text-xs text-white/70 hover:text-white">
              <Cpu className="w-4 h-4" />
              <span>Services</span>
            </Link>

            <Link href="/modules" className="flex items-center gap-3 px-4 py-2.5 rounded-lg hover:bg-white/5 transition-all text-xs text-white/70 hover:text-white">
              <Package className="w-4 h-4" />
              <span>Inventory</span>
            </Link>

            <Link href="/modules" className="flex items-center gap-3 px-4 py-2.5 rounded-lg hover:bg-white/5 transition-all text-xs text-white/70 hover:text-white">
              <ShoppingCart className="w-4 h-4" />
              <span>Orders</span>
            </Link>

            <Link href="/modules" className="flex items-center gap-3 px-4 py-2.5 rounded-lg hover:bg-white/5 transition-all text-xs text-white/70 hover:text-white">
              <Users className="w-4 h-4" />
              <span>Users</span>
            </Link>

            <Link href="/modules" className="flex items-center gap-3 px-4 py-2.5 rounded-lg hover:bg-white/5 transition-all text-xs text-white/70 hover:text-white">
              <MessageSquare className="w-4 h-4" />
              <span>Message</span>
            </Link>

            <Link href="/modules" className="flex items-center gap-3 px-4 py-2.5 rounded-lg hover:bg-white/5 transition-all text-xs text-white/70 hover:text-white">
              <CreditCard className="w-4 h-4" />
              <span>Payments</span>
            </Link>

            <Link href="/modules" className="flex items-center gap-3 px-4 py-2.5 rounded-lg hover:bg-white/5 transition-all text-xs text-white/70 hover:text-white">
              <FileText className="w-4 h-4" />
              <span>Invoices</span>
            </Link>

            <Link href="/modules" className="flex items-center gap-3 px-4 py-2.5 rounded-lg hover:bg-white/5 transition-all text-xs text-white/70 hover:text-white">
              <Coins className="w-4 h-4" />
              <span>Currency</span>
            </Link>
          </nav>
        </div>

        {/* Bottom Utility Menu */}
        <div className="p-4 border-t border-[#2d313c]">
          <Link href="/modules" className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-white/5 transition-all text-xs hover:text-white text-white/60 mb-1">
            <Sliders className="w-4 h-4" />
            <span>Settings</span>
          </Link>
          <Link href="/modules" className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-white/5 transition-all text-xs hover:text-white text-white/60 mb-1">
            <Globe className="w-4 h-4" />
            <span>View Website</span>
          </Link>
          <Link href="/" className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-white/5 transition-all text-xs hover:text-white text-white/60">
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </Link>
        </div>
      </aside>

      {/* ── MAIN CONTENT AREA ── */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Top Header Row */}
        <header className="h-16 bg-white border-b border-[#e2e8f0] flex items-center justify-between px-8">
          <h1 className="font-bold text-lg text-[#1a1c23]">Dashboard</h1>
          <div className="flex items-center gap-4">
            <span className="text-xs text-white bg-[#1a1c23]/80 px-3 py-1 rounded-full font-mono uppercase tracking-widest font-semibold flex items-center gap-1.5 border border-[#2d313c]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#10E39B] animate-pulse" />
              Live Connected
            </span>
          </div>
        </header>

        {/* Dashboard Panels Grid Container */}
        <div className="p-8 space-y-8 max-w-7xl w-full mx-auto">
          
          {/* Stats Cards Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-5">
            {/* 1. Users */}
            <div className="bg-white border border-[#e2e8f0] p-4 rounded-xl flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow">
              <div className="p-2 bg-[#d1fae5] text-[#10E39B] rounded-lg">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Users</p>
                <h3 className="text-lg font-bold text-[#1a1c23] mt-0.5">14055</h3>
              </div>
            </div>

            {/* 2. Total Orders */}
            <div className="bg-white border border-[#e2e8f0] p-4 rounded-xl flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow">
              <div className="p-2 bg-[#e0f2fe] text-[#38BDF8] rounded-lg">
                <ShoppingCart className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Total Orders</p>
                <h3 className="text-lg font-bold text-[#1a1c23] mt-0.5">63132</h3>
              </div>
            </div>

            {/* 3. Pending Orders */}
            <div className="bg-white border border-[#e2e8f0] p-4 rounded-xl flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow">
              <div className="p-2 bg-[#fef3c7] text-[#FBBF24] rounded-lg">
                <Sliders className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Pending Orders</p>
                <h3 className="text-lg font-bold text-[#1a1c23] mt-0.5">96</h3>
              </div>
            </div>

            {/* 4. Active Services */}
            <div className="bg-white border border-[#e2e8f0] p-4 rounded-xl flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow">
              <div className="p-2 bg-[#fdf2f8] text-[#E879F9] rounded-lg">
                <Cpu className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Active Services</p>
                <h3 className="text-lg font-bold text-[#1a1c23] mt-0.5">6896</h3>
              </div>
            </div>

            {/* 5. API Connected */}
            <div className="bg-white border border-[#e2e8f0] p-4 rounded-xl flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow">
              <div className="p-2 bg-[#ecfdf5] text-[#22D3EE] rounded-lg">
                <Network className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">API Connected</p>
                <h3 className="text-lg font-bold text-[#1a1c23] mt-0.5">11</h3>
              </div>
            </div>

            {/* 6. Total Profit */}
            <div className="bg-white border border-[#e2e8f0] p-4 rounded-xl flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow">
              <div className="p-2 bg-[#ecfdf5] text-[#10E39B] rounded-lg">
                <Coins className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Total Profits</p>
                <h3 className="text-lg font-bold text-[#1a1c23] mt-0.5">5,120,176</h3>
              </div>
            </div>
          </div>

          {/* Recent Orders Panel */}
          <div className="bg-white border border-[#e2e8f0] rounded-2xl shadow-sm overflow-hidden">
            {/* Panel Header, Search, and Tabs */}
            <div className="p-6 border-b border-[#e2e8f0] space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <h3 className="font-bold text-sm text-[#1a1c23] tracking-wide">Recent Orders</h3>
                
                {/* Search Bar */}
                <div className="relative flex items-center w-full md:w-80">
                  <input 
                    type="text" 
                    placeholder="Search Order ID, customer, service..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full text-xs pl-8 pr-16 py-2 border border-[#cbd5e1] rounded-lg focus:outline-none focus:border-[#10E39B] bg-[#f8f9fa]"
                  />
                  <Search className="absolute left-2.5 w-4 h-4 text-slate-400" />
                  <button className="absolute right-1 px-3 py-1 bg-[#10E39B] hover:bg-[#0bc283] text-white rounded text-[10px] font-bold transition-colors">
                    Search
                  </button>
                </div>
              </div>

              {/* Status Tabs */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                <button 
                  onClick={() => setActiveTab("Pending")}
                  className={`px-4 py-1.5 rounded-lg text-xs font-bold border transition-colors cursor-pointer ${
                    activeTab === "Pending" ? "bg-[#10E39B] text-white border-[#10E39B]" : "bg-white text-[#64748b] hover:text-[#1e293b] border-[#cbd5e1]"
                  }`}
                >
                  Pending <span className="ml-1 bg-[#d97706]/10 px-1.5 py-0.5 rounded text-[10px] text-[#d97706]">96</span>
                </button>

                <button 
                  onClick={() => setActiveTab("Processing")}
                  className={`px-4 py-1.5 rounded-lg text-xs font-bold border transition-colors cursor-pointer ${
                    activeTab === "Processing" ? "bg-[#10E39B] text-white border-[#10E39B]" : "bg-white text-[#64748b] hover:text-[#1e293b] border-[#cbd5e1]"
                  }`}
                >
                  Processing
                </button>

                <button 
                  onClick={() => setActiveTab("Success")}
                  className={`px-4 py-1.5 rounded-lg text-xs font-bold border transition-colors cursor-pointer ${
                    activeTab === "Success" ? "bg-[#10E39B] text-white border-[#10E39B]" : "bg-white text-[#64748b] hover:text-[#1e293b] border-[#cbd5e1]"
                  }`}
                >
                  Success <span className="ml-1 bg-[#059669]/10 px-1.5 py-0.5 rounded text-[10px] text-[#059669]">62132</span>
                </button>

                <button 
                  onClick={() => setActiveTab("Rejected")}
                  className={`px-4 py-1.5 rounded-lg text-xs font-bold border transition-colors cursor-pointer ${
                    activeTab === "Rejected" ? "bg-[#10E39B] text-white border-[#10E39B]" : "bg-white text-[#64748b] hover:text-[#1e293b] border-[#cbd5e1]"
                  }`}
                >
                  Reject <span className="ml-1 bg-red-600/10 px-1.5 py-0.5 rounded text-[10px] text-red-600">0</span>
                </button>
              </div>
            </div>

            {/* Orders Data Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#f8f9fa] border-b border-[#e2e8f0] text-[10px] font-bold text-[#64748b] uppercase tracking-wider">
                    <th className="px-6 py-3.5">Ref</th>
                    <th className="px-6 py-3.5">User</th>
                    <th className="px-6 py-3.5">Service</th>
                    <th className="px-6 py-3.5">Price</th>
                    <th className="px-6 py-3.5">Status</th>
                    <th className="px-6 py-3.5">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e2e8f0] text-xs">
                  {filteredOrders.length > 0 ? (
                    filteredOrders.map((order) => (
                      <tr 
                        key={order.ref} 
                        onClick={() => order.topicSlug && router.push(`/topic/${order.topicSlug}`)}
                        className="hover:bg-slate-50 transition-colors cursor-pointer"
                      >
                        <td className="px-6 py-3.5 font-bold text-[#3b82f6] hover:underline">
                          {order.ref}
                        </td>
                        <td className="px-6 py-3.5 font-medium text-[#1a1c23]">
                          {order.user}
                        </td>
                        <td className="px-6 py-3.5 text-[#1a1c23]">
                          {order.service}
                        </td>
                        <td className="px-6 py-3.5 font-mono font-semibold text-[#1a1c23]">
                          {order.price}
                        </td>
                        <td className="px-6 py-3.5">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            order.status === "Pending" ? "bg-[#fef3c7] text-[#d97706]" :
                            order.status === "Success" ? "bg-[#d1fae5] text-[#059669]" :
                            order.status === "Processing" ? "bg-[#e0f2fe] text-[#0284c7]" :
                            "bg-[#fee2e2] text-[#dc2626]"
                          }`}>
                            {order.status}
                          </span>
                        </td>
                        <td className="px-6 py-3.5 text-[#64748b]">
                          {order.date}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-slate-400 font-mono">
                        No orders matching the active filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls Footer */}
            <div className="p-4 border-t border-[#e2e8f0] flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#f8f9fa]">
              <span className="text-xs text-slate-500">
                Showing 1 to {filteredOrders.length} of 96 orders
              </span>
              <div className="flex items-center gap-1">
                <button className="px-2.5 py-1 border border-[#cbd5e1] rounded hover:bg-[#cbd5e1]/10 text-xs transition-colors cursor-pointer">&lt;</button>
                <button className="px-2.5 py-1 bg-[#10E39B] text-white rounded text-xs font-bold transition-colors cursor-pointer">1</button>
                <button className="px-2.5 py-1 border border-[#cbd5e1] rounded hover:bg-[#cbd5e1]/10 text-xs transition-colors cursor-pointer">2</button>
                <button className="px-2.5 py-1 border border-[#cbd5e1] rounded hover:bg-[#cbd5e1]/10 text-xs transition-colors cursor-pointer">3</button>
                <span className="px-1 text-xs text-slate-400 font-mono">...</span>
                <button className="px-2.5 py-1 border border-[#cbd5e1] rounded hover:bg-[#cbd5e1]/10 text-xs transition-colors cursor-pointer">12</button>
                <button className="px-2.5 py-1 border border-[#cbd5e1] rounded hover:bg-[#cbd5e1]/10 text-xs transition-colors cursor-pointer">&gt;</button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

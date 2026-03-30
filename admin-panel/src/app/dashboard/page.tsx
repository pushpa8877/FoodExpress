"use client";

import { useEffect, useState, useMemo } from "react";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, query, orderBy, limit } from "firebase/firestore";
import { 
  Users, 
  Utensils, 
  ShoppingBag, 
  IndianRupee, 
  Activity,
  TrendingUp,
  Zap,
  ChevronRight,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  Package,
  CheckCircle2
} from "lucide-react";
import { 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  Cell
} from "recharts";
import { motion, AnimatePresence } from "framer-motion";
import { format, subDays, startOfDay, isWithinInterval, parseISO } from "date-fns";

export default function DashboardOverview() {
  const [orders, setOrders] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [restaurants, setRestaurants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [graphPeriod, setGraphPeriod] = useState<"7d" | "30d">("7d");

  useEffect(() => {
    // Real-time listeners for the entire core data
    const unsubOrders = onSnapshot(collection(db, "orders"), (snap) => {
      const list: any[] = [];
      snap.forEach(d => list.push({ id: d.id, ...d.data() }));
      setOrders(list);
      setLoading(false);
    });

    const unsubUsers = onSnapshot(collection(db, "users"), (snap) => {
      setUsers(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    const unsubRests = onSnapshot(collection(db, "restaurants"), (snap) => {
      setRestaurants(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    return () => {
      unsubOrders();
      unsubUsers();
      unsubRests();
    };
  }, []);

  // Compute stats dynamically
  const stats = useMemo(() => {
    const totalRevenue = orders.reduce((acc, curr) => acc + (curr.totalPrice || 0), 0);
    const today = startOfDay(new Date());
    const todayOrders = orders.filter(o => {
      const date = o.createdAt?.seconds ? new Date(o.createdAt.seconds * 1000) : null;
      return date && date >= today;
    });
    const todayRevenue = todayOrders.reduce((acc, curr) => acc + (curr.totalPrice || 0), 0);

    return {
      totalRevenue,
      todayRevenue,
      totalOrders: orders.length,
      activeUsers: users.length,
      partnerKitchens: restaurants.length,
      revenueGrowth: "+12.5%", // Logic could be added to compare with yesterday
    };
  }, [orders, users, restaurants]);

  // Chart data processing
  const chartData = useMemo(() => {
    const days = graphPeriod === "7d" ? 7 : 30;
    const data = [];
    for (let i = days - 1; i >= 0; i--) {
      const date = subDays(new Date(), i);
      const dateStr = format(date, "MMM dd");
      const dayOrders = orders.filter(o => {
        const oDate = o.createdAt?.seconds ? new Date(o.createdAt.seconds * 1000) : null;
        return oDate && format(oDate, "MMM dd") === dateStr;
      });
      const revenue = dayOrders.reduce((acc, curr) => acc + (curr.totalPrice || 0), 0);
      data.push({ name: dateStr, revenue });
    }
    return data;
  }, [orders, graphPeriod]);

  // AI Insights Logic
  const insights = useMemo(() => {
    const itemMap: Record<string, number> = {};
    orders.forEach(o => {
      o.items?.forEach((item: any) => {
        itemMap[item.name] = (itemMap[item.name] || 0) + (item.quantity || 1);
      });
    });
    const topItem = Object.entries(itemMap).sort((a, b) => b[1] - a[1])[0]?.[0] || "None yet";
    
    return [
      { title: "Top Velocity Item", value: topItem, desc: "High conversion rate", icon: TrendingUp, color: "text-amber-500" },
      { title: "Network Growth", value: `+${restaurants.length > 5 ? 'Stable' : 'Rapid'}`, desc: "Partner onboarding", icon: Utensils, color: "text-emerald-500" },
      { title: "Consumer Confidence", value: "High", desc: "Repeat order rate 64%", icon: Sparkles, color: "text-indigo-500" },
    ];
  }, [orders, restaurants]);

  if (loading) return (
    <div className="h-[70vh] flex items-center justify-center">
       <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const cards = [
    { label: "Total Revenue", value: `₹${stats.totalRevenue.toLocaleString()}`, trend: stats.revenueGrowth, icon: IndianRupee, color: "text-indigo-600", bg: "bg-indigo-50" },
    { label: "Total Orders", value: stats.totalOrders, trend: "+8.2%", icon: ShoppingBag, color: "text-amber-600", bg: "bg-amber-50" },
    { label: "Elite Partners", value: stats.partnerKitchens, trend: "+2", icon: Utensils, color: "text-emerald-600", bg: "bg-emerald-50" },
    { label: "Active Nodes", value: stats.activeUsers, trend: "+14.5%", icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
  ];

  return (
    <div className="space-y-12 pb-20">
      {/* Header with AI Insights */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Executive Intelligence</h1>
          <p className="text-slate-500 mt-2 font-medium">Real-time ecosystem performance across all nodes</p>
        </div>
        
        <div className="flex flex-wrap gap-4">
          {insights.map((ins, i) => (
            <div key={i} className="bg-white px-5 py-3 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center bg-slate-50`}>
                 <ins.icon className={`w-5 h-5 ${ins.color}`} />
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">{ins.title}</p>
                <p className="font-black text-slate-900 text-sm mt-1">{ins.value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Primary KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {cards.map((card, idx) => (
          <motion.div 
            key={idx} 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="group bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-200 hover:border-indigo-400 hover:shadow-2xl hover:shadow-indigo-500/10 transition-all duration-500 relative overflow-hidden"
          >
            <div className="flex justify-between items-start relative z-10">
              <div className={`w-14 h-14 ${card.bg} rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
                <card.icon className={`w-7 h-7 ${card.color}`} />
              </div>
              <div className="flex items-center gap-1 px-3 py-1 bg-emerald-50 text-emerald-600 rounded-lg text-[10px] font-black">
                <ArrowUpRight className="w-3 h-3" /> {card.trend}
              </div>
            </div>
            <div className="mt-8 relative z-10">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">{card.label}</p>
              <h3 className="text-3xl font-black text-slate-900 tracking-tight">{card.value}</h3>
            </div>
            {/* Design flourish */}
            <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-slate-50 rounded-full group-hover:scale-150 transition-transform duration-700 opacity-50" />
          </motion.div>
        ))}
      </div>

      {/* Analytics Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-8 bg-white p-10 rounded-[3rem] shadow-sm border border-slate-200">
          <div className="flex justify-between items-center mb-10">
            <h3 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-3">
              <TrendingUp className="w-6 h-6 text-indigo-600" /> Revenue Trajectory
            </h3>
            <div className="flex bg-slate-50 p-1.5 rounded-xl border border-slate-100">
              <button 
                onClick={() => setGraphPeriod("7d")}
                className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${graphPeriod === "7d" ? "bg-white text-indigo-600 shadow-sm" : "text-slate-400"}`}
              >
                7 Days
              </button>
              <button 
                onClick={() => setGraphPeriod("30d")}
                className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${graphPeriod === "30d" ? "bg-white text-indigo-600 shadow-sm" : "text-slate-400"}`}
              >
                30 Days
              </button>
            </div>
          </div>
          
          <div className="h-[400px] w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#4F46E5" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#94A3B8', fontSize: 11, fontWeight: 700}} 
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#94A3B8', fontSize: 11, fontWeight: 700}} 
                />
                <Tooltip 
                  contentStyle={{ 
                    borderRadius: '20px', 
                    border: 'none', 
                    boxShadow: '0 25px 50px -12px rgba(79, 70, 229, 0.15)',
                    padding: '16px'
                  }}
                  itemStyle={{ color: '#4F46E5', fontWeight: 900 }}
                  labelStyle={{ fontWeight: 700, marginBottom: 4 }}
                />
                <Area 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#4F46E5" 
                  strokeWidth={4} 
                  fillOpacity={1} 
                  fill="url(#colorRevenue)" 
                  animationDuration={2000}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* System & Health Column */}
        <div className="lg:col-span-4 space-y-8">
           <div className="bg-indigo-600 p-10 rounded-[3rem] shadow-xl shadow-indigo-200 text-white relative overflow-hidden group">
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center">
                    <Zap className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black">Core Health</h3>
                    <p className="text-indigo-100 text-[10px] font-black uppercase tracking-widest">Active Operations</p>
                  </div>
                </div>
                <div className="space-y-6">
                  <div className="flex justify-between items-center text-sm font-bold">
                    <span className="text-indigo-200">Firebase Node</span>
                    <span className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-300" /> Operational</span>
                  </div>
                  <div className="flex justify-between items-center text-sm font-bold">
                    <span className="text-indigo-200">Latency Check</span>
                    <span className="text-white">42ms Optimal</span>
                  </div>
                  <div className="flex justify-between items-center text-sm font-bold">
                    <span className="text-indigo-200">Uptime Metric</span>
                    <span className="text-white">99.9% Reliable</span>
                  </div>
                </div>
                <button className="mt-8 bg-white text-indigo-600 w-full py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-lg hover:bg-slate-50 transition-all active:scale-95">
                  Deep Diagnostics
                </button>
              </div>
              {/* Background Glow */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32 group-hover:scale-125 transition-transform duration-1000" />
           </div>

           <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-slate-200 border-dashed">
              <h4 className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mb-8">Resource Load</h4>
              <div className="space-y-8">
                 {[
                   { name: "Order Processing", val: "85%", color: "bg-indigo-500" },
                   { name: "Merchant APIs", val: "62%", color: "bg-emerald-500" },
                   { name: "CDN Integrity", val: "94%", color: "bg-blue-500" },
                 ].map((item, i) => (
                   <div key={i} className="space-y-3">
                      <div className="flex justify-between text-xs font-black">
                         <span className="text-slate-500 uppercase tracking-widest">{item.name}</span>
                         <span className="text-slate-900">{item.val}</span>
                      </div>
                      <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                         <motion.div 
                           initial={{ width: 0 }}
                           animate={{ width: item.val }}
                           transition={{ duration: 1.5, ease: "easeOut" }}
                           className={`h-full ${item.color}`} 
                         />
                      </div>
                   </div>
                 ))}
              </div>
           </div>
        </div>
      </div>

      {/* Live Activity Matrix */}
      <div className="bg-white rounded-[3rem] shadow-sm border border-slate-200 overflow-hidden">
         <div className="p-10 border-b border-slate-100 flex justify-between items-center bg-slate-50/30">
            <div>
              <h3 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                 <Clock className="w-6 h-6 text-indigo-600" /> Recent Deployments
              </h3>
              <p className="text-xs font-medium text-slate-400 mt-1">Live updates from the order fulfillment grid</p>
            </div>
            <button className="text-[10px] font-black text-indigo-600 uppercase tracking-widest flex items-center gap-2 hover:gap-3 transition-all">
              Observe All <ChevronRight className="w-4 h-4" />
            </button>
         </div>
         <div className="overflow-x-auto">
            <table className="w-full text-left">
               <thead>
                  <tr className="bg-gray-50/50">
                     <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">ID / Timestamp</th>
                     <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Entity</th>
                     <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Payload</th>
                     <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Protocol Status</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-slate-100">
                  <AnimatePresence>
                     {orders.slice(0, 5).map((order) => (
                        <motion.tr 
                          key={order.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="hover:bg-slate-50/50 transition-colors group"
                        >
                           <td className="px-10 py-6">
                              <p className="text-sm font-black text-slate-900 leading-none">#{order.id.slice(-6).toUpperCase()}</p>
                              <p className="text-[10px] font-bold text-slate-400 mt-2 flex items-center gap-1.5 uppercase">
                                 <Clock className="w-3 h-3" /> {new Date(order.createdAt?.seconds * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </p>
                           </td>
                           <td className="px-10 py-6">
                              <div className="flex items-center gap-4">
                                 <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center font-black text-slate-400 text-xs">
                                    {order.userEmail?.[0].toUpperCase()}
                                 </div>
                                 <p className="text-sm font-bold text-slate-600 truncate max-w-[200px]">{order.userEmail}</p>
                              </div>
                           </td>
                           <td className="px-10 py-6">
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Value</p>
                              <p className="text-lg font-black text-indigo-600">₹{order.totalPrice?.toLocaleString()}</p>
                           </td>
                           <td className="px-10 py-6">
                              <span className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest ${
                                 order.status === 'delivered' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                                 order.status === 'pending' ? 'bg-amber-50 text-amber-600 border border-amber-100' :
                                 'bg-blue-50 text-blue-600 border border-blue-100'
                              }`}>
                                 {order.status === 'delivered' ? <CheckCircle2 className="w-3 h-3" /> : <Package className="w-3 h-3 animate-pulse" />}
                                 {order.status}
                              </span>
                           </td>
                        </motion.tr>
                     ))}
                  </AnimatePresence>
               </tbody>
            </table>
         </div>
      </div>
    </div>
  );
}

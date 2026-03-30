"use client";

import { useEffect, useState } from "react";
import { db, auth } from "@/lib/firebase";
import { collection, query, where, onSnapshot, getDocs } from "firebase/firestore";
import { 
  ShoppingBag, 
  IndianRupee, 
  TrendingUp, 
  Package, 
  Clock, 
  CheckCircle2,
  ChevronRight,
  Star
} from "lucide-react";
import Link from "next/link";

export default function RestaurantDashboard() {
  const [restaurantId, setRestaurantId] = useState<string | null>(null);
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    todayOrders: 0,
    pendingOrdersValue: 0
  });
  const [topItems, setTopItems] = useState<any[]>([]);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRestaurantId = async () => {
      const user = auth.currentUser;
      if (!user) return;

      const q = query(collection(db, "restaurants"), where("ownerId", "==", user.uid));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        setRestaurantId(querySnapshot.docs[0].id);
      }
    };
    fetchRestaurantId();
  }, []);

  useEffect(() => {
    if (!restaurantId) return;

    // Fetch All Orders for Stats
    const ordersQuery = query(collection(db, "orders"), where("restaurantId", "==", restaurantId));
    const unsubOrders = onSnapshot(ordersQuery, (snap) => {
      let totalRevenue = 0;
      let todayOrders = 0;
      let pendingValue = 0;
      const today = new Date().setHours(0, 0, 0, 0);

      snap.forEach(d => {
        const data = d.data();
        totalRevenue += data.totalPrice || 0;
        
        const orderDate = data.createdAt?.seconds ? new Date(data.createdAt.seconds * 1000).setHours(0, 0, 0, 0) : 0;
        if (orderDate === today) todayOrders++;
        
        if (data.status === 'pending' || data.status === 'preparing') {
           pendingValue += data.totalPrice || 0;
        }
      });

      setStats({
        totalOrders: snap.size,
        totalRevenue,
        todayOrders,
        pendingOrdersValue: pendingValue
      });
      
      const ordersList: any[] = [];
      snap.forEach(d => ordersList.push({ id: d.id, ...d.data() }));
      ordersList.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
      setRecentOrders(ordersList.slice(0, 5));
      setLoading(false);
    });

    // Fetch Top Selling Items
    const unsubMenu = onSnapshot(query(collection(db, "menus"), where("restaurantId", "==", restaurantId)), (snap) => {
      const items: any[] = [];
      snap.forEach(d => items.push({ id: d.id, ...d.data() }));
      items.sort((a, b) => (b.isPopular ? 1 : 0) - (a.isPopular ? 1 : 0));
      setTopItems(items.slice(0, 4));
    });

    return () => {
      unsubOrders();
      unsubMenu();
    };
  }, [restaurantId]);

  if (loading) return (
    <div className="h-[60vh] flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const statCards = [
    { title: "Total Orders", value: stats.totalOrders, icon: ShoppingBag, color: "bg-blue-500", shadow: "shadow-blue-100" },
    { title: "Total Revenue", value: `₹${stats.totalRevenue.toLocaleString()}`, icon: IndianRupee, color: "bg-emerald-500", shadow: "shadow-emerald-100" },
    { title: "Today's Orders", value: stats.todayOrders, icon: TrendingUp, color: "bg-orange-500", shadow: "shadow-orange-100" },
    { title: "In Pipeline", value: `₹${stats.pendingOrdersValue.toLocaleString()}`, icon: Clock, color: "bg-slate-800", shadow: "shadow-slate-100" },
  ];

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Executive Dashboard</h1>
        <p className="text-slate-500 mt-1 font-medium">Business overview and real-time performance metrics</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-5 hover:border-emerald-200 transition-all cursor-default">
             <div className={`w-14 h-14 ${stat.color} rounded-xl flex items-center justify-center text-white shadow-lg ${stat.shadow}`}>
                <stat.icon className="w-6 h-6" />
             </div>
             <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{stat.title}</p>
                <p className="text-xl font-black text-slate-900 mt-0.5">{stat.value}</p>
             </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Recent Orders */}
        <div className="lg:col-span-8 bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
           <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                 <Clock className="w-5 h-5 text-emerald-600" /> Recent Activity
              </h2>
              <Link href="/restaurant/orders" className="text-xs font-bold text-emerald-600 hover:underline flex items-center gap-1">
                 View All <ChevronRight className="w-3 h-3" />
              </Link>
           </div>
           <div className="divide-y divide-slate-50">
              {recentOrders.length === 0 ? (
                <div className="p-20 text-center">
                   <Package className="w-12 h-12 text-slate-100 mx-auto mb-4" />
                   <p className="text-slate-400 font-bold">No recent orders found</p>
                </div>
              ) : (
                recentOrders.map((order) => (
                  <div key={order.id} className="p-5 flex items-center justify-between hover:bg-slate-50 transition-colors">
                     <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center font-black text-slate-400 text-xs">
                           ID
                        </div>
                        <div>
                           <p className="font-bold text-slate-900 text-sm">#{order.id.slice(-6).toUpperCase()}</p>
                           <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{order.status}</p>
                        </div>
                     </div>
                     <div className="text-right">
                        <p className="font-black text-slate-900">₹{order.totalPrice}</p>
                        <p className="text-[10px] text-slate-400 font-bold">
                           {new Date(order.createdAt?.seconds * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                     </div>
                  </div>
                ))
              )}
           </div>
        </div>

        {/* Top Selling Items */}
        <div className="lg:col-span-4 space-y-6">
           <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
              <h2 className="text-lg font-black text-slate-900 mb-6 flex items-center gap-2">
                 <Star className="w-5 h-5 text-orange-500" /> Top Menu Items
              </h2>
              <div className="space-y-4">
                 {topItems.length === 0 ? (
                    <p className="text-sm font-bold text-slate-400 text-center py-10">No items yet</p>
                 ) : (
                    topItems.map((item) => (
                       <div key={item.id} className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-50 transition-all border border-transparent hover:border-slate-100">
                          <img src={item.image} className="w-12 h-12 rounded-lg object-cover" alt="" />
                          <div className="flex-1 min-w-0">
                             <p className="font-bold text-slate-900 text-sm truncate">{item.name}</p>
                             <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">{item.category}</p>
                          </div>
                          <div className="text-right">
                             <p className="font-black text-slate-900 text-sm">₹{item.price}</p>
                          </div>
                       </div>
                    ))
                 )}
              </div>
           </div>

           <div className="bg-emerald-900 rounded-3xl p-8 text-white relative overflow-hidden shadow-xl shadow-emerald-100">
              <div className="relative z-10">
                 <p className="text-emerald-300 text-[10px] font-bold uppercase tracking-[0.2em] mb-2 text-center">Kitchen Status</p>
                 <h3 className="text-2xl font-black mb-6 text-center leading-tight">Your kitchen is currently accepting orders.</h3>
                 <button className="w-full bg-white text-emerald-900 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-emerald-50 transition-all shadow-lg active:scale-95">
                    Pause Incoming Orders
                 </button>
              </div>
              <CheckCircle2 className="absolute -bottom-10 -right-10 w-40 h-40 text-white/5" />
           </div>
        </div>
      </div>
    </div>
  );
}

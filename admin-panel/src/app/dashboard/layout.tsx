"use client";

import { useEffect, useState, useRef } from "react";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { 
  LayoutDashboard, 
  Utensils, 
  ShoppingBag, 
  Users, 
  LogOut, 
  Bell, 
  Search,
  Activity,
  Zap,
  CheckCircle2,
  ExternalLink
} from "lucide-react";
import { doc, getDoc, collection, onSnapshot, query, orderBy, limit } from "firebase/firestore";
import { motion, AnimatePresence } from "framer-motion";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotifs, setShowNotifs] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push("/login");
      } else {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists() && userDoc.data().role === "admin") {
          setLoading(false);
        } else {
          router.push("/login");
        }
      }
    });

    // Real-time Notification listener (New Orders)
    const q = query(collection(db, "orders"), orderBy("createdAt", "desc"), limit(5));
    const unsubNotifs = onSnapshot(q, (snap) => {
       const list: any[] = [];
       snap.forEach(d => list.push({ id: d.id, ...d.data() }));
       setNotifications(list);
    });

    // Close dropdown on click outside
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifs(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      unsubscribe();
      unsubNotifs();
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [router]);

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-slate-50">
      <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const navItems = [
    { name: "Executive Summary", href: "/dashboard", icon: LayoutDashboard },
    { name: "Kitchen Partners", href: "/dashboard/restaurants", icon: Utensils },
    { name: "Fulfillment Logs", href: "/dashboard/orders", icon: ShoppingBag },
    { name: "Citizen Registry", href: "/dashboard/users", icon: Users },
  ];

  return (
    <div className="flex h-screen bg-white text-slate-900 font-sans overflow-hidden">
      {/* Premium Sidebar */}
      <aside className="w-72 bg-slate-950 text-white flex flex-col shadow-2xl relative z-30">
        <div className="p-8 border-b border-white/5 flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-indigo-700 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/20 ring-1 ring-white/20">
             <Zap className="w-6 h-6 text-white animate-pulse" />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tight leading-none">FOOD EXPRESS</h1>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Admin Command</p>
          </div>
        </div>

        <nav className="flex-1 p-6 space-y-2 mt-4">
          <p className="px-4 text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] mb-6">Navigation Matrix</p>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center px-4 py-3.5 rounded-2xl text-[13px] font-bold transition-all group ${
                  isActive
                    ? "text-white bg-indigo-600 shadow-xl shadow-indigo-600/20 ring-1 ring-white/10"
                    : "text-slate-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <Icon className={`w-5 h-5 mr-4 transition-transform group-hover:scale-110 ${isActive ? "text-white" : "text-slate-600"}`} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* System Health Component */}
        <div className="p-6">
           <div className="bg-white/5 rounded-3xl p-6 border border-white/5">
              <div className="flex justify-between items-center mb-4">
                 <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none">Global Nodes</p>
                 <Activity className="w-3.5 h-3.5 text-emerald-500" />
              </div>
              <div className="flex items-center gap-3">
                 <div className="w-2 h-2 bg-emerald-500 rounded-full animate-ping" />
                 <span className="text-xs font-bold text-slate-200">Network Operational</span>
              </div>
              <p className="text-[9px] font-medium text-slate-500 mt-2">Latency: 24ms | Uptime: 99.9%</p>
           </div>
        </div>

        <div className="p-6 border-t border-white/5">
          <button
            onClick={() => auth.signOut()}
            className="w-full flex items-center px-4 py-3.5 rounded-2xl text-xs font-black uppercase tracking-widest text-slate-500 hover:text-rose-400 hover:bg-rose-400/5 transition-all group"
          >
            <LogOut className="w-5 h-5 mr-4 transition-transform group-hover:-translate-x-1" />
            Deauthorize Session
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-slate-50/50">
         <header className="h-24 bg-white/80 backdrop-blur-md border-b border-slate-200/60 flex items-center justify-between px-12 sticky top-0 z-20">
            <div className="relative w-[450px]">
               <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
               <input 
                 type="text" placeholder="Access encrypted data modules..."
                 className="w-full pl-14 pr-6 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold outline-none ring-offset-2 focus:ring-2 focus:ring-indigo-100 focus:bg-white transition-all shadow-sm"
               />
               <kbd className="absolute right-5 top-1/2 -translate-y-1/2 px-2 py-1 bg-white border border-slate-100 rounded text-[9px] font-black text-slate-400 shadow-sm">CTRL + K</kbd>
            </div>
            
            <div className="flex items-center gap-6">
               <div className="relative" ref={notifRef}>
                  <button 
                    onClick={() => setShowNotifs(!showNotifs)}
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center border transition-all relative ${
                      showNotifs ? 'bg-indigo-600 border-indigo-600 shadow-lg shadow-indigo-100' : 'bg-white border-slate-100 hover:bg-slate-50'
                    }`}
                  >
                     <Bell className={`w-5 h-5 ${showNotifs ? 'text-white' : 'text-slate-400'}`} />
                     {notifications.length > 0 && (
                       <div className="absolute top-3 right-3 w-2 h-2 bg-rose-500 rounded-full border-2 border-white shadow-sm" />
                     )}
                  </button>

                  <AnimatePresence>
                    {showNotifs && (
                      <motion.div 
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        className="absolute right-0 mt-4 w-96 bg-white rounded-[2rem] shadow-2xl shadow-slate-200/60 border border-slate-100 p-8 z-50 overflow-hidden"
                      >
                         <div className="flex justify-between items-center mb-8">
                            <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest">Protocol Alerts</h4>
                            <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-full uppercase tracking-widest">{notifications.length} New</span>
                         </div>
                         <div className="space-y-4">
                            {notifications.length === 0 ? (
                               <div className="py-10 text-center">
                                  <CheckCircle2 className="w-10 h-10 text-emerald-100 mx-auto mb-3" />
                                  <p className="text-xs font-bold text-slate-400">All protocols synchronized</p>
                               </div>
                            ) : (
                               notifications.map((n, i) => (
                                  <div key={i} className="flex gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100/50 hover:bg-slate-100 transition-colors cursor-pointer group">
                                     <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center border border-slate-100 shadow-sm shrink-0">
                                        <ShoppingBag className="w-5 h-5 text-indigo-500" />
                                     </div>
                                     <div className="flex-1 min-w-0">
                                        <p className="text-xs font-black text-slate-900 leading-none">New Incoming Order</p>
                                        <p className="text-[10px] font-bold text-slate-400 mt-1.5 truncate">Amt: ₹{n.totalPrice} | Node: {n.userName}</p>
                                     </div>
                                     <div className="text-right shrink-0">
                                        <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">JUST NOW</p>
                                     </div>
                                  </div>
                               ))
                            )}
                         </div>
                         <button className="w-full mt-8 py-4 bg-slate-50 text-slate-400 text-[10px] font-black uppercase tracking-widest rounded-2xl hover:bg-slate-900 hover:text-white transition-all flex items-center justify-center gap-2">
                           View Monitoring Grid <ExternalLink className="w-3.5 h-3.5" />
                         </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
               </div>

               <div className="w-px h-10 bg-slate-200" />

               <div className="flex items-center gap-4 group cursor-pointer">
                  <div className="text-right hidden sm:block">
                     <p className="text-sm font-black text-slate-900 leading-none group-hover:text-indigo-600 transition-colors">Supreme Overseer</p>
                     <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1.5">Authorized Identity</p>
                  </div>
                  <div className="relative">
                     <div className="w-14 h-14 rounded-2xl bg-slate-200 border-2 border-white overflow-hidden shadow-xl shadow-slate-200/30 group-hover:scale-105 transition-transform duration-500">
                        <img src="https://ui-avatars.com/api/?name=Admin&background=4F46E5&color=fff&bold=true&length=1" className="w-full h-full object-cover" />
                     </div>
                     <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full border-4 border-white shadow-sm flex items-center justify-center">
                        <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                     </div>
                  </div>
               </div>
            </div>
         </header>

         <main className="flex-1 overflow-auto p-12 custom-scrollbar">
            <motion.div 
               key={pathname}
               initial={{ opacity: 0, y: 10 }}
               animate={{ opacity: 1, y: 0 }}
               className="max-w-[1600px] mx-auto"
            >
               {children}
            </motion.div>
         </main>
      </div>
    </div>
  );
}

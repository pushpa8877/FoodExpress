"use client";

import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { ShoppingBag, UtensilsCrossed, LogOut, Bell, LayoutDashboard } from "lucide-react";
import { doc, getDoc } from "firebase/firestore";
import { motion } from "framer-motion";

export default function RestaurantLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [loading, setLoading] = useState(true);
  const [restaurantName, setRestaurantName] = useState("Merchant");
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push("/login");
      } else {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists() && userDoc.data().role === "restaurant") {
          setRestaurantName(userDoc.data().name || "Merchant");
          setLoading(false);
        } else {
          router.push("/login"); // or handle unauthorized access better
        }
      }
    });
    return () => unsubscribe();
  }, [router]);

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-slate-50">
      <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const navItems = [
    { name: "Dashboard", href: "/restaurant", icon: LayoutDashboard },
    { name: "Order Desk", href: "/restaurant/orders", icon: ShoppingBag },
    { name: "Kitchen Menu", href: "/restaurant/menu", icon: UtensilsCrossed },
    { name: "Merchant Profile", href: "/restaurant/profile", icon: Bell }, // Using Bell as a fallback, will change to User icon if needed
  ];

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 font-sans overflow-hidden">
      {/* Clean Sidebar */}
      <aside className="w-72 bg-white border-r border-slate-200 flex flex-col shadow-sm">
        <div className="p-8 border-b border-slate-100 flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center shadow-md shadow-emerald-100">
             <UtensilsCrossed className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-black tracking-tight text-slate-900 leading-none">FoodExpress</h1>
            <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest mt-1">Merchant Hub</p>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1 mt-6">
          <p className="px-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Management</p>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                  isActive
                    ? "text-emerald-700 bg-emerald-50"
                    : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
                }`}
              >
                <Icon className={`w-5 h-5 mr-3 ${isActive ? "text-emerald-600" : "text-slate-400"}`} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-100 bg-slate-50/50">
          <button
            onClick={() => auth.signOut()}
            className="w-full flex items-center px-4 py-3 rounded-xl text-sm font-semibold text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-all"
          >
            <LogOut className="w-5 h-5 mr-3" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0">
         <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-10">
            <div className="flex items-center gap-4">
               <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Signed in as</p>
                  <h2 className="text-base font-black text-slate-900 mt-1">{restaurantName}</h2>
               </div>
               <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse mx-2" />
            </div>
            
            <div className="flex items-center gap-6">
               <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center border border-slate-100 hover:bg-slate-100 transition-colors cursor-pointer relative">
                  <Bell className="w-5 h-5 text-slate-400" />
                  <div className="absolute top-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white" />
               </div>
               <Link 
                  href="/restaurant/profile"
                  className="flex items-center gap-3 pl-4 border-l border-slate-100 group transition-all"
               >
                  <div className="text-right hidden sm:block group-hover:opacity-80">
                     <p className="text-xs font-bold text-slate-900 group-hover:text-emerald-600">{restaurantName}</p>
                     <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Partner</p>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 border border-emerald-200 overflow-hidden group-hover:scale-105 group-hover:shadow-lg transition-all">
                     <img src={`https://ui-avatars.com/api/?name=${restaurantName}&background=059669&color=fff`} className="w-full h-full object-cover" />
                  </div>
               </Link>
            </div>
         </header>

         <main className="flex-1 overflow-auto p-10 bg-[#FBFBFE]">
            <motion.div 
               key={pathname}
               initial={{ opacity: 0, y: 5 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ duration: 0.3 }}
               className="max-w-[1400px] mx-auto"
            >
               {children}
            </motion.div>
         </main>
      </div>
    </div>
  );
}

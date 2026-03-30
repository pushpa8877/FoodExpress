"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { 
  Plus, 
  Trash2, 
  Check, 
  X, 
  Utensils, 
  MapPin, 
  Star, 
  Clock, 
  ChefHat,
  Search,
  Filter,
  Sparkles,
  LayoutGrid,
  ShieldAlert,
  ShieldCheck,
  Download,
  ExternalLink,
  ChevronRight
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import * as XLSX from 'xlsx';

export default function RestaurantsPage() {
  const [restaurants, setRestaurants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "restaurants"), (snap) => {
      const list: any[] = [];
      snap.forEach((d) => list.push({ id: d.id, ...d.data() }));
      setRestaurants(list);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const handleUpdateStatus = async (id: string, isApproved: boolean) => {
    try {
      await updateDoc(doc(db, "restaurants", id), { isApproved, updatedAt: new Date().toISOString() });
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleBlock = async (id: string, currentStatus: boolean) => {
    try {
      await updateDoc(doc(db, "restaurants", id), { isBlocked: !currentStatus, updatedAt: new Date().toISOString() });
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Permanently remove this kitchen partner from the grid? This cannot be undone.")) {
      try {
        await deleteDoc(doc(db, "restaurants", id));
      } catch (err) {
        console.error(err);
      }
    }
  };

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(restaurants.map(r => ({
      ID: r.id,
      Name: r.name,
      Email: r.email,
      Address: r.address,
      Status: r.isApproved ? 'Approved' : 'Pending',
      Account: r.isBlocked ? 'Blocked' : 'Active',
      Created: r.createdAt
    })));
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Restaurants");
    XLSX.writeFile(workbook, "FoodExpress_Partners_Registry.xlsx");
  };

  const filtered = restaurants.filter(r => {
    const matchesSearch = r.name?.toLowerCase().includes(searchTerm.toLowerCase()) || r.email?.toLowerCase().includes(searchTerm.toLowerCase());
    if (!matchesSearch) return false;
    if (filter === "pending") return !r.isApproved;
    if (filter === "active") return r.isApproved;
    if (filter === "blocked") return r.isBlocked;
    return true;
  });

  if (loading) return (
    <div className="h-[70vh] flex items-center justify-center">
       <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-12 pb-20">
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-8 bg-white/40 backdrop-blur-xl px-10 py-10 rounded-[3rem] border border-white/20 shadow-xl shadow-slate-200/40">
        <div className="flex-1">
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Kitchen Matrix</h1>
          <p className="text-slate-500 mt-2 font-medium">Verify and moderate our global network of dining partners</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-4">
          <div className="relative">
             <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
             <input 
               type="text" 
               placeholder="Search registry..."
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
               className="pl-12 pr-6 py-3.5 bg-white border border-slate-100 rounded-2xl text-xs font-bold outline-none ring-offset-2 focus:ring-2 focus:ring-indigo-100 transition-all w-64"
             />
          </div>

          <div className="flex bg-slate-100/50 p-1.5 rounded-2xl gap-1 border border-slate-100">
            {["all", "pending", "active", "blocked"].map((opt) => (
              <button
                key={opt}
                onClick={() => setFilter(opt)}
                className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                  filter === opt ? "bg-white text-indigo-600 shadow-sm" : "text-slate-400 hover:text-slate-600"
                }`}
              >
                {opt}
              </button>
            ))}
          </div>

          <button 
            onClick={exportToExcel}
            className="w-12 h-12 bg-indigo-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-200 hover:scale-110 active:scale-90 transition-all"
          >
            <Download className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 2xl:grid-cols-3 gap-10">
        <AnimatePresence mode="popLayout">
          {filtered.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="col-span-full py-40 bg-white/50 rounded-[4rem] border-4 border-dashed border-slate-100 text-center"
            >
              <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                 <LayoutGrid className="w-10 h-10 text-slate-200" />
              </div>
              <p className="text-slate-400 font-bold text-xl tracking-tight leading-none uppercase tracking-[0.2em]">Zero Data Matched</p>
            </motion.div>
          ) : (
            filtered.map((rest, idx) => (
              <motion.div
                key={rest.id}
                layout
                initial={{ opacity: 0, scale: 0.95, y: 30 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.5, delay: idx * 0.05 }}
                className={`bg-white rounded-[3rem] shadow-2xl shadow-slate-200/30 border border-slate-50 overflow-hidden group hover:scale-[1.02] transition-all duration-700 relative ${rest.isBlocked ? 'grayscale opacity-80' : ''}`}
              >
                <div className="relative h-64 overflow-hidden">
                  <img src={rest.image} alt={rest.name} className="w-full h-full object-cover group-hover:scale-125 transition-transform duration-1000" />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-80" />
                  
                  <div className="absolute top-8 right-8">
                     <div className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest backdrop-blur-md border ${
                        rest.isApproved ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                     }`}>
                        {rest.isApproved ? 'Verified Partner' : 'Awaiting Review'}
                     </div>
                  </div>

                  <div className="absolute bottom-8 left-8 right-8">
                     <div className="flex items-center gap-2 mb-2">
                        <div className="flex text-amber-400">
                          {[1,2,3,4,5].map(s => <Star key={s} className="w-3 h-3 fill-current" />)}
                        </div>
                        <span className="text-[10px] font-black text-white/70 uppercase tracking-widest">Global Rank #24</span>
                     </div>
                     <h3 className="text-3xl font-black text-white tracking-tight leading-none">{rest.name}</h3>
                  </div>
                </div>

                <div className="p-10 space-y-8">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 leading-none">Identity</p>
                      <div className="flex items-center gap-2">
                         <MapPin className="w-3.5 h-3.5 text-indigo-600" />
                         <span className="text-xs font-bold text-slate-600 truncate">{rest.address || 'Global Node'}</span>
                      </div>
                    </div>
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 leading-none">Security Status</p>
                      <div className="flex items-center gap-2">
                         {rest.isBlocked ? (
                           <><ShieldAlert className="w-3.5 h-3.5 text-rose-500" /> <span className="text-xs font-black text-rose-500">Restricted</span></>
                         ) : (
                           <><ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> <span className="text-xs font-black text-emerald-500">Authorized</span></>
                         )}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-4 pt-2">
                    {!rest.isApproved ? (
                      <button
                        onClick={() => handleUpdateStatus(rest.id, true)}
                        className="flex-1 bg-indigo-600 text-white py-5 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center justify-center gap-3 active:scale-95"
                      >
                        <Check className="w-5 h-5" /> Approve
                      </button>
                    ) : (
                      <button
                        onClick={() => handleToggleBlock(rest.id, !!rest.isBlocked)}
                        className={`flex-1 py-5 rounded-2xl font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-3 active:scale-95 border ${
                          rest.isBlocked ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100 hover:bg-rose-600 hover:text-white'
                        }`}
                      >
                        {rest.isBlocked ? <><ShieldCheck className="w-5 h-5" /> Unblock</> : <><ShieldAlert className="w-5 h-5" /> Block</>}
                      </button>
                    )}
                    
                    <button
                      onClick={() => handleDelete(rest.id)}
                      className="w-16 h-16 bg-slate-50 text-slate-400 rounded-2xl flex items-center justify-center hover:bg-rose-600 hover:text-white transition-all border border-slate-100 group/btn"
                    >
                      <Trash2 className="w-6 h-6 group-hover/btn:scale-110 transition-transform" />
                    </button>
                  </div>

                  <div className="pt-4 border-t border-slate-50 flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-slate-300">
                     <span>Deployment: {rest.createdAt ? new Date(rest.createdAt).toLocaleDateString() : 'N/A'}</span>
                     <button className="flex items-center gap-1.5 hover:text-indigo-600 transition-colors">
                        Protocol Logs <ChevronRight className="w-3 h-3" />
                     </button>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

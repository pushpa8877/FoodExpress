"use client";
import { useEffect, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore"; // ✅ ADD THIS
import { db } from "@/lib/firebase";
import { 
  Search, 
  Download, 
  Clock, 
  AlertCircle,
  TrendingUp,
  Package,
  ArrowUpRight,
  ExternalLink,
  Calendar,
  Layers
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import * as XLSX from 'xlsx';

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState<any>(null);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "orders"), (snap) => {
      const list: any[] = [];
      snap.forEach(doc => list.push({ id: doc.id, ...doc.data() }));
      list.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
      setOrders(list);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(orders.map(o => ({
      ID: o.id,
      User: o.userEmail,
      Amount: o.totalPrice,
      Status: o.status,
      Items: o.items?.length || 0,
      Date: o.createdAt?.seconds ? new Date(o.createdAt.seconds * 1000).toLocaleString() : 'N/A'
    })));
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Fulfillment_Logs");
    XLSX.writeFile(workbook, "FoodExpress_Global_Orders.xlsx");
  };

  const filtered = orders.filter(o => {
    const matchesSearch = o.userEmail?.toLowerCase().includes(searchTerm.toLowerCase()) || o.id.includes(searchTerm);
    if (!matchesSearch) return false;
    if (statusFilter !== "all" && o.status !== statusFilter) return false;
    return true;
  });

  const stats = {
    total: orders.length,
    revenue: orders.reduce((s, o) => s + (o.totalPrice || 0), 0),
    pending: orders.filter(o => o.status === 'pending').length,
    completed: orders.filter(o => o.status === 'delivered').length
  };

  if (loading) return (
    <div className="h-[70vh] flex items-center justify-center">
       <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-12 pb-20">
      {/* Header & Matrix Selector */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-end gap-10">
        <div className="flex-1">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 rounded-full text-indigo-600 text-[10px] font-black uppercase tracking-widest mb-4">
             <Layers className="w-3.5 h-3.5" /> Fulfillment Pipeline
          </div>
          <h1 className="text-5xl font-black text-slate-900 tracking-tighter leading-none">Order Matrix</h1>
          <p className="text-slate-400 mt-4 font-medium text-lg">Real-time optimization of global food logistics and deployments.</p>
        </div>

        <div className="flex flex-wrap items-center gap-4">
           {/* Stats Cards */}
           <div className="grid grid-cols-2 gap-3 mr-4">
              <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col min-w-[140px]">
                 <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 leading-none">Gross Volume</p>
                 <span className="text-xl font-black text-slate-900 leading-none">₹{stats.revenue.toLocaleString()}</span>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col min-w-[140px]">
                 <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 leading-none">Total Nodes</p>
                 <span className="text-xl font-black text-slate-900 leading-none">{stats.total} Logs</span>
              </div>
           </div>
           
           <button 
             onClick={exportToExcel}
             className="w-14 h-14 bg-slate-900 text-white rounded-2xl flex items-center justify-center shadow-lg hover:scale-110 active:scale-90 transition-all"
           >
             <Download className="w-6 h-6" />
           </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 items-center bg-white/60 backdrop-blur-xl p-8 rounded-[3rem] border border-white/20 shadow-xl shadow-slate-200/40">
        <div className="relative flex-1 group">
           <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
           <input 
             type="text" 
             placeholder="Search by Order ID or User identity..."
             value={searchTerm}
             onChange={(e) => setSearchTerm(e.target.value)}
             className="w-full pl-14 pr-8 py-4 bg-white border border-slate-100 rounded-2xl text-xs font-bold outline-none focus:ring-4 focus:ring-indigo-50 focus:border-indigo-200 transition-all shadow-sm"
           />
        </div>

        <div className="flex bg-slate-100/50 p-1.5 rounded-2xl gap-1 border border-slate-100 whitespace-nowrap overflow-x-auto">
          {["all", "pending", "preparing", "delivered"].map((opt) => (
            <button
              key={opt}
              onClick={() => setStatusFilter(opt)}
              className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                statusFilter === opt ? "bg-white text-indigo-600 shadow-sm" : "text-slate-400 hover:text-slate-600"
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-[4rem] shadow-2xl shadow-slate-200/40 border border-slate-50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-10 py-8 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Transaction ID</th>
                <th className="px-10 py-8 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Partner Node</th>
                <th className="px-10 py-8 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Status Metric</th>
                <th className="px-10 py-8 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Fulfillment Value</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <AnimatePresence>
                {filtered.map((order, idx) => (
                  <motion.tr 
                    key={order.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.02 }}
                    className="group hover:bg-slate-50/70 transition-all cursor-pointer"
                    onClick={() => setSelectedOrder(selectedOrder?.id === order.id ? null : order)}
                  >
                    <td className="px-10 py-8">
                      <div className="flex items-center gap-5">
                         <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center border border-indigo-100 shadow-sm group-hover:scale-110 transition-transform duration-500">
                            <Package className="w-5 h-5 text-indigo-600" />
                         </div>
                         <div>
                            <p className="text-sm font-black text-slate-900 leading-none">#{order.id.slice(-8).toUpperCase()}</p>
                            <div className="flex items-center gap-2 mt-2">
                               <Clock className="w-3 h-3 text-slate-400" />
                               <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">
                                  {order.createdAt?.seconds ? new Date(order.createdAt.seconds * 1000).toLocaleString() : 'N/A'}
                               </span>
                            </div>
                         </div>
                      </div>
                    </td>
                    <td className="px-10 py-8">
                      <div>
                        <p className="text-xs font-black text-slate-800 leading-none">{order.userEmail}</p>
                        <p className="text-[10px] font-bold text-slate-400 mt-2 flex items-center gap-1.5">
                           <TrendingUp className="w-3 h-3 text-emerald-400" /> Authorized Citizen
                        </p>
                      </div>
                    </td>
                    <td className="px-10 py-8">
                      <span className={`inline-flex items-center px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest ${
                        order.status === 'delivered' ? 'bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100' :
                        order.status === 'pending' ? 'bg-amber-50 text-amber-600 ring-1 ring-amber-100' :
                        'bg-blue-50 text-blue-600 ring-1 ring-blue-100'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-10 py-8 text-right">
                       <div className="flex flex-col items-end">
                          <p className="text-lg font-black text-slate-900 leading-none">₹{order.totalPrice}</p>
                          <p className="text-[10px] font-bold text-indigo-500 mt-1.5 uppercase tracking-widest">{order.items?.length || 0} Modules</p>
                       </div>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
          
          {filtered.length === 0 && (
             <div className="py-40 text-center flex flex-col items-center">
                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                   <Package className="w-8 h-8 text-slate-200" />
                </div>
                <p className="text-slate-400 font-black text-xs uppercase tracking-widest">No matching logs found</p>
             </div>
          )}
        </div>
      </div>
      
      {/* Detail Overlay Panel */}
      <AnimatePresence>
        {selectedOrder && (
          <motion.div 
            initial={{ opacity: 0, x: 200 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 200 }}
            className="fixed top-24 right-12 bottom-12 w-[450px] bg-white rounded-[3rem] shadow-[0_40px_100px_rgba(0,0,0,0.1)] border-4 border-slate-50 z-40 p-12 flex flex-col overflow-hidden"
          >
             <div className="flex justify-between items-start mb-10">
                <div>
                   <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-1.5">Deployment Specs</h3>
                   <p className="text-3xl font-black text-slate-900 leading-none">#{selectedOrder.id.slice(-8).toUpperCase()}</p>
                </div>
                <button 
                  onClick={() => setSelectedOrder(null)}
                  className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center hover:bg-rose-50 hover:text-rose-500 transition-all text-slate-300"
                >
                  <ArrowUpRight className="w-6 h-6 rotate-45" />
                </button>
             </div>

             <div className="space-y-6 flex-1 overflow-auto custom-scrollbar pr-2">
                <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Payload Units</p>
                   <div className="space-y-4">
                      {selectedOrder.items?.map((item: any, i: number) => (
                        <div key={i} className="flex justify-between items-center group">
                           <div className="flex gap-4 items-center">
                              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center border border-slate-100 font-black text-xs text-indigo-600">
                                 {item.quantity}x
                              </div>
                              <p className="text-[13px] font-bold text-slate-700">{item.name}</p>
                           </div>
                           <p className="text-[13px] font-black text-slate-900">₹{item.price * item.quantity}</p>
                        </div>
                      ))}
                   </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                   <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 text-center">
                      <Calendar className="w-5 h-5 text-indigo-400 mx-auto mb-3" />
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">Timestamp</p>
                      <p className="text-xs font-black text-slate-900 mt-2 truncate">
                         {selectedOrder.createdAt?.seconds ? new Date(selectedOrder.createdAt.seconds * 1000).toLocaleDateString() : 'N/A'}
                      </p>
                   </div>
                   <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 text-center">
                      <AlertCircle className="w-5 h-5 text-amber-400 mx-auto mb-3" />
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">Node Level</p>
                      <p className="text-xs font-black text-slate-900 mt-2">Tier 01 Auth</p>
                   </div>
                </div>
             </div>

             <div className="pt-10 border-t border-slate-100">
                <div className="flex justify-between items-center mb-8">
                   <span className="text-sm font-black text-slate-400 uppercase tracking-widest">Aggregate Total</span>
                   <span className="text-4xl font-black text-slate-900">₹{selectedOrder.totalPrice}</span>
                </div>
                <button className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-100 hover:scale-105 active:scale-95 transition-all">
                  Audit Transaction <ExternalLink className="w-4 h-4 inline-block ml-2" />
                </button>
             </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

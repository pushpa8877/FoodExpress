"use client";

import { useEffect, useState } from "react";
import { db, auth } from "@/lib/firebase";
import { collection, query, where, onSnapshot, doc, updateDoc, getDocs } from "firebase/firestore";
import { 
  ChefHat, 
  PackageCheck, 
  ShoppingBag, 
  Truck, 
  MapPin, 
  Phone,
  CheckCircle2,
  Clock
} from "lucide-react";

const STATUS_FLOW = [
  { id: 'pending', label: 'Pending', color: 'bg-orange-100 text-orange-600', icon: Clock },
  { id: 'preparing', label: 'Preparing', color: 'bg-blue-100 text-blue-600', icon: ChefHat },
  { id: 'out_for_delivery', label: 'Out for Delivery', color: 'bg-purple-100 text-purple-600', icon: Truck },
  { id: 'delivered', label: 'Delivered', color: 'bg-emerald-100 text-emerald-600', icon: CheckCircle2 },
];

export default function RestaurantOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [restaurantId, setRestaurantId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("all");

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

    const q = query(
      collection(db, "orders"),
      where("restaurantId", "==", restaurantId)
    );

    const unsub = onSnapshot(q, (snap) => {
      const list: any[] = [];
      snap.forEach(d => list.push({ id: d.id, ...d.data() }));
      
      // Sort client-side to avoid index requirement
      list.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));

      // Notification for new orders
      if (snap.docChanges().some(change => change.type === "added") && !loading) {
         new Audio('/notification.mp3').play().catch(() => {});
      }

      setOrders(list);
      setLoading(false);
    }, (error) => {
      console.error("Firestore error in Orders:", error);
      setLoading(false);
    });

    return () => unsub();
  }, [restaurantId, loading]);

  const updateStatus = async (orderId: string, newStatus: string) => {
    try {
      await updateDoc(doc(db, "orders", orderId), { 
        status: newStatus,
        lastUpdated: new Date().toISOString()
      });
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return (
    <div className="h-[60vh] flex items-center justify-center">
       <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const filteredOrders = orders.filter(o => filterStatus === "all" || o.status === filterStatus);

  return (
    <div className="space-y-10 pb-20">
      <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-200 flex flex-col lg:flex-row justify-between items-center gap-6">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Order Command Center</h1>
          <p className="text-slate-500 mt-1 font-medium">Real-time fulfillment and logistics management</p>
        </div>
        
        <div className="flex flex-wrap gap-2">
           <button 
              onClick={() => setFilterStatus("all")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${filterStatus === "all" ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-500 hover:bg-slate-200"}`}
           >
              All Orders
           </button>
           {STATUS_FLOW.map(s => (
             <button 
                key={s.id}
                onClick={() => setFilterStatus(s.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${filterStatus === s.id ? "bg-emerald-600 text-white shadow-lg shadow-emerald-100" : "bg-slate-100 text-slate-500 hover:bg-slate-200"}`}
             >
                {s.label}
             </button>
           ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8">
        {filteredOrders.length === 0 ? (
          <div className="bg-white p-40 rounded-[3rem] border-2 border-dashed border-slate-100 text-center shadow-sm">
            <ShoppingBag className="w-20 h-20 text-slate-100 mx-auto mb-6" />
            <p className="text-slate-400 font-black text-xl">No active transmissions</p>
            <p className="text-slate-300 text-sm mt-2 max-w-xs mx-auto">Orders will appear here as soon as customers place them.</p>
          </div>
        ) : (
          filteredOrders.map((order) => {
            const currentStatus = STATUS_FLOW.find(s => s.id === order.status) || STATUS_FLOW[0];
            const StatusIcon = currentStatus.icon;

            return (
              <div key={order.id} className="bg-white rounded-[2.5rem] shadow-sm border border-slate-200 overflow-hidden flex flex-col xl:flex-row hover:border-emerald-400 hover:shadow-2xl hover:shadow-emerald-500/5 transition-all">
                 {/* Order Sidebar */}
                 <div className="p-8 border-b xl:border-b-0 xl:border-r border-slate-100 xl:w-96 bg-slate-50/50 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-center mb-6">
                         <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Transaction ID</span>
                         <span className="text-xs font-black text-slate-900 bg-white px-3 py-1.5 rounded-lg border border-slate-100 shadow-sm">
                            #{order.id.slice(-8).toUpperCase()}
                         </span>
                      </div>

                      <div className="space-y-5">
                         <div className={`flex items-center gap-3 p-4 rounded-2xl border ${currentStatus.color.split(' ')[0]} ${currentStatus.color.split(' ')[1]}`}>
                            <div className="w-10 h-10 bg-white/80 backdrop-blur rounded-xl flex items-center justify-center">
                               <StatusIcon className="w-5 h-5" />
                            </div>
                            <div>
                               <p className="text-[10px] font-black uppercase tracking-widest leading-none mb-1 opacity-60">Status</p>
                               <p className="font-black text-sm">{currentStatus.label}</p>
                            </div>
                         </div>

                         <div className="grid grid-cols-2 gap-3">
                            <div className="p-3 bg-white rounded-xl border border-slate-100 shadow-sm">
                               <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Time</p>
                               <p className="font-bold text-xs flex items-center gap-1.5">
                                  <Clock className="w-3 h-3 text-emerald-500" />
                                  {new Date(order.createdAt?.seconds * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </p>
                            </div>
                            <div className="p-3 bg-white rounded-xl border border-slate-100 shadow-sm">
                               <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Date</p>
                               <p className="font-bold text-xs">{new Date(order.createdAt?.seconds * 1000).toLocaleDateString()}</p>
                            </div>
                         </div>
                      </div>
                    </div>

                    <div className="mt-8 pt-8 border-t border-slate-100">
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Customer Intelligence</p>
                       <div className="space-y-4">
                          <div className="flex items-center gap-3">
                             <div className="w-10 h-10 rounded-xl bg-slate-200 overflow-hidden">
                                <img src={`https://ui-avatars.com/api/?name=${order.userName || 'U'}&background=e2e8f0&color=475569`} alt="" />
                             </div>
                             <div>
                                <p className="text-sm font-black text-slate-900">{order.userName || "Valued Customer"}</p>
                                <p className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                                   <Phone className="w-2.5 h-2.5" /> {order.userPhone || "Not available"}
                                </p>
                             </div>
                          </div>
                          <div className="flex items-start gap-2 p-3 bg-white rounded-xl border border-slate-100 shadow-inner">
                             <MapPin className="w-3.5 h-3.5 text-rose-500 mt-0.5" />
                             <p className="text-[10px] font-medium text-slate-500 leading-relaxed">
                                {order.address || "No delivery address specified"}
                             </p>
                          </div>
                       </div>
                    </div>
                 </div>

                 {/* Order Content */}
                 <div className="flex-1 p-8 flex flex-col">
                    <div className="flex-1">
                       <div className="flex justify-between items-center mb-6">
                          <h3 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em]">Deployment List</h3>
                          <div className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-lg text-[10px] font-black uppercase tracking-widest">
                             {order.items.length} Items
                          </div>
                       </div>
                       
                       <div className="space-y-2">
                          {order.items.map((item: any, i: number) => (
                            <div key={i} className="group flex justify-between items-center p-4 bg-slate-50 hover:bg-white rounded-2xl border border-transparent hover:border-slate-100 hover:shadow-xl hover:shadow-slate-200/20 transition-all">
                               <div className="flex items-center gap-4">
                                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center font-black text-emerald-600 text-sm shadow-sm border border-slate-100 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                                     {item.quantity}
                                  </div>
                                  <div>
                                     <p className="font-black text-slate-900 uppercase tracking-tight">{item.name}</p>
                                     {item.size && <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Size: {item.size}</p>}
                                  </div>
                               </div>
                               <p className="font-black text-slate-900">₹{(item.price * item.quantity).toLocaleString()}</p>
                            </div>
                          ))}
                       </div>
                    </div>

                    <div className="mt-8 pt-8 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-end sm:items-center gap-6">
                       <div className="w-full sm:w-auto">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Total Payload Value</p>
                          <p className="text-3xl font-black text-slate-900 tracking-tighter">₹{order.totalPrice.toLocaleString()}</p>
                       </div>
                       
                       <div className="flex gap-3 w-full sm:w-auto">
                          {order.status === 'pending' && (
                             <>
                                <button 
                                   onClick={() => updateStatus(order.id, 'rejected')}
                                   className="flex-1 sm:flex-none px-6 py-4 rounded-2xl text-rose-600 font-black text-[10px] uppercase tracking-widest border border-rose-100 hover:bg-rose-50 transition-all"
                                >
                                   Reject
                                </button>
                                <button 
                                   onClick={() => updateStatus(order.id, 'preparing')}
                                   className="flex-[2] sm:flex-none px-12 py-4 bg-emerald-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-emerald-500/20 hover:bg-emerald-700 hover:shadow-emerald-500/30 transition-all active:scale-95"
                                >
                                   Initialize Kitchen
                                </button>
                             </>
                          )}
                          {order.status === 'preparing' && (
                             <button 
                                onClick={() => updateStatus(order.id, 'out_for_delivery')}
                                className="w-full sm:w-auto px-12 py-4 bg-indigo-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-indigo-500/20 hover:bg-indigo-700 hover:shadow-indigo-500/30 transition-all active:scale-95 flex items-center justify-center gap-2"
                             >
                                <Truck className="w-4 h-4" /> Dispatch Personnel
                             </button>
                          )}
                          {order.status === 'out_for_delivery' && (
                             <button 
                                onClick={() => updateStatus(order.id, 'delivered')}
                                className="w-full sm:w-auto px-12 py-4 bg-emerald-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-emerald-500/20 hover:bg-emerald-700 hover:shadow-emerald-500/30 transition-all active:scale-95 flex items-center justify-center gap-2"
                             >
                                <CheckCircle2 className="w-4 h-4" /> Confirm Handover
                             </button>
                          )}
                          {order.status === 'delivered' && (
                             <div className="flex items-center gap-2 px-6 py-4 bg-emerald-50 text-emerald-600 rounded-2xl border border-emerald-100">
                                <PackageCheck className="w-5 h-5" />
                                <span className="text-[10px] font-black uppercase tracking-widest">Mission Accomplished</span>
                             </div>
                          )}
                       </div>
                    </div>
                 </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

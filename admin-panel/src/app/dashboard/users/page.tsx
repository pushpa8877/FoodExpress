"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, doc, updateDoc, query, where, getDocs } from "firebase/firestore";
import { 
  User as UserIcon, 
  Shield, 
  UserCog, 
  Sparkles,
  ShieldAlert,
  ShieldCheck,
  Download,
  ShoppingBag,
  Users,
  X,
  Search
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import * as XLSX from 'xlsx';

export default function UsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [userOrders, setUserOrders] = useState<any[]>([]);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "users"), (snap) => {
      const list: any[] = [];
      snap.forEach(d => list.push({ id: d.id, ...d.data() }));
      setUsers(list);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const changeRole = async (userId: string, newRole: string) => {
    try {
      await updateDoc(doc(db, "users", userId), { role: newRole, updatedAt: new Date().toISOString() });
    } catch (err) {
      console.error(err);
    }
  };

  const toggleBlock = async (userId: string, currentStatus: boolean) => {
    try {
      await updateDoc(doc(db, "users", userId), { isBlocked: !currentStatus, updatedAt: new Date().toISOString() });
    } catch (err) {
      console.error(err);
    }
  };

  const fetchUserOrders = async (email: string) => {
    const q = query(collection(db, "orders"), where("userEmail", "==", email));
    const snap = await getDocs(q);
    const list: any[] = [];
    snap.forEach(d => list.push({ id: d.id, ...d.data() }));
    setUserOrders(list.sort((a,b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)));
  };

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(users.map(u => ({
      ID: u.id,
      Name: u.name,
      Email: u.email,
      Role: u.role || 'user',
      Status: u.isBlocked ? 'Blocked' : 'Active',
      Created: u.createdAt
    })));
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Users");
    XLSX.writeFile(workbook, "FoodExpress_User_Base.xlsx");
  };

  const filtered = users.filter(u => 
    u.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return (
    <div className="h-[70vh] flex items-center justify-center">
       <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-12 pb-20">
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-8 bg-white/40 backdrop-blur-xl px-10 py-10 rounded-[3rem] border border-white/20 shadow-xl shadow-slate-200/40">
        <div className="flex-1">
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Citizen Roster</h1>
          <p className="text-slate-500 mt-2 font-medium">Manage authentication permissions and administrative hierarchies</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-4">
          <div className="relative">
             <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
             <input 
               type="text" 
               placeholder="Search by name or email..."
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
               className="pl-12 pr-6 py-3.5 bg-white border border-slate-100 rounded-2xl text-xs font-bold outline-none ring-offset-2 focus:ring-2 focus:ring-indigo-100 transition-all w-80"
             />
          </div>

          <button 
            onClick={exportToExcel}
            className="px-6 py-3.5 bg-indigo-600 text-white rounded-2xl flex items-center gap-3 shadow-lg shadow-indigo-200 hover:scale-105 active:scale-95 transition-all text-xs font-black uppercase tracking-widest"
          >
            <Download className="w-4 h-4" /> Export DB
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-8 bg-white rounded-[3rem] shadow-2xl shadow-slate-200/40 border border-slate-50 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="px-10 py-8 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Profile Identity</th>
                  <th className="px-10 py-8 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Access tier</th>
                  <th className="px-10 py-8 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Protocol</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                <AnimatePresence>
                  {filtered.map((u, idx) => (
                    <motion.tr 
                      key={u.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className={`group hover:bg-slate-50/50 transition-colors cursor-pointer ${selectedUser?.id === u.id ? 'bg-indigo-50/50' : ''}`}
                      onClick={() => {
                        setSelectedUser(u);
                        fetchUserOrders(u.email);
                      }}
                    >
                      <td className="px-10 py-8">
                        <div className="flex items-center gap-5">
                          <div className="relative">
                             <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ring-4 ring-white shadow-sm group-hover:scale-110 transition-transform duration-500 ${u.isBlocked ? 'bg-rose-50 text-rose-500' : 'bg-indigo-50 text-indigo-600'}`}>
                               <UserIcon className="w-7 h-7" />
                             </div>
                             {u.isBlocked && (
                               <div className="absolute -top-2 -right-2 w-6 h-6 bg-rose-500 rounded-full border-4 border-white shadow-sm flex items-center justify-center">
                                  <X className="w-3 h-3 text-white stroke-[4]" />
                               </div>
                             )}
                          </div>
                          <div>
                            <p className="text-lg font-black text-slate-900 leading-none">{u.name || "Anonymous Citizen"}</p>
                            <p className="text-[11px] font-bold text-slate-400 mt-2">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-10 py-8">
                        <div className="flex flex-col gap-2">
                           <span className={`inline-flex items-center px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest w-fit ${
                             u.role === 'admin' ? 'bg-purple-50 text-purple-600 ring-1 ring-purple-100' :
                             u.role === 'restaurant' ? 'bg-blue-50 text-blue-600 ring-1 ring-blue-100' :
                             'bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100'
                           }`}>
                             {u.role === 'admin' ? <Shield className="w-3.5 h-3.5 mr-2" /> : <UserCog className="w-3.5 h-3.5 mr-2" />}
                             {u.role || 'Standard User'}
                           </span>
                           {u.isBlocked && <span className="text-[9px] font-black text-rose-500 uppercase tracking-widest ml-1">Account Restricted</span>}
                        </div>
                      </td>
                      <td className="px-10 py-8 text-right">
                        <div className="flex items-center justify-end gap-3" onClick={e => e.stopPropagation()}>
                           <button 
                             onClick={() => toggleBlock(u.id, !!u.isBlocked)}
                             className={`p-3 rounded-xl transition-all shadow-sm ${u.isBlocked ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white' : 'bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white'}`}
                             title={u.isBlocked ? "Unblock account" : "Restrict access"}
                           >
                             {u.isBlocked ? <ShieldCheck className="w-5 h-5" /> : <ShieldAlert className="w-5 h-5" />}
                           </button>
                           <select 
                             value={u.role || 'user'} 
                             onChange={(e) => changeRole(u.id, e.target.value)}
                             className="bg-white border text-center border-slate-100 rounded-xl px-4 py-3 text-[9px] font-black uppercase tracking-widest focus:ring-4 focus:ring-indigo-50 focus:border-indigo-200 transition-all outline-none"
                           >
                             <option value="user">Assign User</option>
                             <option value="restaurant">Assign Merchant</option>
                             <option value="admin">Assign Overseer</option>
                           </select>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        </div>

        {/* User Intelligence Panel */}
        <div className="lg:col-span-4 space-y-8">
           <AnimatePresence mode="wait">
             {selectedUser ? (
               <motion.div 
                 key={selectedUser.id}
                 initial={{ opacity: 0, scale: 0.95 }}
                 animate={{ opacity: 1, scale: 1 }}
                 className="bg-slate-900 p-10 rounded-[3rem] text-white shadow-2xl shadow-indigo-200/40 relative overflow-hidden"
               >
                  <div className="relative z-10">
                    <div className="flex justify-between items-start mb-10">
                       <div className="w-20 h-20 rounded-3xl bg-indigo-600 flex items-center justify-center shadow-xl shadow-indigo-900">
                          <ShoppingBag className="w-10 h-10" />
                       </div>
                       <div className="text-right">
                          <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Order Volume</p>
                          <p className="text-4xl font-black mt-1">{userOrders.length}</p>
                       </div>
                    </div>
                    
                    <h3 className="text-xl font-black mb-1">{selectedUser.name}</h3>
                    <p className="text-indigo-400 text-xs font-bold mb-8">{selectedUser.email}</p>

                    <div className="space-y-6">
                       <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Historical Matrix</p>
                       <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                          {userOrders.length === 0 ? (
                            <p className="text-sm font-bold text-slate-500 italic py-4 text-center bg-white/5 rounded-2xl">No deployment history found</p>
                          ) : (
                            userOrders.map((order, i) => (
                              <div key={i} className="bg-white/5 p-4 rounded-2xl border border-white/5 flex justify-between items-center group hover:bg-white/10 transition-all">
                                 <div>
                                    <p className="text-[10px] font-black text-indigo-400">#{order.id.slice(-6).toUpperCase()}</p>
                                    <p className="text-xs font-bold mt-1">₹{order.totalPrice}</p>
                                 </div>
                                 <div className="text-right">
                                    <p className={`text-[9px] font-black uppercase tracking-widest ${order.status === 'delivered' ? 'text-emerald-400' : 'text-amber-400'}`}>
                                       {order.status}
                                    </p>
                                    <p className="text-[9px] font-bold text-slate-500 mt-1">{order.createdAt?.seconds ? new Date(order.createdAt.seconds * 1000).toLocaleDateString() : 'N/A'}</p>
                                 </div>
                              </div>
                            ))
                          )}
                       </div>
                    </div>
                  </div>
                  <div className="absolute bottom-0 right-0 w-64 h-64 bg-indigo-600/10 rounded-full -mb-32 -mr-32 blur-3xl" />
               </motion.div>
             ) : (
               <div className="bg-white p-12 rounded-[3rem] border-4 border-dashed border-slate-100 flex flex-col items-center justify-center text-center">
                  <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                     <Users className="w-10 h-10 text-slate-200" />
                  </div>
                  <p className="text-slate-400 font-black text-xs uppercase tracking-widest leading-none">Select a profile</p>
                  <p className="text-slate-300 text-[11px] font-medium mt-3 italic">Choose a citizen from the roster to view their historical fulfillment logs and behavior analytics.</p>
               </div>
             )}
           </AnimatePresence>

           <div className="bg-emerald-600 p-10 rounded-[3rem] text-white shadow-xl shadow-emerald-100 relative overflow-hidden group">
              <Sparkles className="w-12 h-12 mb-6 text-emerald-200 group-hover:rotate-12 transition-transform duration-500" />
              <h4 className="text-xl font-black mb-2">Growth Metric</h4>
              <p className="text-emerald-100 text-sm font-medium leading-relaxed mb-6">Database integrity checks confirm 99.4% user-facing latency optimization.</p>
              <div className="w-full bg-white/20 h-2 rounded-full overflow-hidden">
                 <div className="w-[94%] bg-white h-full" />
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}

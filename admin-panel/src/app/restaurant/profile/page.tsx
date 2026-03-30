"use client";

import { useEffect, useState, useRef } from "react";
import { db, auth, storage } from "@/lib/firebase";
import { doc, getDoc, updateDoc, query, collection, where, getDocs } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { 
  User, 
  Mail, 
  MapPin, 
  Building2, 
  Camera, 
  Save, 
  Loader2, 
  CheckCircle2,
  Globe,
  Phone,
  Info
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function MerchantProfilePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [restaurantId, setRestaurantId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    address: "",
    description: "",
    phone: "",
    image: ""
  });
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      const user = auth.currentUser;
      if (!user) return;

      // 1. Get user data
      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (!userDoc.exists()) return;
      const userData = userDoc.data();

      // 2. Get restaurant data
      const q = query(collection(db, "restaurants"), where("ownerId", "==", user.uid));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const restDoc = querySnapshot.docs[0];
        const restData = restDoc.data();
        setRestaurantId(restDoc.id);
        
        setFormData({
          name: restData.name || "",
          email: restData.email || userData.email || "",
          address: restData.address || "",
          description: restData.description || "",
          phone: restData.phone || "",
          image: restData.image || ""
        });
      }
      setLoading(false);
    };

    fetchProfile();
  }, []);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !restaurantId) return;

    // Local preview
    const reader = new FileReader();
    reader.onloadend = () => setPreviewImage(reader.result as string);
    reader.readAsDataURL(file);

    try {
      setSaving(true);
      const storageRef = ref(storage, `restaurants/${restaurantId}/cover`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      setFormData(prev => ({ ...prev, image: url }));
    } catch (error) {
      console.error("Upload failed", error);
    } finally {
      setSaving(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const user = auth.currentUser;
    if (!user || !restaurantId) return;

    setSaving(true);
    try {
      // 1. Update Restaurant Document
      await updateDoc(doc(db, "restaurants", restaurantId), {
        name: formData.name,
        email: formData.email,
        address: formData.address,
        description: formData.description,
        phone: formData.phone,
        image: formData.image,
        updatedAt: new Date().toISOString()
      });

      // 2. Update User Document (redundancy for consistency)
      await updateDoc(doc(db, "users", user.uid), {
        restaurantName: formData.name,
        name: formData.name, // Usually name is owner name, but user requested updating it
        email: formData.email
      });

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error("Save failed", error);
      alert("Failed to update profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="h-[60vh] flex items-center justify-center">
       <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto pb-20">
      <div className="mb-10 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Merchant Identity</h1>
          <p className="text-slate-500 mt-2 font-medium">Manage your business details and public presence</p>
        </div>
        <AnimatePresence>
          {success && (
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="flex items-center gap-2 bg-emerald-50 text-emerald-600 px-4 py-2 rounded-xl border border-emerald-100 font-bold text-sm"
            >
              <CheckCircle2 className="w-4 h-4" /> Changes Pulse Synchronized
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Visual Identity */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm text-center relative overflow-hidden group">
            <div className="relative z-10">
              <div className="w-32 h-32 rounded-3xl bg-slate-50 mx-auto mb-6 border border-slate-100 overflow-hidden relative border-dashed">
                <img 
                  src={previewImage || formData.image || `https://ui-avatars.com/api/?name=${formData.name}&background=10b981&color=fff&size=128`} 
                  className="w-full h-full object-cover" 
                  alt="" 
                />
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white"
                >
                  <Camera className="w-8 h-8" />
                </button>
              </div>
              <h3 className="font-black text-slate-900 text-lg leading-tight truncate">{formData.name}</h3>
              <p className="text-xs font-bold text-emerald-600 uppercase tracking-widest mt-2">Verified Partner</p>
            </div>
            {/* Background elements */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50/50 rounded-full blur-3xl -mr-16 -mt-16" />
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleImageUpload} 
              className="hidden" 
              accept="image/*" 
            />
          </div>

          <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white shadow-xl shadow-slate-200">
            <Info className="w-8 h-8 text-emerald-400 mb-4" />
            <h4 className="font-black text-lg mb-2 leading-tight">Identity Sync</h4>
            <p className="text-slate-400 text-sm leading-relaxed">Updating your restaurant name also synchronizes your login display name and customer-facing ID across the FoodExpress network.</p>
          </div>
        </div>

        {/* Configuration Fields */}
        <form onSubmit={handleSave} className="lg:col-span-8 space-y-6">
          <div className="bg-white p-10 rounded-[3rem] border border-slate-200 shadow-sm space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Restaurant Name</label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <input 
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="Grand Kitchen Express"
                    className="w-full pl-12 pr-6 py-4 bg-slate-50 border-transparent rounded-2xl focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm font-bold text-slate-900 outline-none"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Business Email</label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input 
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    placeholder="contact@kitchen.com"
                    className="w-full pl-12 pr-6 py-4 bg-slate-50 border-transparent rounded-2xl focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm font-bold text-slate-900 outline-none"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Inquiry Phone</label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                    <Phone className="w-4 h-4" />
                  </div>
                  <input 
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    placeholder="+91 98765 43210"
                    className="w-full pl-12 pr-6 py-4 bg-slate-50 border-transparent rounded-2xl focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm font-bold text-slate-900 outline-none"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Business Address</label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <input 
                    type="text"
                    required
                    value={formData.address}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                    placeholder="Floor 2, Tech Plaza, London"
                    className="w-full pl-12 pr-6 py-4 bg-slate-50 border-transparent rounded-2xl focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm font-bold text-slate-900 outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Public Description</label>
              <textarea 
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder="Share your kitchen's story..."
                rows={4}
                className="w-full px-6 py-4 bg-slate-50 border-transparent rounded-3xl focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm font-bold text-slate-900 outline-none resize-none"
              />
            </div>

            <button 
              type="submit"
              disabled={saving}
              className="w-full py-5 bg-emerald-600 text-white rounded-3xl font-black text-[10px] uppercase tracking-[0.3em] flex items-center justify-center gap-3 shadow-xl shadow-emerald-500/20 hover:bg-emerald-700 hover:shadow-emerald-500/30 transition-all active:scale-[0.98] disabled:opacity-50"
            >
              {saving ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <Save className="w-5 h-5" /> Push Updates to Cloud
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

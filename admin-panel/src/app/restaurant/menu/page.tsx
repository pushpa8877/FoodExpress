"use client";

import { useEffect, useState, useRef } from "react";
import { db, auth, storage } from "@/lib/firebase";
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  doc, 
  addDoc, 
  deleteDoc, 
  updateDoc,
  getDocs,
  serverTimestamp
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { 
  Plus, 
  Trash2, 
  Utensils, 
  Edit3,
  X,
  Search,
  Star,
  UploadCloud,
  Loader2
} from "lucide-react";

interface MenuSize {
  name: string;
  price: number;
}

interface MenuItem {
  id: string;
  name: string;
  price: number;
  discountPrice?: number;
  category: string;
  image: string;
  description: string;
  isAvailable: boolean;
  isPopular: boolean;
  sizes?: MenuSize[];
  restaurantId: string;
}

export default function RestaurantMenuPage() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [restaurantId, setRestaurantId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("All");
  const [sortBy] = useState("Newest");

  // Form State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [discountPrice, setDiscountPrice] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState("");
  const [isPopular, setIsPopular] = useState(false);
  const [sizes, setSizes] = useState<MenuSize[]>([]);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

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

    const q = query(collection(db, "menus"), where("restaurantId", "==", restaurantId));
    const unsub = onSnapshot(q, (snap) => {
      const list: MenuItem[] = [];
      snap.forEach(d => list.push({ id: d.id, ...d.data() } as MenuItem));
      setMenuItems(list);
      setLoading(false);
    });

    return () => unsub();
  }, [restaurantId]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !restaurantId) return;

    setUploading(true);
    try {
      const storageRef = ref(storage, `menus/${restaurantId}/${Date.now()}_${file.name}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      setImage(url);
    } catch (err) {
      console.error("Upload error:", err);
      alert("Failed to upload image.");
    } finally {
      setUploading(false);
    }
  };

  const handleSaveItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!restaurantId) return;
    
    setSaving(true);
    const itemData = {
      restaurantId,
      name,
      price: parseFloat(price),
      discountPrice: discountPrice ? parseFloat(discountPrice) : null,
      category: category.toLowerCase().trim(),
      description,
      image: image || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=1000",
      isPopular,
      isAvailable: true,
      sizes,
      updatedAt: serverTimestamp(),
      createdAt: editingId ? undefined : serverTimestamp()
    };

    try {
      if (editingId) {
        await updateDoc(doc(db, "menus", editingId), itemData);
      } else {
        await addDoc(collection(db, "menus"), itemData);
      }
      
      resetForm();
    } catch (err) {
      console.error(err);
      alert("Error saving menu item.");
    } finally {
      setSaving(false);
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setName("");
    setPrice("");
    setDiscountPrice("");
    setCategory("");
    setDescription("");
    setImage("");
    setIsPopular(false);
    setSizes([]);
  };

  const handleEdit = (item: MenuItem) => {
    setEditingId(item.id);
    setName(item.name);
    setPrice(item.price.toString());
    setDiscountPrice(item.discountPrice?.toString() || "");
    setCategory(item.category);
    setDescription(item.description || "");
    setImage(item.image);
    setIsPopular(item.isPopular || false);
    setSizes(item.sizes || []);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const toggleAvailability = async (id: string, current: boolean) => {
    try {
      await updateDoc(doc(db, "menus", id), { isAvailable: !current });
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteItem = async (id: string) => {
    if (confirm("Permanently delete this item from your menu?")) {
      try {
        await deleteDoc(doc(db, "menus", id));
      } catch (err) {
        console.error(err);
      }
    }
  };

  const addSize = () => {
    setSizes([...sizes, { name: "", price: 0 }]);
  };

  const updateSize = (index: number, field: string, value: any) => {
    const newSizes = [...sizes];
    newSizes[index] = { ...newSizes[index], [field]: field === 'price' ? parseFloat(value) : value };
    setSizes(newSizes);
  };

  const removeSize = (index: number) => {
    setSizes(sizes.filter((_, i) => i !== index));
  };

  if (loading) return (
    <div className="h-[60vh] flex items-center justify-center">
       <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const categories = ["All", ...Array.from(new Set(menuItems.map(item => item.category)))];
  
  const filteredItems = menuItems
    .filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = filterCategory === "All" || item.category === filterCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      if (sortBy === "Price (Low-High)") return a.price - b.price;
      if (sortBy === "Price (High-Low)") return b.price - a.price;
      return 0; // Default: Newest/Unsorted
    });

  return (
    <div className="space-y-10 pb-20">
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Menu Orchestrator</h1>
          <p className="text-slate-500 mt-1 font-medium">Design and manage your restaurant's culinary offerings</p>
        </div>
        <div className="flex items-center gap-3">
           <div className="px-5 py-2.5 bg-emerald-50 border border-emerald-100 rounded-xl">
              <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest leading-none">Total Items</p>
              <p className="text-lg font-black text-emerald-900 mt-1">{menuItems.length}</p>
           </div>
           <div className="px-5 py-2.5 bg-orange-50 border border-orange-100 rounded-xl">
              <p className="text-[10px] font-bold text-orange-600 uppercase tracking-widest leading-none">Popular</p>
              <p className="text-lg font-black text-orange-900 mt-1">{menuItems.filter(i => i.isPopular).length}</p>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Editor Panel */}
        <div className="lg:col-span-12 xl:col-span-4 transition-all">
          <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-200 sticky top-4">
            <h2 className="text-lg font-black text-slate-900 mb-8 flex items-center gap-3">
              <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center text-white">
                {editingId ? <Edit3 className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              </div>
              {editingId ? "Edit Delicacy" : "Compose New Item"}
            </h2>
            
            <form onSubmit={handleSaveItem} className="space-y-6">
              {/* Image Upload Area */}
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="group relative w-full h-48 bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl overflow-hidden cursor-pointer hover:border-emerald-400 hover:bg-emerald-50/20 transition-all flex flex-col items-center justify-center"
              >
                {image ? (
                  <>
                    <img src={image} className="w-full h-full object-cover" alt="Preview" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white font-bold text-xs gap-2 transition-opacity">
                       <UploadCloud className="w-5 h-5" /> Change Image
                    </div>
                  </>
                ) : (
                  <div className="text-center p-6">
                    {uploading ? (
                      <Loader2 className="w-10 h-10 text-emerald-500 animate-spin mx-auto mb-2" />
                    ) : (
                      <UploadCloud className="w-10 h-10 text-slate-300 mx-auto mb-2 group-hover:text-emerald-500 transition-colors" />
                    )}
                    <p className="text-xs font-bold text-slate-500">Tap to upload item photo</p>
                    <p className="text-[10px] text-slate-400 mt-1">PNG, JPG or JPEG up to 5MB</p>
                  </div>
                )}
                <input 
                  type="file" ref={fileInputRef} className="hidden" 
                  accept="image/*" onChange={handleImageUpload} 
                />
              </div>

              <div className="space-y-4">
                 <div className="grid grid-cols-1 gap-4">
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 block">Dish Name</label>
                      <input 
                        type="text" required placeholder="e.g. Signature Truffle Pasta"
                        className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:bg-white transition-all shadow-sm"
                        value={name} onChange={e => setName(e.target.value)}
                      />
                    </div>
                 </div>

                 <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 block">Base Price (₹)</label>
                      <input 
                        type="number" required placeholder="0.00"
                        className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-xl text-sm font-black focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:bg-white transition-all shadow-sm"
                        value={price} onChange={e => setPrice(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 block">Category</label>
                      <input 
                        type="text" required placeholder="e.g. Appetizers"
                        className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:bg-white transition-all shadow-sm"
                        value={category} onChange={e => setCategory(e.target.value)}
                      />
                    </div>
                 </div>

                 <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 block">Description</label>
                    <textarea 
                      placeholder="Ingredients, spice level, serving size..."
                      rows={3}
                      className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:bg-white transition-all shadow-sm resize-none"
                      value={description} onChange={e => setDescription(e.target.value)}
                    />
                 </div>

                 {/* Advanced Pricing */}
                 <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-4">
                    <div className="flex items-center justify-between">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Variants & Sizes</label>
                       <button 
                          type="button" onClick={addSize}
                          className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest hover:text-emerald-700"
                       >
                          + Add Size
                       </button>
                    </div>
                    {sizes.length === 0 ? (
                       <p className="text-[10px] text-slate-400 italic">No variants added (using base price)</p>
                    ) : (
                      <div className="space-y-2">
                        {sizes.map((s, idx) => (
                          <div key={idx} className="flex gap-2">
                             <input 
                                type="text" placeholder="Small"
                                className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold"
                                value={s.name} onChange={e => updateSize(idx, 'name', e.target.value)}
                             />
                             <input 
                                type="number" placeholder="Price"
                                className="w-20 px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-black"
                                value={s.price} onChange={e => updateSize(idx, 'price', e.target.value)}
                             />
                             <button type="button" onClick={() => removeSize(idx)} className="p-2 text-slate-300 hover:text-rose-500">
                                <Trash2 className="w-4 h-4" />
                             </button>
                          </div>
                        ))}
                      </div>
                    )}
                 </div>

                 <div className="flex items-center gap-3 p-4 bg-orange-50/50 rounded-2xl border border-orange-100/50">
                    <input 
                      type="checkbox" id="popular"
                      className="w-5 h-5 rounded-lg border-orange-200 text-orange-500 focus:ring-orange-500/20"
                      checked={isPopular} onChange={e => setIsPopular(e.target.checked)}
                    />
                    <label htmlFor="popular" className="text-xs font-bold text-orange-700 select-none flex items-center gap-1.5 cursor-pointer">
                       <Star className="w-3.5 h-3.5 fill-orange-500" /> Mark as Best Seller
                    </label>
                 </div>
              </div>

              <div className="flex gap-3">
                {editingId && (
                  <button 
                    type="button" onClick={resetForm}
                    className="flex-1 py-4 text-slate-500 font-bold text-xs uppercase tracking-widest border border-slate-200 rounded-2xl hover:bg-slate-50 transition-all"
                  >
                    Cancel
                  </button>
                )}
                <button 
                  type="submit" disabled={saving || uploading}
                  className="flex-[2] bg-emerald-600 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-emerald-500/20 hover:bg-emerald-700 hover:shadow-emerald-500/30 transition-all disabled:opacity-50 active:scale-95"
                >
                  {saving ? "Perfecting Dish..." : editingId ? "Save Evolution" : "Publish to Kitchen"}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Listings Panel */}
        <div className="lg:col-span-12 xl:col-span-8 space-y-8">
           {/* Filters Bar */}
           <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 items-center">
              <div className="relative flex-1 group">
                 <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-emerald-500 transition-colors" />
                 <input 
                    type="text" placeholder="Trace your culinary creations..."
                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:bg-white transition-all shadow-inner"
                    value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                 />
              </div>
              <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
                 {categories.map(cat => (
                   <button 
                      key={cat}
                      onClick={() => setFilterCategory(cat)}
                      className={`px-5 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${
                        filterCategory === cat 
                          ? "bg-emerald-600 text-white border-emerald-600 shadow-lg shadow-emerald-100" 
                          : "bg-white text-slate-500 border-slate-100 hover:border-emerald-200"
                      }`}
                   >
                      {cat}
                   </button>
                 ))}
              </div>
           </div>

           {/* Items Grid */}
           {filteredItems.length === 0 ? (
            <div className="bg-white p-40 rounded-[3rem] border-2 border-dashed border-slate-100 text-center shadow-sm">
              <Utensils className="w-20 h-20 text-slate-100 mx-auto mb-6" />
              <p className="text-slate-400 font-black text-xl">Kitchen is awaiting recipes</p>
              <p className="text-slate-300 text-sm mt-2 max-w-xs mx-auto">Start filling your menu with signature dishes to delight your customers.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredItems.map((item) => (
                <div key={item.id} className="group bg-white p-5 rounded-[2.5rem] shadow-sm border border-slate-200 hover:border-emerald-400 hover:shadow-2xl hover:shadow-emerald-500/5 transition-all flex flex-col relative">
                   <div className="flex gap-5 mb-5 h-32">
                      <div className="w-32 h-32 bg-slate-100 rounded-[2rem] overflow-hidden flex-shrink-0 relative">
                         <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                         {!item.isAvailable && (
                            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-[2px] flex items-center justify-center">
                               <span className="text-[10px] font-black text-white uppercase tracking-[0.2em] border border-white/40 px-3 py-1.5 rounded-full">Out of Stock</span>
                            </div>
                         )}
                         {item.isPopular && (
                            <div className="absolute top-3 left-3 w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white shadow-lg shadow-orange-500/30">
                               <Star className="w-4 h-4 fill-white" />
                            </div>
                         )}
                      </div>
                      <div className="flex-1 pt-2">
                         <div className="flex justify-between">
                            <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest leading-none mb-1.5">{item.category}</p>
                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                               <button onClick={() => handleEdit(item)} className="p-2 text-slate-300 hover:text-emerald-500 bg-white rounded-lg shadow-sm border border-slate-100">
                                  <Edit3 className="w-3.5 h-3.5" />
                               </button>
                               <button onClick={() => handleDeleteItem(item.id)} className="p-2 text-slate-300 hover:text-rose-500 bg-white rounded-lg shadow-sm border border-slate-100">
                                  <Trash2 className="w-3.5 h-3.5" />
                               </button>
                            </div>
                         </div>
                         <h3 className="font-black text-slate-900 line-clamp-1 group-hover:text-emerald-700 transition-colors uppercase tracking-tight">{item.name}</h3>
                         <p className="text-[10px] text-slate-400 font-medium mt-1.5 line-clamp-2 leading-relaxed">{item.description || "No description provided."}</p>
                         
                         <div className="mt-auto pt-3 flex items-end justify-between">
                             <div className="flex items-baseline gap-2">
                               <span className="text-xl font-black text-slate-900 tracking-tighter">₹{item.price}</span>
                               {item.discountPrice && (
                                  <span className="text-xs text-slate-300 line-through font-bold">₹{item.discountPrice}</span>
                               )}
                             </div>
                             {item.sizes && item.sizes.length > 0 && (
                                <div className="text-[10px] font-bold text-slate-400 uppercase bg-slate-50 px-3 py-1 rounded-full border border-slate-100">
                                   {item.sizes.length + 1} Variations
                                </div>
                             )}
                         </div>
                      </div>
                   </div>
                   
                   <div className="flex items-center gap-3 pt-5 border-t border-slate-50 mt-auto">
                      <button 
                        onClick={() => toggleAvailability(item.id, item.isAvailable)}
                        className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
                          item.isAvailable 
                            ? "bg-slate-900 text-white hover:bg-slate-800" 
                            : "bg-rose-50 text-rose-600 border border-rose-100"
                        }`}
                      >
                         {item.isAvailable ? (
                           <><div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" /> In Stock</>
                         ) : (
                           <><X className="w-3 h-3" /> Mark as Available</>
                         )}
                      </button>
                      {item.isAvailable && (
                        <button 
                          onClick={() => toggleAvailability(item.id, item.isAvailable)}
                          className="px-6 py-3 bg-rose-50 text-rose-600 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-rose-100 hover:bg-rose-100 transition-colors"
                        >
                           Sold Out
                        </button>
                      )}
                   </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

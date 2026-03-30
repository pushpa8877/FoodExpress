"use client";

import { useState } from "react";
import { auth, db } from "@/lib/firebase";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [role, setRole] = useState<"admin" | "restaurant">("restaurant");
  const [name, setName] = useState("");
  const [restaurantName, setRestaurantName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (isSignUp) {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(userCredential.user, { displayName: name });
        
        // Create user doc in firestore
        await setDoc(doc(db, "users", userCredential.user.uid), {
          name: name,
          restaurantName: role === "restaurant" ? restaurantName : "",
          email: email,
          role: role,
          createdAt: new Date().toISOString()
        });

        // If it's a restaurant, create the restaurant profile too
        if (role === "restaurant") {
          await setDoc(doc(db, "restaurants", userCredential.user.uid), {
            name: restaurantName,
            ownerId: userCredential.user.uid,
            email: email,
            description: "New restaurant on FoodExpress",
            image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=1000",
            rating: 5,
            reviews: 0,
            address: "",
            isOpen: true,
            createdAt: new Date().toISOString()
          });
          router.push("/restaurant/orders");
        } else {
          router.push("/dashboard");
        }
      } else {
        // Sign In
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const userDoc = await getDoc(doc(db, "users", userCredential.user.uid));
        
        if (userDoc.exists()) {
          const userData = userDoc.data();
          if (userData.role === "admin") {
            router.push("/dashboard");
          } else if (userData.role === "restaurant") {
            router.push("/restaurant/orders");
          } else {
            await auth.signOut();
            setError("Unauthorized. Access denied.");
          }
        } else {
          await auth.signOut();
          setError("User account not found.");
        }
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8F9FB] px-4 font-sans">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-[2.5rem] shadow-2xl border border-white">
        <div className="text-center">
          <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
             <span className="text-3xl">🚀</span>
          </div>
          <h2 className="text-3xl font-black text-gray-900 tracking-tight">FoodExpress Hub</h2>
          <p className="mt-2 text-sm text-gray-500 font-medium">
            {isSignUp ? "Create your partner account" : "Welcome back! Please sign in"}
          </p>
        </div>

        {isSignUp && (
          <div className="flex p-1 bg-slate-100 rounded-xl mb-4">
            <button 
              onClick={() => setRole("restaurant")}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${role === "restaurant" ? "bg-white text-primary shadow-sm" : "text-slate-400"}`}
            >
              Restaurant
            </button>
            <button 
              onClick={() => setRole("admin")}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${role === "admin" ? "bg-white text-primary shadow-sm" : "text-slate-400"}`}
            >
              Admin
            </button>
          </div>
        )}
        
        <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
          {isSignUp && (
            <>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">Full Name</label>
                <input
                  type="text" required
                  className="block w-full px-5 py-4 bg-gray-50 border-none rounded-2xl text-gray-900 focus:ring-2 focus:ring-primary focus:bg-white transition-all text-sm placeholder-gray-400"
                  placeholder="John Doe"
                  value={name} onChange={(e) => setName(e.target.value)}
                />
              </div>
              {role === "restaurant" && (
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">Restaurant Name</label>
                  <input
                    type="text" required
                    className="block w-full px-5 py-4 bg-gray-50 border-none rounded-2xl text-gray-900 focus:ring-2 focus:ring-primary focus:bg-white transition-all text-sm placeholder-gray-400"
                    placeholder="Grand Kitchen"
                    value={restaurantName} onChange={(e) => setRestaurantName(e.target.value)}
                  />
                </div>
              )}
            </>
          )}

          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">Email Address</label>
            <input
              type="email" required
              className="block w-full px-5 py-4 bg-gray-50 border-none rounded-2xl text-gray-900 focus:ring-2 focus:ring-primary focus:bg-white transition-all text-sm placeholder-gray-400"
              placeholder="admin@foodexpress.com"
              value={email} onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">Password</label>
            <input
              type="password" required
              className="block w-full px-5 py-4 bg-gray-50 border-none rounded-2xl text-gray-900 focus:ring-2 focus:ring-primary focus:bg-white transition-all text-sm placeholder-gray-400"
              placeholder="••••••••"
              value={password} onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {error && (
            <div className="bg-red-50 text-red-500 p-4 rounded-xl text-xs font-bold text-center border border-red-100 italic">
              {error}
            </div>
          )}

          <div>
            <button
              type="submit" disabled={loading}
              className="w-full flex justify-center py-4 px-4 bg-primary hover:bg-violet-700 text-white text-sm font-bold rounded-2xl shadow-lg shadow-primary/20 transition-all active:scale-[0.98] disabled:opacity-70"
            >
              {loading ? "Processing..." : (isSignUp ? "Create Account" : "Sign In")}
            </button>
          </div>
        </form>

        <div className="text-center mt-6">
          <button 
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-sm font-bold text-primary hover:underline transition-all"
          >
            {isSignUp ? "Already have an account? Sign In" : "Don't have an account? Request Access"}
          </button>
        </div>
      </div>
    </div>
  );
}

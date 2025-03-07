"use client";
import { useState, useEffect } from "react";
import { User } from "@supabase/supabase-js";
import supabase from "../../lib/supabase";
import { useRouter } from "next/navigation";

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // get the session
  useEffect(() => {
    const fetchUser = async () => {
      console.log("📢 Fetching user...");
  
      const { data, error } = await supabase.auth.getUser();
      if (error || !data.user) {
        console.error("❌ User not found, redirecting...");
        router.push("/auth");
      } else {
        console.log("✅ User fetched:", data.user);
        setUser(data.user);
      }
  
      setLoading(false);
    };
  
    fetchUser();
  }, []);
  

  const handleLogout = async () => {
    setLoading(true);

    console.log("📢 Logging out...");
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error("❌ Logout failed:", error.message);
    } else {
      console.log("✅ User logged out successfully!");
      setUser(null);
      router.push("/auth"); // logout and go back to login page
    }

    setLoading(false);
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      {user ? (
        <>
          <h1 className="text-2xl font-bold mb-4">Welcome, {user.email}!</h1>
          <button onClick={handleLogout} className="bg-red-500 text-white px-4 py-2 rounded">
            Logout
          </button>
        </>
      ) : (
        <p>No user found. Please log in.</p>
      )}
    </div>
  );
}

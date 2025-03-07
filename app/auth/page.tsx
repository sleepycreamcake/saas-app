"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import supabase from "../../lib/supabase";

export default function Auth() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSignUp = async () => {
    setLoading(true);
    setMessage("");

    console.log("📢 Sending signup request...");

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const result = await res.json();

      if (res.ok) {
        console.log("✅ Signup successful:", result);
        setMessage("Registration successful! Check your email for verification.");
      } else {
        console.error("❌ Signup failed:", result.error);
        setMessage(result.error);
      }
    } catch (error) {
      console.error("❌ API request error:", error);
      setMessage("Something went wrong!");
    }

    setLoading(false);
  };

  const handleLogin = async () => {
    setLoading(true);
    setMessage("");

    console.log("📢 Sending login request...");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const result = await res.json();

      if (res.ok) {
        console.log("✅ Login successful:", result);
        setMessage("Login successful!");
        await supabase.auth.setSession({
          access_token: result.session.access_token,
          refresh_token: result.session.refresh_token,
        });
        // if login success, jump to dashboard
        router.push("/dashboard");
      } else {
        console.error("❌ Login failed:", result.error);
        setMessage(result.error);
      }
    } catch (error) {
      console.error("❌ API request error:", error);
      setMessage("Something went wrong!");
    }

    setLoading(false);
  };

  const handleLogout = async () => {
    setLoading(true);
    setMessage("");

    console.log("📢 Sending logout request...");

    try {
      const res = await fetch("/api/auth/logout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      const result = await res.json();

      if (res.ok) {
        console.log("✅ Logout successful:", result);
        setMessage("Logout successful!");
      } else {
        console.error("❌ Logout failed:", result.error);
        setMessage(result.error);
      }
    } catch (error) {
      console.error("❌ API request error:", error);
      setMessage("Something went wrong!");
    }

    setLoading(false);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-2xl font-bold mb-4">Supabase Auth</h1>
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="p-2 border rounded mb-2"
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="p-2 border rounded mb-2"
      />
      <button onClick={handleSignUp} className="bg-blue-500 text-white px-4 py-2 rounded mb-2">
        {loading ? "Loading..." : "Sign Up"}
      </button>
      <button onClick={handleLogin} className="bg-green-500 text-white px-4 py-2 rounded">
        {loading ? "Loading..." : "Login"}
      </button>
      {message && <p className="mt-4 text-red-500">{message}</p>}
    </div>
  );
}

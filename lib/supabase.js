import { createClient } from "@supabase/supabase-js";

// 🔹 确保环境变量正确加载
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("🚨 Supabase URL or ANON KEY is missing! Check .env.local file.");
}

const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true, // ✅ 确保 Session 持久化
    storage: typeof window !== "undefined" ? localStorage : null, // ✅ 仅在浏览器端存储
    autoRefreshToken: true, // ✅ 允许自动刷新 Token
    detectSessionInUrl: true, // ✅ 解析 URL 中的 Session
  },
});

// ✅ 在 `window` 上暴露 `supabase`
if (typeof window !== "undefined") {
  window.supabase = supabase;
  window.onload = () => {
    console.log("✅ Supabase is available globally:", window.supabase);
  };
}

export default supabase;

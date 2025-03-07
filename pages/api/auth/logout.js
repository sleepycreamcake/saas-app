import supabase from "../../../lib/supabase";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  console.log("📢 Logging out user...");

  const { error } = await supabase.auth.signOut();

  if (error) {
    console.error("❌ Logout failed:", error.message);
    return res.status(400).json({ error: error.message });
  }

  console.log("✅ User logged out successfully!");
  res.status(200).json({ message: "Logout successful" });
}

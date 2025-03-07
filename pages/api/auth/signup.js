import supabase from "../../../lib/supabase";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { email, password } = req.body;

  console.log("📢 Starting user signup...");

  // sign up
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) {
    console.error("❌ Signup error:", error.message);
    return res.status(400).json({ error: error.message });
  }

  console.log("✅ Signup successful:", data);

  // get user id
  const user = data.user;
  if (!user || !user.id) {
    console.error("❌ User registration failed or missing ID");
    return res.status(400).json({ error: "User registration failed" });
  }

  console.log(`📢 User ID: ${user.id}`);

  // insert user into 'users' table
  const { error: dbError } = await supabase
    .from("users")
    .insert([{ id: user.id, email: user.email }]);

  if (dbError) {
    console.error("Database insert error:", dbError.message);
    return res.status(500).json({ error: dbError.message });
  }

  console.log("✅ User inserted into users table:", user);

  res.status(200).json({ user: data });
}

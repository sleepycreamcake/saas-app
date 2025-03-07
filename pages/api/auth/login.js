import supabase from "../../../lib/supabase";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { email, password } = req.body;

  console.log("📢 Attempting login...");

  // user login
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    console.error("❌ Login failed:", error.message);
    return res.status(400).json({ error: error.message });
  }

  const { user, session } = data;

  if (!user || !user.id || !session) {
    return res.status(400).json({ error: "Login failed or user missing" });
  }

  console.log("✅ Login successful:", user);

  // make sure user exists in 'users' table
  console.log("📢 Checking if user exists in 'users' table...");

  const { data: existingUser, error: userCheckError } = await supabase
    .from("users")
    .select("id")
    .eq("id", user.id)
    .single();

  if (userCheckError && userCheckError.code !== "PGRST116") {
    console.error("❌ User check error:", userCheckError.message);
    return res.status(500).json({ error: userCheckError.message });
  }

  // if user does not exist, insert into 'users' table
  if (!existingUser) {
    console.log("📢 Inserting user into users table...");

    const { error: insertError } = await supabase.from("users").insert([
      { id: user.id, email: user.email },
    ]);

    if (insertError) {
      console.error("❌ Database insert error:", insertError.message);
      return res.status(500).json({ error: insertError.message });
    }

    console.log("✅ User inserted into users table:", user);
  }

  // make sure the session exists
  console.log("📢 Storing session...");
  const { error: sessionError } = await supabase.auth.setSession({
    access_token: session.access_token,
    refresh_token: session.refresh_token,
  });

  if (sessionError) {
    console.error("❌ Failed to set session:", sessionError.message);
    return res.status(500).json({ error: "Failed to set session" });
  }

  console.log("✅ Session stored successfully!");

  res.status(200).json({ user: data.user, session: session });
}

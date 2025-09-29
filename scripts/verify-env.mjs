const req = ["SUPABASE_URL","SUPABASE_ANON_KEY"];
if (process.env.CHECK_SERVICE_ROLE === "1") req.push("SUPABASE_SERVICE_ROLE_KEY");
const miss = req.filter(k => !process.env[k]);
if (miss.length) { console.error("Missing ENV:", miss.join(",")); process.exit(1); }
console.log("✅ ENV ok");
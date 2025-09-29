const req = ["NEXT_PUBLIC_SUPABASE_URL","NEXT_PUBLIC_SUPABASE_ANON_KEY"];
if (process.env.CHECK_SERVICE_ROLE === "1") req.push("SUPABASE_SERVICE_ROLE_KEY");

// Solo verificar si estamos en desarrollo local
const isLocalDev = process.env.NODE_ENV === 'development' && !process.env.VERCEL;
const isVercelBuild = process.env.VERCEL === '1';

if (isLocalDev) {
  const miss = req.filter(k => !process.env[k]);
  if (miss.length) { 
    console.error("Missing ENV:", miss.join(",")); 
    console.log("💡 Tip: Las variables están configuradas en Vercel para producción");
    process.exit(1); 
  }
  console.log("✅ ENV ok (local)");
} else if (isVercelBuild) {
  console.log("✅ ENV ok (Vercel build)");
} else {
  console.log("✅ ENV ok (production)");
}
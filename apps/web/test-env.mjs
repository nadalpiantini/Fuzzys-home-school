import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

console.log('Supabase URL exists:', !!process.env.NEXT_PUBLIC_SUPABASE_URL);
console.log('Service Role Key exists:', !!process.env.SUPABASE_SERVICE_ROLE_KEY);
console.log('Anon Key exists:', !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  console.log('URL format valid:', url.includes('supabase.co') || url.includes('localhost'));
}

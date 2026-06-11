import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function run() {
  const { data: users, error: listError } = await supabase.auth.admin.listUsers();
  if (listError) {
    console.error("Error listing users:", listError);
    return;
  }
  
  const user = users.users.find(u => u.email === 'wsriraj10@gmail.com');
  if (!user) {
    console.log('User not found');
    return;
  }
  
  console.log('User ID:', user.id);
  const { data: profile, error: profErr } = await supabase
    .from('profiles')
    .update({ role: 'coach' })
    .eq('id', user.id)
    .select();
    
  console.log('Update result:', profile, profErr);
}

run();

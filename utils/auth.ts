import { createClient } from './supabase/server';

export async function getUserProfile() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  // Fetch the role from the profiles table
  const { data: profile } = await supabase
    .from('profiles')
    .select('role, player_id')
    .eq('id', user.id)
    .single();

  return {
    user,
    profile: profile || { role: 'player', player_id: null }, // default fallback
  };
}

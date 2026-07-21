import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://wptezhsjnfqewwpvfopc.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndwdGV6aHNqbmZxZXd3cHZmb3BjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ2NDA5OTAsImV4cCI6MjEwMDIxNjk5MH0.dMHtPc3GIlsoOiak_8GOjLIRMhiGrxrgFvYHrUVKsMw";

let supabaseClient: SupabaseClient | null = null;

if (SUPABASE_URL && SUPABASE_ANON_KEY && !SUPABASE_URL.includes('tu-proyecto')) {
  supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}

export const supabase = supabaseClient;

export async function saveMatchResult(winnerName: string, totalPlayers: number) {
  if (!supabaseClient) {
    return undefined;
  }

  try {
    const { error } = await supabaseClient
      .from('matches')
      .insert([
        {
          winner_name: winnerName,
          total_players: totalPlayers,
          played_at: new Date().toISOString()
        }
      ]);

    if (error) {
      console.error('Error al insertar partida en Supabase:', error);
    }
  } catch (err) {
    console.error('Error de conexión con Supabase:', err);
  }

  return undefined;
}

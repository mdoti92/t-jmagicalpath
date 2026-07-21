import { createClient } from '@supabase/supabase-js';
const SUPABASE_URL = (process.env.SUPABASE_URL || 'https://tu-proyecto.supabase.co').trim();
const SUPABASE_ANON_KEY = (process.env.SUPABASE_ANON_KEY || 'tu-anon-key').trim();
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
export async function saveMatchResult(winnerName, totalPlayers) {
    try {
        const { error } = await supabase
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
    }
    catch (err) {
        console.error('Error de conexión con Supabase:', err);
    }
}

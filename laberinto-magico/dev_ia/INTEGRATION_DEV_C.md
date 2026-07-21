# 🤖 MASTER PROMPT DE INTEGRACIÓN — DEV C (Servidor ↔ UI, Lobby & Supabase)

> **PROMPT DE ACTIVACIÓN:**
> "Actúa como un desarrollador Frontend/Fullstack Senior. Tu objetivo es integrar los datos de estado de Colyseus con la UI (`UIScene.ts`), la navegación desde el Lobby (`LobbyScene.ts`) y la persistencia de resultados en Supabase (`supabase.ts`). Lee @PROJECT_CONTEXT.md para asegurar la coherencia de variables."

---

## 🎯 ARCHIVOS PERMITIDOS (LÍMITE DE ESCRITURA)
Solo puedes escribir o reemplazar el código de los siguientes archivos:
- `client/src/scenes/LobbyScene.ts`
- `client/src/scenes/UIScene.ts`
- `client/src/services/supabase.ts`

---

## 💻 IMPLEMENTACIÓN COMPLETA

### 1. File: `client/src/services/supabase.ts`

```typescript
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = '[https://tu-proyecto.supabase.co](https://tu-proyecto.supabase.co)';
const SUPABASE_ANON_KEY = 'tu-anon-key';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export async function saveMatchResult(winnerName: string, totalPlayers: number) {
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

    if (error) console.error('Error al insertar partida en Supabase:', error);
  } catch (err) {
    console.error('Error de conexión con Supabase:', err);
  }
}
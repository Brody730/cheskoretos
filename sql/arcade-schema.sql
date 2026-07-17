/**
 * ═══════════════════════════════════════════════════════════════════
 * CHESKORETOS — ARCADE DE PUNTOS (MVP)
 * ═══════════════════════════════════════════════════════════════════
 * Agrega el sistema de puntos del minijuego "Flappy Chesko":
 *   - Saldo de puntos por usuario (columna en `lealtad`, se reutiliza
 *     la misma tabla que ya guarda la racha de sábados).
 *   - Historial de partidas (para la tabla de posiciones / leaderboard).
 *   - Historial de canjes (auditoría de qué se canjeó y cuándo).
 *   - 3 funciones RPC `SECURITY DEFINER` con toda la lógica de negocio
 *     en el servidor (igual patrón que `registrar_visita`): el cliente
 *     nunca decide cuántos puntos gana ni descuenta el saldo por su
 *     cuenta, solo manda "jugué y saqué tal puntaje" o "quiero canjear
 *     tal recompensa por tal costo".
 *
 * El catálogo de recompensas (qué cuesta cada premio) vive en el
 * frontend (js/arcade.js, constante ARCADE_REWARDS) — mismo patrón que
 * el catálogo de retos (window.CHALLENGES en js/challenges.js) vive
 * solo en el frontend y no en una tabla. La RPC de canje solo valida
 * que el saldo alcance para el costo que le manda el cliente; si el
 * catálogo cambia, no hace falta tocar SQL.
 *
 * EJECUTA ESTE SCRIPT UNA SOLA VEZ en el SQL Editor de Supabase
 * (requiere que ya exista el esquema base de sql/supabase-schema.sql).
 * ═══════════════════════════════════════════════════════════════════
 */

-- ═══════════════════════════════════════════
-- 1. SALDO DE PUNTOS (columna nueva en lealtad)
-- ═══════════════════════════════════════════
ALTER TABLE lealtad ADD COLUMN IF NOT EXISTS puntos_arcade INT NOT NULL DEFAULT 0
  CHECK (puntos_arcade >= 0);


-- ═══════════════════════════════════════════
-- 2. TABLAS
-- ═══════════════════════════════════════════

-- Historial de partidas jugadas (alimenta el leaderboard y el conteo
-- de "intentos de hoy" que usa el multiplicador decreciente).
CREATE TABLE IF NOT EXISTS arcade_partidas (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  usuario_id    UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  juego         TEXT NOT NULL DEFAULT 'flappy_chesko',
  puntaje       INT  NOT NULL CHECK (puntaje >= 0),
  puntos_ganados INT NOT NULL CHECK (puntos_ganados >= 0),
  jugado_en     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_arcade_partidas_usuario ON arcade_partidas(usuario_id);
CREATE INDEX IF NOT EXISTS idx_arcade_partidas_juego   ON arcade_partidas(juego, puntaje DESC);
CREATE INDEX IF NOT EXISTS idx_arcade_partidas_fecha    ON arcade_partidas(usuario_id, juego, jugado_en);

-- Historial de canjes (qué recompensa, por cuántos puntos, cuándo).
CREATE TABLE IF NOT EXISTS arcade_canjes (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  usuario_id    UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  recompensa_id TEXT NOT NULL,
  costo         INT  NOT NULL CHECK (costo > 0),
  canjeado_en   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_arcade_canjes_usuario ON arcade_canjes(usuario_id);

ALTER TABLE arcade_partidas DISABLE ROW LEVEL SECURITY;
ALTER TABLE arcade_canjes   DISABLE ROW LEVEL SECURITY;


-- ═══════════════════════════════════════════
-- 3. RPC: Registrar partida (otorga puntos con multiplicador decreciente)
-- ═══════════════════════════════════════════
-- Entre más partidas jugadas HOY del mismo juego, menor es el
-- multiplicador de puntos que se otorga por punto de puntaje. Esto
-- premia mucho las primeras partidas del día (para enganchar) mientras
-- evita que el saldo se pueda "grindear" infinito quedándose horas.
--
--   Intento #1 del día → multiplicador 1.00
--   Intento #2         → multiplicador 0.75
--   Intento #3         → multiplicador 0.50
--   Intento #4         → multiplicador 0.35
--   Intento #5 o más   → multiplicador 0.20 (piso)
--
-- El PUNTAJE (competitivo, para el leaderboard) siempre se guarda
-- completo tal cual se jugó; lo único que decrece es la conversión a
-- PUNTOS canjeables. Además se limita a 50 puntos ganados por partida
-- como techo, para que una sola partida excepcional no desbalancee el
-- catálogo de recompensas.

CREATE OR REPLACE FUNCTION public.registrar_partida_arcade(
  p_usuario_id UUID,
  p_juego      TEXT,
  p_puntaje    INT
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_hoy DATE := (now() AT TIME ZONE 'America/Mexico_City')::DATE;
  v_intentos_hoy INT;
  v_multiplicador NUMERIC;
  v_puntos_ganados INT;
  v_puntos_totales INT;
BEGIN
  IF p_puntaje IS NULL OR p_puntaje < 0 THEN
    RETURN json_build_object('ok', false, 'mensaje', 'Puntaje inválido.');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.lealtad WHERE usuario_id = p_usuario_id) THEN
    RETURN json_build_object('ok', false, 'mensaje', 'Usuario no encontrado.');
  END IF;

  -- Contar cuántas partidas de este juego ya jugó HOY (antes de esta)
  SELECT COUNT(*) INTO v_intentos_hoy
  FROM public.arcade_partidas
  WHERE usuario_id = p_usuario_id
    AND juego = p_juego
    AND (jugado_en AT TIME ZONE 'America/Mexico_City')::DATE = v_hoy;

  v_multiplicador := CASE
    WHEN v_intentos_hoy = 0 THEN 1.00
    WHEN v_intentos_hoy = 1 THEN 0.75
    WHEN v_intentos_hoy = 2 THEN 0.50
    WHEN v_intentos_hoy = 3 THEN 0.35
    ELSE 0.20
  END;

  v_puntos_ganados := LEAST(50, GREATEST(0, ROUND(p_puntaje * v_multiplicador)));

  INSERT INTO public.arcade_partidas (usuario_id, juego, puntaje, puntos_ganados)
  VALUES (p_usuario_id, p_juego, p_puntaje, v_puntos_ganados);

  UPDATE public.lealtad
  SET puntos_arcade = puntos_arcade + v_puntos_ganados
  WHERE usuario_id = p_usuario_id
  RETURNING puntos_arcade INTO v_puntos_totales;

  RETURN json_build_object(
    'ok', true,
    'puntaje', p_puntaje,
    'puntos_ganados', v_puntos_ganados,
    'multiplicador', v_multiplicador,
    'intentos_hoy', v_intentos_hoy + 1,
    'puntos_totales', v_puntos_totales
  );
END;
$$;


-- ═══════════════════════════════════════════
-- 4. RPC: Leaderboard (mejor puntaje por usuario)
-- ═══════════════════════════════════════════
CREATE OR REPLACE FUNCTION public.obtener_leaderboard_arcade(
  p_juego  TEXT DEFAULT 'flappy_chesko',
  p_limite INT  DEFAULT 10
)
RETURNS JSON
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT COALESCE(json_agg(t), '[]'::JSON) FROM (
    SELECT mejor.usuario_id, mejor.username, mejor.puntaje, mejor.jugado_en
    FROM (
      SELECT DISTINCT ON (ap.usuario_id)
        ap.usuario_id,
        pr.username,
        ap.puntaje,
        ap.jugado_en
      FROM public.arcade_partidas ap
      JOIN public.profiles pr ON pr.id = ap.usuario_id
      WHERE ap.juego = p_juego
      ORDER BY ap.usuario_id, ap.puntaje DESC, ap.jugado_en ASC
    ) mejor
    ORDER BY mejor.puntaje DESC
    LIMIT p_limite
  ) t;
$$;


-- ═══════════════════════════════════════════
-- 5. RPC: Canjear recompensa
-- ═══════════════════════════════════════════
-- El costo lo manda el cliente (viene del catálogo en js/arcade.js);
-- esta función solo valida que el saldo alcance y descuenta de forma
-- atómica. No entrega el producto físico: el staff lo entrega en
-- persona al ver la pantalla de "canjeado" (mismo modelo de honor que
-- ya usa el cupón de Chesko gratis de la racha).
CREATE OR REPLACE FUNCTION public.canjear_recompensa_arcade(
  p_usuario_id    UUID,
  p_recompensa_id TEXT,
  p_costo         INT
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_saldo INT;
BEGIN
  IF p_costo IS NULL OR p_costo <= 0 THEN
    RETURN json_build_object('ok', false, 'mensaje', 'Costo inválido.');
  END IF;

  SELECT puntos_arcade INTO v_saldo FROM public.lealtad WHERE usuario_id = p_usuario_id;

  IF v_saldo IS NULL THEN
    RETURN json_build_object('ok', false, 'mensaje', 'Usuario no encontrado.');
  END IF;

  IF v_saldo < p_costo THEN
    RETURN json_build_object('ok', false, 'mensaje', 'No tienes suficientes puntos todavía.', 'puntos_totales', v_saldo);
  END IF;

  UPDATE public.lealtad
  SET puntos_arcade = puntos_arcade - p_costo
  WHERE usuario_id = p_usuario_id
  RETURNING puntos_arcade INTO v_saldo;

  INSERT INTO public.arcade_canjes (usuario_id, recompensa_id, costo)
  VALUES (p_usuario_id, p_recompensa_id, p_costo);

  RETURN json_build_object('ok', true, 'mensaje', '¡Canjeado! Muestra esta pantalla en el puesto.', 'puntos_totales', v_saldo);
END;
$$;

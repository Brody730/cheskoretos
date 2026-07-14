/**
 * ═══════════════════════════════════════════════════════════════════
 * CHESKORETOS — ESQUEMA COMPLETO PARA SUPABASE
 * ═══════════════════════════════════════════════════════════════════
 *
 * INSTRUCCIONES:
 * 1. Crea un proyecto en https://supabase.com
 * 2. Ve a SQL Editor → New Query
 * 3. Pega TODO este script y ejecútalo
 * 4. En Authentication → Providers, habilita "Phone" (Twilio)
 * 5. Copia tu URL y anon key a js/config.js
 *
 * Para asignar rol de admin a un usuario, ejecuta:
 *   UPDATE profiles SET rol = 'admin' WHERE telefono = '55XXXXXXXX';
 *
 * ═══════════════════════════════════════════════════════════════════
 */

-- ═══════════════════════════════════════════
-- 1. TABLAS
-- ═══════════════════════════════════════════

-- Perfil extendido (referencia auth.users por UUID)
CREATE TABLE IF NOT EXISTS profiles (
  id        UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username  TEXT UNIQUE NOT NULL DEFAULT 'Sin Nombre',
  telefono  TEXT UNIQUE NOT NULL DEFAULT '',
  rol       TEXT NOT NULL DEFAULT 'usuario'
            CHECK (rol IN ('admin', 'empleado', 'usuario')),
  creado_en TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Lealtad / Rachas de sábados
CREATE TABLE IF NOT EXISTS lealtad (
  usuario_id          UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  racha_actual        INT NOT NULL DEFAULT 0
                      CHECK (racha_actual >= 0 AND racha_actual <= 5),
  ultima_visita       DATE,
  medallas_ganadas    INT NOT NULL DEFAULT 0,
  chesko_gratis_activo BOOLEAN NOT NULL DEFAULT FALSE
);

-- Historial de retos completados
CREATE TABLE IF NOT EXISTS historial_retos (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  usuario_id  UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  reto_id     TEXT NOT NULL,
  cumplio     BOOLEAN NOT NULL DEFAULT FALSE,
  fecha       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Promociones (gestionadas por admin)
CREATE TABLE IF NOT EXISTS promociones (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  titulo      TEXT NOT NULL,
  descripcion TEXT DEFAULT '',
  activa      BOOLEAN NOT NULL DEFAULT TRUE,
  creado_por  UUID REFERENCES profiles(id),
  creado_en   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  vence_en    TIMESTAMPTZ
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_profiles_telefono   ON profiles(telefono);
CREATE INDEX IF NOT EXISTS idx_lealtad_usuario     ON lealtad(usuario_id);
CREATE INDEX IF NOT EXISTS idx_historial_usuario   ON historial_retos(usuario_id);
CREATE INDEX IF NOT EXISTS idx_historial_reto      ON historial_retos(reto_id);
CREATE INDEX IF NOT EXISTS idx_promociones_activa  ON promociones(activa);


-- ═══════════════════════════════════════════
-- 2. ROW LEVEL SECURITY (RLS)
-- ═══════════════════════════════════════════

ALTER TABLE profiles        ENABLE ROW LEVEL SECURITY;
ALTER TABLE lealtad         ENABLE ROW LEVEL SECURITY;
ALTER TABLE historial_retos ENABLE ROW LEVEL SECURITY;
ALTER TABLE promociones     ENABLE ROW LEVEL SECURITY;

-- ─── PROFILES ───────────────────────────
-- Cualquier usuario autenticado puede leer su propio perfil
CREATE POLICY "read_own_profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- Admins y empleados pueden leer todos los perfiles (necesario para escáner QR)
CREATE POLICY "staff_read_all_profiles"
  ON profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND rol IN ('admin', 'empleado')
    )
  );

-- Un usuario puede actualizar su propio perfil (username, etc.)
CREATE POLICY "update_own_profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Usuarios autenticados pueden insertar su propio perfil (post-OTP)
CREATE POLICY "insert_own_profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);


-- ─── LEALTAD ────────────────────────────
-- Usuarios leen su propia lealtad
CREATE POLICY "read_own_lealtad"
  ON lealtad FOR SELECT
  USING (auth.uid() = usuario_id);

-- Staff puede leer toda la lealtad (para escáner)
CREATE POLICY "staff_read_all_lealtad"
  ON lealtad FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND rol IN ('admin', 'empleado')
    )
  );

-- Staff puede actualizar la lealtad de cualquier usuario (registrar visita)
CREATE POLICY "staff_update_lealtad"
  ON lealtad FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND rol IN ('admin', 'empleado')
    )
  );

-- Usuarios pueden insertar su propia lealtad (post-OTP)
CREATE POLICY "insert_own_lealtad"
  ON lealtad FOR INSERT
  WITH CHECK (auth.uid() = usuario_id);

-- Usuarios pueden actualizar su propia lealtad (canjear cupón)
CREATE POLICY "update_own_lealtad"
  ON lealtad FOR UPDATE
  USING (auth.uid() = usuario_id);


-- ─── HISTORIAL_RETOS ────────────────────
-- Usuarios leen su propio historial
CREATE POLICY "read_own_historial"
  ON historial_retos FOR SELECT
  USING (auth.uid() = usuario_id);

-- Staff puede leer todo el historial
CREATE POLICY "staff_read_all_historial"
  ON historial_retos FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND rol IN ('admin', 'empleado')
    )
  );

-- Staff puede insertar retos para cualquier usuario
CREATE POLICY "staff_insert_historial"
  ON historial_retos FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND rol IN ('admin', 'empleado')
    )
  );

-- Usuarios pueden insertar sus propios retos (auto-registro)
CREATE POLICY "insert_own_historial"
  ON historial_retos FOR INSERT
  WITH CHECK (auth.uid() = usuario_id);


-- ─── PROMOCIONES ────────────────────────
-- Todos los usuarios autenticados pueden leer promos activas
CREATE POLICY "read_active_promos"
  ON promociones FOR SELECT
  USING (activa = TRUE);

-- Admins pueden gestionar promociones (CRUD completo)
CREATE POLICY "admin_manage_promos"
  ON promociones FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND rol = 'admin'
    )
  );


-- ═══════════════════════════════════════════
-- 3. FUNCIÓN RPC: Verificar si un teléfono ya existe
-- ═══════════════════════════════════════════
-- Se usa antes de enviar OTP para saber si es registro nuevo o login

CREATE OR REPLACE FUNCTION public.check_phone_exists(phone_number TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles WHERE telefono = phone_number
  );
END;
$$;


-- ═══════════════════════════════════════════
-- 4. FUNCIÓN RPC: Registrar visita (racha)
-- ═══════════════════════════════════════════
-- Lógica de negocio de racha de sábados ejecutada en el servidor
-- Retorna JSON con el resultado de la operación

CREATE OR REPLACE FUNCTION public.registrar_visita(target_user_id UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_lealtad RECORD;
  v_hoy DATE := CURRENT_DATE;
  v_dias_diff INT;
  v_nueva_racha INT;
  v_resultado JSON;
BEGIN
  -- Obtener datos de lealtad del usuario objetivo
  SELECT * INTO v_lealtad
  FROM public.lealtad
  WHERE usuario_id = target_user_id;

  IF NOT FOUND THEN
    RETURN '{"tipo":"error","mensaje":"Usuario no encontrado"}'::JSON;
  END IF;

  -- Calcular diferencia de días desde la última visita
  IF v_lealtad.ultima_visita IS NULL THEN
    v_dias_diff := 999; -- Primera visita
  ELSE
    v_dias_diff := v_hoy - v_lealtad.ultima_visita;
  END IF;

  -- BLOQUEO: Si la diferencia es <= 1 día (mismo fin de semana)
  IF v_dias_diff <= 1 AND v_lealtad.ultima_visita IS NOT NULL THEN
    RETURN json_build_object(
      'tipo', 'ya_registro_hoy',
      'mensaje', '¡Párale al mitote! Ya registraste tu visita este fin de semana.',
      'titulo', '¡Doble Visita Detectada!',
      'subtitulo', 'Solo puedes registrar 1 visita por semana'
    );
  END IF;

  -- RACHA: calcular nueva racha
  IF v_lealtad.ultima_visita IS NULL THEN
    -- Primera visita
    v_nueva_racha := 1;
  ELSIF v_dias_diff >= 6 AND v_dias_diff <= 8 THEN
    -- Asistió el sábado pasado → incrementar racha
    v_nueva_racha := LEAST(v_lealtad.racha_actual + 1, 5);
  ELSIF v_dias_diff > 8 THEN
    -- Se saltó un sábado → reiniciar racha
    v_nueva_racha := 1;
  ELSE
    -- Caso raro (< 6 días pero > 1 día)
    v_nueva_racha := v_lealtad.racha_actual;
  END IF;

  -- Actualizar lealtad
  UPDATE public.lealtad
  SET racha_actual  = v_nueva_racha,
      ultima_visita = v_hoy
  WHERE usuario_id = target_user_id;

  -- ¿Alcanzó la racha de 5?
  IF v_nueva_racha >= 5 THEN
    UPDATE public.lealtad
    SET chesko_gratis_activo = TRUE,
        racha_actual = 0,
        medallas_ganadas = medallas_ganadas + 1
    WHERE usuario_id = target_user_id;

    RETURN json_build_object(
      'tipo', 'chesko_gratis',
      'mensaje', '¡FELICIDADES! Llegaste a 5 sábados seguidos. Tu Chesko es GRATIS.',
      'titulo', '¡BOOM! ¡CHESCO GRATIS!',
      'subtitulo', 'Presenta este cupón en el puesto',
      'racha_actual', 0,
      'medallas_ganadas', v_lealtad.medallas_ganadas + 1
    );
  END IF;

  -- Respuesta normal
  RETURN json_build_object(
    'tipo', 'visita_registrada',
    'mensaje', '¡Visita registrada! Racha de sábados: ' || v_nueva_racha || ' de 5.',
    'titulo', '¡Sábado Registrado!',
    'subtitulo', 'Llevas ' || v_nueva_racha || ' de 5 sábados',
    'racha_actual', v_nueva_racha,
    'racha_max', 5
  );
END;
$$;

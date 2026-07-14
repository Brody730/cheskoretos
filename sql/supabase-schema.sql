/**
 * ═══════════════════════════════════════════════════════════════════
 * CHESKORETOS — ESQUEMA COMPLETO PARA SUPABASE (PIN-BASED)
 * ═══════════════════════════════════════════════════════════════════
 *
 * AUTH: PIN de 4 dígitos (sin SMS, sin email, sin proveedores externos).
 * RLS: Deshabilitado para simplificar (app de negocio local, admin presente).
 *
 * INSTRUCCIONES:
 * 1. Crea un proyecto en https://supabase.com
 * 2. Ve a SQL Editor → New Query
 * 3. Pega TODO este script y ejecútalo
 * 4. Copia tu URL y anon key a js/config.js
 *
 * Para asignar rol de admin:
 *   UPDATE profiles SET rol = 'admin' WHERE telefono = '55XXXXXXXX';
 *
 * ═══════════════════════════════════════════════════════════════════
 */

-- ═══════════════════════════════════════════
-- 1. TABLAS
-- ═══════════════════════════════════════════

-- Perfil extendido (sin auth.users, UUID auto-generado)
CREATE TABLE IF NOT EXISTS profiles (
  id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username  TEXT UNIQUE NOT NULL DEFAULT 'Sin Nombre',
  telefono  TEXT UNIQUE NOT NULL DEFAULT '',
  pin       TEXT NOT NULL DEFAULT '',
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
CREATE INDEX IF NOT EXISTS idx_profiles_username   ON profiles(username);
CREATE INDEX IF NOT EXISTS idx_lealtad_usuario     ON lealtad(usuario_id);
CREATE INDEX IF NOT EXISTS idx_historial_usuario   ON historial_retos(usuario_id);
CREATE INDEX IF NOT EXISTS idx_historial_reto      ON historial_retos(reto_id);
CREATE INDEX IF NOT EXISTS idx_promociones_activa  ON promociones(activa);


-- ═══════════════════════════════════════════
-- 2. ROW LEVEL SECURITY — DESHABILITADO
-- ═══════════════════════════════════════════
-- App de negocio local con admin físico presente.
-- Seguridad manejada por la app (PIN + roles).

ALTER TABLE profiles        DISABLE ROW LEVEL SECURITY;
ALTER TABLE lealtad         DISABLE ROW LEVEL SECURITY;
ALTER TABLE historial_retos DISABLE ROW LEVEL SECURITY;
ALTER TABLE promociones     DISABLE ROW LEVEL SECURITY;


-- ═══════════════════════════════════════════
-- 3. FUNCIÓN RPC: Registrar usuario con PIN
-- ═══════════════════════════════════════════
-- Crea perfil + registro de lealtad en una sola operación.
-- Retorna el perfil creado.

CREATE OR REPLACE FUNCTION public.register_user(
  p_username TEXT,
  p_phone TEXT,
  p_pin TEXT
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_perfil RECORD;
BEGIN
  -- Verificar que el teléfono no exista
  IF EXISTS (SELECT 1 FROM public.profiles WHERE telefono = p_phone) THEN
    RETURN '{"ok":false,"mensaje":"Ese teléfono ya está registrado. Inicia sesión con tu PIN."}'::JSON;
  END IF;

  -- Verificar que el username no exista
  IF EXISTS (SELECT 1 FROM public.profiles WHERE username = p_username) THEN
    RETURN '{"ok":false,"mensaje":"Ese nickname ya existe. Elige otro."}'::JSON;
  END IF;

  -- Crear perfil
  INSERT INTO public.profiles (username, telefono, pin)
  VALUES (p_username, p_phone, p_pin)
  RETURNING * INTO v_perfil;

  -- Crear lealtad
  INSERT INTO public.lealtad (usuario_id)
  VALUES (v_perfil.id);

  -- Retornar perfil creado
  RETURN json_build_object(
    'ok', true,
    'mensaje', '¡Cuenta creada! Bienvenido al Club.',
    'id', v_perfil.id,
    'username', v_perfil.username,
    'telefono', v_perfil.telefono,
    'rol', v_perfil.rol,
    'creado_en', v_perfil.creado_en
  );
END;
$$;


-- ═══════════════════════════════════════════
-- 4. FUNCIÓN RPC: Login con PIN
-- ═══════════════════════════════════════════
-- Verifica teléfono + PIN, retorna el perfil si coincide.

CREATE OR REPLACE FUNCTION public.login_with_pin(
  p_phone TEXT,
  p_pin TEXT
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_perfil RECORD;
BEGIN
  SELECT * INTO v_perfil
  FROM public.profiles
  WHERE telefono = p_phone AND pin = p_pin;

  IF NOT FOUND THEN
    RETURN '{"ok":false,"mensaje":"Teléfono o PIN incorrectos."}'::JSON;
  END IF;

  RETURN json_build_object(
    'ok', true,
    'mensaje', '¡Sesión iniciada!',
    'id', v_perfil.id,
    'username', v_perfil.username,
    'telefono', v_perfil.telefono,
    'rol', v_perfil.rol,
    'creado_en', v_perfil.creado_en
  );
END;
$$;


-- ═══════════════════════════════════════════
-- 5. FUNCIÓN RPC: Verificar si teléfono existe
-- ═══════════════════════════════════════════

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
-- 6. FUNCIÓN RPC: Registrar visita (racha)
-- ═══════════════════════════════════════════
-- Lógica de negocio de racha de sábados ejecutada en el servidor.

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
BEGIN
  SELECT * INTO v_lealtad
  FROM public.lealtad
  WHERE usuario_id = target_user_id;

  IF NOT FOUND THEN
    RETURN '{"tipo":"error","mensaje":"Usuario no encontrado"}'::JSON;
  END IF;

  IF v_lealtad.ultima_visita IS NULL THEN
    v_dias_diff := 999;
  ELSE
    v_dias_diff := v_hoy - v_lealtad.ultima_visita;
  END IF;

  -- BLOQUEO: mismo fin de semana
  IF v_dias_diff <= 1 AND v_lealtad.ultima_visita IS NOT NULL THEN
    RETURN json_build_object(
      'tipo', 'ya_registro_hoy',
      'mensaje', '¡Párale al mitote! Ya registraste tu visita este fin de semana.',
      'titulo', '¡Doble Visita Detectada!',
      'subtitulo', 'Solo puedes registrar 1 visita por semana'
    );
  END IF;

  -- RACHA
  IF v_lealtad.ultima_visita IS NULL THEN
    v_nueva_racha := 1;
  ELSIF v_dias_diff >= 6 AND v_dias_diff <= 8 THEN
    v_nueva_racha := LEAST(v_lealtad.racha_actual + 1, 5);
  ELSIF v_dias_diff > 8 THEN
    v_nueva_racha := 1;
  ELSE
    v_nueva_racha := v_lealtad.racha_actual;
  END IF;

  UPDATE public.lealtad
  SET racha_actual  = v_nueva_racha,
      ultima_visita = v_hoy
  WHERE usuario_id = target_user_id;

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

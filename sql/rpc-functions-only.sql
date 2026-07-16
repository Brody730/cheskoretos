-- ═══════════════════════════════════════════
-- EJECUTA ESTE SCRIPT EN SUPABASE SQL EDITOR
-- Solo crea las funciones RPC (las tablas ya existen)
-- ═══════════════════════════════════════════

-- Asegurar columna pin en profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS pin TEXT DEFAULT '';

-- Verificar que RLS esté deshabilitado
ALTER TABLE profiles        DISABLE ROW LEVEL SECURITY;
ALTER TABLE lealtad         DISABLE ROW LEVEL SECURITY;
ALTER TABLE historial_retos DISABLE ROW LEVEL SECURITY;
ALTER TABLE promociones     DISABLE ROW LEVEL SECURITY;


-- FUNCIÓN: Registrar usuario con PIN
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
  IF EXISTS (SELECT 1 FROM public.profiles WHERE telefono = p_phone) THEN
    RETURN json_build_object('ok', false, 'mensaje', 'Ese telefono ya esta registrado.');
  END IF;

  IF EXISTS (SELECT 1 FROM public.profiles WHERE username = p_username) THEN
    RETURN json_build_object('ok', false, 'mensaje', 'Ese nickname ya existe. Elige otro.');
  END IF;

  INSERT INTO public.profiles (username, telefono, pin)
  VALUES (p_username, p_phone, p_pin)
  RETURNING * INTO v_perfil;

  INSERT INTO public.lealtad (usuario_id)
  VALUES (v_perfil.id);

  RETURN json_build_object(
    'ok', true,
    'mensaje', 'Cuenta creada.',
    'id', v_perfil.id,
    'username', v_perfil.username,
    'telefono', v_perfil.telefono,
    'rol', v_perfil.rol,
    'creado_en', v_perfil.creado_en
  );
END;
$$;


-- FUNCIÓN: Login con PIN
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
    RETURN json_build_object('ok', false, 'mensaje', 'Telefono o PIN incorrectos.');
  END IF;

  RETURN json_build_object(
    'ok', true,
    'mensaje', 'Sesion iniciada.',
    'id', v_perfil.id,
    'username', v_perfil.username,
    'telefono', v_perfil.telefono,
    'rol', v_perfil.rol,
    'creado_en', v_perfil.creado_en
  );
END;
$$;


-- FUNCIÓN: Verificar si teléfono existe
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


-- FUNCIÓN: Registrar visita (racha)
CREATE OR REPLACE FUNCTION public.registrar_visita(target_user_id UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_lealtad RECORD;
  v_hoy DATE := (now() AT TIME ZONE 'America/Mexico_City')::DATE;
  v_dias_diff INT;
  v_nueva_racha INT;
BEGIN
  SELECT * INTO v_lealtad
  FROM public.lealtad
  WHERE usuario_id = target_user_id;

  IF NOT FOUND THEN
    RETURN json_build_object('tipo', 'error', 'mensaje', 'Usuario no encontrado');
  END IF;

  -- BLOQUEO: solo se puede registrar visita en sábado
  IF EXTRACT(DOW FROM v_hoy) != 6 THEN
    RETURN json_build_object(
      'tipo', 'error',
      'mensaje', 'Solo se puede registrar la visita de lealtad los sábados.',
      'titulo', 'No es sábado',
      'subtitulo', 'Vuelve el sábado para registrar tu racha'
    );
  END IF;

  IF v_lealtad.ultima_visita IS NULL THEN
    v_dias_diff := 999;
  ELSE
    v_dias_diff := v_hoy - v_lealtad.ultima_visita;
  END IF;

  IF v_dias_diff <= 1 AND v_lealtad.ultima_visita IS NOT NULL THEN
    RETURN json_build_object(
      'tipo', 'ya_registro_hoy',
      'mensaje', 'Ya registraste tu visita este fin de semana.',
      'titulo', 'Doble Visita Detectada',
      'subtitulo', 'Solo puedes registrar 1 visita por semana'
    );
  END IF;

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
  SET racha_actual = v_nueva_racha, ultima_visita = v_hoy
  WHERE usuario_id = target_user_id;

  IF v_nueva_racha >= 5 THEN
    UPDATE public.lealtad
    SET chesko_gratis_activo = TRUE,
        racha_actual = 0,
        medallas_ganadas = medallas_ganadas + 1
    WHERE usuario_id = target_user_id;

    RETURN json_build_object(
      'tipo', 'chesko_gratis',
      'mensaje', 'FELICIDADES! Llegaste a 5 sabados seguidos. Tu Chesko es GRATIS.',
      'titulo', 'BOOM! CHESCO GRATIS!',
      'subtitulo', 'Presenta este cupon en el puesto',
      'racha_actual', 0,
      'medallas_ganadas', v_lealtad.medallas_ganadas + 1
    );
  END IF;

  RETURN json_build_object(
    'tipo', 'visita_registrada',
    'mensaje', 'Visita registrada! Racha: ' || v_nueva_racha || ' de 5.',
    'titulo', 'Sabado Registrado!',
    'subtitulo', 'Llevas ' || v_nueva_racha || ' de 5 sabados',
    'racha_actual', v_nueva_racha,
    'racha_max', 5
  );
END;
$$;

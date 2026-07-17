/**
 * ═══════════════════════════════════════════
 * CHESKORETOS - BUZÓN DE SUGERENCIAS (envío por fetch a Formspree)
 * ═══════════════════════════════════════════
 * ⚠️ ARCHIVO NO CARGADO ACTUALMENTE: ningún .html incluye
 * <script src="js/buzon.js">. El formulario #formSugerencias que
 * existe en index.html funciona hoy gracias al listener equivalente
 * dentro de js/landing.js → initSugerenciasForm() (envío 100% local,
 * sin fetch, solo muestra el mensaje de éxito y resetea el form).
 * Este archivo queda referenciado en sw.js (se precachea) pero es
 * código huérfano/duplicado: dos implementaciones del mismo formulario.
 * Si se reactiva, debe también agregarse su <script> en index.html.
 */
const form = document.getElementById('formSugerencias');
const successMsg = document.getElementById('sugerenciaExito');

form.addEventListener('submit', async (e) => {
  e.preventDefault(); // Detiene la recarga

  const formData = new FormData(form);

  try {
    const response = await fetch(form.action, {
      method: 'POST',
      body: formData,
      headers: {
        'Accept': 'application/json'
      }
    });

    if (response.ok) {
      // Mostrar mensaje de éxito
      successMsg.style.display = 'block';
      form.reset(); // Limpiar campos
    } else {
      alert('Hubo un error al enviar. Intenta de nuevo.');
    }
  } catch (error) {
    alert('Error de conexión. Revisa tu internet.');
  }
});
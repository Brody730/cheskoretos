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
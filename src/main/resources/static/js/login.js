const API_URL = 'http://localhost:8080/api/v1/auth';

document.getElementById('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const email = document.getElementById('loginEmail').value.trim().toLowerCase();
const password = document.getElementById('loginPassword').value.trim();
  const output = document.getElementById('output');


  //output.textContent = "Conectando con el backend...";

  try {
    const response = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();

    if (response.ok) {
      console.log("sesion exitosa")
      //output.textContent = `✅ ¡Autenticación Exitosa!\n\nToken JWT:\n${data.token}`;
      // Guarda el token en el almacenamiento local para peticiones futuras
      localStorage.setItem('jwt_token', data.token);
      window.location.href = "/"
    } else {
      //output.textContent = `❌ Error (${response.status}):\n${JSON.stringify(data, null, 2)}`;
    }
  } catch (error) {
    console.log("Error")
    //output.textContent = `⚠️ Error de conexión:\nAsegúrate de que el backend está corriendo en http://localhost:8080\n\nDetalle: ${error.message}`;
  }
});




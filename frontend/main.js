// Obtener el canvas y su contexto
const canvas = document.getElementById('myCanvas');
const ctx = canvas.getContext('2d');

document.getElementById('map').addEventListener('click', function(event) {
    const coordenadas = obtenerCoordenadasRelativas(event);
    console.log(`Coordenadas relativas: X=${coordenadas.x}, Y=${coordenadas.y}`);
});

function obtenerCoordenadasRelativas(event) {
    // Obtener la posición de la imagen en la página
    const rect = event.target.getBoundingClientRect();

    // Calcular las coordenadas relativas al inicio de la imagen
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    return { x, y };
}

// Función para dibujar puntos rojos
function dibujarPuntos(coordenadas) {
    ctx.fillStyle = 'red'; // Color de los puntos
    coordenadas.forEach(coord => {
        ctx.beginPath();
        ctx.arc(coord.x, coord.y, 5, 0, Math.PI * 2); // Dibuja un círculo
        ctx.fill();
    });
}

// Cargar las coordenadas desde el archivo JSON
fetch('../backend/python/graph_data.json')
    .then(response => response.json())
    .then(coordenadas => {
        // Llamar a la función con las coordenadas
        dibujarPuntos(coordenadas.nodes);
    })
    .catch(error => console.error('Error al cargar el archivo JSON:', error));

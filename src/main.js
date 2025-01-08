import KDBush from 'https://cdn.jsdelivr.net/npm/kdbush/+esm';
import {graph_data} from './util/graph_data.js';

// Obtener el canvas y su contexto
const canvas = document.getElementById('myCanvas');
const ctx = canvas.getContext('2d');

document.getElementById('map').addEventListener('click', function(event) {
    const coordenadas = obtenerCoordenadasRelativas(event);
    console.log(`Coordenadas relativas: X=${coordenadas.x}, Y=${coordenadas.y}`);
    console.log('Nodo más cercano:', buscarNodoMasCercano(coordenadas.x, coordenadas.y));
    
});

// Función para dibujar puntos rojos
function dibujarPuntos(coordenadas) {
    console.log('Dibujando puntos:', coordenadas);
    ctx.fillStyle = 'red'; // Color de los puntos
    coordenadas.nodes.forEach(coord => {
        ctx.beginPath();
        ctx.arc(coord.x, coord.y, 5, 0, Math.PI * 2); // Dibuja un círculo
        ctx.fill();
    });
}

dibujarPuntos(graph_data)

const index = new KDBush(graph_data.nodes.length)

for (let i = 0; i < graph_data.nodes.length; i++) {
    const {x, y} = graph_data.nodes[i];
    index.add(x,y);
}

index.finish();

function obtenerCoordenadasRelativas(event) {
    // Obtener la posición de la imagen en la página
    const rect = event.target.getBoundingClientRect();

    // Calcular las coordenadas relativas al inicio de la imagen
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    return { x, y };
}

function buscarNodoMasCercano(x,y) {
    const radius = 20;
    console.log(index.within(x, y, radius));
    return graph_data.nodes[index.within(x, y, radius)[0]];
}



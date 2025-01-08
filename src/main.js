import KDBush from 'https://cdn.jsdelivr.net/npm/kdbush/+esm';
import {graph_data} from './util/graph_data.js';

// Obtener el canvas y su contexto
const canvas = document.getElementById('myCanvas');
const ctx = canvas.getContext('2d');

let sourceSelected = null;

document.getElementById('map').addEventListener('click', function(event) {
    const coordenadas = obtenerCoordenadasRelativas(event);
    console.log(`Coordenadas relativas: X=${coordenadas.x}, Y=${coordenadas.y}`);
    let nearestNode = buscarNodoMasCercano(coordenadas.x, coordenadas.y);
    pintarNodoMasCercano(nearestNode);
    if (sourceSelected === null) {
        sourceSelected = nearestNode;
    } else {
        buscarRuta(sourceSelected, nearestNode);
    }
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
    console.log("nodo mas cercano", index.within(x, y, radius)[0]);
    const nearestNode = graph_data.nodes[index.within(x, y, radius)[0]];
    //TODO: agrandar el radius hasta que se encuentre un nodo
    return nearestNode;
}


function pintarNodoMasCercano(nearestNode) {
    ctx.fillStyle = 'blue';
    ctx.beginPath();
    ctx.arc(nearestNode.x, nearestNode.y, 6, 0, Math.PI * 2);
    ctx.fill();
}

//
//Creo el grafo
var g = createGraph();

//Agrego nodos
for (let i = 0; i < graph_data.nodes.length; i++) {
    const {id, x, y} = graph_data.nodes[i];
    g.addNode(id.toString(), {
        x: x.toString(),
        y: y.toString()
    })
}

console.log(g.getNode('20'));

//Agrego aristas
for (let i = 0; i < graph_data.edges.length; i++) {
    const {source, target, weight} = graph_data.edges[i];
    g.addLink(source.toString(), target.toString(), {weight: weight.toString()});
}

console.log(g.getNode('20'));


//Pathfinding
let pathFinder = ngraphPath.aStar(g);

let fromNodeId = "20";
let toNodeId = "1534";
let foundPath = pathFinder.find(fromNodeId, toNodeId);
// foundPath is array of nodes in the graph
console.log(foundPath);


function buscarRuta(source, target) {
    console.log("Buscando ruta de", source, "a", target);
    const sourceIndex = graph_data.nodes.indexOf(source);
    const targetIndex = graph_data.nodes.indexOf(target);
    

}
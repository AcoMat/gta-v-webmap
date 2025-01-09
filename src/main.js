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
        const ruta = buscarRuta(sourceSelected, nearestNode);
        console.log(ruta);
        pintarRuta(ruta);
        sourceSelected = null;
    }
});

// Función para dibujar puntos rojos
function dibujarPuntos(coordenadas) {
    console.log('Dibujando puntos:', coordenadas);
    ctx.fillStyle = 'green'; // Color de los puntos
    coordenadas.nodes.forEach(coord => {
        ctx.beginPath();
        ctx.arc(coord.x, coord.y, 1, 0, Math.PI * 1); // Dibuja un círculo
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
    const radius = 5;
    console.log("nodo mas cercano", index.within(x, y, radius)[0]);
    const nearestNode = graph_data.nodes[index.within(x, y, radius)[0]];
    //TODO: agrandar el radius hasta que se encuentre un nodo
    return nearestNode;
}


function pintarNodoMasCercano(nearestNode) {
    ctx.fillStyle = 'blue';
    ctx.beginPath();
    ctx.arc(nearestNode.x, nearestNode.y, 3, 0, Math.PI * 2);
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
    const {source, target} = graph_data.edges[i];
    g.addLink(source.toString(), target.toString());
}


//Pathfinding
let pathFinder = ngraphPath.aStar(g);

let fromNodeId = "20";
let toNodeId = "1534";
let foundPath = pathFinder.find(fromNodeId, toNodeId);
// foundPath is array of nodes in the graph
console.log(foundPath);


function buscarRuta(source, target) {
    console.log("Buscando ruta de", source, "a", target);
    return pathFinder.find(source.id.toString(), target.id.toString());
}

function pintarRuta(listaNodos) {
    if(listaNodos.length === 0) {
        console.log("No se encontró ruta");
        return;
    }
    ctx.strokeStyle = 'purple';
    ctx.lineWidth = 3;
    
    // Comenzar a dibujar
    ctx.beginPath();
    
    // Mover al primer nodo
    ctx.moveTo(Number(listaNodos[0].data.x), Number(listaNodos[0].data.y));

    // Iterar sobre los nodos restantes y dibujar líneas
    for (let i = 1; i < listaNodos.length; i++) {
        ctx.lineTo(Number(listaNodos[i].data.x), Number(listaNodos[i].data.y));
    }

    // Terminar el dibujo
    ctx.stroke();
}

//clear ctx.clearRect(0, 0, canvas.width, canvas.height);
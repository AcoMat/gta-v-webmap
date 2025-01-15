import KDBush from 'https://cdn.jsdelivr.net/npm/kdbush/+esm';
import { graph_data } from './util/graph_data.js';

// Obtener el canvas y su contexto
const canvas = document.getElementById('myCanvas');
const ctx = canvas.getContext('2d');
let cw = canvas.width;
let ch = canvas.height;

const image = new Image();
image.src = 'http://127.0.0.1:5500/src/assets/map_image.jpg';
image.onload = () => {
    resizeCanvas();
    ctx.drawImage(image, 0, 0, image.width, image.height);
};

window.addEventListener('resize', resizeCanvas);
window.addEventListener('scroll', reOffset);

// Ajustar el tamaño del canvas al tamaño de la ventana
function resizeCanvas() {
    canvas.width = window.innerWidth - 500;
    canvas.height = window.innerHeight - 300;
    reOffset();
    redrawCanvas();
}

// Redibujar contenido del canvas
function redrawCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(image, netPanningX, netPanningY, image.width, image.height);
    dibujarPuntos(graph_data);
    pintarRuta(actualRoute);
}

let sourceSelected = null;

// account for scrolling
function reOffset() {
    let BB = canvas.getBoundingClientRect();
    offsetX = BB.left;
    offsetY = BB.top;
}
let offsetX, offsetY;
reOffset();
window.onscroll = function (e) { reOffset(); }
window.onresize = function (e) { reOffset(); }

// mouse drag related letiables
let isDown = false;
let startX, startY;

// the accumulated horizontal(X) & vertical(Y) panning the user has done in total
let netPanningX = 0;
let netPanningY = 0;


// draw the numbered horizontal & vertical reference lines
ctx.drawImage(image, 0, 0, image.width, image.height);

// listen for mouse events
canvas.addEventListener("mousedown", (e) => { handleMouseDown(e); });
canvas.addEventListener("mousemove", (e) => { handleMouseMove(e); });
canvas.addEventListener("mouseup", (e) => { handleMouseUp(e); });
canvas.addEventListener("mouseout", (e) => { handleMouseOut(e); });

function handleMouseDown(e) {
    // tell the browser we're handling this event
    e.preventDefault();
    e.stopPropagation();

    // calc the starting mouse X,Y for the drag
    startX = parseInt(e.clientX - offsetX);
    startY = parseInt(e.clientY - offsetY);

    // set the isDragging flag
    isDown = true;
}

function handleMouseUp(e) {
    // tell the browser we're handling this event
    e.preventDefault();
    e.stopPropagation();

    // clear the isDragging flag
    isDown = false;
    console.log("netPanningX: " + netPanningX + " netPanningY: " + netPanningY);

}

function handleMouseOut(e) {
    // tell the browser we're handling this event
    e.preventDefault();
    e.stopPropagation();

    // clear the isDragging flag
    isDown = false;
}

function handleMouseMove(e) {

    // only do this code if the mouse is being dragged
    if (!isDown) { return; }

    // tell the browser we're handling this event
    e.preventDefault();
    e.stopPropagation();

    // get the current mouse position
    let mouseX = parseInt(e.clientX - offsetX);
    let mouseY = parseInt(e.clientY - offsetY);

    // dx & dy are the distance the mouse has moved since
    // the last mousemove event
    let dx = mouseX - startX;
    let dy = mouseY - startY;

    // reset the lets for next mousemove
    startX = mouseX;
    startY = mouseY;

    // accumulate the net panning done
    netPanningX += dx;
    netPanningY += dy;

    // display the horizontal & vertical reference lines
    // The horizontal line is offset leftward or rightward by netPanningX
    // The vertical line is offset upward or downward by netPanningY
    ctx.clearRect(0, 0, cw, ch);
    ctx.drawImage(image, netPanningX, netPanningY, image.width, image.height);
    dibujarPuntos(graph_data);
    pintarRuta(actualRoute);
    const moveAudio = document.getElementById("menu_map_move");
    const moveAudio2 = document.getElementById("menu_map_move2");
    moveAudio.play()
    setTimeout(() => { moveAudio2.play() }, 70);
}


//TODO: manejar bien los nodos seleccionados, quizas una variable para source y target, y reiniciar en nueva ruta
let actualRoute = null

document.getElementById('myCanvas').addEventListener('dblclick', mapDblClick);

function mapDblClick(event) {
    const srcSelected = document.getElementById("map_source_selected");
    const tgtSelected = document.getElementById("map_target_selected");
    const coordenadas = obtenerCoordenadasRelativas(event);
    console.log(`Coordenadas relativas: X=${coordenadas.x}, Y=${coordenadas.y}`);
    let nearestNode = buscarNodoMasCercano(coordenadas.x, coordenadas.y);
    pintarNodoMasCercano(nearestNode);
    if (sourceSelected === null) {
        sourceSelected = nearestNode;
        actualRoute = null
        srcSelected.play()
    } else {
        actualRoute = buscarRuta(sourceSelected, nearestNode);
        console.log(actualRoute);
        pintarRuta(actualRoute);
        sourceSelected = null;
        tgtSelected.play()
    }
};

// Función para dibujar puntos rojos
function dibujarPuntos(coordenadas) {
    console.log('Dibujando puntos:', coordenadas);
    ctx.fillStyle = 'green'; // Color de los puntos
    coordenadas.nodes.forEach(coord => {
        ctx.beginPath();
        ctx.arc(coord.x + netPanningX, coord.y + netPanningY, 1, 0, Math.PI * 2); // Dibuja un círculo
        ctx.fill();
    });
}

dibujarPuntos(graph_data)

const index = new KDBush(graph_data.nodes.length)

for (let i = 0; i < graph_data.nodes.length; i++) {
    const { x, y } = graph_data.nodes[i];
    index.add(x, y);
}

index.finish();

function obtenerCoordenadasRelativas(event) {
    // Obtener la posición de la imagen en la página
    const rect = event.target.getBoundingClientRect();

    // Calcular las coordenadas relativas al inicio de la imagen
    const x = event.clientX - rect.left - netPanningX;
    const y = event.clientY - rect.top - netPanningY;

    return { x, y };
}

function buscarNodoMasCercano(x, y) {
    const radius = 5;
    console.log("nodo mas cercano", index.within(x, y, radius)[0]);
    const nearestNode = graph_data.nodes[index.within(x, y, radius)[0]];
    //TODO: agrandar el radius hasta que se encuentre un nodo
    return nearestNode;
}



function pintarNodoMasCercano(nearestNode) {
    ctx.fillStyle = 'blue';
    ctx.beginPath();
    ctx.arc(nearestNode.x + netPanningX, nearestNode.y + netPanningY, 3, 0, Math.PI * 2);
    ctx.fill();
}

//
//Creo el grafo
let g = createGraph();

//Agrego nodos
for (let i = 0; i < graph_data.nodes.length; i++) {
    const { id, x, y } = graph_data.nodes[i];
    g.addNode(id.toString(), {
        x: x.toString(),
        y: y.toString()
    })
}

//Agrego aristas
for (let i = 0; i < graph_data.edges.length; i++) {
    const { source, target } = graph_data.edges[i];
    g.addLink(source.toString(), target.toString());
}


//Pathfinding
let pathFinder = ngraphPath.aStar(g);

function buscarRuta(source, target) {
    console.log("Buscando ruta de", source, "a", target);
    return pathFinder.find(source.id.toString(), target.id.toString());
}

function pintarRuta(listaNodos) {
    if (!listaNodos || listaNodos.length === 0) {
        console.log("No se encontró ruta");
        return;
    }
    ctx.strokeStyle = 'purple';
    ctx.lineWidth = 3;

    // Comenzar a dibujar
    ctx.beginPath();

    // Mover al primer nodo
    ctx.moveTo(Number(listaNodos[0].data.x) + netPanningX, Number(listaNodos[0].data.y) + netPanningY);

    // Iterar sobre los nodos restantes y dibujar líneas
    for (let i = 1; i < listaNodos.length; i++) {
        ctx.lineTo(Number(listaNodos[i].data.x) + netPanningX, Number(listaNodos[i].data.y) + netPanningY);
    }

    // Terminar el dibujo
    ctx.stroke();
}



const menuOptions = document.querySelectorAll('.clickable');

menuOptions.forEach(option => {
    option.addEventListener('click', (event) => {
        let $menuSelect = document.getElementById("menu_select");
        $menuSelect.play();
    });
});


function mapSourceSelected() {
    const $mapSourceSelected = document.getElementById("map_source_selected");
    $mapSourceSelected.play()
}

function mapTargetSelected() {
    const $mapTargetSelected = document.getElementById("map_target_selected");
    $mapTargetSelected.play()
}


function updateDayAndTime() {
    const now = new Date();

    const days = ["SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"];
    const currentDay = days[now.getDay()];

    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const currentTime = `${hours}:${minutes}`;

    const $timeDisplay = document.getElementById("timeDisplay");
    $timeDisplay.textContent = `${currentDay}  ${currentTime}`;
}

updateDayAndTime();
setInterval(updateDayAndTime, 60000);

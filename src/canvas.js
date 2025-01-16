import { graph_data } from './util/graph_data.js';

export default class CanvasController {
    constructor(canvas, imageSrc, pathFinder) {
        this.canvas = canvas;
        this.pathFinder = pathFinder;

        this.ctx = canvas.getContext('2d');
        this.cw = canvas.width;
        this.ch = canvas.height;

        this.offset = { x: 0, y: 0 };

        this.netPanning = { x: 0, y: 0 };

        this.mouseDragging = false;
        this.mouseDragStart = { x: 0, y: 0 };

        this.gps = { source: null, sourceNode: null, target: null, targetNode: null, actualRoute: null };

        this.image = new Image();
        this.image.src = imageSrc;
        this.image.onload = () => {
            this.resizeCanvas();
        };

        this.playerIco = new Image();
        this.playerIco.src = "http://127.0.0.1:5500/src/assets/icons/6.png";

        this.markerIco = new Image();
        this.markerIco.src = "http://127.0.0.1:5500/src/assets/icons/marker.png";

        this.canvas.addEventListener("mousedown", (e) => { this.handleMouseDown(e); });
        this.canvas.addEventListener("mousemove", (e) => { this.handleMouseMove(e); });
        this.canvas.addEventListener("mouseup", (e) => { this.handleMouseUp(e); });
        this.canvas.addEventListener("mouseout", (e) => { this.handleMouseUp(e); });
        
        this.canvas.addEventListener('dblclick', (e) => { this.mapDblClick(e); });
        
        // Soporte Movil
        this.canvas.addEventListener("touchstart", (e) => { this.handleTouchStart(e); });
        this.canvas.addEventListener("touchmove", (e) => { this.handleTouchMove(e); });
        this.canvas.addEventListener("touchend", (e) => { this.handleTouchEnd(e); });
        this.canvas.addEventListener("touchcancel", (e) => { this.handleTouchEnd(e); });
        this.lastTouchTime = 0;
        this.doubleTouchThreshold = 300;
    }

    reOffset() {
        let BB = this.canvas.getBoundingClientRect();
        this.offset = { x: BB.left, y: BB.top };
    }

    resizeCanvas() {
        if(window.innerWidth < 768){
            this.canvas.width = window.innerWidth - 20;
            this.canvas.height = window.innerHeight - 320;
        }else {
            this.canvas.width = window.innerWidth - window.innerWidth * 0.2 ;
            this.canvas.height = window.innerHeight - 300;
        }
        // Calcula el centro de la imagen y el canvas
        const centerX = (this.image.width - this.cw) / 2 - 800;
        const centerY = (this.image.height - this.ch) / 2 + 1500;

        // Ajusta el panning inicial para centrar la imagen
        this.netPanning.x = -centerX;
        this.netPanning.y = -centerY;

        // Actualiza el offset y redibuja el canvas
        this.reOffset();
        this.redrawCanvas();
    }

    redrawCanvas() {
        this.ctx.clearRect(0, 0, this.cw, this.ch);
        this.ctx.drawImage(this.image, this.netPanning.x, this.netPanning.y, this.image.width, this.image.height);
        this.drawGraphNodes(graph_data);
        this.drawRoute(this.gps.actualRoute);
        this.drawIcons();
    }

    drawRoute() {
        const nodeList = this.gps.actualRoute;
        if(!nodeList) return;
        this.ctx.strokeStyle = 'purple';
        this.ctx.lineWidth = 3;

        // Comenzar a dibujar
        this.ctx.beginPath();
        // Mover al primer nodo
        this.ctx.moveTo(Number(nodeList[0].data.x) + this.netPanning.x, Number(nodeList[0].data.y) + this.netPanning.y);

        // Iterar sobre los nodos restantes y dibujar líneas
        for (let i = 1; i < nodeList.length; i++) {
            this.ctx.lineTo(Number(nodeList[i].data.x) + this.netPanning.x, Number(nodeList[i].data.y) + this.netPanning.y);
        }
        this.ctx.stroke();
    }

    drawIcons() {
        const source = this.gps.source
        const target = this.gps.target
        if(source){
            this.ctx.drawImage(this.playerIco, source.x - 12 + this.netPanning.x, source.y - 12 + this.netPanning.y, 24, 24);
        }
        if(target){
            this.ctx.drawImage(this.markerIco, target.x - 12 + this.netPanning.x, target.y - 12 + this.netPanning.y, 24, 24);
        }
    }

    drawGraphNodes(graph) {
        this.ctx.fillStyle = 'green';
        graph.nodes.forEach(node => {
            this.ctx.beginPath();
            this.ctx.arc(node.x + this.netPanning.x, node.y + this.netPanning.y, 3, 0, Math.PI * 2);
            this.ctx.fill();
        });
    }


    handleMouseDown(e) {
        e.preventDefault();
        e.stopPropagation();

        this.mouseDragStart = { x: parseInt(e.clientX - this.offset.x), y: parseInt(e.clientY - this.offset.y) };
        this.mouseDragging = true;
    }

    handleMouseUp(e) {
        e.preventDefault();
        e.stopPropagation();
        this.mouseDragging = false;
    }

    handleMouseMove(e) {
        if (!this.mouseDragging) { return; }

        e.preventDefault();
        e.stopPropagation();

        let dx = parseInt(e.clientX - this.offset.x) - this.mouseDragStart.x;
        let dy = parseInt(e.clientY - this.offset.y) - this.mouseDragStart.y;

        this.mouseDragStart = { "x": parseInt(e.clientX - this.offset.x), "y": parseInt(e.clientY - this.offset.y) };

        this.netPanning.x += dx;
        this.netPanning.y += dy;

        this.redrawCanvas();
        const moveAudio = document.getElementById("menu_map_move");
        const moveAudio2 = document.getElementById("menu_map_move2");
        moveAudio.play()
        setTimeout(() => { moveAudio2.play() },  Math.random() * (100 - 20) + 80);

    }

    mapDblClick(e) {
        let mouse = {};
        if(!e.clientX){
            mouse = {
                x: e.touches[0].clientX - this.offset.x - this.netPanning.x,
                y: e.touches[0].clientY - this.offset.y - this.netPanning.y
            }
            console.log("Touch");
        }else {
            mouse = {
                x: e.clientX - this.offset.x - this.netPanning.x,
                y: e.clientY - this.offset.y - this.netPanning.y
            };
        }
        if (this.pathFinder) {
            let nearestNode = this.pathFinder.findNearestNode(mouse.x, mouse.y);
            if (!nearestNode) return;

            if (this.gps.source === null || this.gps.actualRoute !== null) {
                this.gps.source = mouse;
                this.gps.sourceNode = nearestNode;
                this.gps.target = null;
                this.gps.actualRoute = null;
                document.getElementById("map_source_selected").play();
                this.redrawCanvas();
            } else {
                this.gps.target = mouse;
                this.gps.targetNode = nearestNode;
                this.gps.actualRoute = this.pathFinder.findRoute(this.gps.sourceNode, nearestNode);
                console.log(this.gps.actualRoute);
                this.drawRoute();
                document.getElementById("map_target_selected").play();
            }
            this.drawIcons();
        } else {
            console.error("PathFinder is not defined");
        }
    };

    //SOPORTE MOVIL

    handleTouchStart(e) {
        e.preventDefault();
        const touch = e.touches[0];
        this.mouseDragStart = { x: touch.clientX - this.offset.x, y: touch.clientY - this.offset.y };
        this.mouseDragging = true;

        // Doble toque
        const currentTime = new Date().getTime();
        const timeDifference = currentTime - this.lastTouchTime;

        if (timeDifference < this.doubleTouchThreshold) {
            // Detectado doble toque
            this.mapDblClick(e);  // Llamar a la función de doble clic
        }
        this.lastTouchTime = currentTime;
    }
 
    handleTouchMove(e) {
        if (!this.mouseDragging) { return; }
    
        e.preventDefault();
        const touch = e.touches[0];
        let dx = touch.clientX - this.offset.x - this.mouseDragStart.x;
        let dy = touch.clientY - this.offset.y - this.mouseDragStart.y;
    
        this.mouseDragStart = { x: touch.clientX - this.offset.x, y: touch.clientY - this.offset.y };
    
        this.netPanning.x += dx;
        this.netPanning.y += dy;
    
        const moveAudio = document.getElementById("menu_map_move");
        const moveAudio2 = document.getElementById("menu_map_move2");
        moveAudio.play()
        setTimeout(() => { moveAudio2.play() },  Math.random() * (100 - 20) + 80);
        this.redrawCanvas();
    }
    
    handleTouchEnd(e) {
        e.preventDefault();
        this.mouseDragging = false;
    }
}



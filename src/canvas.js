import { graph_data } from './util/graph_data.js';

export default class CanvasController {
    constructor(canvas, imageSrc, pathFinder) {
        this.canvas = canvas;
        this.pathFinder = pathFinder;

        this.ctx = canvas.getContext('2d');
        this.cw = canvas.width;
        this.ch = canvas.height;

        this.offset = { x: 0, y: 0 };

        this.netPanning = { x: -500, y: -500 };

        this.mouseDragging = false;
        this.mouseDragStart = { x: 0, y: 0 };

        this.gps = { source: null, target: null, actualRoute: null };

        this.image = new Image();
        this.image.src = imageSrc;
        this.image.onload = () => {
            this.resizeCanvas();
            this.reOffset();
            this.redrawCanvas();
        };

        this.canvas.addEventListener("mousedown", (e) => { this.handleMouseDown(e); });
        this.canvas.addEventListener("mousemove", (e) => { this.handleMouseMove(e); });
        this.canvas.addEventListener("mouseup", (e) => { this.handleMouseUp(e); });
        this.canvas.addEventListener("mouseout", (e) => { this.handleMouseUp(e); });
        this.canvas.addEventListener('dblclick', (e) => { this.mapDblClick(e); });

    }

    reOffset() {
        let BB = this.canvas.getBoundingClientRect();
        this.offset = { x: BB.left, y: BB.top };
    }

    resizeCanvas() {
        this.canvas.width = window.innerWidth - 500;
        this.canvas.height = window.innerHeight - 300;
        this.reOffset();
        this.redrawCanvas();
    }

    redrawCanvas() {
        this.ctx.clearRect(0, 0, this.cw, this.ch);
        this.ctx.drawImage(this.image, this.netPanning.x, this.netPanning.y, this.image.width, this.image.height);
        this.drawGraphNodes(graph_data);
        this.drawRoute(this.gps.actualRoute);
    }

    drawNearestNode(nearestNode) {
        this.ctx.fillStyle = 'blue';
        this.ctx.beginPath();
        this.ctx.arc(nearestNode.x + this.netPanning.x, nearestNode.y + this.netPanning.y, 3, 0, Math.PI * 2);
        this.ctx.fill();
    }

    drawRoute(nodeList) {
        if (!nodeList || nodeList.length === 0) {
            console.log("No hay ruta para dibujar");
            return;
        }
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

        // Terminar el dibujo
        this.ctx.stroke();
    }

    drawGraphNodes(graph) {
        this.ctx.fillStyle = 'green';
        graph.nodes.forEach(node => {
            this.ctx.beginPath();
            this.ctx.arc(node.x + this.netPanning.x, node.y + this.netPanning.y, 1, 0, Math.PI * 2);
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
        setTimeout(() => { moveAudio2.play() }, 70);

    }

    mapDblClick(e) {
        let mouse = {
            x: e.clientX - this.offset.x - this.netPanning.x,
            y: e.clientY - this.offset.y - this.netPanning.y
        };
        console.log(`Coordenadas relativas: X=${mouse.x}, Y=${mouse.y}`);
        console.log(this.gps);


        if (this.pathFinder) {
            let nearestNode = this.pathFinder.findNearestNode(mouse.x, mouse.y);
            if (!nearestNode) return;
            this.drawNearestNode(nearestNode);

            if (this.gps.source === null || this.gps.actualRoute !== null) {
                this.gps.source = nearestNode;
                this.gps.target = null;
                this.gps.actualRoute = null;
                document.getElementById("map_source_selected").play();
            } else {
                this.gps.target = nearestNode;
                this.gps.actualRoute = this.pathFinder.findRoute(this.gps.source, nearestNode);
                console.log(this.gps.actualRoute);
                this.drawRoute(this.gps.actualRoute);
                document.getElementById("map_target_selected").play();
            }
        } else {
            console.error("PathFinder is not defined");
        }
    };
}



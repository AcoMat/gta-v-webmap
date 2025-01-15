import { graph_data } from './util/graph_data.js';
import KDBush from 'https://cdn.jsdelivr.net/npm/kdbush/+esm';

export default class PathFinder {
    constructor() {
        this.g = createGraph();
        this.index = new KDBush(graph_data.nodes.length)

        //Agrego nodos
        for (let i = 0; i < graph_data.nodes.length; i++) {
            const { id, x, y } = graph_data.nodes[i];
            this.g.addNode(id.toString(), {
                x: x.toString(),
                y: y.toString()
            })
        }

        //Agrego aristas
        for (let i = 0; i < graph_data.edges.length; i++) {
            const { source, target } = graph_data.edges[i];
            this.g.addLink(source.toString(), target.toString());
        }

        //Spatial Index
        for (let i = 0; i < graph_data.nodes.length; i++) {
            const { x, y } = graph_data.nodes[i];
            this.index.add(x, y);
        }
        this.index.finish();

        this.pathFinder = ngraphPath.aStar(this.g);
    }

    findRoute(source, target) {
        console.log("Buscando ruta de", source, "a", target);
        return this.pathFinder.find(source.id.toString(), target.id.toString());
    }

    findNearestNode(x, y) {
        const radius = 5;
        console.log("nodo mas cercano", this.index.within(x, y, radius)[0]);
        const nearestNode = graph_data.nodes[this.index.within(x, y, radius)[0]];
        //TODO: agrandar el radius hasta que se encuentre un nodo
        return nearestNode;
    }
    


}
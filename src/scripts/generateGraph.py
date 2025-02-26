import cv2
import numpy as np
import networkx
import json
import matplotlib.pyplot as plt

def process_image(image_path):
    # Leer la imagen en escala de grises
    image = cv2.imread(image_path, cv2.IMREAD_GRAYSCALE)
    
    # Binarizar la imagen (asegurar que sea solo blanco y negro)
    _, binary_image = cv2.threshold(image, 127, 255, cv2.THRESH_BINARY)

    # Identificar los puntos finales y cruces
    skeleton = (binary_image // 255).astype(np.uint8)  # Convertir a 0 y 1
    
    # Crear un grafo vacío
    G = networkx.Graph()

    # Identificar los nodos y aristas
    height, width = skeleton.shape
    directions = [(-1, 0), (1, 0), (0, -1), (0, 1), (-1, -1), (-1, 1), (1, -1), (1, 1)]  # 8 direcciones posibles

    for y in range(height):
        for x in range(width):
            if skeleton[y, x] == 1:  # Si el píxel es blanco (parte de una calle)
                neighbors = [(y+dy, x+dx) for dy, dx in directions if 0 <= y+dy < height and 0 <= x+dx < width and skeleton[y+dy, x+dx] == 1]
                
                # Identificar si es un nodo
                if len(neighbors) != 2:  # Es un nodo si tiene 0, 1, o más de 2 vecinos
                    G.add_node((x, y))

                # Crear aristas entre el nodo actual y sus vecinos
                for ny, nx in neighbors:
                    if not G.has_edge((x, y), (nx, ny)):
                        G.add_edge((x, y), (nx, ny))

    # Optimización: eliminar nodos redundantes
    nodes_to_remove = []
    for node in list(G.nodes):
        neighbors = list(G.neighbors(node))
        if len(neighbors) == 2:
            n1, n2 = neighbors
            # Verificar si los tres puntos (nodo, n1, n2) están alineados en una línea recta
            # Si la pendiente entre (nodo, n1) es igual a la pendiente entre (nodo, n2), entonces están alineados
            dx1, dy1 = n1[0] - node[0], n1[1] - node[1]
            dx2, dy2 = n2[0] - node[0], n2[1] - node[1]
            
            # Para verificar si los vectores (dx1, dy1) y (dx2, dy2) son colineales, comprobamos si el producto cruzado es 0
            if dx1 * dy2 == dy1 * dx2:  # Producto cruzado igual a cero indica colinealidad
                # Conectar los dos vecinos y eliminar el nodo redundante
                G.add_edge(n1, n2)
                nodes_to_remove.append(node)

    # Eliminar los nodos redundantes
    for node in nodes_to_remove:
        G.remove_node(node)

    return G

def graph_to_js(G):
    # Generar el contenido JS con export
    nodes_js = [{"id": i, "x": node[0], "y": node[1]} for i, node in enumerate(G.nodes)]
    edges_js = [{"source": list(G.nodes).index(edge[0]), "target": list(G.nodes).index(edge[1])} for edge in G.edges]

    js_content = f"""
export const graph_data = {{
    "nodes": {json.dumps(nodes_js, indent=4)},
    "edges": {json.dumps(edges_js, indent=4)}
}};
"""
    return js_content

if __name__ == "__main__":
    image_path = "" 
    graph = process_image(image_path)
    
    graph_js = graph_to_js(graph)
    
    with open("graph_data.js", "w") as f:
        f.write(graph_js)

    print("Grafo optimizado generado y guardado en graph_data.js")

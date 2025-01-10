import cv2
import skan
import networkx as nx
from skimage import morphology
from skan.pre import threshold
from skimage.util import img_as_ubyte
import matplotlib.pyplot as plt
import numpy as np



def plot_graph(image, graph, skeleton_graph, title):
    """Función para visualizar el grafo sobre la imagen"""
    plt.figure(figsize=(10, 5))
    plt.imshow(image, cmap='gray')  # Mostrar la imagen de fondo
    
    pos = {i: (skeleton_graph.coordinates[i, 1], skeleton_graph.coordinates[i, 0]) for i in range(skeleton_graph.coordinates.shape[0])}
    nx.draw(graph, pos, with_labels=True, node_size=50, node_color="blue", edge_color="gray")
    
    plt.title(title)
    plt.show()

def main(image_path, output_js_path):
    # Leer la imagen
    image = cv2.imread(image_path, cv2.IMREAD_GRAYSCALE)
    
    # Umbralización para binarizar la imagen
    binary = threshold(image)

    skeleton = morphology.skeletonize(binary)
    skeleton_ubyte = img_as_ubyte(skeleton)

    # Guardar la imagen esqueletizada
    cv2.imwrite("generated_ske.png", skeleton_ubyte)

    skeleton_graph = skan.Skeleton(skeleton)
    graph = skan.csr.skeleton_to_nx(skeleton_graph)

    # Asegurarse de que el grafo sea un multigrafo para manejar claves únicas
    if not isinstance(graph, nx.MultiGraph) and not isinstance(graph, nx.MultiDiGraph):
        graph = nx.MultiGraph(graph)

    # Agregar atributos de posición (X, Y) a los nodos
    for node in graph.nodes:
        y, x = skeleton_graph.coordinates[node]  # Coordenadas del nodo
        graph.nodes[node]['X'] = int(x)  # Convertir a tipo Python nativo
        graph.nodes[node]['Y'] = int(y)  # Convertir a tipo Python nativo

    # Agregar peso a las aristas basado en la distancia euclidiana
    edge_weights = {}
    for u, v, key in graph.edges(keys=True):  # Incluye 'key' en la iteración
        x1, y1 = graph.nodes[u]['X'], graph.nodes[u]['Y']
        x2, y2 = graph.nodes[v]['X'], graph.nodes[v]['Y']
        weight = np.sqrt((x2 - x1)**2 + (y2 - y1)**2)
        edge_weights[(u, v, key)] = float(weight)  # Convertir a tipo Python nativo

    nx.set_edge_attributes(graph, edge_weights, 'weight')

    plot_graph(image, graph, skeleton_graph, "Grafo antes de eliminar nodos")

    # Nodos a eliminar
    nodes_to_remove = [
{ "source": 3687, "target": 3687 },
{ "source": 3807, "target": 3807 },
{ "source": 55676, "target": 55676 },
{ "source": 45360, "target": 45360 },
{ "source": 4680, "target": 4680 },
{ "source": 2348, "target": 2348 },
{ "source": 659, "target": 659 },
{ "source": 21566, "target": 21566 },
{ "source": 160167, "target": 160167 },
{ "source": 178819, "target": 178819 },
{ "source": 151507, "target": 151507 },
{ "source": 164898, "target": 164898 },
{ "source": 118505, "target": 118505 },
{ "source": 107345, "target": 107345 },
{ "source": 46485, "target": 46485 },
{ "source": 117220, "target": 117220 },
{ "source": 135623, "target": 135623 },
{ "source": 116929, "target": 116929 },
{ "source": 32555, "target": 32555 },
{ "source": 35199, "target": 35199 },
{ "source": 44963, "target": 44963 },
{ "source": 43021, "target": 43021 },
{ "source": 100116, "target": 100116 },
{ "source": 52191, "target": 52191 },
{ "source": 39268, "target": 39268 },
{ "source": 42971, "target": 42971 },
{ "source": 81501, "target": 81501 },
{ "source": 89929, "target": 89929 },
{ "source": 92253, "target": 92253 },
{ "source": 127466, "target": 127466 },
{ "source": 130976, "target": 130976 },
{ "source": 132281, "target": 132281 },
{ "source": 128730, "target": 128730 },
{ "source": 133248, "target": 133248 },
{ "source": 146967, "target": 146967 },
{ "source": 162924, "target": 162924 },
{ "source": 90122, "target": 90122 },
{ "source": 86566, "target": 86566 },
{ "source": 85138, "target": 85138 },
{ "source": 57468, "target": 57468 },
{ "source": 135307, "target": 135307 },
{ "source": 134487, "target": 134487 },
{ "source": 155401, "target": 155401 },
{ "source": 160173, "target": 160173 },
{ "source": 165409, "target": 165409 },
{ "source": 163228, "target": 163228 },
{ "source": 174193, "target": 174193 },
{ "source": 178432, "target": 178432 },
{ "source": 174389, "target": 174389 },
{ "source": 183522, "target": 183522 },
{ "source": 183102, "target": 183102 },
{ "source": 183907, "target": 183907 },
{ "source": 26933, "target": 26933 }
]

    # Eliminar nodos del grafo
    for node_data in nodes_to_remove:
        node = node_data["source"]
        if graph.has_node(node):  # Verificar si el nodo existe en el grafo
            graph.remove_node(node)

    plot_graph(image, graph, skeleton_graph, "Grafo después de eliminar nodos")

    # Convertir nodos y aristas a un formato adecuado para JavaScript
    nodes = []
    edges = []

    # Procesar nodos
    for node, data in graph.nodes(data=True):
        nodes.append({
            "id": int(node),  # Asegurarse de que sea un int nativo
            "x": data['X'],
            "y": data['Y']
        })

    # Procesar aristas
    for u, v, key, data in graph.edges(data=True, keys=True):
        edges.append({
            "source": int(u),  # Asegurarse de que sea un int nativo
            "target": int(v),  # Asegurarse de que sea un int nativo
            "weight": data['weight']
        })

    # Crear la estructura de datos en formato JS
    js_content = f"""
export const graph_data = {{
    "nodes": {nodes},
    "edges": {edges}
}};
"""

    # Guardar en un archivo JavaScript
    with open(output_js_path, 'w') as js_file:
        js_file.write(js_content)

    print(f"Datos del grafo guardados en {output_js_path}")


# Ruta de la imagen del mapa y salida JavaScript
image_path = r"F:\VSCODE-Repos\gta-v-webmap\src\util\map_skeleton.png"
output_js_path = r"F:\VSCODE-Repos\gta-v-webmap\src\util\graph_data.js"

main(image_path, output_js_path)
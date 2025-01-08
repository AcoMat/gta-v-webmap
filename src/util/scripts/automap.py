import cv2
import skan
import networkx as nx
from skimage import morphology
from skan.pre import threshold
from skimage.util import img_as_ubyte
import matplotlib.pyplot as plt
import numpy as np
import json


def main(image_path, output_json_path):
    # Leer la imagen
    image = cv2.imread(image_path, cv2.IMREAD_GRAYSCALE)
    
    # Umbralización para binarizar la imagen
    binary = threshold(image)

    skeleton = morphology.skeletonize(binary)
    skeleton_ubyte = img_as_ubyte(skeleton)

    # Guardar la imagen esqueletizada
    cv2.imwrite("skeleton.png", skeleton_ubyte)

    skeleton_graph = skan.Skeleton(skeleton)
    graph = skan.csr.skeleton_to_nx(skeleton_graph)

    # Visualizar el grafo del esqueleto
    plt.figure(figsize=(10, 5))
    plt.imshow(image, cmap='gray')
    
    pos = {i: (skeleton_graph.coordinates[i, 1], skeleton_graph.coordinates[i, 0]) for i in range(skeleton_graph.coordinates.shape[0])}
    nx.draw(graph, pos, with_labels=True, node_size=50, node_color="blue", edge_color="gray")
    
    plt.show()

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

    # Convertir nodos y aristas a un formato JSON
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

    # Crear estructura JSON
    graph_data = {
        "nodes": nodes,
        "edges": edges
    }

    # Guardar en un archivo JSON
    with open(output_json_path, 'w') as json_file:
        json.dump(graph_data, json_file, indent=4)

    print(f"Datos del grafo guardados en {output_json_path}")


# Ruta de la imagen del mapa y salida JSON
image_path = r"F:\VSCODE-Repos\gta-v-webmap\src\util\map_image.png"
output_json_path = r"F:\VSCODE-Repos\gta-v-webmap\src\util\graph_data.json"

main(image_path, output_json_path)

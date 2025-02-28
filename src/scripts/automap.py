import cv2
import skan
import networkx as nx
from skimage import morphology
from skan.pre import threshold
from skimage.util import img_as_ubyte
import matplotlib.pyplot as plt
import numpy as np

def merge_close_nodes(graph, distance_threshold=5):
    """
    Fusiona nodos cercanos en un grafo, ajustando sus aristas.

    Args:
        graph (networkx.Graph): Grafo con atributos X e Y en los nodos.
        distance_threshold (int): Distancia máxima en píxeles para fusionar nodos.

    Returns:
        networkx.Graph: Grafo con nodos fusionados.
    """
    # Crear una lista de nodos para iterar sin modificar dinámicamente
    nodes_to_merge = list(graph.nodes(data=True))

    # Mapeo de nodos fusionados
    merged_nodes = {}

    for i, (node1, data1) in enumerate(nodes_to_merge):
        if node1 not in graph:
            continue  # Si el nodo ya fue eliminado, ignorarlo

        x1, y1 = data1['X'], data1['Y']

        for j, (node2, data2) in enumerate(nodes_to_merge):
            if i >= j or node2 not in graph or node2 in merged_nodes:
                continue  # Evitar repetir fusiones o trabajar con nodos eliminados

            x2, y2 = data2['X'], data2['Y']
            if abs(x1 - x2) <= distance_threshold and abs(y1 - y2) <= distance_threshold:
                # Fusionar node2 en node1
                merged_nodes[node2] = node1

                # Transferir las aristas de node2 a node1
                for neighbor in list(graph.neighbors(node2)):
                    if neighbor != node1:  # Evitar auto-bucles
                        weight = graph[node2][neighbor][0]['weight']
                        graph.add_edge(node1, neighbor, weight=weight)

                # Eliminar el nodo fusionado
                graph.remove_node(node2)

    # Actualizar las coordenadas de los nodos fusionados (promedio de coordenadas)
    for node1 in set(merged_nodes.values()):
        related_nodes = [n for n, m in merged_nodes.items() if m == node1] + [node1]
        avg_x = int(np.mean([graph.nodes[n]['X'] for n in related_nodes if n in graph]))
        avg_y = int(np.mean([graph.nodes[n]['Y'] for n in related_nodes if n in graph]))
        graph.nodes[node1]['X'] = avg_x
        graph.nodes[node1]['Y'] = avg_y

    return graph

def findNodesInRedArea(graph, image):
    """
    Encuentra los nodos en el grafo que se superponen con píxeles rojos en la imagen.
    
    Args:
        graph (networkx.Graph): Grafo con atributos X e Y en los nodos.
        image (numpy.ndarray): Imagen original en formato BGR.
        
    Returns:
        list: Lista de nodos que se superponen con píxeles rojos.
    """
    nodes_to_remove = []

    # Asegurarse de que la imagen sea del tipo correcto (BGR)
    if len(image.shape) != 3 or image.shape[2] != 3:
        raise ValueError("La imagen debe ser una imagen en formato BGR.")

    # Recorrer los nodos y verificar si sus coordenadas se superponen con un píxel rojo
    for node in graph.nodes:
        x = graph.nodes[node]['X']
        y = graph.nodes[node]['Y']

        # Asegurarse de que las coordenadas están dentro de los límites de la imagen
        if 0 <= x < image.shape[1] and 0 <= y < image.shape[0]:
            b, g, r = image[y, x]  # Obtener el valor del píxel en formato BGR
            # Determinar si el píxel es rojo
            if r > 150 and g < 100 and b < 100:  # Condición de píxel rojo
                nodes_to_remove.append(node)

    return nodes_to_remove

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
    ogImage = cv2.imread(image_path)
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

    nodes_to_remove = findNodesInRedArea(graph, ogImage)

    # Eliminar nodos del grafo
    for node in nodes_to_remove:
        if graph.has_node(node):  # Verificar si el nodo existe en el grafo
            graph.remove_node(node)

    graph = merge_close_nodes(graph, distance_threshold=5)

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
image_path = r""
output_js_path = r""

main(image_path, output_js_path)
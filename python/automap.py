import cv2
import skan  
import networkx as nx
from skimage import morphology
from skan.pre import threshold
from skimage.util import img_as_ubyte
import matplotlib.pyplot as plt
import numpy as np
from skan import draw

def main(image_path):
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
    plt.figure(figsize=(10, 10))
    plt.imshow(image, cmap='gray')
    
    pos = {i: (skeleton_graph.coordinates[i, 1], skeleton_graph.coordinates[i, 0]) for i in range(skeleton_graph.coordinates.shape[0])}
    nx.draw(graph, pos, with_labels=True, node_size=50, node_color="blue", edge_color="gray")
    
    plt.show()


# Ruta de la imagen del mapa
image_path = r"F:\VSCODE-Repos\gta-v-webmap\python\map_image.png" 
main(image_path)

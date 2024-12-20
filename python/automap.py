import cv2
import numpy as np
from skimage.morphology import skeletonize
from skimage.util import img_as_ubyte

def neighbours(x,y,image):
    """Return 8-neighbours of image point P1(x,y), in a clockwise order"""
    img = image
    x_1, y_1, x1, y1 = x-1, y-1, x+1, y+1;
    return [ img[x_1][y], img[x_1][y1], img[x][y1], img[x1][y1], img[x1][y], img[x1][y_1], img[x][y_1], img[x_1][y_1] ]   


def getSkeletonIntersection(skeleton):
    """ 
    Dado un esqueleto de imagen, detecta las coordenadas de las intersecciones.
    """
    # Lista de patrones válidos de intersección
    validIntersection = [[0,1,0,1,0,0,1,0], [0,0,1,0,1,0,0,1], [1,0,0,1,0,1,0,0],
                         [0,1,0,0,1,0,1,0], [0,0,1,0,0,1,0,1], [1,0,0,1,0,0,1,0],
                         [0,1,0,0,1,0,0,1], [1,0,1,0,0,1,0,0], [0,1,0,0,0,1,0,1],
                         [0,1,0,1,0,0,0,1], [0,1,0,1,0,1,0,0], [0,0,0,1,0,1,0,1],
                         [1,0,1,0,0,0,1,0], [1,0,1,0,1,0,0,0], [0,0,1,0,1,0,1,0],
                         [1,0,0,0,1,0,1,0], [1,0,0,1,1,1,0,0], [0,0,1,0,0,1,1,1],
                         [1,1,0,0,1,0,0,1], [0,1,1,1,0,0,1,0], [1,0,1,1,0,0,1,0],
                         [1,0,1,0,0,1,1,0], [1,0,1,1,0,1,1,0], [0,1,1,0,1,0,1,1],
                         [1,1,0,1,1,0,1,0], [1,1,0,0,1,0,1,0], [0,1,1,0,1,0,1,0],
                         [0,0,1,0,1,0,1,1], [1,0,0,1,1,0,1,0], [1,0,1,0,1,1,0,1],
                         [1,0,1,0,1,1,0,0], [1,0,1,0,1,0,0,1], [0,1,0,0,1,0,1,1],
                         [0,1,1,0,1,0,0,1], [1,1,0,1,0,0,1,0], [0,1,0,1,1,0,1,0],
                         [0,0,1,0,1,1,0,1], [1,0,1,0,0,1,0,1], [1,0,0,1,0,1,1,0],
                         [1,0,1,1,0,1,0,0]];

    image = skeleton.copy() / 255
    intersections = []

    for x in range(1, len(image) - 1):
        for y in range(1, len(image[x]) - 1):
            # Si el píxel es blanco
            if image[x][y] == 1:
                neighbour_pixels = neighbours(x, y, image)  # Cambié el nombre de la variable
                if neighbour_pixels in validIntersection:
                    intersections.append((x, y))

    # Filtrar intersecciones muy cercanas
    for point1 in intersections:
        for point2 in intersections:
            if (((point1[0] - point2[0]) ** 2 + (point1[1] - point2[1]) ** 2) < 10 ** 2) and (point1 != point2):
                intersections.remove(point2)

    # Eliminar duplicados
    intersections = list(set(intersections))
    return intersections


def main(image_path):
    # Leer la imagen
    image = cv2.imread(image_path, cv2.IMREAD_GRAYSCALE)
    
    # Umbralización para binarizar la imagen
    _, binary = cv2.threshold(image, 128, 255, cv2.THRESH_BINARY_INV)

    # Generar el esqueleto
    skeleton = skeletonize(binary > 0)
    skeleton = img_as_ubyte(skeleton)

    # Detectar intersecciones
    intersections = getSkeletonIntersection(skeleton)

    # Mostrar los resultados
    for y, x in intersections:
        cv2.circle(skeleton, (x, y), 3, (255), -1)  # Dibujar círculos en las intersecciones

    # Guardar la imagen con intersecciones detectadas
    cv2.imwrite("skeleton_with_intersections.png", skeleton)
    print("La imagen procesada ha sido guardada como 'skeleton_with_intersections.png'.")

    # Convertir intersecciones a una lista de tuplas
    intersections_list = [(int(x), int(y)) for y, x in intersections]
    print("Intersecciones detectadas:", intersections_list)
    return intersections_list

# Ruta de la imagen del mapa
image_path = r"F:\VSCODE-Repos\gta-v-webmap\python\map_image.png"  # Cambia la ruta según sea necesario
intersections = main(image_path)

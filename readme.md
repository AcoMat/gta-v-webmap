# 🗺️ Mapa Interactivo de GTA V con GPS

Este proyecto es un mapa interactivo basado en **Grand Theft Auto V**, que permite explorar la ciudad con su gps con desplazamiento. Además, cuenta con un sistema de **GPS basado en teoría de grafos**, capaz de calcular rutas entre puntos del mapa.

## 📸 Vista previa

![image](https://github.com/user-attachments/assets/4f382dec-bf82-450c-b8c7-f32bffa45f8c)

![preview](https://github.com/user-attachments/assets/cc2e67c2-8412-40fe-b865-b0ee943d5a84)

## Desafíos del proyecto

* Crear un mapa interactivo con zoom y movimiento fluido.
* Implementar un sistema de navegación para el mapa interactivo utilizando **teoría de grafos**.  
* Extraer el grafo de rutas a partir de una imagen mediante su procesamiento y esqueletización.
* Manejar nodos y conexiones dinámicas en un grafo basado en la estructura vial del juego.

## Estado actual y mejoras pendientes

### TODO:

- [ ] Agregar capas faltantes al grafo (puentes, autopistas, intersecciones complejas).  
- [ ] Realizar pruebas y validaciones en el cálculo de rutas.  
- [x] Mejorar la precisión de las curvas en el grafo.  
- [x] Permitir la selección de cualquier punto en el mapa y conectarlo automáticamente.  

## Tecnologías utilizadas

* Frontend: HTML, CSS y JavaScript para la interfaz y navegación en el mapa.
* Algoritmos de rutas: ngraph.path para la búsqueda eficiente de rutas con A (A-Star).
* Optimización espacial: KDBush para indexación y búsqueda de nodos.
* Procesamiento de imágenes: OpenCV, scikit-image y skan para extraer caminos y convertirlos en grafos.
* Estructuras de datos: NetworkX para modelar el grafo vial.

### Recursos utilizados:

- https://dip4fish.blogspot.com/2014/05/construct-graph-from-skeleton-image-of.html
- https://stackoverflow.com/questions/41705405/finding-intersections-of-a-skeletonised-image-in-python-opencv
- https://forum.processing.org/one/topic/how-to-detect-intersections-and-lines-if-possible
- [anvaka/ngraph.path](https://github.com/anvaka/ngraph.path)
- [github.com/mourner/kdbush](https://github.com/mourner/kdbush)
- https://stackoverflow.com/questions/41705405/finding-intersections-of-a-skeletonised-image-in-python-opencv
- https://skeleton-analysis.org/stable/index.html

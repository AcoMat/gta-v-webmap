# Mapa ficticio interactivo con gps
## Basado en el mapa del videojuego GTA 5

![preview](https://github.com/user-attachments/assets/cc2e67c2-8412-40fe-b865-b0ee943d5a84)

### Desafios:
* Crear una web con el mapa, en la que se pueda hacer zoom y arrastar.
* Utilizar Teoria de Grafos para desarrollar un gps.
* Automatizar el procesamiento de la imagen del mapa para la extraccion de grafos.

### TODO:
* Agregar capas faltantes en el grafo que se utiliza para el gps (Puentes, Autopistas, Intersecciones complejas)
* refactorizar el codigo, mejorar estructura, etc
* Redimencionar pagina
* Testeo general del grafo
* Refinar curvas en el grafo
* Refinar grafo en general (nodos muy juntos, conexiones incorrectas, etc)
* Mejorar el renderizado de rutas (probar con una mascara)
* Feat: Ser capaz de seleccionar cualquier punto en el mapa (crear un nuevo nodo y conectarlo automaticamente)
* UX (sonidos, interfaz del juego, tamaño del mapa, etc)
* Acceso rapido para borrar ruta
* Leyenda en la parte inferior

#### Recursos utilizados:
- https://stackoverflow.com/questions/41705405/finding-intersections-of-a-skeletonised-image-in-python-opencv
- https://forum.processing.org/one/topic/how-to-detect-intersections-and-lines-if-possible


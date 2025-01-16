# Mapa ficticio interactivo con gps
## Basado en el mapa del videojuego GTA 5

![image](https://github.com/user-attachments/assets/4f382dec-bf82-450c-b8c7-f32bffa45f8c)

![preview](https://github.com/user-attachments/assets/cc2e67c2-8412-40fe-b865-b0ee943d5a84)

### Desafios:
* Crear una web con el mapa, en la que se pueda hacer zoom y arrastar.
* Utilizar Teoria de Grafos para desarrollar un gps.
* Automatizar el procesamiento de la imagen del mapa para la extraccion de grafos.

### TODO:
* Agregar capas faltantes en el grafo que se utiliza para el gps (Puentes, Autopistas, Intersecciones complejas)
* Testeo general del grafo
* Refinar curvas en el grafo
* Feat: Ser capaz de seleccionar cualquier punto en el mapa (crear un nuevo nodo y conectarlo automaticamente)

#### Recursos utilizados:
- https://dip4fish.blogspot.com/2014/05/construct-graph-from-skeleton-image-of.html
- https://stackoverflow.com/questions/41705405/finding-intersections-of-a-skeletonised-image-in-python-opencv
- https://forum.processing.org/one/topic/how-to-detect-intersections-and-lines-if-possible
- [anvaka/ngraph.path](https://github.com/anvaka/ngraph.path)
- [github.com/mourner/kdbush](https://github.com/mourner/kdbush)
- https://stackoverflow.com/questions/41705405/finding-intersections-of-a-skeletonised-image-in-python-opencv
- https://skeleton-analysis.org/stable/index.html

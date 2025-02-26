
const canvas = document.getElementById('myCanvas');
import Canvas from './canvas.js';
import PathFinder from './pathfinder.js';

const pathFinder = new PathFinder();
const canvasController = new Canvas(canvas,"./src/assets/map_image.jpg", pathFinder);


// Ajustar el tamaño del canvas al tamaño de la ventana
window.addEventListener('resize', canvasController.resizeCanvas);
window.addEventListener('scroll', canvasController.reOffset);

const menuOptions = document.querySelectorAll('.clickable');
menuOptions.forEach(option => {
    option.addEventListener('click', (event) => {
        let $menuSelect = document.getElementById("menu_select");
        $menuSelect.play();
    });
});

function updateDayAndTime() {
    const now = new Date();

    const days = ["SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"];
    const currentDay = days[now.getDay()];

    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const currentTime = `${hours}:${minutes}`;

    const $timeDisplay = document.getElementById("timeDisplay");
    $timeDisplay.textContent = `${currentDay}  ${currentTime}`;
}

updateDayAndTime();
setInterval(updateDayAndTime, 60000);

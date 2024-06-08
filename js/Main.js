document.addEventListener('DOMContentLoaded',function(){
   // Configuración del lienzo y del contexto de dibujo
 const canvas = document.getElementById("canvas");
 canvas.width = canvas.clientWidth;
 canvas.height = canvas.clientHeight;
const paper = canvas.getContext("2d");

// Selección de elementos del DOM
const undo = document.getElementById('undo');
const redo = document.getElementById('redo');
const move = document.getElementById('move');
const scale = document.getElementById('ratio');
const rotate = document.getElementById('rotate');
const toPNG = document.getElementById('toPNG');
const toJPG = document.getElementById('toJPG');
const Colors = document.querySelectorAll('.color');
const Figrs = document.querySelectorAll('.fig');
const save = document.getElementById('Save');
const open = document.getElementById('openfile');
const restart = document.getElementById('restart');
const layer = document.querySelectorAll('.post');
const menu = document.querySelectorAll('.menu-figuras');

// Variables globales
var figure = [];
var back_store = [];
var isDrawing = false;
var isScale = false;
var isRotate = false;
var isEraser = false;
var firstPointX = 0;
var firstPointY = 0;
var finalPointX = 0;
var finalPointY = 0;
var modo = 'pencil';
var Color_line = 'black';
let current_index = null;
let json = [];
const picker = document.getElementById('picker');

// Asignación de eventos a los botones de colores
Colors.forEach((button) => {
    button.addEventListener('click', function (ev) {
        Color_line = button.value;
    });
});

// Asignación de evento al selector de color
picker.addEventListener('change', function () {
    Color_line = picker.value;
});

// Asignación de eventos a los botones de capas
layer.forEach((button) => {
    button.addEventListener('click', function () {
        modo = button.value;
    });
});

// Asignación de evento al botón de abrir archivo
open.addEventListener('click', function () {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "application/json";
    input.onchange = function (event) {
        const file = event.target.files[0];
        const reader = new FileReader();
        reader.onload = function (event) {
            figure = JSON.parse(event.target.result);
            drawFigure();
        };
        reader.readAsText(file);
    };
    input.click();
});

// Carga de figuras en el menú
menu.forEach((value) => {
    value.addEventListener('onload', function () {
        for (let fig of figure) {
            let h3 = document.createElement('h3');
            document.body.appendChild(h3);
            h3.textContent = 'hi';
        }
    });
});

// Asignación de eventos a los botones de figuras
Figrs.forEach((button) => {
    button.addEventListener('click', function () {
        modo = button.value;
    });
});

// Asignación de evento al botón de reiniciar
restart.addEventListener('click', function () {
    paper.clearRect(0, 0, canvas.width, canvas.height);
    figure = [];
    back_store = [];
});

// Asignación de evento al botón de guardar
save.addEventListener('click', function () {
    json = JSON.stringify(figure);
    console.log(json);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'figuras.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
});

// Tamaño del pincel
let sinsel_size = 5;
    // Selección de elementos del DOM
const range = document.getElementById('range');
const dat = document.getElementById('data');
const eraser = document.getElementById('eraser');
const eraser_pix = document.getElementById('eraser_pix');

// Evento para cambiar el tamaño del pincel y mostrar el valor actual
range.addEventListener('change', function () {
    dat.textContent = range.value;
    sinsel_size = range.value;
});

// Eventos para cambiar el modo a "eraser" y "eraser_pix"
eraser.addEventListener('click', function () {
    modo = 'eraser';
});
eraser_pix.addEventListener('click', function () {
    modo = 'eraser_pix';
});

// Eventos para cambiar el modo a "move", "scale" y "rotate"
move.addEventListener('click', function () {
    modo = 'move';
});
scale.addEventListener('click', function () {
    modo = 'scale';
});
rotate.addEventListener('click', function () {
    modo = 'rotate';
});

// Evento para deshacer la última acción
undo.addEventListener('click', function () {
    if (figure.length > 0) {
        back_store.push(figure.pop());
        drawFigure();
    }
});

// Evento para guardar el lienzo como imagen PNG
toPNG.addEventListener('click', function () {
    const a = document.createElement('a');
    const dataURI = canvas.toDataURL();
    document.body.appendChild(a);
    a.href = dataURI;
    a.download = "canvas-image.png";
    a.click();
    document.body.removeChild(a);
});

// Evento para guardar el lienzo como imagen JPG
toJPG.addEventListener('click', function () {
    const a = document.createElement('a');
    const dataURI = canvas.toDataURL();
    document.body.appendChild(a);
    a.href = dataURI;
    a.download = "canvas-image.jpg";
    a.click();
    document.body.removeChild(a);
});

// Evento para guardar el lienzo como PDF
const toPDF = document.getElementById('toPDF');
toPDF.addEventListener('click', function () {
    genPDF();
});

// Función para generar y guardar el PDF
function genPDF() {
    var doc = new jsPDF({
        orientation: "landscape",
        unit: 'mm',
        format: [canvas.clientWidth, canvas.clientHeight]
    });
    const dataURI = canvas.toDataURL({
        type: 'png',
        quality: 1
    });
    doc.addImage(dataURI, "PNG", 0, 0);
    doc.save("Midocumento.pdf");
}

// Evento para rehacer la última acción deshecha
redo.addEventListener('click', function () {
    if (back_store.length > 0) {
        figure.push(back_store.pop());
        drawFigure();
    }
});


  // Función para dibujar una elipse
function DrawEllipse(xc, yc, a, b, angle, size, color) {
    for (let theta = 0; theta < 2 * Math.PI; theta += 0.01) {
        // Calcular las coordenadas x e y de la elipse
        const x = xc + a * Math.cos(theta) * Math.cos(angle) - b * Math.sin(theta) * Math.sin(angle);
        const y = yc + a * Math.cos(theta) * Math.sin(angle) + b * Math.sin(theta) * Math.cos(angle);
        paper.fillStyle = color; // Establecer el color de relleno
        paper.fillRect(x, y, size, size); // Dibujar un pequeño rectángulo en las coordenadas calculadas
    }
}

// Función para verificar si el ratón está dentro de un trapecio
function is_in_trapezoid(mouseX, mouseY, Figure) {
    var halfHeight = Figure.heightTrapezoid; // Altura del trapecio
    var halfTopWidth = Figure.topWidth; // Ancho superior del trapecio
    var halfBottomWidth = Figure.bottomWidth; // Ancho inferior del trapecio

    // Calcular las coordenadas de los vértices del trapecio en base al ángulo de inclinación
    var topLeftX = Figure.firstPointX - halfTopWidth;
    var topLeftY = Figure.firstPointY - halfHeight;
    var topRightX = Figure.firstPointX + halfTopWidth;
    var topRightY = Figure.firstPointY - halfHeight;
    var bottomRightX = Figure.firstPointX + halfBottomWidth;
    var bottomRightY = Figure.firstPointY + halfHeight;
    var bottomLeftX = Figure.firstPointX - halfBottomWidth;
    var bottomLeftY = Figure.firstPointY + halfHeight;

    // Rotar los vértices del trapecio alrededor de su centro
    var rotatedTopLeft = rotatePoint(topLeftX, topLeftY, Figure.firstPointX, Figure.firstPointY, Figure.angle);
    var rotatedTopRight = rotatePoint(topRightX, topRightY, Figure.firstPointX, Figure.firstPointY, Figure.angle);
    var rotatedBottomRight = rotatePoint(bottomRightX, bottomRightY, Figure.firstPointX, Figure.firstPointY, Figure.angle);
    var rotatedBottomLeft = rotatePoint(bottomLeftX, bottomLeftY, Figure.firstPointX, Figure.firstPointY, Figure.angle);

    // Crear un polígono con los vértices rotados del trapecio
    var trapezoidPolygon = [rotatedTopLeft, rotatedTopRight, rotatedBottomRight, rotatedBottomLeft];

    var inside = false; // Variable para determinar si el punto está dentro del trapecio
    for (var i = 0, j = trapezoidPolygon.length - 1; i < trapezoidPolygon.length; j = i++) {
        var xi = trapezoidPolygon[i].x, yi = trapezoidPolygon[i].y;
        var xj = trapezoidPolygon[j].x, yj = trapezoidPolygon[j].y;

        // Verificar si el punto (mouseX, mouseY) está dentro del polígono utilizando el algoritmo de cruce de rayos
        var intersect = ((yi > mouseY) !== (yj > mouseY)) &&
            (mouseX < (xj - xi) * (mouseY - yi) / (yj - yi) + xi);
        if (intersect) inside = !inside;
    }

    return inside;
}

    // Función para verificar si el mouse está dentro de una figura
function is_mouse_in_figure(startX, startY, Figure) {
    let x1, y1, x2, y2, numerator, denominator, distance, angle, width;
    switch (Figure.type) {
        case 'line':
            x1 = Figure.firstPointX;
            y1 = Figure.firstPointY;
            x2 = Figure.finalPointX;
            y2 = Figure.finalPointY;

            // Calcular la distancia del punto a la línea
            numerator = Math.abs((y2 - y1) * startX - (x2 - x1) * startY + x2 * y1 - y2 * x1);
            denominator = Math.sqrt(Math.pow(y2 - y1, 2) + Math.pow(x2 - x1, 2));
            distance = numerator / denominator;

            const epsilon = 2; // Tamaño del área alrededor de la línea para considerar como "dentro"
            if (distance <= epsilon) {
                return true;
            }
            break;
        case 'diamond':
            const halfWidth = Figure.width_rhombus;
            distance = Math.sqrt(Math.pow(startX - Figure.firstPointX, 2) + Math.pow(startY - Figure.firstPointY, 2));
            if (distance < halfWidth / 2) {
                return true;
            }
            break;
        case 'trapezoid':
            return is_in_trapezoid(startX, startY, Figure);
        case 'square':
            let lengthX = Math.abs(Figure.finalPointX - Figure.firstPointX);
            let lengthY = Math.abs(Figure.finalPointY - Figure.firstPointY);
            let length = Math.min(lengthX, lengthY);
            if (startX >= Figure.firstPointX && startX <= Figure.firstPointX + length * Figure.OrientX && startY >= Figure.firstPointY && startY <= Figure.firstPointY + length * Figure.OrientY) {
                return true;
            }
            break;
        case 'circle':
            distance = Math.sqrt(Math.pow(startX - Figure.firstPointX, 2) + Math.pow(startY - Figure.firstPointY, 2));
            if (distance < Figure.radius) {
                return true;
            }
            break;
        case 'rectangle':
            width = Math.abs(Figure.finalPointX - Figure.firstPointX);
            let height = Math.abs(Figure.finalPointY - Figure.firstPointY);
            if ((startX >= Figure.firstPointX && startX <= Figure.firstPointX + width * Figure.OrientX) && (startY >= Figure.firstPointY && startY <= Figure.firstPointY + height * Figure.OrientY)) {
                return true;
            }
            break;
        case 'oval':
            let distanceX = Math.sqrt(Math.pow(startX - Figure.firstPointX, 2));
            let distanceY = Math.sqrt(Math.pow(startY - Figure.firstPointY, 2));
            if (distanceX <= Figure.a && distanceY <= Figure.b) {
                return true;
            }
            break;
        case 'pent':
            distance = Math.sqrt(Math.pow(startX - Figure.firstPointX, 2) + Math.pow(startY - Figure.firstPointY, 2));
            angle = Math.atan2(Figure.finalPointY - startY, Figure.finalPointX - startX);
            if (distance < Figure.radius && angle !== Figure.angle * 5) {
                console.log(Figure.angle * 5);
                return true;
            } else {
                console.log(angle);
            }
            break;
        case 'hex':
            distance = Math.sqrt(Math.pow(startX - Figure.firstPointX, 2) + Math.pow(startY - Figure.firstPointY, 2));
            angle = Math.atan2(Figure.finalPointY - startY, Figure.finalPointX - startX);
            if (distance <= Figure.radius) {
                return true;
            }
            break;
        case 'text':
            if (startY === Figure.firstPointY) {
                return true;
            }
            break;
    }
    return false;
}
let isMove = false;

function moverHaciaAtras(curfig) {
    // Verificar si el botón de mover hacia atrás está activado
    console.log(curfig);
    const index = figure.indexOf(curfig);
    if (index > 0) {
        // Intercambiar la posición de la figura seleccionada con la anterior
        [figure[index], figure[index - 1]] = [figure[index - 1], figure[index]];
        // Redibujar todas las figuras en el nuevo orden
        drawFigure();
    }
}

function moverHaciaAdelante(currfig) {
    const index = figure.indexOf(currfig);
    if (index < figure.length - 1) {
        // Guardar la figura que está adelante de la figura seleccionada
        const figuraSiguiente = figure[index + 1];
        // Colocar la figura siguiente en la posición actual de la figura seleccionada
        figure[index + 1] = currfig;
        // Colocar la figura seleccionada en la posición siguiente
        figure[index] = figuraSiguiente;
        // Redibujar todas las figuras en el nuevo orden
        drawFigure();
    }
}

function moverAlFondo(currfig) {
    const index = figure.indexOf(currfig);
    if (index > 0) {
        // Eliminar la figura seleccionada de su posición actual
        figure.splice(index, 1);
        // Insertar la figura al inicio de la lista
        figure.unshift(currfig);
        // Redibujar todas las figuras en el nuevo orden
        drawFigure();
    }
}

function moverAlFrente(currfig) {
    const index = figure.indexOf(currfig);
    if (index < figure.length - 1) {
        // Eliminar la figura seleccionada de su posición actual
        figure.splice(index, 1);
        // Insertar la figura al final de la lista
        figure.push(currfig);
        // Redibujar todas las figuras en el nuevo orden
        drawFigure();
    }
}
canvas.addEventListener('touchstart', function (e) {
    var touch = e.touches[0];
    var position = getPos(canvas, touch);

    // Check if the mode is 'atras' (move backward)
    if (modo === 'atras') {
        let index = 0;
        for (let fig of figure) {
            if (is_mouse_in_figure(position.x, position.y, fig)) {
                let current_fig = figure[index];
                moverHaciaAtras(current_fig);
                return;
            }
            index++;
        }
    }

    // Check if the mode is 'adelante' (move forward)
    if (modo === 'adelante') {
        let index = 0;
        for (let fig of figure) {
            if (is_mouse_in_figure(position.x, position.y, fig)) {
                let current_fig = figure[index];
                moverHaciaAdelante(current_fig);
                return;
            }
            index++;
        }
    }

    // Check if the mode is 'fondo' (move to back)
    if (modo === 'fondo') {
        let index = 0;
        for (let fig of figure) {
            if (is_mouse_in_figure(position.x, position.y, fig)) {
                let current_fig = figure[index];
                moverAlFondo(current_fig);
                return;
            }
            index++;
        }
    }

    // Check if the mode is 'frente' (move to front)
    if (modo === 'frente') {
        let index = 0;
        for (let fig of figure) {
            if (is_mouse_in_figure(position.x, position.y, fig)) {
                let current_fig = figure[index];
                moverAlFrente(current_fig);
                return;
            }
            index++;
        }
    }

    // Check if the mode is 'eraser_pix' (pixel eraser)
    if (modo === 'eraser_pix') {
        let index = 0;
        for (let fig of figure) {
            if (is_mouse_in_figure(position.x, position.y, fig)) {
                current_index = index;
                isEraser = true;
                return;
            }
            index++;
        }
    }

    // Check if the mode is 'eraser' (erase figure)
    if (modo === 'eraser') {
        let index = 0;
        for (let fig of figure) {
            if (is_mouse_in_figure(position.x, position.y, fig)) {
                current_index = index;
                figure.splice(index, 1);
                drawFigure();
                return;
            }
            index++;
        }
    }

    // Check if the mode is 'rotate' (rotate figure)
    if (modo === 'rotate') {
        let index = 0;
        for (let fig of figure) {
            if (is_mouse_in_figure(position.x, position.y, fig)) {
                current_index = index;
                isRotate = true;
                return;
            }
            index++;
        }
    }

    // Check if the mode is 'scale' (scale figure)
    if (modo === 'scale') {
        let index = 0;
        for (let fig of figure) {
            if (is_mouse_in_figure(position.x, position.y, fig)) {
                current_index = index;
                isScale = true;
                firstPointX = position.x;
                firstPointY = position.y;
                console.log('entra');
                return;
            } else {
                console.log('no entra')
            }
            index++;
        }
    }

    // Check if the mode is 'move' (move figure)
    if (modo === 'move') {
        let index = 0;
        for (let fig of figure) {
            if (is_mouse_in_figure(position.x, position.y, fig)) {
                current_index = index;
                isMove = true;
                firstPointX = position.x;
                firstPointY = position.y;
                console.log('entra');
                return;
            } else {
                console.log('no entra')
            }
            index++;
        }
    }

    // Start drawing
    isDrawing = true;
    firstPointX = position.x;
    firstPointY = position.y;
})
canvas.addEventListener('mousedown', function (e) {
    var position = getPos(canvas, e);

    // Verificar si el modo es 'atras' (mover hacia atrás)
    if (modo === 'atras') {
        let index = 0;
        for (let fig of figure) {
            if (is_mouse_in_figure(position.x, position.y, fig)) {
                let current_fig = figure[index];
                moverHaciaAtras(current_fig);
                return;
            }
            index++;
        }
    }

    // Verificar si el modo es 'adelante' (mover hacia adelante)
    if (modo === 'adelante') {
        let index = 0;
        for (let fig of figure) {
            if (is_mouse_in_figure(position.x, position.y, fig)) {
                let current_fig = figure[index];
                moverHaciaAdelante(current_fig);
                return;
            }
            index++;
        }
    }

    // Verificar si el modo es 'fondo' (mover al fondo)
    if (modo === 'fondo') {
        let index = 0;
        for (let fig of figure) {
            if (is_mouse_in_figure(position.x, position.y, fig)) {
                let current_fig = figure[index];
                moverAlFondo(current_fig);
                return;
            }
            index++;
        }
    }

    // Verificar si el modo es 'frente' (mover al frente)
    if (modo === 'frente') {
        let index = 0;
        for (let fig of figure) {
            if (is_mouse_in_figure(position.x, position.y, fig)) {
                let current_fig = figure[index];
                moverAlFrente(current_fig);
                return;
            }
            index++;
        }
    }

    // Verificar si el modo es 'eraser_pix' (borrador de píxeles)
    if (modo === 'eraser_pix') {
        let index = 0;
        for (let fig of figure) {
            if (is_mouse_in_figure(position.x, position.y, fig)) {
                current_index = index;
                isEraser = true;
                return;
            }
            index++;
        }
    }

    // Verificar si el modo es 'eraser' (borrador)
    if (modo === 'eraser') {
        let index = 0;
        for (let fig of figure) {
            if (is_mouse_in_figure(position.x, position.y, fig)) {
                current_index = index;
                figure.splice(index, 1);
                drawFigure();
                return;
            }
            index++;
        }
    }

    // Verificar si el modo es 'rotate' (rotar figura)
    if (modo === 'rotate') {
        let index = 0;
        for (let fig of figure) {
            if (is_mouse_in_figure(position.x, position.y, fig)) {
                current_index = index;
                isRotate = true;
                return;
            }
            index++;
        }
    }

    // Verificar si el modo es 'scale' (escalar figura)
    if (modo === 'scale') {
        let index = 0;
        for (let fig of figure) {
            if (is_mouse_in_figure(position.x, position.y, fig)) {
                current_index = index;
                isScale = true;
                firstPointX = position.x;
                firstPointY = position.y;
                console.log('entra');
                return;
            } else {
                console.log('no entra')
            }
            index++;
        }
    }

    // Verificar si el modo es 'move' (mover figura)
    if (modo === 'move') {
        let index = 0;
        for (let fig of figure) {
            if (is_mouse_in_figure(position.x, position.y, fig)) {
                current_index = index;
                isMove = true;
                firstPointX = position.x;
                firstPointY = position.y;
                console.log('entra');
                return;
            } else {
                console.log('no entra')
            }
            index++;
        }
    }

    // Iniciar el dibujo
    isDrawing = true;
    firstPointX = position.x;
    firstPointY = position.y;
});
function Scale(curr_fig, pos) {
    let OrientX, OrientY, radio, width, height;

    switch (curr_fig.type) {
        case 'square':
            // Calcular la longitud del lado del cuadrado basado en la posición del mouse
            let lengthX = Math.abs(pos.x - curr_fig.firstPointX);
            let lengthY = Math.abs(pos.y - curr_fig.firstPointY);
            let length = Math.min(lengthX, lengthY);
            curr_fig.OrientX = Math.sign(pos.x - curr_fig.firstPointX);
            curr_fig.OrientY = Math.sign(pos.y - curr_fig.firstPointY);
            curr_fig.len = length;
            break;
        case 'line':
            // Ajustar los puntos iniciales y finales de la línea basado en la posición del mouse
            let dx = pos.x - firstPointX;
            let dy = pos.y - firstPointY;
            curr_fig.firstPointX += dx;
            curr_fig.firstPointY -= dy;
            curr_fig.finalPointX -= dx;
            curr_fig.finalPointY += dy;
            break;
        case 'circle':
            // Calcular el radio del círculo basado en la posición del mouse
            radio = Math.sqrt(Math.pow(pos.x - curr_fig.firstPointX, 2) + Math.pow(pos.y - curr_fig.firstPointY, 2));
            curr_fig.radius = radio;
            break;
        case 'oval':
            // Calcular los ejes del óvalo basado en la posición del mouse
            curr_fig.a = Math.abs(pos.x - curr_fig.firstPointX);
            curr_fig.b = Math.abs(pos.y - curr_fig.firstPointY);
            break;
        case 'rectangle':
            // Calcular el ancho y la altura del rectángulo basado en la posición del mouse
            curr_fig.width_rect = Math.abs(pos.x - curr_fig.firstPointX);
            curr_fig.height_rect = Math.abs(pos.y - curr_fig.firstPointY);
            curr_fig.OrientX = Math.sign(pos.x - curr_fig.firstPointX);
            curr_fig.OrientY = Math.sign(pos.y - curr_fig.firstPointY);
            break;
        case 'pent':
            // Calcular el radio del pentágono basado en la posición del mouse
            radio = Math.sqrt(Math.pow(pos.x - curr_fig.firstPointX, 2) + Math.pow(pos.y - curr_fig.firstPointY, 2));
            curr_fig.radius = radio;
            break;
        case 'hex':
            // Calcular el radio del hexágono basado en la posición del mouse
            radio = Math.sqrt(Math.pow(pos.x - curr_fig.firstPointX, 2) + Math.pow(pos.y - curr_fig.firstPointY, 2));
            curr_fig.radius = radio;
            break;
        case 'trapezoid':
            // Calcular el ancho y la altura del trapecio basado en la posición del mouse
            curr_fig.bottomWidth = Math.abs(pos.x - curr_fig.firstPointX);
            curr_fig.topWidth = curr_fig.bottomWidth / 2;
            curr_fig.heightTrapezoid = Math.abs(pos.y - curr_fig.firstPointY);
            break;
        case 'diamond':
            // Calcular el ancho y la altura del rombo basado en la posición del mouse
            curr_fig.width_rhombus = Math.abs(pos.x - firstPointX);
            curr_fig.height_rhombus = Math.abs(pos.y - firstPointY);
            break;
    }
}
function rotateFig(curr_fig, pos) {
    let OrientX, OrientY, radio, angle, dx, dy;

    switch (curr_fig.type) {
        case 'square':
            // Calcular el ángulo de rotación para el cuadrado basado en la posición del mouse
            angle = Math.atan2(pos.y - curr_fig.firstPointY, pos.x - curr_fig.firstPointX);
            curr_fig.angle = angle;
            break;
        case 'line':
            // Ajustar los puntos iniciales y finales de la línea basado en la posición del mouse
            dx = pos.x - firstPointX;
            dy = pos.y - firstPointY;
            curr_fig.firstPointX += dx;
            curr_fig.firstPointY -= dy;
            curr_fig.finalPointX -= dx;
            curr_fig.finalPointY += dy;
            break;
        case 'circle':
            // Calcular el radio del círculo basado en la posición del mouse
            radio = Math.sqrt(Math.pow(pos.x - curr_fig.firstPointX, 2) + Math.pow(pos.y - curr_fig.firstPointY, 2));
            curr_fig.radius = radio;
            break;
        case 'oval':
            // Calcular el ángulo de rotación para el óvalo basado en la posición del mouse
            angle = Math.atan2(pos.y - curr_fig.firstPointY, pos.x - curr_fig.firstPointX);
            curr_fig.angle = angle;
            break;
        case 'rectangle':
            // Calcular el ángulo de rotación para el rectángulo basado en la posición del mouse
            angle = Math.atan2(pos.y - curr_fig.firstPointY, pos.x - curr_fig.firstPointX);
            curr_fig.angle = angle;
            break;
        case 'pent':
            // Calcular el ángulo de rotación para el pentágono basado en la posición del mouse
            angle = Math.atan2(pos.y - curr_fig.firstPointY, pos.x - curr_fig.firstPointX);
            curr_fig.angle = angle;
            break;
        case 'hex':
            // Calcular el ángulo de rotación para el hexágono basado en la posición del mouse
            angle = Math.atan2(pos.y - curr_fig.firstPointY, pos.x - curr_fig.firstPointX);
            curr_fig.angle = angle;
            break;
        case 'trapezoid':
            // Calcular el ángulo de rotación para el trapecio basado en la posición del mouse
            angle = Math.atan2(pos.y - curr_fig.firstPointY, pos.x - curr_fig.firstPointX);
            curr_fig.angle = angle;
            break;
        case 'diamond':
            // Calcular el ángulo de rotación para el rombo basado en la posición del mouse
            angle = Math.atan2(pos.y - curr_fig.firstPointY, pos.x - curr_fig.firstPointX);
            curr_fig.angle = angle;
    }
}
   
let erasePoints = [];

canvas.addEventListener('touchmove', function (e) {
    e.preventDefault();
    var touch = e.touches[0];
    var pos = getPos(canvas, touch);

    // Si la herramienta seleccionada es el borrador
    if (isEraser) {
        let current_fig = figure[current_index];
        // Agrega el punto actual a la lista de puntos a borrar
        erasePoints.push({ x: pos.x, y: pos.y });
        // Borra el área correspondiente en el lienzo
        paper.clearRect(pos.x, pos.y, 4, 4);
    }

    // Si la herramienta seleccionada es rotar
    if (isRotate) {
        let current_fig = figure[current_index];
        // Rota la figura actual
        rotateFig(current_fig, pos);
        // Redibuja todas las figuras
        drawFigure();
    }

    // Si la herramienta seleccionada es escalar
    if (isScale) {
        let current_fig = figure[current_index];
        // Escala la figura actual
        Scale(current_fig, pos);
        // Redibuja todas las figuras
        drawFigure();
    }

    // Si la herramienta seleccionada es mover
    if (isMove) {
        let current_fig = figure[current_index];
        let dx = pos.x - firstPointX;
        let dy = pos.y - firstPointY;
        // Actualiza las coordenadas de la figura para moverla
        current_fig.firstPointX += dx;
        current_fig.firstPointY += dy;
        current_fig.finalPointX += dx;
        current_fig.finalPointY += dy;
        // Redibuja todas las figuras
        drawFigure();
        firstPointX = pos.x;
        firstPointY = pos.y;
    }

    // Si no se está dibujando, sale de la función
    if (!isDrawing) return;

    // Si se está dibujando
    if (isDrawing) {
        var position = getPos(canvas, touch);
        finalPointX = position.x;
        finalPointY = position.y;
        // Si la herramienta seleccionada es lápiz, dibuja con lápiz
        if (modo === 'pencil') {
            Pencil(finalPointX, finalPointY);
        } else {
            // De lo contrario, dibuja la figura correspondiente
            drawFigure();
        }
    }
});
canvas.addEventListener('mousemove', function (e) {
    // Obtiene la posición del mouse en relación al lienzo
    var pos = getPos(canvas, e);

    // Si la herramienta seleccionada es el borrador
    if (isEraser) {
        let current_fig = figure[current_index];
        // Agrega el punto actual a la lista de puntos a borrar
        erasePoints.push({ x: pos.x, y: pos.y });
        // Borra el área correspondiente en el lienzo
        paper.clearRect(pos.x, pos.y, 4, 4);
    }

    // Si la herramienta seleccionada es rotar
    if (isRotate) {
        let current_fig = figure[current_index];
        // Rota la figura actual
        rotateFig(current_fig, pos);
        // Redibuja todas las figuras
        drawFigure();
    }

    // Si la herramienta seleccionada es escalar
    if (isScale) {
        let current_fig = figure[current_index];
        // Escala la figura actual
        Scale(current_fig, pos);
        // Redibuja todas las figuras
        drawFigure();
    }

    // Si la herramienta seleccionada es mover
    if (isMove) {
        let current_fig = figure[current_index];
        let dx = pos.x - firstPointX;
        let dy = pos.y - firstPointY;
        // Actualiza las coordenadas de la figura para moverla
        current_fig.firstPointX += dx;
        current_fig.firstPointY += dy;
        current_fig.finalPointX += dx;
        current_fig.finalPointY += dy;
        // Redibuja todas las figuras
        drawFigure();
        firstPointX = pos.x;
        firstPointY = pos.y;
    }

    // Si no se está dibujando, sale de la función
    if (!isDrawing) return;

    // Si se está dibujando
    if (isDrawing) {
        var position = getPos(canvas, e);
        finalPointX = position.x;
        finalPointY = position.y;
        // Si la herramienta seleccionada es lápiz, dibuja con lápiz
        if (modo === 'pencil') {
            Pencil(finalPointX, finalPointY, sinsel_size, Color_line);
        } else {
            // De lo contrario, dibuja la figura correspondiente
            drawFigure();
        }
    }
});
let pointsPencil = [];

// Función para dibujar con lápiz
function Pencil(x, y, size, color) {
    // Comienza el trazado de la figura
    paper.beginPath();
    // Establece el color de la línea
    paper.strokeStyle = color;
    // Establece el grosor de la línea
    paper.lineWidth = size;
    // Establece el tipo de extremo de la línea
    paper.lineCap = 'round';
    // Mueve el punto inicial del lápiz a la posición inicial
    paper.moveTo(firstPointX, firstPointY);
    // Almacena el punto actual en el array de puntos del lápiz
    pointsPencil.push({ x: x, y: y });
    // Dibuja una línea desde el punto inicial hasta el punto actual
    paper.lineTo(x, y);
    // Establece el tipo de unión entre líneas
    paper.lineJoin = 'round';
    // Cierra el trazado de la figura
    paper.closePath();
    // Dibuja la línea en el lienzo
    paper.stroke();
    // Actualiza la posición inicial del lápiz al punto actual
    firstPointX = x;
    firstPointY = y;
}

// Función para volver a dibujar los puntos dibujados a mano
function redrawpoints(handDrawnPoints, size, color) {
    let index = 0;
    // Recorre todos los puntos dibujados a mano
    for (let point of handDrawnPoints.points) {
        if (index === 0) {
            // Si es el primer punto, mueve el lápiz a esa posición
            paper.moveTo(point.x, point.y);
        } else {
            // Para los puntos siguientes, dibuja una línea desde el punto anterior hasta este
            paper.lineTo(point.x, point.y);
        }
        index++;
    }
    // Establece el grosor de la línea y el color
    paper.lineWidth = size;
    paper.strokeStyle = color;
    // Dibuja las líneas en el lienzo
    paper.stroke();
}

// Función para dibujar un círculo cuadrado
function drawcircle(xc, yc, x, y, size, color) {
    // Rellena los cuadrados alrededor del centro del círculo
    paper.fillStyle = color;
    paper.fillRect(xc + x, yc + y, size, size);
    paper.fillRect(xc - x, yc + y, size, size);
    paper.fillRect(xc + x, yc - y, size, size);
    paper.fillRect(xc - x, yc - y, size, size);
    paper.fillRect(xc + y, yc + x, size, size);
    paper.fillRect(xc - y, yc + x, size, size);
    paper.fillRect(xc + y, yc - x, size, size);
    paper.fillRect(xc - y, yc - x, size, size);
}
    // Función para dibujar un círculo utilizando el algoritmo de Bresenham
function circleBres(xc, yc, r, size, color)
{ 
    // Inicialización de variables
    let x = 0, y = r; 
    let d = 3 - 2 * r;

    // Bucle para trazar el círculo
    while (y >= x)
    {
        // Dibuja los puntos reflejados en los octantes del círculo
        drawcircle(xc, yc, x, y, size, color);
        x++; 
        // Actualiza la variable de decisión
        if (d > 0) 
        { 
            y--;  
            d += 4 * (x - y) + 10;
        } 
        else{
            d += 4 * x + 6;
        }
    }
}

// Función para dibujar una línea utilizando el algoritmo DDA (Digital Differential Analyzer)
function DDA(x0, y0, x1, y1, size, color){
    // Declaración de variables
    var dx, dy, incx, incy, x, y, p;
    dx = x1 - x0;
    dy = y1 - y0;
    // Determina el número de pasos basado en la diferencia entre las coordenadas
    if (Math.abs(dx) >= Math.abs(dy)){
        p = Math.abs(dx);
    } else {
        p = Math.abs(dy);
    }
    // Calcula los incrementos en cada dirección
    incx = dx / p;
    incy = dy / p;
    x = x0;
    y = y0;
    // Bucle para dibujar la línea
    for (var i = 0; i <= p; i++){
        // Dibuja el píxel en la posición actual
        paper.fillStyle = color;
        paper.fillRect(x, y, size, size);
        // Actualiza las coordenadas
        x += incx;
        y += incy;
    }
}

  // Función para rotar un punto alrededor de otro punto por un ángulo dado
function rotatePoint(x, y, x0, y0, angle) {
    // Aplicar la fórmula de rotación
    var newX = (x - x0) * Math.cos(angle) - (y - y0) * Math.sin(angle) + x0;
    var newY = (x - x0) * Math.sin(angle) + (y - y0) * Math.cos(angle) + y0;
    // Devolver las coordenadas del punto rotado
    return { x: newX, y: newY };
}

// Función para dibujar un cuadrado, permitiendo la rotación
function square(x0, y0, length, OrientX, OrientY, angle, color, size) {
    // Verificar si el ángulo de rotación es diferente de cero
    if (angle !== 0) {
        // Calcular las coordenadas de los vértices del cuadrado sin rotación
        var x = x0 - length / 2;
        var y = y0 - length / 2;
        var x1 = x0 + length / 2;
        var y1 = y0 - length / 2;
        var x2 = x0 + length / 2;
        var y2 = y0 + length / 2;
        var x3 = x0 - length / 2;
        var y3 = y0 + length / 2;

        // Rotar cada vértice del cuadrado alrededor del centro
        var rotatedX0Y0 = rotatePoint(x, y, x0, y0, angle);
        var rotatedX1Y1 = rotatePoint(x1, y1, x0, y0, angle);
        var rotatedX2Y2 = rotatePoint(x2, y2, x0, y0, angle);
        var rotatedX3Y3 = rotatePoint(x3, y3, x0, y0, angle);

        // Dibujar las líneas que conectan los vértices rotados para formar el cuadrado
        DDA(rotatedX0Y0.x, rotatedX0Y0.y, rotatedX1Y1.x, rotatedX1Y1.y, size, color);
        DDA(rotatedX1Y1.x, rotatedX1Y1.y, rotatedX2Y2.x, rotatedX2Y2.y, size, color);
        DDA(rotatedX2Y2.x, rotatedX2Y2.y, rotatedX3Y3.x, rotatedX3Y3.y, size, color);
        DDA(rotatedX3Y3.x, rotatedX3Y3.y, rotatedX0Y0.x, rotatedX0Y0.y, size, color);
    } else {
        // Calcular las coordenadas del punto final del cuadrado sin rotación
        let x1 = x0 + length * OrientX;
        let y1 = y0 + length * OrientY;
        // Dibujar las líneas para formar el cuadrado sin rotación
        DDA(x0, y0, x1, y0, size, color);
        DDA(x1, y0, x1, y1, size, color);
        DDA(x1, y1, x0, y1, size, color);
        DDA(x0, y1, x0, y0, size, color);
    }
}
   // Función para dibujar un rectángulo, permitiendo la rotación
function Rectangle(x0, y0, x1, y1, width, height, OrientX, OrientY, angle, size, color) {
    // Verificar si el ángulo de rotación es diferente de cero
    if (angle !== 0) {
        // Calcular las coordenadas de los vértices del rectángulo sin rotación
        var x = x0 - width / 2;
        var y = y0 - height / 2;
        var x1_1 = x0 + width / 2;
        var y1_1 = y0 - height / 2;
        var x2 = x0 + width / 2;
        var y2 = y0 + height / 2;
        var x3 = x0 - width / 2;
        var y3 = y0 + height / 2;

        // Rotar cada vértice del rectángulo alrededor del centro
        var rotatedX0Y0 = rotatePoint(x, y, x0, y0, angle);
        var rotatedX1Y1 = rotatePoint(x1_1, y1_1, x0, y0, angle);
        var rotatedX2Y2 = rotatePoint(x2, y2, x0, y0, angle);
        var rotatedX3Y3 = rotatePoint(x3, y3, x0, y0, angle);

        // Dibujar las líneas que conectan los vértices rotados para formar el rectángulo
        DDA(rotatedX0Y0.x, rotatedX0Y0.y, rotatedX1Y1.x, rotatedX1Y1.y, size, color);
        DDA(rotatedX1Y1.x, rotatedX1Y1.y, rotatedX2Y2.x, rotatedX2Y2.y, size, color);
        DDA(rotatedX2Y2.x, rotatedX2Y2.y, rotatedX3Y3.x, rotatedX3Y3.y, size, color);
        DDA(rotatedX3Y3.x, rotatedX3Y3.y, rotatedX0Y0.x, rotatedX0Y0.y, size, color);
    } else {
        // Calcular las coordenadas del punto final del rectángulo sin rotación
        let x = x0 + width * OrientX;
        let y = y0 + height * OrientY;
        // Dibujar las líneas para formar el rectángulo sin rotación
        DDA(x0, y0, x, y0, size, color);
        DDA(x, y0, x, y, size, color);
        DDA(x, y, x0, y, size, color);
        DDA(x0, y, x0, y0, size, color);
    }
}

// Función para convertir grados en coordenadas de punto
function grade_to_points(CenterX, CenterY, radio, angle) {
    // Calcular las coordenadas del punto basadas en el ángulo y el radio
    let pointX = Math.round(CenterX + radio * Math.cos(angle));
    let pointY = Math.round(CenterY + radio * Math.sin(angle));
    return { x: pointX, y: pointY };
}

// Función para dibujar un polígono regular
function draw_Polygon(radio, centerX, centerY, Sides, angle, size, color) {
    // Calcular el ángulo inicial entre los lados del polígono
    var initialAngle = (2 * Math.PI) / Sides, lastX = 0, lastY = 0;
    // Iterar sobre cada lado del polígono
    for (let i = 0; i < Sides; i++) {
        // Calcular el ángulo del punto actual
        let step = i * initialAngle + angle;
        // Obtener las coordenadas del punto actual
        let points = grade_to_points(centerX, centerY, radio, step);
        // Verificar si no es el primer lado para dibujar la línea
        if (i > 0) {
            DDA(lastX, lastY, points.x, points.y, size, color);
        }
        // Actualizar las coordenadas del último punto
        lastX = points.x;
        lastY = points.y;
    }
    // Dibujar la última línea para cerrar el polígono
    DDA(lastX, lastY, Math.round(centerX + radio * Math.cos(angle)), Math.round(centerY + radio * Math.sin(angle)), size, color);
}
   // Función para manejar eventos de liberación de tecla o dedo
function UPevent() {
    // Verificar si se estaba utilizando la herramienta de borrador
    if (isEraser) {
        // Desactivar la herramienta de borrador y guardar los puntos borrados como una acción
        isEraser = false;
        figure.push({ type: 'action', subtype: 'erase', erasePoints: erasePoints });
    }
    // Verificar si se estaba realizando una rotación
    if (isRotate) {
        // Desactivar la rotación
        isRotate = false;
    }
    // Verificar si se estaba realizando un escalado
    if (isScale) {
        // Desactivar el escalado
        isScale = false;
    }
    // Verificar si se estaba realizando un movimiento
    if (isMove) {
        // Desactivar el movimiento
        isMove = false;
    }
        // Si se estaba dibujando una figura
if(isDrawing){
    // Declaración de variables para propiedades de la figura
    let OrientX, OrientY, angle, radio, width, height;

    // Desactivar el modo de dibujo
    isDrawing = false;

    // Evaluación del modo de dibujo actual
    switch (modo){
        // Caso: lápiz
        case "pencil":
            // Guardar los puntos dibujados como una figura de tipo lápiz
            figure.push({type:'pencil',points:pointsPencil,sinsel_size:sinsel_size,color:Color_line});
            // Limpiar el array de puntos del lápiz para futuros usos
            pointsPencil=[];
            console.log(figure);
            break;
        // Caso: línea
        case "line":
            // Guardar los puntos de inicio y fin como una figura de tipo línea
            figure.push({type:'line',firstPointX:firstPointX,firstPointY:firstPointY,finalPointX:finalPointX,finalPointY:finalPointY,sinsel_size:sinsel_size,color:Color_line});
            break;
        // Caso: cuadrado
        case "square":
            // Calcular la longitud del lado del cuadrado
            let lengthX = Math.abs(finalPointX-firstPointX);
            let lengthY = Math.abs(finalPointY-firstPointY);
            let length = Math.min(lengthX,lengthY);
            // Determinar la orientación del cuadrado
            OrientX = Math.sign(finalPointX-firstPointX);
            OrientY = Math.sign(finalPointY-firstPointY);
            // Guardar la figura de tipo cuadrado con los parámetros calculados
            figure.push({type:'square',firstPointX:firstPointX,firstPointY:firstPointY,finalPointX:finalPointX,finalPointY:finalPointY,len:length,OrientX:OrientX,
                OrientY:OrientY,angle:0,sinsel_size:sinsel_size,color: Color_line});
            break;
        // Caso: rectángulo
        case 'rectangle':
            // Calcular el ancho y alto del rectángulo
            width = Math.abs(finalPointX-firstPointX);
            height = Math.abs(finalPointY-firstPointY);
            // Determinar la orientación del rectángulo
            OrientX = Math.sign(finalPointX-firstPointX);
            OrientY = Math.sign(finalPointY-firstPointY);
            // Guardar la figura de tipo rectángulo con los parámetros calculados
            figure.push({type:'rectangle',firstPointX:firstPointX,firstPointY:firstPointY,finalPointX:finalPointX,finalPointY:finalPointY,width_rect:width,height_rect:height,
                OrientX:OrientX,OrientY:OrientY,angle:0,sinsel_size:sinsel_size,color: Color_line});
            break;
        // Caso: círculo
        case "circle":
            // Calcular el radio del círculo
            radio = Math.sqrt(Math.pow(finalPointX-firstPointX,2)+Math.pow(finalPointY-firstPointY,2));
            // Guardar la figura de tipo círculo con los parámetros calculados
            figure.push({type:'circle',firstPointX:firstPointX,firstPointY:firstPointY,finalPointX:finalPointX,finalPointY:finalPointY,radius:radio,sinsel_size:sinsel_size,color: Color_line});
            break;
        // Caso: óvalo
        case 'oval':
            // Calcular los semiejes del óvalo
            var a = Math.abs(finalPointX-firstPointX);
            var b = Math.abs(finalPointY-firstPointY);
            // Guardar la figura de tipo óvalo con los parámetros calculados
            figure.push({type:'oval',firstPointX:firstPointX,firstPointY:firstPointY,finalPointX:finalPointX,finalPointY:finalPointY,a:a,b:b,angle:0,sinsel_size:sinsel_size,color: Color_line});
            break;
        // Caso: pentágono
        case 'pent':
            // Calcular el ángulo y radio del pentágono
            angle = Math.atan2(finalPointY - firstPointY, finalPointX - firstPointX);
            radio = Math.sqrt(Math.pow(finalPointX-firstPointX,2)+Math.pow(finalPointY-firstPointY,2));
            // Guardar la figura de tipo pentágono con los parámetros calculados
            figure.push({type:'pent',firstPointX:firstPointX,firstPointY:firstPointY,finalPointX:finalPointX,finalPointY:finalPointY,radius:radio,sides:5,angle:angle,sinsel_size:sinsel_size,color: Color_line});
            break;
        // Caso: hexágono
        case 'hex':
            // Calcular el ángulo y radio del hexágono
            angle = Math.atan2(finalPointY - firstPointY, finalPointX - firstPointX);
            radio = Math.sqrt(Math.pow(finalPointX-firstPointX,2)+Math.pow(finalPointY-firstPointY,2));
            // Guardar la figura de tipo hexágono con los parámetros calculados
            figure.push({type:'hex',firstPointX:firstPointX,firstPointY:firstPointY,finalPointX:finalPointX,finalPointY:finalPointY,radius:radio,sides:6,angle:angle,sinsel_size:sinsel_size,color: Color_line});
            break;
        // Caso: diamante
        case 'diamond':
            // Calcular el ancho y alto del diamante
            width = Math.abs(finalPointX-firstPointX);
            height= Math.abs(finalPointY-firstPointY);
            // Guardar la figura de tipo diamante con los parámetros calculados
            figure.push({type:'diamond',firstPointX:firstPointX,firstPointY:firstPointY,finalPointX:finalPointX,finalPointY:finalPointY,width_rhombus:width,height_rhombus:height, angle:0,sinsel_size:sinsel_size,color: Color_line});
            break;
 // Caso: trapecio
case 'trapezoid':
    // Calcular el ancho y alto del trapecio
    width = Math.abs(finalPointX-firstPointX);
    height= Math.abs(finalPointY-firstPointY);
    // Guardar la figura de tipo trapecio con los parámetros calculados
    figure.push({type:'trapezoid',firstPointX:firstPointX,firstPointY:firstPointY,finalPointX:finalPointX,finalPointY:finalPointY,topWidth:width/2,bottomWidth:width,heightTrapezoid:height,angle:0,sinsel_size:sinsel_size,color: Color_line});
    break;
// Caso: triángulo
case 'triangle':
    // Calcular el ángulo y radio del triángulo
    angle = Math.atan2(finalPointY - firstPointY, finalPointX - firstPointX);
    radio = Math.sqrt(Math.pow(finalPointX-firstPointX,2)+Math.pow(finalPointY-firstPointY,2));
    // Guardar la figura de tipo triángulo con los parámetros calculados
    figure.push({type:'hex',firstPointX:firstPointX,firstPointY:firstPointY,finalPointX:finalPointX,finalPointY:finalPointY,radius:radio,sides:3,angle:angle,sinsel_size:sinsel_size,color: Color_line});
    break;
}
// En caso contrario, si no se estaba dibujando una figura
}else{

}
}

// Agregar event listener para 'touchend' que llama a la función UPevent cuando termina un toque en el canvas
canvas.addEventListener('touchend', function () {
    UPevent();
});

// Agregar event listener para 'mouseup' que llama a la función UPevent cuando se suelta el botón del mouse en el canvas
canvas.addEventListener('mouseup', function (e) {
    UPevent();
});

let TrapezoidPoints;

// Función para establecer los puntos de un trapecio
function SetTrapezoidPoints(point0, point1, point2, point3) {
    // Asignar los puntos del trapecio a TrapezoidPoints
    return TrapezoidPoints = { x0: point0.x, y0: point0.y, x1: point1.x, y1: point1.y, x2: point2.x, y2: point2.y, x3: point3.x, y3: point3.y };
}

// Función para dibujar un rombo en el canvas
function draw_Rhombus(x0, y0, length, angle, size, color) {
    // Calcular la mitad de la diagonal del rombo
    var halfDiagonal = length;
    // Calcular el desplazamiento en x e y
    var xOffset = halfDiagonal * Math.cos(Math.PI / 4);
    var yOffset = halfDiagonal * Math.sin(Math.PI / 4);

    // Rotar cada vértice del rombo alrededor del centro (x0, y0)
    var rotatedX0Y0 = rotatePoint(x0, y0 - halfDiagonal, x0, y0, angle);
    var rotatedX1Y1 = rotatePoint(x0 + xOffset, y0, x0, y0, angle);
    var rotatedX2Y2 = rotatePoint(x0, y0 + halfDiagonal, x0, y0, angle);
    var rotatedX3Y3 = rotatePoint(x0 - xOffset, y0, x0, y0, angle);

    // Dibujar las líneas que conectan los vértices rotados para formar el rombo
    DDA(rotatedX0Y0.x, rotatedX0Y0.y, rotatedX1Y1.x, rotatedX1Y1.y, size, color);
    DDA(rotatedX1Y1.x, rotatedX1Y1.y, rotatedX2Y2.x, rotatedX2Y2.y, size, color);
    DDA(rotatedX2Y2.x, rotatedX2Y2.y, rotatedX3Y3.x, rotatedX3Y3.y, size, color);
    DDA(rotatedX3Y3.x, rotatedX3Y3.y, rotatedX0Y0.x, rotatedX0Y0.y, size, color);
}
function drawTrapezoid(x, y, topWidth, bottomWidth, height, angle, size, color) {
    var halfHeight = height;
    var halfTopWidth = topWidth;
    var halfBottomWidth = bottomWidth;

    // Calcular las coordenadas de los vértices del trapecio en base al ángulo de inclinación
    var topLeftX = x - halfTopWidth;
    var topLeftY = y - halfHeight;
    var topRightX = x + halfTopWidth;
    var topRightY = y - halfHeight;
    var bottomRightX = x + halfBottomWidth;
    var bottomRightY = y + halfHeight;
    var bottomLeftX = x - halfBottomWidth;
    var bottomLeftY = y + halfHeight;

    // Rotar cada vértice del trapecio alrededor del centro (x, y)
    var rotatedTopLeft = rotatePoint(topLeftX, topLeftY, x, y, angle);
    var rotatedTopRight = rotatePoint(topRightX, topRightY, x, y, angle);
    var rotatedBottomRight = rotatePoint(bottomRightX, bottomRightY, x, y, angle);
    var rotatedBottomLeft = rotatePoint(bottomLeftX, bottomLeftY, x, y, angle);

    // Dibujar las líneas que conectan los vértices rotados para formar el trapecio
    DDA(rotatedTopLeft.x, rotatedTopLeft.y, rotatedTopRight.x, rotatedTopRight.y, size, color);
    DDA(rotatedTopRight.x, rotatedTopRight.y, rotatedBottomRight.x, rotatedBottomRight.y, size, color);
    DDA(rotatedBottomRight.x, rotatedBottomRight.y, rotatedBottomLeft.x, rotatedBottomLeft.y, size, color);
    DDA(rotatedBottomLeft.x, rotatedBottomLeft.y, rotatedTopLeft.x, rotatedTopLeft.y, size, color);
}
    // Obtiene el elemento de área de texto del documento
const textarea = document.getElementById('txt_area');

function drawFigure() {
    // Limpia el lienzo antes de redibujar todas las figuras
    paper.clearRect(0, 0, canvas.width, canvas.height);

    // Itera sobre cada figura en el array "figure" y la dibuja en el lienzo
    for (var i = 0; i < figure.length; i++) {
        let fig = figure[i];
        paper.beginPath();  // Inicia un nuevo trazo

        // Determina el tipo de figura y la dibuja en consecuencia
        switch (fig.type) {
            case 'action':
                if (fig.subtype === 'erase') {
                    // Borra los puntos especificados en "erasePoints"
                    for (let point of fig.erasePoints) {
                        // Borra el punto en la posición especificada
                        paper.clearRect(point.x, point.y, 4, 4);  // Borra un píxel en la posición del punto
                    }
                }
                break;
            case 'pencil':
                // Redibuja los puntos de lápiz con el tamaño y color especificados
                redrawpoints(fig, fig.sinsel_size, fig.color);
                break;
            case 'circle':
                let h, k;
                h = fig.firstPointX;
                k = fig.firstPointY;
                // Dibuja un círculo usando el algoritmo de Bresenham
                circleBres(h, k, fig.radius, fig.sinsel_size, fig.color);
                break;
            case 'square':
                // Dibuja un cuadrado con las propiedades especificadas
                square(fig.firstPointX, fig.firstPointY, fig.len, fig.OrientX, fig.OrientY, fig.angle, fig.color, fig.sinsel_size);
                break;
            case 'rectangle':
                // Dibuja un rectángulo con las propiedades especificadas
                Rectangle(fig.firstPointX, fig.firstPointY, fig.finalPointX, fig.finalPointY, fig.width_rect, fig.height_rect, fig.OrientX, fig.OrientY, fig.angle, fig.sinsel_size, fig.color);
                break;
            case 'oval':
                // Dibuja un óvalo con las propiedades especificadas
                DrawEllipse(fig.firstPointX, fig.firstPointY, fig.a, fig.b, fig.angle, fig.sinsel_size, fig.color);
                break;
            case 'line':
                // Dibuja una línea usando el algoritmo DDA
                DDA(fig.firstPointX, fig.firstPointY, fig.finalPointX, fig.finalPointY, fig.sinsel_size, fig.color);
                break;
            case 'pent':
                // Dibuja un pentágono con las propiedades especificadas
                draw_Polygon(fig.radius, fig.firstPointX, fig.firstPointY, fig.sides, fig.angle, fig.sinsel_size, fig.color);
                break;
            case 'hex':
                // Dibuja un hexágono con las propiedades especificadas
                draw_Polygon(fig.radius, fig.firstPointX, fig.firstPointY, fig.sides, fig.angle, fig.sinsel_size, fig.color);
                break;
            case 'diamond':
                // Dibuja un rombo con las propiedades especificadas
                draw_Rhombus(fig.firstPointX, fig.firstPointY, fig.width_rhombus, fig.angle, fig.sinsel_size, fig.color);
                break;
            case 'triangle':
                // Dibuja un triángulo con las propiedades especificadas
                draw_Polygon(fig.radius, fig.firstPointX, fig.firstPointY, fig.sides, fig.angle, fig.sinsel_size, fig.color);
                break;
            case 'trapezoid':
                // Dibuja un trapecio con las propiedades especificadas
                drawTrapezoid(fig.firstPointX, fig.firstPointY, fig.topWidth, fig.bottomWidth, fig.heightTrapezoid, fig.angle, fig.sinsel_size, fig.color);
                break;
            case 'text':
                // Dibuja el texto en la posición especificada
                drawtext(fig.text_value, fig.firstPointX, fig.firstPointY);
                break;
        }
    }
    if (isDrawing) {
        let radio = 0, angle = 0, OrientX, OrientY, width, height;
    
        // Se determina el modo de dibujo y se ejecuta el código correspondiente
        switch (modo) {
            case "circle":
                // Calcula el radio del círculo y lo dibuja usando el algoritmo de Bresenham
                radio = Math.sqrt(Math.pow(finalPointX - firstPointX, 2) + Math.pow(finalPointY - firstPointY, 2));
                circleBres(firstPointX, firstPointY, radio, sinsel_size, Color_line);
                break;
            case 'oval':
                // Calcula los ejes del óvalo y lo dibuja
                var a = Math.abs(finalPointX - firstPointX);
                var b = Math.abs(finalPointY - firstPointY);
                DrawEllipse(firstPointX, firstPointY, a, b, 0, sinsel_size, Color_line);
                break;
            case 'square':
                // Calcula el lado del cuadrado y lo dibuja
                let lengthX = Math.abs(finalPointX - firstPointX);
                let lengthY = Math.abs(finalPointY - firstPointY);
                let length = Math.min(lengthX, lengthY);
                OrientX = Math.sign(finalPointX - firstPointX);
                OrientY = Math.sign(finalPointY - firstPointY);
                square(firstPointX, firstPointY, length, OrientX, OrientY, 0, Color_line, sinsel_size);
                break;
            case 'rectangle':
                // Calcula las dimensiones del rectángulo y lo dibuja
                width = Math.abs(finalPointX - firstPointX);
                height = Math.abs(finalPointY - firstPointY);
                OrientX = Math.sign(finalPointX - firstPointX);
                OrientY = Math.sign(finalPointY - firstPointY);
                Rectangle(firstPointX, firstPointY, finalPointX, finalPointY, width, height, OrientX, OrientY, 0, sinsel_size, Color_line);
                break;
            case "line":
                // Dibuja una línea usando el algoritmo DDA
                DDA(firstPointX, firstPointY, finalPointX, finalPointY, sinsel_size, Color_line);
                break;
            case 'pent':
                // Calcula el ángulo y el radio del pentágono y lo dibuja
                angle = Math.atan2(finalPointY - firstPointY, finalPointX - firstPointX);
                radio = Math.sqrt(Math.pow(finalPointX - firstPointX, 2) + Math.pow(finalPointY - firstPointY, 2));
                draw_Polygon(radio, firstPointX, firstPointY, 5, angle, sinsel_size, Color_line);
                break;
            case 'hex':
                // Calcula el ángulo y el radio del hexágono y lo dibuja
                angle = Math.atan2(finalPointY - firstPointY, finalPointX - firstPointX);
                radio = Math.sqrt(Math.pow(finalPointX - firstPointX, 2) + Math.pow(finalPointY - firstPointY, 2));
                draw_Polygon(radio, firstPointX, firstPointY, 6, angle, sinsel_size, Color_line);
                break;
            case 'diamond':
                // Calcula el ancho del rombo y lo dibuja
                width = Math.abs(finalPointX - firstPointX);
                angle = Math.atan2(finalPointY - firstPointY, finalPointX - firstPointX);
                draw_Rhombus(firstPointX, firstPointY, width, 0, sinsel_size, Color_line);
                break;
            case 'trapezoid':
                // Calcula las dimensiones del trapecio y lo dibuja
                width = Math.abs(finalPointX - firstPointX);
                height = Math.abs(finalPointY - firstPointY);
                drawTrapezoid(firstPointX, firstPointY, width / 2, width, height, 0, sinsel_size, Color_line);
                break;
            case 'triangle':
                // Calcula el ángulo y el radio del triángulo y lo dibuja
                angle = Math.atan2(finalPointY - firstPointY, finalPointX - firstPointX);
                radio = Math.sqrt(Math.pow(finalPointX - firstPointX, 2) + Math.pow(finalPointY - firstPointY, 2));
                draw_Polygon(radio, firstPointX, firstPointY, 3, angle, sinsel_size, Color_line);
                break;
        }
    }
    
    // Cierra la ruta actual en el contexto de dibujo
    paper.closePath();
   }
let hasInput = false;

// Añadir evento click al canvas
canvas.addEventListener('click', function (e) {
    if (modo === 'text') {
        // Si ya existe un input, no hacer nada
        if (hasInput) { return; }
        // Agregar un nuevo input en la posición del click
        addInput(firstPointX, firstPointY, e);
    } else {
        return;
    }
});

// Función para agregar un input de texto en la posición especificada
function addInput(x, y, ev) {
    const input = document.createElement('input');
    input.type = 'text';
    input.style.position = 'absolute';
    input.style.left = ev.pageX + 'px';
    input.style.top = ev.pageY + 'px';
    input.onkeydown = handleEnter;
    document.body.appendChild(input);
    input.focus();
    hasInput = true;
}

// Manejar la tecla Enter en el input de texto
function handleEnter(e) {
    const keyCode = e.keyCode;
    console.log(keyCode);
    if (keyCode === 13) {
        // Dibujar el texto en el canvas
        drawtext(this.value, firstPointX, firstPointY);
        // Añadir el texto al array de figuras
        figure.push({ type: 'text', firstPointX: firstPointX, firstPointY: firstPointY, text_value: this.value });
        // Eliminar el input de texto del DOM
        document.body.removeChild(this);
        hasInput = false;
    }
}

// Función para dibujar texto en el canvas
function drawtext(txt, x, y) {
    paper.font = '25px Arial';
    paper.fillText(txt, x, y);
}

// Obtener la posición del click en el canvas
function getPos(canvas, event) {
    var rect = canvas.getBoundingClientRect();
    return {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top
    };
}
});

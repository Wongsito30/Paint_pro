/**
 * Clase que implementa el algoritmo DDA para dibujar líneas en un canvas.
 */
class DDA {
    /**
     * Constructor de la clase DDA.
     * @param {number} CordX_In - Coordenada X del punto inicial de la línea.
     * @param {number} CordY_In - Coordenada Y del punto inicial de la línea.
     * @param {number} CordX_Fin - Coordenada X del punto final de la línea.
     * @param {number} CordY_Fin - Coordenada Y del punto final de la línea.
     */
    constructor(CordX_In, CordY_In, CordX_Fin, CordY_Fin) {
        this._CordX_In = CordX_In;
        this._CordY_In = CordY_In;
        this._CordX_Fin = CordX_Fin;
        this._CordY_Fin = CordY_Fin;
    }

    /**
     * Método para dibujar una línea en el canvas utilizando el algoritmo DDA.
     * @param {number} size - Tamaño del píxel.
     * @param {object} paper - Contexto del canvas sobre el que se dibuja la línea.
     */
    DrawLine(size, paper) {
        let dx, dy, incx, incy, x, y, p;
        dx = this._CordX_Fin - this._CordX_In;
        dy = this._CordY_Fin - this._CordY_In;
        if (Math.abs(dx) >= Math.abs(dy)) {
            p = Math.abs(dx);
        } else {
            p = Math.abs(dy);
        }
        incx = dx / p;
        incy = dy / p;
        x = this._CordX_In;
        y = this._CordY_In;
        for (var i = 0; i <= p; i++) {
            paper.fillRect(x, y, size, size);
            x += incx;
            y += incy;
        }
    }
}
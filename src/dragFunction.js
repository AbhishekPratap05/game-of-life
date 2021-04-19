export const dragElement = (dragRef, elmnt) => {
    let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;

    if (dragRef) {
        console.log(dragRef)
        console.log(elmnt)
        /* if present, the header is where you move the DIV from:*/
        dragRef.onmousedown = dragMouseDown;
    } else {
        /* otherwise, move the DIV from anywhere inside the DIV:*/
        elmnt.onmousedown = dragMouseDown;
    }

    function dragMouseDown(e) {
        console.log('hi hter')
        e = e || window.event;
        e.preventDefault();
        // get the mouse cursor position at startup:
        console.log(e.clientX, e.clientY)
        console.log(window.innerHeight)
        pos3 = e.clientX;
        pos4 = e.clientY;
        document.onmouseup = closeDragElement;
        // call a function whenever the cursor moves:
        document.onmousemove = elementDrag;
    }

    function elementDrag(e) {
        e = e || window.event;
        e.preventDefault();
        // calculate the new cursor position:
        if (!(e.clientX < 25 || e.clientY < 25) && !(e.clientX > (window.innerWidth - 60) || e.clientY > (window.innerHeight - 40))) {
            pos1 = pos3 - e.clientX;
            pos2 = pos4 - e.clientY;
            pos3 = e.clientX;
            pos4 = e.clientY;
            // set the element's new position:
            elmnt.style.top = (elmnt.offsetTop - pos2) + "px";
            elmnt.style.left = (elmnt.offsetLeft - pos1) + "px";
        }
    }


    function closeDragElement() {
        /* stop moving when mouse button is released:*/
        document.onmouseup = null;
        document.onmousemove = null;
    }
}
var canvas = document.getElementById("myCanvas");
var context = canvas.getContext("2d");

var lastX, lastY;

function isStylus(event) {
    if (event.touches === undefined) {
        return false;
    }
    if (event.touches[0].touchType === "stylus") {
        return true;
    } else {
        return false;
    }
}

function adjustCanvasSize(initial) {
    if (!initial && navigator.userAgent.match(/Mac OS X/i)) {
        return;
    }
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
}

function startDrawing(e) {
    if (e.type == "mousedown") {
        lastX = e.offsetX;
        lastY = e.offsetY;
        return;
    }
    if (!isStylus(e)) {
        return;
    }
	lastX = e.touches[0].clientX - canvas.offsetLeft;
	lastY = e.touches[0].clientY - canvas.offsetTop;
	e.preventDefault();
}

function saveStroke(startX, startY, stopX, stopY) {
  var existingArray = JSON.parse(localStorage.getItem("strokes")) || [];
  existingArray.push([startX, startY, stopX, stopY]);
  localStorage.setItem("strokes", JSON.stringify(existingArray));
}

function getStrokes() {
  return JSON.parse(localStorage.getItem("strokes")) || [];
}

function keepDrawing(e) {
	if (e.type === "mousemove" && e.buttons !== 1) {
		return;
	}

    if (e.type === "touchmove" && !isStylus(e)) {
        return;
    }

    let currentX, currentY;
    if (e.type == "mousemove") {
        currentX = e.offsetX;
        currentY = e.offsetY;
    } else {
	    currentX = e.touches[0].clientX - canvas.offsetLeft;
	    currentY = e.touches[0].clientY - canvas.offsetTop;
    }
	
	context.beginPath();
	context.lineWidth = 3;
	context.lineCap = "round";
	context.strokeStyle = "black";
	context.moveTo(lastX, lastY);
	context.lineTo(currentX, currentY);
	context.stroke();

    saveStroke(lastX, lastY, currentX, currentY);

	lastX = currentX;
	lastY = currentY;

	e.preventDefault();
}

function stopDrawing(e) {
    if (!isStylus(e)) {
        return;
    }
	lastX = null;
	lastY = null;
    e.preventDefault();
}

window.addEventListener("resize", () => {
    adjustCanvasSize(false);
});

canvas.addEventListener("mousedown", startDrawing);
canvas.addEventListener("touchstart", startDrawing);

canvas.addEventListener("mousemove", keepDrawing);
canvas.addEventListener("touchmove", keepDrawing);

canvas.addEventListener("mouseup", stopDrawing);
canvas.addEventListener("mouseleave", stopDrawing);
canvas.addEventListener("touchend", stopDrawing);

adjustCanvasSize(true);
getStrokes().forEach(stroke => {
	context.beginPath();
	context.lineWidth = 3;
	context.lineCap = "round";
	context.strokeStyle = "black";
	context.moveTo(stroke[0], stroke[1]);
	context.lineTo(stroke[2], stroke[3]);
	context.stroke();
});

if ("serviceWorker" in navigator) {
    window.addEventListener("load", function() {
        navigator.serviceWorker.register("/serviceworker.js")
            .then(function(registration) {
                console.log("Service worker registered successfully");
            })
            .catch(function(error) {
                console.log("Service worker registration failed:", error);
            });
    });
}

// TODO
//  change scaleUp's event listener's callback into a named function defined elsewhere
// Use global variables for live cell colors and dead cell colors

// Select Buttons
const canvas = document.querySelector('canvas');
const width = canvas.width = window.innerWidth;
const height = canvas.height = window.innerHeight;
const playButton = document.querySelector('#play');
const stopButton = document.querySelector('#stop');
const scaleUp = document.querySelector('#scaleUp');
const scaleDown = document.querySelector('#scaleDown');
// Add Event Listeners
playButton.addEventListener("click", () => {
    evolve = true;
    showEvolution()
});
stopButton.addEventListener("click", () => evolve = false);

scaleUp.addEventListener("click", () => {
    // save current state. Save at with row and column living cells are
    stateStash = [];
    row = 0;
    for (var rw = 0; rw <= width; rw += scale) {
        col = 0;
        for (var cl = 0; cl <= height; cl += scale) {
            cx = rw + parseInt(scale / 2); cy = cl + parseInt(scale / 2);
            color = c.getImageData(cx, cy, 1, 1).data[0];
            if (color == 255) {
                stateStash.push([row, col])
            }
            col += 1;
        }
    row += 1;
    }
    // redraw board with new scale
    scale += 10;
    drawBoard(scale, width, height, gridColor, backgroundColor);
    // Apply old status
    console.log(`stateStash: ${stateStash}`);
    stateStash.forEach(change => {
        c.fillStyle = "white";
        row = change[0]*scale; col = change[1]*scale;
        c.fillRect(row + 1, col + 1, (scale - 2), (scale - 2));
    });

});

scaleDown.addEventListener("click", () => {
    stateStash = [];
    row = 0;
    for (var rw = 0; rw <= width; rw += scale) {
        col = 0;
        for (var cl = 0; cl <= height; cl += scale) {
            cx = rw + parseInt(scale / 2); cy = cl + parseInt(scale / 2);
            color = c.getImageData(cx, cy, 1, 1).data[0];
            if (color == 255) {
                stateStash.push([row, col])
            }
            col += 1;
        }
    row += 1;
    }
    // redraw board with new scale
    scale -= 10;
    drawBoard(scale, width, height, gridColor, backgroundColor);
    // Apply old status
    console.log(`stateStash: ${stateStash}`);
    stateStash.forEach(change => {
        c.fillStyle = "white";
        row = change[0]*scale; col = change[1]*scale;
        c.fillRect(row + 1, col + 1, (scale - 2), (scale - 2));
    });
});

// Initial Setup
let pressed = false;
let evolutionStarted = false;
let evolve = true;
let gridColor = "#39FF14";
let backgroundColor = "black";
let scale = 30;
// interval between evolution stages
let interval = 100;

let curY;
let curX;

//  ****** Draw Board ******  //

const c = canvas.getContext('2d');

drawBoard(scale, width, height, gridColor, backgroundColor);

// function to color a specific area on the board given X and Y coordinates of where mouse was clicked in pixels
// A click occurs at a point but the entire box containing it has to be colored.
// We need to locate the box first then color it 

async function showEvolution() {
    evolutionStarted = true;
    directions = [[0, -scale], [0, scale], [-scale, 0], [scale, 0], [scale, -scale], [scale, scale], [-scale, scale], [-scale, -scale]];
    changeStash = [];
    // Go through board. Apply Rules. Stash changes.
    for (var rw = 0; rw <= width; rw += scale) {
        for (var cl = 0; cl <= height; cl += scale) {
            //get center coordinates
            cx = rw + parseInt(scale / 2); cy = cl + parseInt(scale / 2);
            //get center color
            color = c.getImageData(cx, cy, 1, 1).data[0];
            alive = color == 255 ? true : false;
            //count alive 8 directional neighbors
            var count = 0;
            directions.forEach(dir => {
                neighborColor = c.getImageData(cx + dir[0], cy + dir[1], 1, 1).data[0]
                if (neighborColor == 255) {
                    count++;
                }
                // Apply the 3 rules of Game of life (the condensed version)
                // Rule 1: Any live cell with two or three live neighbours survives.
                if (alive && (count == 2 || count == 3)) {
                    changeStash.push([rw, cl, true])
                }
                // Rule 2: Any dead cell with three live neighbours becomes a live cell.
                else if (!alive && count == 3) {
                    changeStash.push([rw, cl, true])
                }
                // Rule 3: All other live cells die in the next generation. Similarly, all other dead cells stay dead.
                else {
                    changeStash.push([rw, cl, false]);
                }
            });
        }
    }
    // Apply changes
    changeStash.forEach(change => {
        rw = change[0]; cl = change[1]; alive = change[2];
        if (alive) {
            c.fillStyle = "white";
            c.fillRect(rw + 1, cl + 1, (scale - 2), (scale - 2));
        }
        else {
            c.fillStyle = "black";
            c.fillRect(rw + 1, cl + 1, (scale - 2), (scale - 2));
        }
    });
    await sleep(interval);
    console.log(evolve);
    if (evolve) {
        requestAnimationFrame(showEvolution);
    }
}

// Function to sleep ms milliseconds before generating next phase in evolution
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
// Function to draw board, given height, width, background color, and grid color 
function drawBoard(scale, width, height, gridColor, backgroundColor) {
    c.fillStyle = backgroundColor;
    c.fillRect(0, 0, canvas.width, canvas.height);
    // Rows
    // 28 so as to have extra line at the very end.
    for (var i = 0; i < parseInt(height / (scale - 2)); i++) {
        c.beginPath();
        c.moveTo(0, scale * i);
        c.lineTo(width, scale * i);
        c.strokeStyle = gridColor;
        c.stroke();
    }
    for (var i = 0; i < parseInt(width / (scale - 2)); i++) {
        c.beginPath();
        c.moveTo(scale * i, 0);
        c.lineTo(scale * i, height);
        c.strokeStyle = gridColor;
        c.stroke();
    }
}

function colorSquare(x, y) {
    // calculate left border of the square . (Left & right borders are vertical lines with equation x = i) 
    // first calculate by how much point has shifted from its nearest left border by calculating how far it is from the nearest integer divisible by 30
    offsetX = x % scale;
    offsetY = y % scale;
    try {
        imageData = c.getImageData(x, y, 1, 1);

        if (imageData.data[0] == 255 || imageData.data[1] == 255 || imageData.data[2] == 255) {
            c.fillStyle = "black";
            c.fillRect(x - offsetX + 1, y - offsetY + 1, (scale - 2), (scale - 2));
        }
        else if (imageData.data[0] == 0 || imageData.data[1] == 0 || imageData.data[2] == 0) {
            c.fillStyle = "white";
            c.fillRect(x - offsetX + 1, y - offsetY + 1, (scale - 2), (scale - 2));
        }
    }
    catch (e) { }
    if (!evolutionStarted) {
        requestAnimationFrame(colorSquare);
    }
}

document.onmousemove = function (e) {
    curX = (window.Event) ? e.pageX : e.clientX + (document.documentElement.scrollLeft ? document.documentElement.scrollLeft : document.body.scrollLeft);
    curY = (window.Event) ? e.pageY : e.clientY + (document.documentElement.scrollTop ? document.documentElement.scrollTop : document.body.scrollTop);
}

canvas.onmousedown = function () {
    pressed = true;
    colorSquare(curX, curY)
};

canvas.onmouseup = function () {
    pressed = false;
}
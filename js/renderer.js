// Shipeng Xu
// billhsu.github.io
function drawTrangle(a, b, c, color) {
    convertVector3(a);
    convertVector3(b);
    convertVector3(c);
    var canvas = document.getElementById('canvas');
    if (canvas.getContext) {
        var ctx = canvas.getContext('2d');
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.lineTo(c.x, c.y);
        ctx.closePath();
        ctx.fillStyle = color;
        ctx.fill();
    }
}

function convertVector3(vec) {
    var scale = 10.0;
    vec.x = vec.x * scale;
    vec.y = vec.y * scale;
    vec.z = vec.z * scale;
    vec.x = vec.x + 400;
    vec.y = 300 - vec.y;
}

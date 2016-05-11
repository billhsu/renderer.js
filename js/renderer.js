// Shipeng Xu
// http://billhsu.github.io
// This is the JavaScript implementation of a simple OpenGL-like 3D rendering API.
// Thanks to the below link:
// https://github.com/ssloy/tinyrenderer/blob/master/our_gl.cpp
"use strict";

function barycentric(a, b, c, p) {
    var s0 = new Vector(c.x - a.x, b.x - a.x, a.x - p.x);
    var s1 = new Vector(c.y - a.y, b.y - a.y, a.y - p.y);
    var u = s0.cross(s1);
    if (Math.abs(u.z) > 1e-2) {
        return new Vector(1 - (u.x + u.y) / u.z, u.y / u.z, u.x / u.z);
    }
    return new Vector(-1, 1, 1);
}

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

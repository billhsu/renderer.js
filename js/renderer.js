// Shipeng Xu
// http://billhsu.github.io
// This is the JavaScript implementation of a simple OpenGL-like 3D rendering API.
// Thanks to the below link:
// https://github.com/ssloy/tinyrenderer/blob/master/our_gl.cpp
"use strict";

function Renderer(width, height) {
    this.width = width;
    this.height = height;
    this.zbuffer = [];
    this.viewportMatrix = this.viewport(0, 0);
    this.clearBuffer(this.zbuffer);
}
Renderer.prototype = {
    drawTrangle: function(a, b, c, color) {
        Renderer.drawTrangle(this.viewportMatrix, a, b, c, color);
    },
    clearBuffer: function(buffer) {
        for (var i = 0; i < this.width * this.height; ++i) {
            buffer[i] = 0;
        }
    },
    viewport: function(x, y) {
        return Renderer.viewport(x, y, this.width, this.height);
    },
    lookat: function(eye, center, up) {
        return Renderer.lookat(eye, center, up);
    },
    project: function(fovy, zNear, zFar) {
        return Renderer.project(fovy, zNear, zFar, this.width, this.height);
    },
    resize: function(width, height) {
        this.width = width;
        this.height = height;
        this.clearBuffer(this.zbuffer);
        this.viewportMatrix = this.viewport(0, 0);
    }
}
Renderer.drawTrangle = function(viewportMatrix, a, b, c, color) {
    var ta = viewportMatrix.transformPoint(a);
    ta = ta.divide(ta.w);
    var tb = viewportMatrix.transformPoint(b);
    tb = tb.divide(tb.w);
    var tc = viewportMatrix.transformPoint(c);
    tc = tc.divide(tc.w);
    var canvas = document.getElementById('canvas');
    if (canvas.getContext) {
        var ctx = canvas.getContext('2d');
        ctx.beginPath();
        ctx.moveTo(ta.x, ta.y);
        ctx.lineTo(tb.x, tb.y);
        ctx.lineTo(tc.x, tc.y);
        ctx.closePath();
        ctx.fillStyle = color;
        ctx.fill();
    }
}

Renderer.barycentric = function(a, b, c, p) {
    var s0 = new Vector(c.x - a.x, b.x - a.x, a.x - p.x);
    var s1 = new Vector(c.y - a.y, b.y - a.y, a.y - p.y);
    var u = s0.cross(s1);
    if (Math.abs(u.z) > 1e-2) {
        return new Vector(1 - (u.x + u.y) / u.z, u.y / u.z, u.x / u.z);
    }
    return new Vector(-1, 1, 1);
}

Renderer.viewport = function(x, y, width, height) {
    var matrix = new Matrix();
    matrix.m[0] = width / 2;
    matrix.m[1] = 0;
    matrix.m[2] = 0;
    matrix.m[3] = x + width / 2;
    matrix.m[4] = 0;
    matrix.m[5] = -height / 2;
    matrix.m[6] = 0;
    matrix.m[7] = y + height / 2;
    matrix.m[8] = 0;
    matrix.m[9] = 0;
    matrix.m[10] = 0;
    matrix.m[11] = 1;
    matrix.m[12] = 0;
    matrix.m[13] = 0;
    matrix.m[14] = 0;
    matrix.m[15] = 1;
    return matrix;
}

Renderer.lookat = function(eye, center, up) {
    up = up.unit();
    var f = center.subtract(eye).unit();
    var s = f.cross(up);
    var u = s.unit().cross(f);
    var matrix = new Matrix();
    matrix.m[0] = s.x;
    matrix.m[1] = s.y;
    matrix.m[2] = s.z;

    matrix.m[4] = u.x;
    matrix.m[5] = u.y;
    matrix.m[6] = u.z;

    matrix.m[8] = -f.x;
    matrix.m[9] = -f.y;
    matrix.m[10] = -f.z;
    return matrix.translate(eye.negative());
}

Renderer.project = function(fovy, zNear, zFar, width, height) {
    var f = 1 / Math.tan(fovy * Math.PI / 180 / 2);
    var aspect = width / height;
    var matrix = new Matrix();
    matrix.m[0] = f / aspect;
    matrix.m[5] = f;
    matrix.m[10] = (zFar + zNear) / (zNear - zFar);
    matrix.m[11] = 2 * zFar * zNear / (zNear - zFar);
    matrix.m[14] = -1;
    return matrix;
}

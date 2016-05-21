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
    this.imageBuffer = [];
    this.viewportMatrix = this.viewport(0, 0);
    this.clearBuffer(this.zbuffer);
}
Renderer.prototype = {
    drawTriangle: function(vertices, color) {
        Renderer.drawTriangle(this, vertices, color);
    },
    clearBuffer: function(buffer, val) {
        for (var i = 0; i < this.width * this.height; ++i) {
            buffer[i] = val || 0;
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
        this.clearBuffer(this.zbuffer, 255);
        this.viewportMatrix = this.viewport(0, 0);
    },
    setBuffer: function(buffer, x, y, val) {
        buffer[y * this.width + x] = val;
    },
    getBuffer: function(buffer, x, y) {
        return buffer[y * this.width + x];
    }
}
Renderer.drawTriangle = function(renderer, vertices, color) {
    if (vertices.length != 3) {
        console.log("vertices.length should be 3");
        return;
    }
    for (var i = 0; i < 3; i += 1) {
        vertices[i] = vertices[i].divide(vertices[i].w);
        vertices[i] = renderer.viewportMatrix.transformPoint(vertices[i]);
        vertices[i].x = Math.floor(vertices[i].x);
        vertices[i].y = Math.floor(vertices[i].y);
    }
    var BBoxTopLeft = new Vector(Math.min(Math.min(vertices[0].x, vertices[1].x), vertices[2].x), Math.min(Math.min(vertices[0].y, vertices[1].y), vertices[2].y));
    var BBoxBottomRight = new Vector(Math.max(Math.max(vertices[0].x, vertices[1].x), vertices[2].x), Math.max(Math.max(vertices[0].y, vertices[1].y), vertices[2].y));
    for (var x = BBoxTopLeft.x; x <= BBoxBottomRight.x; ++x) {
        for (var y = BBoxTopLeft.y; y <= BBoxBottomRight.y; ++y) {
            var p = new Vector(x, y);
            var barycentricCoord = Renderer.barycentric(vertices[0], vertices[1], vertices[2], p);
            if (barycentricCoord.x<0 || barycentricCoord.y<0 || barycentricCoord.z<0) {
                continue;
            }
            var depth = vertices[0].z * barycentricCoord.x + vertices[1].z * barycentricCoord.y + vertices[2].z * barycentricCoord.z;
            if(depth<0) {depth = 0;}
            if(depth>1) {depth = 1;}
            depth = 1 - depth;
            if (renderer.getBuffer(renderer.zbuffer, x, y) < depth) {
                renderer.setBuffer(renderer.zbuffer, x, y, depth);
                var val = Math.floor(depth * 255);
                renderer.setBuffer(renderer.imageBuffer, x, y, new Vector(val, val, val, 255));
            }
        }
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
    matrix.m[10] = 0.5;
    matrix.m[11] = 0.5;
    matrix.m[12] = 0;
    matrix.m[13] = 0;
    matrix.m[14] = 0;
    matrix.m[15] = 1;
    return matrix;
}

Renderer.lookat = function(eye, center, up) {
    up = up.unit();
    return Matrix.lookAt(eye.x, eye.y, eye.z, center.x, center.y, center.z, up.x, up.y, up.z);
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

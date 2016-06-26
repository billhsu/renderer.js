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
    this.clear();
}
Renderer.prototype = {
    drawTriangle: function(vertices, shader) {
        Renderer.drawTriangle(this, vertices, shader);
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
    },
    clear: function() {
        this.clearBuffer(this.zbuffer);
        this.clearBuffer(this.imageBuffer);
    }
}
Renderer.drawTriangle = function(renderer, input, shader) {
    if (input.length != 3) {
        console.log("input.length has to be 3.");
        return;
    }
    var vertices = shader.vertexShader([input[0], input[1], input[2]]);
    for (var i = 0; i < vertices.length; i += 1) {
        vertices[i] = vertices[i].divide(vertices[i].w);
        vertices[i] = renderer.viewportMatrix.transformPoint(vertices[i]);
    }

    var boundingBox = Renderer.getBoundingBox(vertices);
    var xMin = boundingBox[0];
    var yMin = boundingBox[1];
    var xMax = boundingBox[2];
    var yMax = boundingBox[3];
    for (var x = xMin; x <= xMax; ++x) {
        for (var y = yMin; y <= yMax; ++y) {
            var p = new Vector(x, y);
            var barycentricCoord = Renderer.barycentric(vertices[0], vertices[1], vertices[2], p);
            if (barycentricCoord.x < 0 || barycentricCoord.y < 0 || barycentricCoord.z < 0) {
                continue;
            }
            var depth = vertices[0].z * barycentricCoord.x + vertices[1].z * barycentricCoord.y + vertices[2].z * barycentricCoord.z;
            if (depth < 0) {
                depth = 0;
            }
            if (depth > 1) {
                depth = 1;
            }
            depth = 1 - depth;
            if (renderer.getBuffer(renderer.zbuffer, x, y) < depth) {
                renderer.setBuffer(renderer.zbuffer, x, y, depth);
                var val  = Math.floor(depth * 255);
                renderer.setBuffer(renderer.imageBuffer, x, y, shader.fragmentShader(barycentricCoord));
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
Renderer.getTexturePixel = function(texture, u, v) {
    if (u > 1) u = 1;
    if (u < 0) u = 0;
    if (v > 1) v = 1;
    if (v < 0) v = 0;
    v = 1 - v;
    u = Math.floor(u * texture.width);
    v = Math.floor(v * texture.height);
    var index = (u + v * texture.width) * 4;
    return [
        texture.data[index],
        texture.data[index + 1],
        texture.data[index + 2],
        texture.data[index + 3]
    ];
}
Renderer.getBoundingBox = function(vertices) {
    var xMin = vertices[0].x,
    yMin = vertices[0].y;
    var xMax = vertices[0].x,
    yMax = vertices[0].y;
    for (var i = 1; i < vertices.length; ++i) {
        xMin = Math.floor(Math.min(xMin, vertices[i].x));
        xMax = Math.ceil(Math.max(xMax, vertices[i].x));
        yMin = Math.floor(Math.min(yMin, vertices[i].y));
        yMax = Math.ceil(Math.max(yMax, vertices[i].y));
    }
    return [xMin, yMin, xMax, yMax];
}
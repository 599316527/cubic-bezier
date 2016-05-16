/*
 * Copyright (c) 2013 Lea Verou. All rights reserved.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a
 * copy of this software and associated documentation files (the "Software"),
 * to deal in the Software without restriction, including without limitation
 * the rights to use, copy, modify, merge, publish, distribute, sublicense,
 * and/or sell copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
 * DEALINGS IN THE SOFTWARE.
 *
 */

/**
 * Init
 */

// Ensure global vars for ids (most browsers already do this anyway, so…)
[
	'curve','P1','P2'
].forEach(function(id) { window[id] = document.querySelector('#' + id); });

var ctx = curve.getContext("2d");
var curveBoundingBox = curve.getBoundingClientRect();

var cubicBezier = new CubicBezier(80, 230, 50, 10)
var bezierCanvas = new BezierCanvas(curve, cubicBezier, [.25, 0]);

update();

/**
 * Event handlers
 */
// Make the handles draggable
P1.onmousedown =
P2.onmousedown = function() {
	var me = this;

	document.onmousemove = function drag(e) {
		var x = e.pageX, y = e.pageY,
			left = curveBoundingBox.left,
			top = curveBoundingBox.top;

		if (x === 0 && y == 0) {
			return;
		}

		// Constrain x
		x = clamp(left, curveBoundingBox.width + left, x)
		y = clamp(top, top + curveBoundingBox.height, y)

		me.style.left = x - left + 'px'
		me.style.top = y - top + 'px'

		update();
	};

	document.onmouseup = function () {
		me.focus();

		document.onmousemove = document.onmouseup = null;
	}
};

function update() {
	bezierCanvas.bezier.setCoordinates(
		bezierCanvas.offsetsToCoordinates(P1)
		.concat(bezierCanvas.offsetsToCoordinates(P2))
	)

	bezierCanvas.plot();
}

function clamp(min, max, val) {
	return Math.min(Math.max(min, val), max)
}

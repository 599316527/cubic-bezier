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

(function() {

var self = window.CubicBezier = function(...coordinates) {
	this.setCoordinates(coordinates)
};

self.prototype = {
	setCoordinates(coordinates) {
		this.coordinates = coordinates.map(x => +x)
	},

	get P1() {
		return this.coordinates.slice(0, 2);
	},

	get P2() {
		return this.coordinates.slice(2);
	},

	// Clipped to the range 0-1
	get clipped() {
		var coordinates = this.coordinates.slice();

		for(var i=coordinates.length; i--;) {
			coordinates[i] = Math.max(0, Math.min(coordinates[i], 1));
		}

		return new self(coordinates);
	},

	get inRange() {
		var coordinates = this.coordinates;

		return Math.abs(coordinates[1] - .5) <= .5 && Math.abs(coordinates[3] - .5) <= .5;
	},

	toString: function() {
		return 'cubic-bezier(' + this.coordinates.map(x => x.toFixed(2)) + ')';
	},

	applyStyle: function(element) {
		element.style.setProperty(prefix + 'transition-timing-function', this, null);
	},
};


})();

(function(){

var self = window.BezierCanvas = function(canvas, bezier, padding) {
	this.canvas = canvas;
	this.bezier = bezier;
	this.padding = self.getPadding(padding);

	// Convert to a cartesian coordinate system with axes from 0 to 1
	var ctx = this.canvas.getContext('2d'),
		p = this.padding;

	ctx.scale(canvas.width * (1 - p[1] - p[3]), -canvas.height * (1 - p[0] - p[2]));
	ctx.translate(p[3] / (1 - p[1] - p[3]), -1 - p[0] / (1 - p[0] - p[2]));
};

self.prototype = {
	get offsets() {
		var p = this.padding, w = this.canvas.width, h = this.canvas.height;

		return [{
			left: w * (this.bezier.coordinates[0] * (1 - p[3] - p[1]) - p[3]) + 'px',
			top: h * (1 - this.bezier.coordinates[1] * (1 - p[0] - p[2]) - p[0]) + 'px'
		}, {
			left: w * (this.bezier.coordinates[2] * (1 - p[3] - p[1]) - p[3]) + 'px',
			top: h * (1 - this.bezier.coordinates[3] * (1 - p[0] - p[2]) - p[0]) + 'px'
		}]
	},

	offsetsToCoordinates: function(element) {
		var p = this.padding, w = this.canvas.width, h = this.canvas.height;

		// Convert padding percentage to actual padding
		p = p.map(function(a, i) { return a * (i % 2? w : h)});

		return [
			(parseInt(element.style.left) - p[3]) / (w + p[1] + p[3]),
			(h - parseInt(element.style.top) - p[2]) / (h - p[0] - p[2])
		];
	},

	plot: function(settings) {
		var xy = this.bezier.coordinates,
			ctx = this.canvas.getContext('2d');

		var defaultSettings = {
			handleColor: 'rgba(0,0,0,.6)',
			handleThickness: .008,
			bezierColor: 'black',
			bezierThickness: .02
		};

		settings || (settings = {});

		for (var setting in defaultSettings) {
			(setting in settings) || (settings[setting] = defaultSettings[setting]);
		}

		ctx.clearRect(-.5,-.5, 2, 2);

		// Draw control handles
		ctx.beginPath()

		ctx.fillStyle = 'rgba(0,0,0,0)'
		ctx.lineWidth = settings.handleThickness;
		ctx.strokeStyle = settings.handleColor;

		ctx.moveTo(0, 0);
		ctx.lineTo(xy[0], xy[1]);

		ctx.moveTo(1,1);
		ctx.lineTo(xy[2], xy[3]);

		ctx.stroke()
		ctx.closePath();

		ctx.arc(xy[0], xy[1], 1.5 * settings.handleThickness, 0, Math.PI * 2)
		ctx.fill();
		ctx.arc(xy[2], xy[3], 1.5 * settings.handleThickness, 0, Math.PI * 2)
		ctx.fill();

		// Draw bezier curve
		ctx.beginPath();
		ctx.lineWidth = settings.bezierThickness;
		ctx.strokeStyle = settings.bezierColor;
		ctx.moveTo(0,0);
		ctx.bezierCurveTo(xy[0], xy[1], xy[2], xy[3], 1,1)
		ctx.stroke();
		ctx.closePath();
	}

};

self.getPadding = function(padding) {
	var p = typeof padding === 'number'? [padding] : padding;

	if (p.length === 1) {
		p[1] = p[0];
	}

	if (p.length === 2) {
		p[2] = p[0];
	}

	if (p.length === 3) {
		p[3] = p[1];
	}

	return p;
}

})();

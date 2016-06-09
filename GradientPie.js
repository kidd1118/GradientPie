GradientPie = function (options) {
    this.options = {
        className: "GradientPie",
        strokeWidth: 36,
        backgroundOpacity: 1,
        backgroundColor: "#1b1d20",
        progressOpacity: 1,
        angleInterval: 2, //interval each time
        radius: 90,
        textSize: 33
    };
    this.options = this.options || options;
    this._appendToNode = null;
    this._managedNode = document.createElement("div");
    this._managedNode.style.overflowX = "hidden";
    this._managedNode.style.overflowY = "hidden";
    this.prepareNode(this._managedNode);
};

GradientPie.prototype = {
    /* private property */
    pvtData: 0,
    pvtInterval: null, //for clear interval
    pvtDrawAngle: 0,   //counting total angle
    pvtCenter: { x: 0, y: 0 },
    pvtRadius: 0,
    /* private methods */
    render: function (appendToNode) {
        if (!appendToNode) return;

        if (typeof appendToNode == 'string')
            appendToNode = document.getElementById(appendToNode);

        this._appendToNode = appendToNode;

        appendToNode.appendChild(this._managedNode);
    },

    pvtDraw: function () {
        var me = this;
        if (me.pvtDrawAngle >= me.pvtData * 360) {
            clearInterval(me.pvtInterval);
            return;
        }
        var path = me.pvtCreateSVGElement("path");
        path.setAttribute("fill", "none");
        path.setAttribute("stroke-width", me.options.strokeWidth);
        path.setAttribute("stroke-opacity", me.options.progressOpacity);
        me.pvtG.appendChild(path);

        /* ==== Gradient ==== */
        var offset = 0;
        var interAngle = 120;
        var intervalRGB = Math.ceil(255 / interAngle);

        if (me.pvtDrawAngle >= offset && me.pvtDrawAngle < interAngle + offset) { //blue: rgb(0,255,255)
            var b = 255 - (intervalRGB * (me.pvtDrawAngle - offset));
            path.setAttribute("stroke", "rgb(0,255," + (b < 0 ? 0 : b) + ")");
        }
        else if (me.pvtDrawAngle >= interAngle + offset && me.pvtDrawAngle < interAngle * 2 + offset) { //green: rgb(0,255,0)
            var r = (intervalRGB * (me.pvtDrawAngle - (interAngle + offset)));
            path.setAttribute("stroke", "rgb(" + (r > 255 ? 255 : r) + ",255,0)");
        }
        else if (me.pvtDrawAngle >= interAngle * 2 + offset && me.pvtDrawAngle < interAngle * 3 + offset) { //yellow: rgb(255,255,0)
            var g = 255 - (intervalRGB * (me.pvtDrawAngle - (interAngle * 2 + offset)));
            path.setAttribute("stroke", "rgb(255," + (g < 0 ? 0 : g) + ",0)");
        }
        else if (me.pvtDrawAngle >= interAngle * 3 + offset) { //red: rgb(255,0,0)
            var r = 255 - (intervalRGB * (me.pvtDrawAngle - (interAngle * 3 + offset)));
            var gb = (intervalRGB * (me.pvtDrawAngle - (interAngle * 3 + offset)));
            path.setAttribute("stroke", "rgb(" + (r < 0 ? 0 : r) + "," + (gb > 255 ? 255 : gb) + "," + (gb > 255 ? 255 : gb) + ")");
        }
        else if (me.pvtDrawAngle < offset) {
            var r = 255 - (intervalRGB * (me.pvtDrawAngle + interAngle - offset));
            var gb = (intervalRGB * (me.pvtDrawAngle + interAngle - offset));
            path.setAttribute("stroke", "rgb(" + (r < 0 ? 0 : r) + "," + (gb > 255 ? 255 : gb) + "," + (gb > 255 ? 255 : gb) + ")");
        }
        /* =============== */

        me.pvtDrawAngle += me.options.angleInterval;

        var _coords = getCoords();

        if (typeof me.x != "number") me.x = me.pvtCenter.x;
        if (typeof me.y != "number") me.y = me.pvtCenter.y - me.options.radius + me.options.strokeWidth / 2;

        var _d = [
			"M", me.x, me.y,
			"A", me.pvtRadius, me.pvtRadius, 0, _coords.large, 1, _coords.x, _coords.y
        ].join(" ");

        me.x = _coords.x;
        me.y = _coords.y;

        path.setAttribute("d", _d);
        
        function getCoords() {
            var _rads = (me.pvtDrawAngle - 90) * Math.PI / 180.0;
            var _x = me.pvtCenter.x + (me.pvtRadius * Math.cos(_rads));
            var _y = me.pvtCenter.y + (me.pvtRadius * Math.sin(_rads));
            return {
                x: _x,
                y: _y,
                large: "0"
            };
        }
	me.pvtInterval = setInterval(function () {
            me.pvtDraw.call(me);
        }, 100);
    },
    /* public methods */
    prepareNode: function (nodeToAppend) {
        nodeToAppend.className = this.options.className;

        this.pvtDefs = this.pvtCreateSVGElement("defs");
        this.pvtFilter1 = this.pvtCreateSVGElement("filter");
        this.pvtFeOffset = this.pvtCreateSVGElement("feOffset");
        this.pvtFeGaussianBlur = this.pvtCreateSVGElement("feGaussianBlur");
        this.pvtFeBlend = this.pvtCreateSVGElement("feBlend");

        /* fiter tor background shadow */
        this.pvtFilter1.setAttribute("id", "shadow");
        this.pvtFilter1.setAttribute("x", "-20%");
        this.pvtFilter1.setAttribute("y", "-20%");
        this.pvtFilter1.setAttribute("width", "150%");
        this.pvtFilter1.setAttribute("height", "150%");
        this.pvtFeOffset.setAttribute("result", "offOut");
        this.pvtFeOffset.setAttribute("in", "SourceAlpha");
        this.pvtFeOffset.setAttribute("dx", -1);
        this.pvtFeOffset.setAttribute("dy", 1);
        this.pvtFeGaussianBlur.setAttribute("result", "blurOut");
        this.pvtFeGaussianBlur.setAttribute("in", "offOut");
        this.pvtFeGaussianBlur.setAttribute("stdDeviation", 1);
        this.pvtFeBlend.setAttribute("in", "SourceGraphic");
        this.pvtFeBlend.setAttribute("in2", "blurOut");
        this.pvtFeBlend.setAttribute("mode", "normal");

        this.pvtFilter1.appendChild(this.pvtFeOffset);
        this.pvtFilter1.appendChild(this.pvtFeGaussianBlur);
        this.pvtFilter1.appendChild(this.pvtFeBlend);

        /* fiter tor percent citcle's lighting */
        this.pvtFilter2 = this.pvtCreateSVGElement("filter");
        this.pvtFeGaussianBlur2 = this.pvtCreateSVGElement("feGaussianBlur");
        this.pvtFeSpecularLighting = this.pvtCreateSVGElement("feSpecularLighting");
        this.pvtFePointLight = this.pvtCreateSVGElement("fePointLight");
        this.pvtFeComposite1 = this.pvtCreateSVGElement("feComposite");
        this.pvtFeComposite2 = this.pvtCreateSVGElement("feComposite");

        this.pvtFilter2.setAttribute("id", "Bevel");
        this.pvtFilter2.setAttribute("x", "-200px");
        this.pvtFilter2.setAttribute("y", "-200px");
        this.pvtFilter2.setAttribute("width", "500px");
        this.pvtFilter2.setAttribute("height", "500px");
        this.pvtFilter2.setAttribute("filterUnits", "objectBoundingBox");
        this.pvtFeGaussianBlur2.setAttribute("result", "blur");
        this.pvtFeGaussianBlur2.setAttribute("in", "SourceAlpha");
        this.pvtFeGaussianBlur2.setAttribute("stdDeviation", 2);
        this.pvtFeSpecularLighting.setAttribute("specularConstant", 2);
        this.pvtFeSpecularLighting.setAttribute("in", "blur");
        this.pvtFeSpecularLighting.setAttribute("surfaceScale", 1);
        this.pvtFeSpecularLighting.setAttribute("specularExponent", 50);
        this.pvtFeSpecularLighting.setAttribute("result", "specOut");
        this.pvtFeSpecularLighting.setAttribute("lighting-color", "gray");
        this.pvtFePointLight.setAttribute("x", 100000);
        this.pvtFePointLight.setAttribute("y", -50000);
        this.pvtFePointLight.setAttribute("z", 80000);
        this.pvtFeComposite1.setAttribute("in", "specOut");
        this.pvtFeComposite1.setAttribute("in2", "SourceAlpha");
        this.pvtFeComposite1.setAttribute("operator", "in");
        this.pvtFeComposite1.setAttribute("result", "specOut2");
        this.pvtFeComposite2.setAttribute("in", "SourceGraphic");
        this.pvtFeComposite2.setAttribute("in2", "specOut2");
        this.pvtFeComposite2.setAttribute("operator", "arithmetic");
        this.pvtFeComposite2.setAttribute("result", "litPaint");
        this.pvtFeComposite2.setAttribute("k1", 0);
        this.pvtFeComposite2.setAttribute("k2", 1);
        this.pvtFeComposite2.setAttribute("k3", 1);
        this.pvtFeComposite2.setAttribute("k4", 0);

        this.pvtFeSpecularLighting.appendChild(this.pvtFePointLight);
        this.pvtFilter2.appendChild(this.pvtFeGaussianBlur2);
        this.pvtFilter2.appendChild(this.pvtFeSpecularLighting);
        this.pvtFilter2.appendChild(this.pvtFeComposite1);
        this.pvtFilter2.appendChild(this.pvtFeComposite2);

        /* fiter tor percent citcle's shadow */
        this.pvtFilter3 = this.pvtCreateSVGElement("filter");
        this.pvtFeOffset3 = this.pvtCreateSVGElement("feOffset");
        this.pvtFeGaussianBlur3 = this.pvtCreateSVGElement("feGaussianBlur");
        this.pvtFeComposite3 = this.pvtCreateSVGElement("feComposite");
        this.pvtFeFlood = this.pvtCreateSVGElement("feFlood");
        this.pvtFeComposite4 = this.pvtCreateSVGElement("feComposite");
        this.pvtFeComposite5 = this.pvtCreateSVGElement("feComposite");

        this.pvtFilter3.setAttribute("id", "shadow2");
        this.pvtFilter3.setAttribute("x", "-200px");
        this.pvtFilter3.setAttribute("y", "-200px");
        this.pvtFilter3.setAttribute("width", "500px");
        this.pvtFilter3.setAttribute("height", "500px");
        this.pvtFilter3.setAttribute("filterUnits", "objectBoundingBox");
        this.pvtFeOffset3.setAttribute("dx", 4);
        this.pvtFeOffset3.setAttribute("dy", -4);
        this.pvtFeGaussianBlur3.setAttribute("stdDeviation", 1);
        this.pvtFeGaussianBlur3.setAttribute("result", "offset-blur");
        this.pvtFeComposite3.setAttribute("in", "SourceGraphic");
        this.pvtFeComposite3.setAttribute("in2", "offset-blur");
        this.pvtFeComposite3.setAttribute("operator", "out");
        this.pvtFeComposite3.setAttribute("result", "inverse");
        this.pvtFeFlood.setAttribute("flood-color", "black");
        this.pvtFeFlood.setAttribute("flood-opacity", 0.9);
        this.pvtFeFlood.setAttribute("result", "color");
        this.pvtFeComposite4.setAttribute("in", "color");
        this.pvtFeComposite4.setAttribute("in2", "inverse");
        this.pvtFeComposite4.setAttribute("operator", "in");
        this.pvtFeComposite4.setAttribute("result", "shadow");
        this.pvtFeComposite5.setAttribute("in", "shadow");
        this.pvtFeComposite5.setAttribute("in2", "SourceGraphic");
        this.pvtFeComposite5.setAttribute("operator", "over");
        this.pvtFeComposite5.setAttribute("result", "c");

        this.pvtFilter3.appendChild(this.pvtFeOffset3);
        this.pvtFilter3.appendChild(this.pvtFeGaussianBlur3);
        this.pvtFilter3.appendChild(this.pvtFeComposite3);
        this.pvtFilter3.appendChild(this.pvtFeFlood);
        this.pvtFilter3.appendChild(this.pvtFeComposite4);
        this.pvtFilter3.appendChild(this.pvtFeComposite5);

        //root
        this.pvtSVG = this.pvtCreateSVGElement("svg");
        this.pvtGs = this.pvtCreateSVGElement("g");
        this.pvtG = this.pvtCreateSVGElement("g");
        this.pvtCircularBack = this.pvtCreateSVGElement("circle");
        this.pvtText = this.pvtCreateSVGElement("text");
        this.pvtTextUnit = this.pvtCreateSVGElement("text");
        this.pvtTextDesc = this.pvtCreateSVGElement("text");

        this.pvtG.setAttribute("filter", "url(#Bevel)");
        this.pvtGs.appendChild(this.pvtG);
        this.pvtGs.setAttribute("filter", "url(#shadow2)");

        this.pvtText.style.fontSize = this.options.textSize + "px";
        this.pvtTextUnit.style.fontSize = "17px";
        this.pvtTextUnit.textContent = " %";
        this.pvtTextDesc.style.fontSize = "17px";
        this.pvtTextDesc.textContent = "Used"
        this.pvtTextDesc.className = "text";

        this.pvtCircularBack.setAttribute("filter", "url(#shadow)");
        this.pvtCircularBack.setAttribute("fill", "none");
        this.pvtCircularBack.setAttribute("stroke", this.options.backgroundColor);
        this.pvtCircularBack.setAttribute("stroke-width", this.options.strokeWidth);
        this.pvtCircularBack.setAttribute("stroke-opacity", this.options.backgroundOpacity);

        this.pvtDefs.appendChild(this.pvtFilter1);
        this.pvtDefs.appendChild(this.pvtFilter2);
        this.pvtDefs.appendChild(this.pvtFilter3);
        this.pvtSVG.appendChild(this.pvtDefs);
        this.pvtSVG.appendChild(this.pvtCircularBack);
        this.pvtSVG.appendChild(this.pvtGs);
        this.pvtSVG.appendChild(this.pvtText);
        this.pvtSVG.appendChild(this.pvtTextUnit);
        this.pvtSVG.appendChild(this.pvtTextDesc);
        nodeToAppend.appendChild(this.pvtSVG);

    },

    pvtCreateSVGElement: function (type) {
        return document.createElementNS("http://www.w3.org/2000/svg", type);
    },

    getWidth: function () {
        return this._managedNode.offsetWidth;
    },

    setWidth: function (value) {
        value = parseFloat(value.toString().replace("px", ""));
        if (value > 0)
            this._managedNode.style.width = value + "px";
    },

    getHeight: function () {
        return this._managedNode.offsetHeight;
    },

    setHeight: function (value) {
        if (value) {
            value = parseFloat(value.toString().replace("px", ""));
            if (value > 0) this._managedNode.style.height = value + "px";
        }
    },

    refresh: function () {

        if (!this.getWidth()) this.pvtSVG.setAttribute("width", this.options.radius * 2);
        else this.pvtSVG.setAttribute("width", this.getWidth());
        if (!this.getHeight()) this.pvtSVG.setAttribute("height", this.options.radius * 2);
        else this.pvtSVG.setAttribute("height", this.getHeight());

        this.pvtCenter.x = Math.max(this.getWidth() / 2, this.options.radius);
        this.pvtCenter.y = Math.max(this.getHeight() / 2, this.options.radius);
        this.pvtRadius = this.options.radius - (this.options.strokeWidth / 2);

        this.pvtCircularBack.setAttribute("cx", this.pvtCenter.x);
        this.pvtCircularBack.setAttribute("cy", this.pvtCenter.y);
        this.pvtCircularBack.setAttribute("r", this.pvtRadius);

        var textRegion = this.pvtText.getBBox();
        var unitRegion = this.pvtTextUnit.getBBox();
        var descRegion = this.pvtTextDesc.getBBox();
        var totalWidth = textRegion.width + unitRegion.width;
        var totalHeight = Math.max(textRegion.height, unitRegion.height) + descRegion.height;

        this.pvtText.setAttribute("x", this.pvtCenter.x - totalWidth / 2);
        this.pvtText.setAttribute("y", this.pvtCenter.y);

        this.pvtTextUnit.setAttribute("x", this.pvtCenter.x - totalWidth / 2 + textRegion.width);
        this.pvtTextUnit.setAttribute("y", this.pvtCenter.y);

        this.pvtTextDesc.setAttribute("x", this.pvtCenter.x - descRegion.width / 2);
        this.pvtTextDesc.setAttribute("y", this.pvtCenter.y - totalHeight / 4 + Math.max(textRegion.height, unitRegion.height));
        this.pvtTextDesc.setAttribute("width", this.options.radius * 2);
    },

    setValue: function (data) {
        /// <summary>
        /// set Data and changing ui.
        /// </summary>
        /// <param name="Object">data</param>
        var me = this;

        this.clear();

        if (typeof data != "number" || isNaN(data)) {
            this.refresh();
            return false;
        }
        var tmpValue = Math.floor(data * 100);

        this.pvtData = tmpValue / 100;
        this.pvtDrawAngle = 0;

        this.pvtText.style.fill = "gray";
        this.pvtText.textContent = (tmpValue).toFixed(0);
        this.pvtTextUnit.style.fill = "gray";
        this.pvtTextDesc.style.fill = "gray";

        this.refresh();
        this.pvtDraw.call(me);
    },

    getValue: function (value) {
        return this.pvtData;
    },

    clear: function () {
        this.pvtData = 0;

        this.pvtText.textContent = "-- ";
        this.pvtText.style.fill = "#565656";
        this.pvtTextUnit.style.fill = "#565656";
        this.pvtTextDesc.style.fill = "#565656";

        clearInterval(this.pvtInterval);
        this.x = null;
        this.y = null;

        var paths = this.pvtG.getElementsByTagName("path");

        if (paths) {
            var i = paths.length;

            while (i--) {
                if (paths instanceof HTMLCollection) {
                    paths.item(i).parentNode.removeChild(paths.item(i));
                } else if (paths instanceof Array) {
                    paths[i].parentNode.removeChild(dDiv[i]);
                    paths[i] = null;
                }
            }
        }

        //var paths = this.pvtG.getElementsByTagName("path");
        //for (var i = paths.length - 1; i > -1; i--) this.pvtG.removeChild(paths[i]);
    }
};

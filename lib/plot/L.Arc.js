L.Arc = L.Path.extend({
    // @section
    // @aka CircleMarker options
    options: {
        fill: true,
        // @option radius: Number = 10
        // Radius of the circle marker, in pixels
        radius: 10
    },
    initialize: function(latlng, options) {
        L.setOptions(this, options);
        this._latlng = L.latLng(latlng);
        this._radius = this.options.radius;
        this._mRadius = this.options.radius;
        this._deg = this.options.deg;
        this._clockwise = this.options.clockwise;
    },
    // @method setLatLng(latLng: LatLng): this
    // Sets the position of a circle marker to a new location.
    setLatLng: function(latlng) {
        this._latlng = L.latLng(latlng);
        this.redraw();
        return this.fire('move', {
            latlng: this._latlng
        });
    },
    // @method getLatLng(): LatLng
    // Returns the current geographical position of the circle marker
    getLatLng: function() {
        return this._latlng;
    },
    // @method setRadius(radius: Number): this
    // Sets the radius of a circle marker. Units are in pixels.
    setRadius: function(radius) {
        this.options.radius = this._radius = radius;
        return this.redraw();
    },
    // @method getRadius(): Number
    // Returns the current radius of the circle
    getRadius: function() {
        return this._radius;
    },
    setStyle: function(options) {
        var radius = options && options.radius || this._radius;
        L.Path.prototype.setStyle.call(this, options);
        this.setRadius(radius);
        return this;
    },
    _updateBounds: function() {
        var r = this._radius,
            r2 = this._radiusY || r,
            w = this._clickTolerance(),
            p = [r + w, r2 + w];
        this._pxBounds = new L.Bounds(this._point.subtract(p), this._point.add(p));
    },
    _update: function() {
        if (!this._map) {
            return;
        }
        this._updatePath();
    },
    _updatePath: function() {
        this._renderer._updateArc(this);
    },
    _project: function() {
        var lng = this._latlng.lng,
            lat = this._latlng.lat,
            map = this._map,
            crs = map.options.crs;
        if (crs.distance === L.CRS.Earth.distance) {
            var d = Math.PI / 180,
                latR = (this._mRadius / L.CRS.Earth.R) / d,
                top = map.project([lat + latR, lng]),
                bottom = map.project([lat - latR, lng]),
                p = top.add(bottom).divideBy(2),
                lat2 = map.unproject(p).lat,
                lngR = Math.acos((Math.cos(latR * d) - Math.sin(lat * d) * Math.sin(lat2 * d)) / (Math.cos(lat * d) * Math.cos(lat2 * d))) / d;
            if (isNaN(lngR) || lngR === 0) {
                lngR = latR / Math.cos(Math.PI / 180 * lat); // Fallback for edge case, #2425
            }
            this._point = p.subtract(map.getPixelOrigin());
            this._radius = isNaN(lngR) ? 0 : Math.max(Math.round(p.x - map.project([lat2, lng - lngR]).x), 1);
            this._radiusY = Math.max(Math.round(p.y - top.y), 1);
        } else {
            var latlng2 = crs.unproject(crs.project(this._latlng).subtract([this._mRadius, 0]));
            this._point = map.latLngToLayerPoint(this._latlng);
            this._radius = this._point.x - map.latLngToLayerPoint(latlng2).x;
        }
        this._updateBounds();
    }
});
// @factory L.circleMarker(latlng: LatLng, options?: CircleMarker options)
// Instantiates a circle marker object given a geographical point, and an optional options object.
L.arc = function(latlng, options) {
    return new L.Arc(latlng, options);
};
L.Ellipse = L.Polygon.extend({
    initialize: function(latlng, majorRadius, minorRadius, options) {
        L.setOptions(this, options);
        this._latlng = L.latLng(latlng);
        this._bounds = new L.LatLngBounds();
        this._latlngs = this.generatePoints(latlng, majorRadius, minorRadius);
    },
    options: {
        fill: true,
        startAngle: 0,
        endAngle: 359.9
    },
    generate: function() {
        var count = this.points.length;
        if (count < 2) {
            return;
        }
        var pnt1 = this.points[0];
        var pnt2 = this.points[1];
        var center = L.PlotUtils.mid(pnt1, pnt2);
        var majorRadius = Math.abs((pnt1[0] - pnt2[0]) / 2);
        var minorRadius = Math.abs((pnt1[1] - pnt2[1]) / 2);
        this._latlngs=this.generatePoints(center, majorRadius, minorRadius);
    },
    generatePoints: function(center, majorRadius, minorRadius) {
        var x, y, angle, points = [];
        for (var i = 0; i <= L.Constants.FITTING_COUNT; i++) {
            angle = Math.PI * 2 * i / L.Constants.FITTING_COUNT;
            x = center[0] + majorRadius * Math.cos(angle);
            y = center[1] + minorRadius * Math.sin(angle);
            points.push([y, x]);
        }
        return this._convertLatLngs(points);
    },
    _convertLatLngs: function(latlngs) {
        var result = [],
            flat = L.Polyline._flat(latlngs);
        for (var i = 0, len = latlngs.length; i < len; i++) {
            if (flat) {
                result[i] = L.latLng(latlngs[i]);
                this._bounds.extend(result[i]);
            } else {
                result[i] = this._convertLatLngs(latlngs[i]);
            }
        }
        return result;
    }
});
L.ellipse = function(latlng, radii, tilt, options) {
    return new L.Ellipse(latlng, radii, tilt, options);
};
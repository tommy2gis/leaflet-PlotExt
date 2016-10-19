L.FineArrow = L.Polygon.extend({
    tailWidthFactor: 0.15,
    neckWidthFactor: 0.2,
    headWidthFactor: 0.25,
    headAngle: Math.PI / 8.5,
    neckAngle: Math.PI / 13,
    fixPointCount: 2,
    initialize: function(points, options) {
        L.setOptions(this, options);
        this.points = points;
        this._bounds = new L.LatLngBounds();
        this.generate();
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
        var pnts = this.points;
        var pnt1 = pnts[0];
        var pnt2 = pnts[1];
        var len = L.PlotUtils.getBaseLength(pnts);
        var tailWidth = len * this.tailWidthFactor;
        var neckWidth = len * this.neckWidthFactor;
        var headWidth = len * this.headWidthFactor;
        var tailLeft = L.PlotUtils.getThirdPoint(pnt2, pnt1, L.Constants.HALF_PI, tailWidth, true);
        var tailRight = L.PlotUtils.getThirdPoint(pnt2, pnt1, L.Constants.HALF_PI, tailWidth, false);
        var headLeft = L.PlotUtils.getThirdPoint(pnt1, pnt2, this.headAngle, headWidth, false);
        var headRight = L.PlotUtils.getThirdPoint(pnt1, pnt2, this.headAngle, headWidth, true);
        var neckLeft = L.PlotUtils.getThirdPoint(pnt1, pnt2, this.neckAngle, neckWidth, false);
        var neckRight = L.PlotUtils.getThirdPoint(pnt1, pnt2, this.neckAngle, neckWidth, true);
        var pList = [tailLeft, neckLeft, headLeft, [pnt2[1],pnt2[0]], headRight, neckRight, tailRight];
        this._latlngs = this._convertLatLngs(pList);
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
L.fineArrow = function(latlng, radii, tilt, options) {
    return new L.FineArrow(latlng, radii, tilt, options);
};
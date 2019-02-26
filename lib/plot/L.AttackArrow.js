L.AttackArrow = L.Polygon.extend({


    headHeightFactor : 0.18,
    headWidthFactor : 0.3,
    neckHeightFactor : 0.85,
    neckWidthFactor : 0.15,
    headTailFactor : 0.8,

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
        if (count < 2){
            return;
        }
        if (count == 2) {
            this._setLatLngs(L.PlotUtils.pointsTolatlngs(this.points));
            this.redraw();
            return;
        }
        var pnts = this.points;
        // 计算箭尾
        var tailLeft = pnts[0];
        var tailRight = pnts[1];
        if (L.PlotUtils.isClockWise(pnts[0], pnts[1], pnts[2])) {
            tailLeft = pnts[1];
            tailRight = pnts[0];
        }
        var midTail = L.PlotUtils.mid(tailLeft, tailRight);
        var bonePnts = [midTail].concat(pnts.slice(2));
        // 计算箭头
        var headPnts = this.getArrowHeadPoints(bonePnts, tailLeft, tailRight);
        var neckLeft = headPnts[0];
        var neckRight = headPnts[4];
        var tailWidthFactor = L.PlotUtils.distance(tailLeft, tailRight) / L.PlotUtils.getBaseLength(bonePnts);
        // 计算箭身
        var bodyPnts = this.getArrowBodyPoints(bonePnts, neckLeft, neckRight, tailWidthFactor);
        // 整合
        var count = bodyPnts.length;
        var leftPnts = [tailLeft].concat(bodyPnts.slice(0, count / 2));
        leftPnts.push(neckLeft);
        var rightPnts = [tailRight].concat(bodyPnts.slice(count / 2, count));
        rightPnts.push(neckRight);
    
        leftPnts = L.PlotUtils.getQBSplinePoints(leftPnts);
        rightPnts = L.PlotUtils.getQBSplinePoints(rightPnts);

        this._setLatLngs(L.PlotUtils.pointsTolatlngs(leftPnts.concat(headPnts, rightPnts.reverse())));
        this.redraw();
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
    },
    getArrowHeadPoints : function (points, tailLeft, tailRight) {
        var len = L.PlotUtils.getBaseLength(points);
        var headHeight = len * this.headHeightFactor;
        var headPnt = points[points.length - 1];
        len = L.PlotUtils.distance(headPnt, points[points.length - 2]);
        var tailWidth = L.PlotUtils.distance(tailLeft, tailRight);
        if (headHeight > tailWidth * this.headTailFactor) {
            headHeight = tailWidth * this.headTailFactor;
        }
        var headWidth = headHeight * this.headWidthFactor;
        var neckWidth = headHeight * this.neckWidthFactor;
        headHeight = headHeight > len ? len : headHeight;
        var neckHeight = headHeight * this.neckHeightFactor;
        var headEndPnt = L.PlotUtils.getThirdPoint(points[points.length - 2], headPnt, 0, headHeight, true);
        var neckEndPnt = L.PlotUtils.getThirdPoint(points[points.length - 2], headPnt, 0, neckHeight, true);
        var headLeft = L.PlotUtils.getThirdPoint(headPnt, headEndPnt, L.Constants.HALF_PI, headWidth, false);
        var headRight = L.PlotUtils.getThirdPoint(headPnt, headEndPnt, L.Constants.HALF_PI, headWidth, true);
        var neckLeft = L.PlotUtils.getThirdPoint(headPnt, neckEndPnt, L.Constants.HALF_PI, neckWidth, false);
        var neckRight = L.PlotUtils.getThirdPoint(headPnt, neckEndPnt, L.Constants.HALF_PI, neckWidth, true);
        return [neckLeft, headLeft, headPnt, headRight, neckRight];
    },
    getArrowBodyPoints : function (points, neckLeft, neckRight, tailWidthFactor) {
        var allLen = L.PlotUtils.wholeDistance(points);
        var len = L.PlotUtils.getBaseLength(points);
        var tailWidth = len * tailWidthFactor;
        var neckWidth = L.PlotUtils.distance(neckLeft, neckRight);
        var widthDif = (tailWidth - neckWidth) / 2;
        var tempLen = 0, leftBodyPnts = [], rightBodyPnts = [];
        for (var i = 1; i < points.length - 1; i++) {
            var angle = L.PlotUtils.getAngleOfThreePoints(points[i - 1], points[i], points[i + 1]) / 2;
            tempLen += L.PlotUtils.distance(points[i - 1], points[i]);
            var w = (tailWidth / 2 - tempLen / allLen * widthDif) / Math.sin(angle);
            var left = L.PlotUtils.getThirdPoint(points[i - 1], points[i], Math.PI - angle, w, true);
            var right = L.PlotUtils.getThirdPoint(points[i - 1], points[i], angle, w, false);
            leftBodyPnts.push(left);
            rightBodyPnts.push(right);
        }
        return leftBodyPnts.concat(rightBodyPnts);
    }
});
L.attackArrow = function(latlng, options) {
    return new L.AttackArrow(latlng, options);
};




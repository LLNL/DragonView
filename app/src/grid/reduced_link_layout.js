/**
 * Created by Divya on 4/14/2015.
 */

var createReducedLinks = (function(){
    return function(){
        var links = [];
        var linkOccupancy = createLinkMatrix();
        var beg, end;
        var validChannel, channel;

        //var centerX, centerY;
        var arcs = [];

        for(var k=0; k<linkMatrix.length; k++){
            for(var i=0; i<linkMatrix[k].length; i++){

                for(var j=0; j<linkMatrix[k][i].length; j++){
                    if(linkMatrix[k][i][j].left == true){
                        beg = Math.min(i, j);
                        end = Math.max(i, j);

                        for(var channelIdx = 0; channelIdx < linkMatrix[k].length; channelIdx++){
                            validChannel = true;
                            channel = channelIdx;

                            for(var col = beg; col <= end; col++){
                                if(linkOccupancy[k][channelIdx][col].seg == true){
                                    validChannel = false;
                                    break;
                                }
                            }
                            if(validChannel == true){
                                break;
                            }
                        }

                        for(col = beg; col < end; col++){
                            linkOccupancy[k][channel][col].seg = true;
                        }

                        sNodeX = beg*params.xFactor+params.xMargin;
                        sNodeY = k*params.yFactor+params.yMargin;
                        sNodeLinkY = sNodeY-(channel+1)*params.channelGap;

                        tNodeX = end*params.xFactor+params.xMargin;
                        tNodeY = k*params.yFactor+params.yMargin;
                        tNodeLinkY = tNodeY-(channel+1)*params.channelGap;

                        //try arc
                        center1X = sNodeX+params.channelGap;
                        center1Y = sNodeLinkY+params.channelGap;
                        arcs.push({"center": {"x": center1X, "y": center1Y}, "startAngle": 270, "endAngle": 360});

                        center2X = tNodeX-params.channelGap;
                        center2Y = center1Y;
                        arcs.push({"center": {"x": center2X, "y": center2Y}, "startAngle": 0, "endAngle": 90});

                        //try path

                        //links
                        links.push({"source":{"x":sNodeX , "y": sNodeY}, "target": {"x": sNodeX, "y": center1Y}});
                        links.push({"source": {"x": center1X, "y": sNodeLinkY}, "target": {"x": center2X, "y": tNodeLinkY}});
                        links.push({"source": {"x": tNodeX, "y": tNodeY}, "target": {"x": tNodeX, "y": center2Y}})
                    }
                }
            }
        }
        return {
            links: links,
            arcs: arcs
        };
    }
})();
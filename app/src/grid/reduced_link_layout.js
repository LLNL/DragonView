/**
 * Created by Divya on 4/14/2015.
 */
color = null;

var createReducedLinks = (function(){
    return function(linkColor, linkMatrix){
        color = linkColor;
        return reducedLinks(linkMatrix);
    }
})();

var reducedLinks = (function(){
    return function(linkMatrix){
        var links = [];
        var linkOccupancy = null;
        var beg, end;
        var validChannel, channel;
        var arcs = [];
        var counter = 0;
        var sourceColor = 'green';

        if(color == 'green'){
            linkOccupancy = getLinkMatrix('green');
        }
        else{
            linkOccupancy = getLinkMatrix('black');
        }

        for(var k=0; k<linkMatrix.length; k++){
            for(var i=0; i<linkMatrix[k].length; i++){

                for(var j=0; j<linkMatrix[k][i].length; j++){
                    if(linkMatrix[k][i][j].left == true){

                        beg = Math.min(i, j);
                        end = Math.max(i, j);
                        linkColor = linkMatrix[k][i][j].color;

                        if (i == beg){
                            leftArc = sourceColor;
                            rightArc = linkColor;
                        }
                        else{
                            leftArc = linkColor;
                            rightArc = sourceColor;
                        }

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

                        pos = linkPosition(k, beg, end, channel, color);
                        if(color == 'green'){
                            id = "green" + counter;
                            counter += 1;

                            arcs.push({"center": {"x": pos.center1X, "y": pos.center1Y}, "startAngle": 270, "endAngle": 360, "color": leftArc, "id": id });
                            arcs.push({"center": {"x": pos.center2X, "y": pos.center2Y}, "startAngle": 0, "endAngle": 90, "color": rightArc, "id": id});

                            //links
                            links.push({"source":{"x":pos.sNodeX , "y": pos.sNodeY}, "target": {"x": pos.sNodeX, "y": pos.center1Y}, "color": linkColor, "id": id});
                            links.push({"source": {"x": pos.center1X, "y": pos.sNodeLinkY}, "target": {"x": pos.center2X, "y": pos.tNodeLinkY}, "color": linkColor, "id": id});
                            links.push({"source": {"x": pos.tNodeX, "y": pos.tNodeY}, "target": {"x": pos.tNodeX, "y": pos.center2Y}, "color": linkColor, "id": id})
                        }
                        else if(color == 'black'){
                            id = "black" + counter;
                            counter += 1;

                            arcs.push({"center": {"x": pos.center1X, "y": pos.center1Y}, "startAngle": 270, "endAngle": 360, "color": leftArc, "id": id});
                            arcs.push({"center": {"x": pos.center2X, "y": pos.center2Y}, "startAngle": 180, "endAngle": 270, "color": rightArc, "id": id});

                            //links
                            links.push({"source":{"x":pos.sNodeX , "y": pos.sNodeY}, "target": {"x": pos.sNodeLinkX, "y": pos.sNodeY}, "color": linkColor, "id": id});
                            links.push({"source": {"x": pos.sNodeLinkX, "y": pos.center1Y}, "target": {"x": pos.tNodeLinkX, "y": pos.center2Y}, "color": linkColor, "id": id});
                            links.push({"source": {"x": pos.tNodeX, "y": pos.tNodeY}, "target": {"x": pos.tNodeLinkX, "y": pos.tNodeY}, "color": linkColor, "id": id});
                        }
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
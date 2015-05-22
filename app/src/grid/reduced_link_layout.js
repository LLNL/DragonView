/**
 * Created by Divya on 4/14/2015.
 */
var color = null;
var linkMatrixNew = null;

var createReducedLinks = (function(){
    return function(linkColor, linkMatrix1){
        color = linkColor;
        linkMatrixNew = linkMatrix1;

        return reducedLinks();
    }
})();

var reducedLinks = (function(){
    return function(){
        var links = [];
        var linkOccupancy = null;
        var beg, end;
        var validChannel, channel;
        var arcs = [];
        var counter = 0;
        var sourceColor = 'green';

        var hasLinks;
        var nodeChannel, nodeIndex;
        var begSegment, endSegment;

        if(color == 'green'){
            linkOccupancy = getLinkMatrix('green');
        }
        else{
            linkOccupancy = getLinkMatrix('black');
        }

        //console.log(linkMatrixNew);

        for(var k=0; k<linkMatrixNew.length; k++){
            for(var i=0; i<linkMatrixNew[k].length; i++){
                hasLinks = false;
                begSegment = linkMatrixNew[k].length;
                endSegment = 0;

                nodeChannel = 0;
                startAgain = true;

                while(startAgain){
                    startAgain = false;

                    for(var j=0; j<linkMatrixNew[k][i].length; j++){
                        if(linkMatrixNew[k][i][j].left == true){
                            hasLinks = true;

                            if(begSegment > Math.min(i, j)){
                                begSegment = Math.min(i, j);
                            }
                            if(endSegment < Math.max(i, j)){
                                endSegment = Math.max(i, j);
                            }

                            for(var channelIdx = 0; channelIdx < linkMatrixNew[k].length; channelIdx++){
                                validChannel = true;
                                channel = channelIdx;

                                for(var col = beg; col <= end; col++){
                                    if(col == beg){
                                        if(linkOccupancy[k][channelIdx][col].left == true || (linkOccupancy[k][channelIdx][col].right == true)){
                                            console.log('1111111111111111111111111111111111111111');
                                            validChannel = false;
                                            break;
                                        }
                                    }
                                    if(linkOccupancy[k][channelIdx][col].seg == true){
                                        console.log('^^^^^^^^^^^^^^^^^^^^^^');
                                        validChannel = false;
                                        break;
                                    }
                                }
                                if(validChannel == true){
                                    break;
                                }
                            }

                            if(nodeChannel != channel){
                                nodeChannel = channel;
                                startAgain = true;
                                break;
                            }
                        }
                    }
                }

                if(hasLinks){
                    for(var l=begSegment; l<endSegment; l++){
                        linkOccupancy[k][nodeChannel][l].seg = true;
                    }
                }


                for(var j=0; j<linkMatrixNew[k][i].length; j++){

                    if(linkMatrixNew[k][i][j].left == true){
                        beg = Math.min(i, j);
                        end = Math.max(i, j);
                        linkColor = linkMatrixNew[k][i][j].color;

                        if (i == beg){
                            leftArc = sourceColor;
                            rightArc = linkColor;
                        }
                        else{
                            leftArc = linkColor;
                            rightArc = sourceColor;
                        }

                        pos = linkPosition(k, beg, end, nodeChannel, color);
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
                            links.push({"source":{"x":pos.sNodeX , "y": pos.sNodeY}, "target": {"x": pos.center1X, "y": pos.sNodeY}, "color": linkColor, "id": id});
                            links.push({"source": {"x": pos.sNodeLinkX, "y": pos.center1Y}, "target": {"x": pos.tNodeLinkX, "y": pos.center2Y}, "color": linkColor, "id": id});
                            links.push({"source": {"x": pos.tNodeX, "y": pos.tNodeY}, "target": {"x": pos.center2X, "y": pos.tNodeY}, "color": linkColor, "id": id});
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
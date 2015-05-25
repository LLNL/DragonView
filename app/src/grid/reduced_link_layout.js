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
        var sourceID;

        var hasLinks;
        var nodeChannel, nodeIndex;
        var begSegment, endSegment;
        var linkColor, linkValue;

        var segmentColor = segment_color();
        segmentColor.reset();

        if(color == 'green'){
            linkOccupancy = getLinkMatrix('green');
        }
        else{
            linkOccupancy = getLinkMatrix('black');
        }

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
                                            validChannel = false;
                                            break;
                                        }
                                    }
                                    if(linkOccupancy[k][channelIdx][col].seg == true){
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

                //render links
                for(var j=0; j<linkMatrixNew[k][i].length; j++){

                    if(linkMatrixNew[k][i][j].left == true){
                        beg = Math.min(i, j);
                        end = Math.max(i, j);
                        linkColor = linkMatrixNew[k][i][j].color;
                        linkValue = linkMatrixNew[k][i][j].value;
                        sourceID = linkMatrixNew[k][i][j].sourceID;
                        temp = sourceID.split(':');
                        sourceID = temp[0] + temp[1] + temp[2];

                        pos = linkPosition(k, beg, end, nodeChannel, color);
                        colors = segmentColor.set_color(pos.axis, pos.row, pos.channel, pos.firstSegment, pos.segments, linkValue, linkColor);
                        connector_colors = segmentColor.set_connector_color(pos, linkValue, linkColor);

                        if(color == 'green'){
                            id = "green" + counter;
                            counter += 1;

                            sourceID = 'green-' + sourceID;

                            side = 'beg';
                            bend_color = segmentColor.set_bend_color(pos, linkValue, linkColor, side);
                            key = pos.axis + pos.row.toString() + side + pos.channel.toString();
                            c = bend_color.get(key).color;
                            if(i == beg){
                                c = sourceColor;
                            }
                            arcs.push({"center": {"x": pos.center1X, "y": pos.center1Y}, "startAngle": 270, "endAngle": 360, "color": c, "id": id, 'sourceID': sourceID });
                            //d = document.getElementById(id);
                            //d.className = d.className + key;
                            //console.log(d.className);

                            side = 'end';
                            bend_color = segmentColor.set_bend_color(pos, linkValue, linkColor, side);
                            key = pos.axis + pos.row.toString() + side + pos.channel.toString();
                            c = bend_color.get(key).color;
                            if(j == beg){
                                c = sourceColor;
                            }
                            arcs.push({"center": {"x": pos.center2X, "y": pos.center2Y}, "startAngle": 0, "endAngle": 90, "color": c, "id": id, 'sourceID': sourceID});

                            //beginning connectors
                            y1 = pos.sNodeY;
                            for(var z=0; z< pos.beg_connector_segments.length; z++){
                                key = pos.axis + pos.row.toString() + pos.beg.toString() + z.toString();
                                c = connector_colors.get(key).color;
                                y2 = pos.beg_connector_segments[z];
                                links.push({"source":{"x":pos.sNodeX , "y": y1}, "target": {"x": pos.sNodeX, "y": y2}, "color": c, "id": id, 'sourceID': sourceID});
                                y1 = y2;
                            }

                            //segments
                            x1 = pos.center1X;
                            for(var z= 0; z<pos.segments.length; z++){
                                key = pos.axis + pos.row.toString() + pos.channel.toString() + pos.segments[z].toString();
                                c = colors.get(key).color;
                                x2 = pos.segments[z];
                                links.push({"source": {"x": x1, "y": pos.sNodeLinkY}, "target": {"x": x2, "y": pos.tNodeLinkY}, "color": c, "id": id, 'sourceID': sourceID});
                                x1 = x2;
                            }

                            //end connector
                            y1 = pos.tNodeY;
                            for(var z=0; z< pos.end_connector_segments.length; z++){
                                key = pos.axis + pos.row.toString() + pos.end1.toString() + z.toString();
                                c = connector_colors.get(key).color;
                                y2 = pos.end_connector_segments[z];
                                links.push({"source":{"x":pos.tNodeX , "y": y1}, "target": {"x": pos.tNodeX, "y": y2}, "color": c, "id": id, 'sourceID': sourceID});
                                y1 = y2;
                            }
                        }
                        else if(color == 'black'){
                            id = "black" + counter;
                            counter += 1;

                            sourceID = 'black-' + sourceID;

                            side = 'beg';
                            bend_color = segmentColor.set_bend_color(pos, linkValue, linkColor, side);
                            key = pos.axis + pos.row.toString() + side + pos.channel.toString();
                            c = bend_color.get(key).color;
                            if(j == beg){
                                c = sourceColor;
                            }
                            arcs.push({"center": {"x": pos.center1X, "y": pos.center1Y}, "startAngle": 270, "endAngle": 360, "color": c, "id": id, 'sourceID': sourceID });

                            side = 'end';
                            bend_color = segmentColor.set_bend_color(pos, linkValue, linkColor, side);
                            key = pos.axis + pos.row.toString() + side + pos.channel.toString();
                            c = bend_color.get(key).color;
                            if(j == beg){
                                c = sourceColor;
                            }
                            arcs.push({"center": {"x": pos.center2X, "y": pos.center2Y}, "startAngle": 180, "endAngle": 270, "color": c, "id": id, 'sourceID': sourceID});

                            //beginning connectors
                            x1 = pos.sNodeX;
                            for(var z=0; z< pos.beg_connector_segments.length; z++){
                                key = pos.axis + pos.row.toString() + pos.beg.toString() + z.toString();
                                c = connector_colors.get(key).color;
                                x2 = pos.beg_connector_segments[z];
                                links.push({"source":{"x":x1 , "y": pos.sNodeY}, "target": {"x": x2, "y": pos.sNodeY}, "color": c, "id": id, 'sourceID': sourceID});
                                x1 = x2;
                            }

                            //segments
                            y1 = pos.center1Y;
                            for(var z= 0; z<pos.segments.length; z++){
                                key = pos.axis + pos.row.toString() + pos.channel.toString() + pos.segments[z].toString();
                                c = colors.get(key).color;
                                y2 = pos.segments[z];
                                    links.push({"source": {"x": pos.sNodeLinkX, "y": y1}, "target": {"x": pos.tNodeLinkX, "y": y2}, "color": c, "id": id, 'sourceID': sourceID});
                                y1 = y2;
                            }

                            //end connector
                            x1 = pos.tNodeX;
                            for(var z=0; z< pos.end_connector_segments.length; z++){
                                key = pos.axis + pos.row.toString() + pos.end1.toString() + z.toString();
                                c1 = connector_colors.get(key).color;
                                x2 = pos.end_connector_segments[z];
                                links.push({"source": {"x": x1, "y": pos.tNodeY}, "target": {"x": x2, "y": pos.tNodeY}, "color": c, "id": id, 'sourceID': sourceID});
                                y1 = y2;
                            }
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
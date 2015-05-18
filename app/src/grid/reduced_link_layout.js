/**
 * Created by Divya on 4/14/2015.
 */

var createReducedLinks = (function(){
    return function(linkColor, linkMatrix){
        if(linkColor == 'green'){
            return createGreenLinks(linkMatrix);
        }
        else if(linkColor == 'black'){
            return createBlackLinks(linkMatrix);
        }
        else{
            console.log('Something is wrong');
        }
    }
})();

var createGreenLinks = (function(){
    return function(linkMatrix){
        var links = [];
        var linkOccupancy = getLinkMatrix('green');
        var beg, end;
        var validChannel, channel;
        var arcs = [];
        var counter = 0;
        var sourceColor = 'green';

        for(var k=0; k<linkMatrix.length; k++){
            for(var i=0; i<linkMatrix[k].length; i++){

                for(var j=0; j<linkMatrix[k][i].length; j++){
                    if(linkMatrix[k][i][j].left == true){

                        beg = Math.min(i, j);
                        end = Math.max(i, j);
                        color = linkMatrix[k][i][j].color;

                        if (i == beg){
                            leftArc = sourceColor;
                            rightArc = color;
                        }
                        else{
                            leftArc = color;
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

                        sNodeX = beg*params.xFactor+params.xMargin+(((beg*2)+1)*params.radius);
                        sNodeY = k*params.yFactor+params.yMargin+(((k*2)+1)*params.radius);
                        sNodeLinkY = sNodeY-(channel+1)*params.channelGap;

                        tNodeX = end*params.xFactor+params.xMargin+(((end*2)+1)*params.radius);
                        tNodeY = k*params.yFactor+params.yMargin+(((k*2)+1)*params.radius);
                        tNodeLinkY = tNodeY-(channel+1)*params.channelGap;

                        center1X = sNodeX+params.channelGap;
                        center1Y = sNodeLinkY+params.channelGap;

                        center2X = tNodeX-params.channelGap;
                        center2Y = center1Y;

                        id = "green" + counter;
                        counter += 1;


                        arcs.push({"center": {"x": center1X, "y": center1Y}, "startAngle": 270, "endAngle": 360, "color": leftArc, "id": id });
                        arcs.push({"center": {"x": center2X, "y": center2Y}, "startAngle": 0, "endAngle": 90, "color": rightArc, "id": id});

                        //links
                        links.push({"source":{"x":sNodeX , "y": sNodeY}, "target": {"x": sNodeX, "y": center1Y}, "color": color, "id": id});
                        links.push({"source": {"x": center1X, "y": sNodeLinkY}, "target": {"x": center2X, "y": tNodeLinkY}, "color": color, "id": id});
                        links.push({"source": {"x": tNodeX, "y": tNodeY}, "target": {"x": tNodeX, "y": center2Y}, "color": color, "id": id})
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

var createBlackLinks = (function(){
    return function(linkMatrix){
        var links = [];
        var linkOccupancy = null;
        var beg, end;
        var validChannel, channel;
        var arcs = [];
        var counter = 0;
        linkOccupancy = getLinkMatrix('black');
        var sourceColor = 'green';


        for(var k=0; k<linkMatrix.length; k++){
            for(var i=0; i<linkMatrix[k].length; i++){

                for(var j=0; j<linkMatrix[k][i].length; j++){

                    if(linkMatrix[k][i][j].left == true){
                        beg = Math.min(i, j);
                        end = Math.max(i, j);
                        color = linkMatrix[k][i][j].color;
                        if (i == beg){
                            leftArc = sourceColor;
                            rightArc = color;
                        }
                        else{
                            leftArc = color;
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

                        id = "black" + counter;
                        counter += 1;

                        sNodeX = k*params.xFactor+params.xMargin+(((k*2)+1)*params.radius);
                        sNodeY = beg*params.yFactor+params.yMargin+(((beg*2)+1)*params.radius);
                        sNodeLinkX = sNodeX-(channel+1)*params.channelGap; //-

                        tNodeX = k*params.xFactor+params.xMargin+(((k*2)+1)*params.radius);
                        tNodeY = end*params.yFactor+params.yMargin+(((end*2)+1)*params.radius);
                        tNodeLinkX = tNodeX-(channel+1)*params.channelGap;

                        center1Y = sNodeY+params.channelGap;
                        center1X = sNodeLinkX+params.channelGap;
                        center2Y = tNodeY-params.channelGap;
                        center2X = center1X;

                        arcs.push({"center": {"x": center1X, "y": center1Y}, "startAngle": 270, "endAngle": 360, "color": leftArc, "id": id});
                        arcs.push({"center": {"x": center2X, "y": center2Y}, "startAngle": 180, "endAngle": 270, "color": rightArc, "id": id});

                        //links
                        links.push({"source":{"x":sNodeX , "y": sNodeY}, "target": {"x": sNodeLinkX, "y": sNodeY}, "color": color, "id": id});
                        links.push({"source": {"x": sNodeLinkX, "y": center1Y}, "target": {"x": tNodeLinkX, "y": center2Y}, "color": color, "id": id});
                        links.push({"source": {"x": tNodeX, "y": tNodeY}, "target": {"x": tNodeLinkX, "y": tNodeY}, "color": color, "id": id});
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
/**
 * Created by Divya on 4/14/2015.
 */

var createCondensedLinks = (function(){
    return function(color, linkMatrix){
        if(color == 'green'){
            return createCondensedGreenLinks(linkMatrix);
        }
        else if(color == 'black'){
            return createCondensedBlackLinks(linkMatrix);
        }
        else{
            console.log('Something is wrong');
        }
    }
})();

var createCondensedGreenLinks = (function () {
return function(linkMatrix){
    var links = [];
    var arcs= [];

    for(var k=0; k<linkMatrix.length; k++){
        var channelLevel = new Map();
        var channelIdx = 1, channel;

        for(var i = 0; i<linkMatrix[k].length; i++){
            var beg = 0, end = 0;

            for(var j=0; j<linkMatrix[k][i].length; j++){

                if(linkMatrix[k][i][j].left == true){
                    beg = Math.min(i, j);
                    end = Math.max(i, j);
                    color = linkMatrix[k][i][j].color;
                }
            }

            if(beg != end){
                sNodeX = beg*params.xFactor+params.margin;
                sNodeY = k*params.yFactor+params.margin;
                tNodeX = end*params.xFactor+params.margin;
                tNodeY = k*params.yFactor+params.margin;

                if(channelLevel.has(i)){
                    channel = channelLevel.get(i);
                }
                else{
                    channelLevel.set(i, channelIdx);
                    channel = channelIdx;
                    channelIdx += 1;
                }

                //links.push({"source":{"x":sNodeX , "y": sNodeY}, "target": {"x": sNodeX, "y": sNodeY-channel*params.channelGap}});
                //links.push({"source": {"x": sNodeX, "y": sNodeY-channel*params.channelGap}, "target": {"x": tNodeX, "y": tNodeY-channel*params.channelGap}});
                //links.push({"source": {"x": tNodeX, "y": tNodeY}, "target": {"x": tNodeX, "y": tNodeY-channel*params.channelGap}})


                sNodeX = beg*params.xFactor+params.xMargin+(((beg*2)+1)*params.radius);
                sNodeY = k*params.yFactor+params.yMargin+(((k*2)+1)*params.radius);
                sNodeLinkY = sNodeY-(channel+1)*params.channelGap;

                tNodeX = end*params.xFactor+params.xMargin+(((end*2)+1)*params.radius);
                tNodeY = k*params.yFactor+params.yMargin+(((k*2)+1)*params.radius);
                tNodeLinkY = tNodeY-(channel+1)*params.channelGap;

                //try arc
                center1X = sNodeX+params.channelGap;
                center1Y = sNodeLinkY+params.channelGap;
                arcs.push({"center": {"x": center1X, "y": center1Y}, "startAngle": 270, "endAngle": 360, "color": color});

                center2X = tNodeX-params.channelGap;
                center2Y = center1Y;
                arcs.push({"center": {"x": center2X, "y": center2Y}, "startAngle": 0, "endAngle": 90, "color": color});

                //links
                links.push({"source":{"x":sNodeX , "y": sNodeY}, "target": {"x": sNodeX, "y": center1Y}, "color": color});
                links.push({"source": {"x": center1X, "y": sNodeLinkY}, "target": {"x": center2X, "y": tNodeLinkY}, "color": color});
                links.push({"source": {"x": tNodeX, "y": tNodeY}, "target": {"x": tNodeX, "y": center2Y}, "color": color})

            }

        }
    }

    //return links;

    return {
        links: links,
        arcs: arcs
    };
}
})();

var createCondensedBlackLinks = (function(){
    return function(linkMatrix){
        var links = [];
        var arcs= [];

        for(var k=0; k<linkMatrix.length; k++){
            var channelLevel = new Map();
            var channelIdx = 1, channel;

            for(var i = 0; i<linkMatrix[k].length; i++){
                var beg = 0, end = 0;

                for(var j=0; j<linkMatrix[k][i].length; j++){

                    if(linkMatrix[k][i][j].left == true){
                        beg = Math.min(i, j);
                        end = Math.max(i, j);
                        color = linkMatrix[k][i][j].color;

                    }
                }

                if(beg != end){
                    //sNodeX = beg*params.xFactor+params.margin;
                    //sNodeY = k*params.yFactor+params.margin;
                    //tNodeX = end*params.xFactor+params.margin;
                    //tNodeY = k*params.yFactor+params.margin;

                    if(channelLevel.has(i)){
                        channel = channelLevel.get(i);
                    }
                    else{
                        channelLevel.set(i, channelIdx);
                        channel = channelIdx;
                        channelIdx += 1;
                    }

                    //links.push({"source":{"x":sNodeX , "y": sNodeY}, "target": {"x": sNodeX, "y": sNodeY-channel*params.channelGap}});
                    //links.push({"source": {"x": sNodeX, "y": sNodeY-channel*params.channelGap}, "target": {"x": tNodeX, "y": tNodeY-channel*params.channelGap}});
                    //links.push({"source": {"x": tNodeX, "y": tNodeY}, "target": {"x": tNodeX, "y": tNodeY-channel*params.channelGap}})

                    sNodeX = k*params.xFactor+params.xMargin+(((k*2)+1)*params.radius);
                    sNodeY = beg*params.yFactor+params.yMargin+(((beg*2)+1)*params.radius);
                    sNodeLinkX = sNodeX-(channel+1)*params.channelGap; //-

                    tNodeX = k*params.xFactor+params.xMargin+(((k*2)+1)*params.radius);
                    tNodeY = end*params.yFactor+params.yMargin+(((end*2)+1)*params.radius);
                    tNodeLinkX = tNodeX-(channel+1)*params.channelGap;

                    ////try arc
                    center1Y = sNodeY+params.channelGap;
                    center1X = sNodeLinkX+params.channelGap; //-
                    arcs.push({"center": {"x": center1X, "y": center1Y}, "startAngle": 270, "endAngle": 360, "color": color});
                    //
                    center2Y = tNodeY-params.channelGap;
                    center2X = center1X;
                    arcs.push({"center": {"x": center2X, "y": center2Y}, "startAngle": 180, "endAngle": 270, "color": color});

                    //links
                    links.push({"source":{"x":sNodeX , "y": sNodeY}, "target": {"x": sNodeLinkX, "y": sNodeY}, "color": color});
                    links.push({"source": {"x": sNodeLinkX, "y": center1Y}, "target": {"x": tNodeLinkX, "y": center2Y}, "color": color});
                    links.push({"source": {"x": tNodeX, "y": tNodeY}, "target": {"x": tNodeLinkX, "y": tNodeY}, "color": color});

                }

            }
        }

        //return links;

        return {
            links: links,
            arcs: arcs
        };
    }
})();

//var createCondensedLinks = (function(){
//    return function(){
//        var links = [];
//        var arcs= [];
//
//        for(var k=0; k<linkMatrix.length; k++){
//            var channelLevel = new Map();
//            var channelIdx = 1, channel;
//
//            for(var i = 0; i<linkMatrix[k].length; i++){
//                var beg = 0, end = 0;
//
//                for(var j=0; j<linkMatrix[k][i].length; j++){
//
//                    if(linkMatrix[k][i][j].left == true){
//                        beg = i;
//                        end = j;
//                    }
//                }
//
//                if(beg != end){
//                    sNodeX = beg*params.xFactor+params.margin;
//                    sNodeY = k*params.yFactor+params.margin;
//                    tNodeX = end*params.xFactor+params.margin;
//                    tNodeY = k*params.yFactor+params.margin;
//
//                    if(channelLevel.has(i)){
//                        channel = channelLevel.get(i);
//                    }
//                    else{
//                        channelLevel.set(i, channelIdx);
//                        channel = channelIdx;
//                        channelIdx += 1;
//                    }
//
//                    //links.push({"source":{"x":sNodeX , "y": sNodeY}, "target": {"x": sNodeX, "y": sNodeY-channel*params.channelGap}});
//                    //links.push({"source": {"x": sNodeX, "y": sNodeY-channel*params.channelGap}, "target": {"x": tNodeX, "y": tNodeY-channel*params.channelGap}});
//                    //links.push({"source": {"x": tNodeX, "y": tNodeY}, "target": {"x": tNodeX, "y": tNodeY-channel*params.channelGap}})
//
//
//                    sNodeX = k*params.xFactor+params.xMargin+(((k*2)+1)*params.radius);
//                    sNodeY = beg*params.yFactor+params.yMargin+(((beg*2)+1)*params.radius);
//                    sNodeLinkX = sNodeX-(channel+1)*params.channelGap; //-
//
//                    tNodeX = k*params.xFactor+params.xMargin+(((k*2)+1)*params.radius);
//                    tNodeY = end*params.yFactor+params.yMargin+(((end*2)+1)*params.radius);
//                    tNodeLinkX = tNodeX-(channel+1)*params.channelGap;
//
//                    ////try arc
//                    center1Y = sNodeY+params.channelGap;
//                    center1X = sNodeLinkX+params.channelGap; //-
//                    arcs.push({"center": {"x": center1X, "y": center1Y}, "startAngle": 270, "endAngle": 360});
//                    //
//                    center2Y = tNodeY-params.channelGap;
//                    center2X = center1X;
//                    arcs.push({"center": {"x": center2X, "y": center2Y}, "startAngle": 180, "endAngle": 270});
//
//                    //links
//                    links.push({"source":{"x":sNodeX , "y": sNodeY}, "target": {"x": sNodeLinkX, "y": sNodeY}});
//                    links.push({"source": {"x": sNodeLinkX, "y": center1Y}, "target": {"x": tNodeLinkX, "y": center2Y}});
//                    links.push({"source": {"x": tNodeX, "y": tNodeY}, "target": {"x": tNodeLinkX, "y": tNodeY}});
//
//                }
//
//            }
//        }
//
//        //return links;
//
//        return {
//            links: links,
//            arcs: arcs
//        };
//
//    }
//})();
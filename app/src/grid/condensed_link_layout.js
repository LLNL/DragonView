///**
// * Created by Divya on 4/14/2015.
// */
color = null;

var createCondensedLinks = (function(){
    return function(linkColor, linkMatrix){
        color = linkColor;

        return condensedLinks(linkMatrix);

    }
})();

var condensedLinks = (function(){

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
                        linkColor = linkMatrix[k][i][j].color;

                        if(channelLevel.has(i)){
                            channel = channelLevel.get(i);
                        }
                        else{
                            channelLevel.set(i, channelIdx);
                            channel = channelIdx;
                            channelIdx += 1;
                        }

                        pos = linkPosition(k, beg, end, channel);

                        if(color == 'green'){
                            arcs.push({"center": {"x": pos.center1X, "y": pos.center1Y}, "startAngle": 270, "endAngle": 360, "color": linkColor});
                            arcs.push({"center": {"x": pos.center2X, "y": pos.center2Y}, "startAngle": 0, "endAngle": 90, "color": linkColor});

                            //links
                            links.push({"source":{"x": pos.sNodeX , "y": pos.sNodeY}, "target": {"x": pos.sNodeX, "y": pos.center1Y}, "color": linkColor});
                            links.push({"source": {"x": pos.center1X, "y": pos.sNodeLinkY}, "target": {"x": pos.center2X, "y": pos.tNodeLinkY}, "color": linkColor});
                            links.push({"source": {"x": pos.tNodeX, "y": pos.tNodeY}, "target": {"x": pos.tNodeX, "y": pos.center2Y}, "color": linkColor});
                        }
                        else if(color == 'black'){
                            arcs.push({"center": {"x": pos.center1X, "y": pos.center1Y}, "startAngle": 270, "endAngle": 360, "color": linkColor});
                            arcs.push({"center": {"x": pos.center2X, "y": pos.center2Y}, "startAngle": 180, "endAngle": 270, "color": linkColor});

                            links.push({"source":{"x":pos.sNodeX , "y": pos.sNodeY}, "target": {"x": pos.sNodeLinkX, "y": pos.sNodeY}, "color": linkColor});
                            links.push({"source": {"x": pos.sNodeLinkX, "y": pos.center1Y}, "target": {"x": pos.tNodeLinkX, "y": pos.center2Y}, "color": linkColor});
                            links.push({"source": {"x": pos.tNodeX, "y": pos.tNodeY}, "target": {"x": pos.tNodeLinkX, "y": pos.tNodeY}, "color": linkColor});
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
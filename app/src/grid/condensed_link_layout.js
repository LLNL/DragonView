/**
 * Created by Divya on 4/14/2015.
 */

var createCondensedLinks = (function(){
    return function(){
        var links = [];

        for(var k=0; k<linkMatrix.length; k++){
            var channelLevel = new Map();
            var channelIdx = 1, channel;

            for(var i = 0; i<linkMatrix[k].length; i++){
                var beg = 0, end = 0;

                for(var j=0; j<linkMatrix[k][i].length; j++){

                    if(linkMatrix[k][i][j].left == true){
                        beg = i;
                        end = j;
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

                    links.push({"source":{"x":sNodeX , "y": sNodeY}, "target": {"x": sNodeX, "y": sNodeY-channel*params.channelGap}});
                    links.push({"source": {"x": sNodeX, "y": sNodeY-channel*params.channelGap}, "target": {"x": tNodeX, "y": tNodeY-channel*params.channelGap}});
                    links.push({"source": {"x": tNodeX, "y": tNodeY}, "target": {"x": tNodeX, "y": tNodeY-channel*params.channelGap}})
                }

            }
        }

        return links;
    }
})();
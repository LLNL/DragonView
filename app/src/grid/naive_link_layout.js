/**
 * Created by Divya on 4/8/2015.
 */

var createNaiveLinks = (function(){
    return function(){
        var links = [];

        for(var k=0; k<linkMatrix.length; k++){

            for(var i=0; i<linkMatrix[k].length; i++){
                var beg=0, end=0;

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

                    links.push({"source":{"x":sNodeX , "y": sNodeY}, "target": {"x": sNodeX, "y": sNodeY-(i+1)*params.channelGap}});
                    links.push({"source": {"x": sNodeX, "y": sNodeY-(i+1)*params.channelGap}, "target": {"x": tNodeX, "y": tNodeY-(i+1)*params.channelGap}});
                    links.push({"source": {"x": tNodeX, "y": tNodeY}, "target": {"x": tNodeX, "y": tNodeY-(i+1)*params.channelGap}})
                }

            }
        }
        return links;
    }
})();
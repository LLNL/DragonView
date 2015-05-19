/**
 * Created by divraj on 5/11/15.
 */

var linkPosition = (function linkPosition(){
    return function(k, beg, end, channel, color){
        if(color == 'green'){
            sNodeX = beg*params.xFactor+params.xMargin+(((beg*2)+1)*params.radius);
            sNodeY = k*params.yFactor+params.yMargin+(((k*2)+1)*params.radius);

            tNodeX = end*params.xFactor+params.xMargin+(((end*2)+1)*params.radius);
            tNodeY = k*params.yFactor+params.yMargin+(((k*2)+1)*params.radius);

            sNodeLinkY = sNodeY-(channel+1)*params.channelGap;
            tNodeLinkY = tNodeY-(channel+1)*params.channelGap;

            center1X = sNodeX+params.channelGap;
            center1Y = sNodeLinkY+params.channelGap;

            center2X = tNodeX-params.channelGap;
            center2Y = center1Y;

            return{
                sNodeX: sNodeX,
                sNodeY: sNodeY,

                tNodeX: tNodeX,
                tNodeY: tNodeY,

                sNodeLinkY: sNodeLinkY,
                tNodeLinkY: tNodeLinkY,

                center1X: center1X,
                center1Y: center1Y,

                center2X: center2X,
                center2Y: center2Y
            }
        }

        else if(color == 'black'){
            sNodeX = k*params.xFactor+params.xMargin+(((k*2)+1)*params.radius);
            sNodeY = beg*params.yFactor+params.yMargin+(((beg*2)+1)*params.radius);

            tNodeX = k*params.xFactor+params.xMargin+(((k*2)+1)*params.radius);
            tNodeY = end*params.yFactor+params.yMargin+(((end*2)+1)*params.radius);

            sNodeLinkX = sNodeX-(channel+1)*params.channelGap;
            tNodeLinkX = tNodeX-(channel+1)*params.channelGap;


            center1Y = sNodeY+params.channelGap;
            center1X = sNodeLinkX+params.channelGap;

            center2Y = tNodeY-params.channelGap;
            center2X = center1X;

            return {
                sNodeX: sNodeX,
                sNodeY: sNodeY,

                tNodeX: tNodeX,
                tNodeY: tNodeY,

                sNodeLinkX: sNodeLinkX,
                tNodeLinkX: tNodeLinkX,

                center1X: center1X,
                center1Y: center1Y,

                center2X: center2X,
                center2Y: center2Y
            }
        }
    }
})();
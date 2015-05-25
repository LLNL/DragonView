/**
 * Created by divraj on 5/11/15.
 */
var greenNodeSpace, blackNodeSpace, connector;
var x, y;
var segments, connector_segments;

var linkPosition = (function linkPosition(){

    return function(k, beg, end, channel, color){
        greenNodeSpace = params.xFactor-2*params.channelGap+2*params.radius;
        blackNodeSpace = params.yFactor-2*params.channelGap+2*params.radius;
        connector = 2*params.channelGap;

        if(color == 'green'){
            sNodeX = beg*params.xFactor+params.xMargin+(((beg*2)+1)*params.radius);
            sNodeY = k*params.yFactor+params.yMargin+(((k*2)+1)*params.radius) - params.radius;

            tNodeX = end*params.xFactor+params.xMargin+(((end*2)+1)*params.radius);
            tNodeY = k*params.yFactor+params.yMargin+(((k*2)+1)*params.radius) - params.radius;

            sNodeLinkY = sNodeY-(channel+1)*params.channelGap;
            tNodeLinkY = tNodeY-(channel+1)*params.channelGap;

            center1X = sNodeX+params.channelGap;
            center1Y = sNodeLinkY+params.channelGap;

            center2X = tNodeX-params.channelGap;
            center2Y = center1Y;

            //---all segments
            beg_connector_segments = [];
            y = sNodeY;
            while(y > center1Y){
                y -= params.channelGap;
                beg_connector_segments.push(y);
            }

            end_connector_segments = [];
            y = tNodeY;
            while(y > center2Y){
                y -= params.channelGap;
                end_connector_segments.push(y);
            }

            segments = [];
            x = center1X;
            while(x < center2X){
                x += greenNodeSpace;
                segments.push(x);

                if(x < center2X){
                    x += connector;
                    segments.push(x);
                }
            }
            //---

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
                center2Y: center2Y,

                beg_connector_segments: beg_connector_segments,
                end_connector_segments: end_connector_segments,
                beg: beg,
                end1: end,

                segments: segments,
                axis:'green',
                'row': k,
                'channel': channel,
                'firstSegment': beg
            }
        }

        else if(color == 'black'){
            sNodeX = k*params.xFactor+params.xMargin+(((k*2)+1)*params.radius) - params.radius;
            sNodeY = beg*params.yFactor+params.yMargin+(((beg*2)+1)*params.radius);

            tNodeX = k*params.xFactor+params.xMargin+(((k*2)+1)*params.radius) - params.radius;
            tNodeY = end*params.yFactor+params.yMargin+(((end*2)+1)*params.radius);

            sNodeLinkX = sNodeX-(channel+1)*params.channelGap;
            tNodeLinkX = tNodeX-(channel+1)*params.channelGap;

            center1Y = sNodeY+params.channelGap;
            center1X = sNodeLinkX+params.channelGap;

            center2Y = tNodeY-params.channelGap;
            center2X = center1X;

            //---all segments
            beg_connector_segments = [];
            x = sNodeX;
            while(x > center1X){
                x -= params.channelGap;
                beg_connector_segments.push(x);
            }

            end_connector_segments = [];
            x = tNodeX;
            while(x > center2X){
                x -= params.channelGap;
                end_connector_segments.push(x);
            }

            segments = [];
            y = center1Y;
            while(y < center2Y){
                y += blackNodeSpace;
                segments.push(y);

                if(y < center2Y){
                    y += connector;
                    segments.push(y);
                }
            }
            //---

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
                center2Y: center2Y,

                beg_connector_segments: beg_connector_segments,
                end_connector_segments: end_connector_segments,
                beg: beg,
                end1: end,

                segments: segments,
                axis:'black',
                'row': k,
                'channel': channel,
                'firstSegment': beg
            }
        }
    }
})();
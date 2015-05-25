/**
 * Created by divraj on 5/24/15.
 */

var links = new Map();
var connectors = new Map();
var bends = new Map();


var segment_color = (function(){
    var segments = {};
    var key, value;

    return function(){
        segments.set_color = function(axis, row, channel, firstSegment, segments, dataValue, color){
                for(var i=0; i<segments.length; i++){
                    key = axis + row.toString() + channel.toString() + segments[i].toString();
                    if(links.has(key)){
                        if(links.get(key).value < dataValue){
                            value = {
                                value: dataValue,
                                color: color
                            };
                            links.set(key, value);
                        }
                    }
                    else{
                        value = {
                            value: dataValue,
                            color: color
                        };
                        links.set(key, value);
                    }
                }

                return links;
        };

        segments.set_connector_color = function(pos, dataValue, linkColor){

            for(var i=0; i<pos.beg_connector_segments.length; i++){
                key = pos.axis + pos.row.toString() + pos.beg.toString() + i.toString();
                if(connectors.has(key)){
                    if(connectors.get(key).value < dataValue){
                        value = {
                            value: dataValue,
                            color: linkColor
                        };
                        connectors.set(key, value);
                    }
                }
                else{
                    value = {
                        value: dataValue,
                        color: linkColor
                    };
                    connectors.set(key, value);
                }
            }

            for(var i=0; i<pos.end_connector_segments.length; i++){
                key = pos.axis + pos.row.toString() + pos.end1.toString() + i.toString();
                if(connectors.has(key)){
                    if(connectors.get(key).value < dataValue){
                        value = {
                            value: dataValue,
                            color: linkColor
                        };
                        connectors.set(key, value);
                    }
                }
                else{
                    value = {
                        value: dataValue,
                        color: linkColor
                    };
                    connectors.set(key, value);
                }
            }

            return connectors;
        };

        segments.set_bend_color = function(pos, dataValue, linkColor, side){
            key = pos.axis + pos.row.toString() + side + pos.channel.toString();
            if(bends.has(key)){
                if(bends.get(key).value < dataValue){
                    value = {
                        value: dataValue,
                        color: linkColor
                    };
                    bends.set(key, value);
                }
            }
            else{
                value = {
                    value: dataValue,
                    color: linkColor
                };
                bends.set(key, value);
            }

            return bends;
        };
        segments.reset = function(){
            links = new Map();
            connectors = new Map();
            bends = new Map();
        };


        return segments;
    }
})();
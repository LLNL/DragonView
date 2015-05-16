/**
 * Created by Divya on 4/14/2015.
 */

var linkMatrixElement = (function linkMatrixElement(d){
    return function(d){

        return element = {
            "id": null,
            "seg": false,
            "right": false,
            "left": false,
            "color": null};
    }
})();

var getLinkMatrix = (function (){
    return function(color){
        if(color == 'green'){
            return createLinkMatrix(6, 16);
        }
        else{
            return createLinkMatrix(16, 6);
        }
    }
})();

var createLinkMatrix =(function createLinkMatrix(){
    return function(levelCount, channelCount){

        var linkMat = new Array();
        for(var k=0; k<levelCount; k++){
            var row = new Array();

            for(var i=0; i<channelCount; i++){
                var channel = new Array();

                for(var j=0; j<channelCount; j++){
                    channel.push(linkMatrixElement());
                }
                row.push(channel);
            }
            linkMat.push(row);
        }
        return linkMat;
    }
})();

var populateLinkMatrix = (function populateLinkMatrix(){

    return function(matrix, data){
        var source, target;

        data.forEach(function(d){
            source = d.srcId;
            target = d.destId;

            if(source.r == target.r){
                matrix[source.r][source.c][source.c].id = d.id;
                matrix[source.r][source.c][source.c].seg = true;
                matrix[source.r][source.c][source.c].right = true;
                matrix[source.r][source.c][source.c].color = d.vis_color;

                matrix[source.r][source.c][target.c].id = d.id;
                matrix[source.r][source.c][target.c].seg = true;
                matrix[source.r][source.c][target.c].left = true;
                matrix[source.r][source.c][target.c].color = d.vis_color;
            }
            else if(source.c == target.c){
                matrix[source.c][source.r][source.r].id = d.id;
                matrix[source.c][source.r][source.r].seg = true;
                matrix[source.c][source.r][source.r].right = true;
                matrix[source.c][source.r][source.r].color = d.vis_color;

                matrix[source.c][source.r][target.r].id = d.id;
                matrix[source.c][source.r][target.r].seg = true;
                matrix[source.c][source.r][target.r].left = true;
                matrix[source.c][source.r][target.r].color = d.vis_color;
            }
        });
        return matrix;

    }
})();
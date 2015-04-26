/**
 * Created by Divya on 4/14/2015.
 */


var linkMatrixElement = (function linkMatrixElement(d){
    return function(d){
        return element = {
            "seg": false,
            "right": false,
            "left": false};
    }
})();

var createLinkMatrix =(function createLinkMatrix(){
    return function(d){
        var linkMat = new Array();
        for(var k=0; k<6; k++){
            var row = new Array();

            for(var i=0; i<16; i++){
                var channel = new Array();

                for(var j=0; j<16; j++){
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
                matrix[source.r][source.c][source.c].seg = true;
                matrix[source.r][source.c][source.c].right = true;

                matrix[source.r][source.c][target.c].seg = true;
                matrix[source.r][source.c][target.c].left = true;
                console.log('true');
            }
        })
        return matrix;

    }
})();
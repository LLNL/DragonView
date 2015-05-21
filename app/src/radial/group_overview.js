/**
 * Created by divraj on 5/4/15.
 */

define(function(require){

    var d3 = require('d3');

    var naive_layout = require('grid/naive_link_layout');
    var condensed_layout = require('grid/condensed_link_layout');
    var reduced_layout = require('grid/reduced_link_layout');
    var param = require('grid/parameters');
    var linkPosition = require('grid/linkPosition');

    return function(){
        var selectedGroupId, selectedGroup;
        var gLinks, kLinks;
        var greenLinks, blackLinks;
        var greenPaths, blackPaths;
        var showGreen=true, showBlack=true;
        var linkMatrix;

        var algorithms = ['Naive', 'Condensed', 'Reduced'];
        var selectedAlgo = algorithms[2];

        var link = {id: 'green', id:'black'};
        var expandOverview = false;

        var WIDTH = ((params.xMargin*2)+(params.radius*2*16)+(params.xFactor*15));
        var HEIGHT = ((params.yMargin+10)+(params.radius*2*6)+(params.yFactor*5));

        var drag = d3.behavior.drag()
            .origin(function(d){
                return {x: 0, y: 0}
            })
            .on('dragstart', function(){
                d3.event.sourceEvent.stopPropagation();
            })
            .on('drag', function(){
                xPosition = parseInt(view.style('left'), 10) + d3.event.x;
                yPosition = parseInt(view.style('top'), 10) + d3.event.y;

                view.style("left", xPosition+"px")
                    .style("top", yPosition+"px");
            });

        var view = d3.select('.group-overview');

        var controls = view.select('#tab-controls')
            .call(drag);

        var resize_icon = controls.select('#resize')
            .on('click', function(){
                if(!expandOverview){
                    console.log('view enlarged');

                    params.xMargin = 100;
                    params.yMargin = 107;
                    params.xFactor = 50;
                    params.yFactor = 100;
                    params.channelGap = 6;
                    params.linkBuf = 4;
                    params.controlBuf = 3;
                }
                else{
                    console.log('view compressed');

                    params.xMargin = 70;
                    params.yMargin = 75;
                    params.xFactor = 35;
                    params.yFactor = 70;
                    params.channelGap = 4;
                    params.linkBuf = 3;
                    params.controlBuf = 2;
                }
                resize();
                expandOverview = !expandOverview;
            });

        var link_control = controls.select('#link-control')
            .selectAll('g')
            .data(['Green', 'Black'])
            .enter()
            .append('g');

        link_control.insert('input')
            .attr('type', 'checkbox')
            .attr('class', 'link-color')
            .attr('value', function(d){ return d;})
            .property('checked', function(d, i) {  d3.selectAll('input').property('checked', true); })
            .on('change', function(){
                if(this.value == 'Green'){
                    showGreen = !showGreen;
                    if(!showGreen){
                        svg.select('.greenLinks').remove();
                        svg.select('.greenArcs').remove();
                    }
                    else if(showGreen){
                        showGreenLinks();
                    }
                }
                else if(this.value == 'Black'){
                    showBlack = !showBlack;
                    if(!showBlack){
                        svg.select('.blackLinks').remove();
                        svg.select('.blackArcs').remove();
                    }
                    else if(showBlack){
                        showBlackLinks();
                    }
                }
            });

        link_control.append('label')
            .text(function(d){ return d;});

        var algo_control = controls.select('#layout-control')
            .selectAll('g')
            .data(algorithms)
            .enter()
            .append('g');

        algo_control.append('input')
            .attr('type', 'radio')
            .attr('value', function(d, i){ return d;})
            .attr('name', 'algorithm-type')
            .property('checked', function(d, i){ return i === 2;})
            .on('change', function(){
                if(this.value == algorithms[0]){
                    selectedAlgo = algorithms[0];
                }
                else if(this.value == algorithms[1]){
                    selectedAlgo = algorithms[1];
                }
                else if(this.value == algorithms[2]){
                    selectedAlgo = algorithms[2];
                }
                addLinks();
            });

        algo_control.append('label')
            .text(function(d){ return d;});


        var svg = view.select('#tab-overview')
            .append('svg')
            .attr('class', 'svg')
            .attr('width', WIDTH + 'px')
            .attr('height', HEIGHT +'px');

        svg.append('g')
            .attr('class', 'nodes');

        function mousever(){
            id = this.id;
            svg.selectAll("#"+id)
                .attr('stroke', 'black')
                .attr('stroke-opacity', '1');
        }

        function mouseout(){
            id = this.id;
            svg.selectAll("#"+id)
                .attr('stroke',function(d){ return d.color;});
        }

        function resize(){
            view.select('svg').remove();

            WIDTH = ((params.xMargin*2)+(params.radius*2*16)+(params.xFactor*15));
            HEIGHT = ((params.yMargin+10)+(params.radius*2*6)+(params.yFactor*5));

            svg = view.select('#tab-overview')
                .append('svg')
                .attr('class', 'svg')
                .attr('width', WIDTH + 'px')
                .attr('height', HEIGHT +'px');
            svg.append('g')
                .attr('class', 'nodes');

            addRouters();
            addLinks();
        }

        function filter(){
            greenLinks = [];
            blackLinks = [];

            for(var i in gLinks){
                if(gLinks[i].destId.g == selectedGroupId){
                    greenLinks.push(gLinks[i]);
                }
            }

            for(var i in kLinks){
                if(kLinks[i].destId.g == selectedGroupId){
                    blackLinks.push(kLinks[i]);
                }
            }
        }

        function addRouters(){
            var rows = svg.select('.nodes')
                .selectAll(".rows")
                .data(selectedGroup.routers)
                .enter()
                .append("svg:g");

            var routers = rows.selectAll(".nodes")
                .data(function(d){return d;})
                .enter()
                .append("circle")
                .attr('cx', function(d){return (params.xMargin+(((d.c*2)+1)*params.radius)+((d.c)*params.xFactor));})
                .attr('cy', function(d){return (params.yMargin+(((d.r*2)+1)*params.radius)+((d.r)*params.yFactor));})
                .attr('r', params.radius);
        }

        function addLinks(){
            if(showGreen){
                addGreenLinks();
            }
            if(showBlack){
                addBlackLinks();
            }
        }

        function addGreenLinks(){

            linkMatrix = getLinkMatrix('green');
            linkMatrix = populateLinkMatrix(linkMatrix, greenLinks);

            if(selectedAlgo == algorithms[0]){
                greenPaths = createNaiveLinks('green', linkMatrix);
            }
            else if(selectedAlgo == algorithms[1]){
                greenPaths = createCondensedLinks('green', linkMatrix);
            }
            else{
                greenPaths = createReducedLinks('green', linkMatrix);
            }

            showGreenLinks();
        }

        function addBlackLinks(){

            linkMatrix = getLinkMatrix('black');
            linkMatrix = populateLinkMatrix(linkMatrix, blackLinks);

            if(selectedAlgo == algorithms[0]){
                blackPaths = createNaiveLinks('black', linkMatrix);
            }
            else if(selectedAlgo == algorithms[1]){
                blackPaths = createCondensedLinks('black', linkMatrix);
            }
            else{
                blackPaths = createReducedLinks('black', linkMatrix);
            }

            showBlackLinks();
        }

        function showGreenLinks(){
            var links = greenPaths.links;
            var arcs = greenPaths.arcs;

            svg.select('.greenLinks').remove();

            svg.append('g')
                .attr('class', 'greenLinks');


            var d3Links = svg.select('.greenLinks')
                .selectAll('links')
                .data(links)
                .enter()
                .append('line')
                .attr('class', 'greenLink')
                .attr('id', function(d){ return d.id})
                .attr("x1", function(d){ return d.source.x})
                .attr("y1", function(d){ return d.source.y})
                .attr("x2", function(d){ return d.target.x})
                .attr("y2", function(d){ return d.target.y})
                .attr('stroke', function(d){return d.color;})
                .on('mouseover', mousever)
                .on('mouseout', mouseout);

            var arc = d3.svg.arc()
                .startAngle(function(d){return d.startAngle*(Math.PI/180);})
                .endAngle(function(d){return d.endAngle*(Math.PI/180);})
                .innerRadius(function(){return params.channelGap-0.5;})
                .outerRadius(function(){return  params.channelGap+0.5;});

            var d3Arcs = svg.select('.greenLinks')
                .selectAll('Arc')
                .data(arcs)
                .enter()
                .append('path')
                .attr('class', 'greenLink')
                .attr('id', function(d){ return d.id})
                .attr('d', arc)
                .attr('fill', function(d){return d.color})
                .attr("transform", function(d){
                    return "translate("+ d.center.x+","+ d.center.y+")"; });
        }

        function showBlackLinks(){
            var links = blackPaths.links;
            var arcs = blackPaths.arcs;

            svg.select('.blackLinks').remove();

            svg.append('g')
                .attr('class', 'blackLinks');

            var d3Links = svg.select('.blackLinks')
                .selectAll('links')
                .data(links)
                .enter()
                .append('line')
                .attr('class', 'blackLink')
                .attr('id', function(d){ return d.id})
                .attr("x1", function(d){ return d.source.x})
                .attr("y1", function(d){ return d.source.y})
                .attr("x2", function(d){ return d.target.x})
                .attr("y2", function(d){ return d.target.y})
                .attr('stroke', function(d){return d.color;})
                .on('mouseover', mousever)
                .on('mouseout', mouseout);

            var arc = d3.svg.arc()
                .startAngle(function(d){return d.startAngle*(Math.PI/180);})
                .endAngle(function(d){return d.endAngle*(Math.PI/180);})
                .innerRadius(function(){return params.channelGap-0.5;})
                .outerRadius(function(){return  params.channelGap+0.5;});

            var d3Arcs = svg.select('.blackLinks')
                .selectAll('Arc')
                .data(arcs)
                .enter()
                .append('path')
                .attr('class', 'blackLink')
                .attr('id', function(d){ return d.id})
                .attr('d', arc)
                .attr('fill', function(d){return d.color;})
                .attr("transform", function(d){
                    return "translate("+ d.center.x+","+ d.center.y+")"; });
        }

        var api = {};

        api.selectGroup = function(group){
            selectedGroup = group;
            selectedGroupId = group.id;
        };
        var xPos, yPos;

        api.showView = function(){

            if(d3.select('.group-overview').style('top') == 'auto'){
                console.log('auto');
                xPos = d3.event.pageX-5;
                yPos = d3.event.pageY-5;
            }
            else{
                console.log('make sure it is inside the view');
                x = parseInt(d3.select('.group-overview').style('left'), 10);
                y = parseInt(d3.select('.group-overview').style('top'), 10);

                if(x < 0 || y < 0 || x + WIDTH > window.innerWidth || y + HEIGHT > window.innerHeight){
                    console.log('condition true');
                    xPos = d3.event.pageX-5;
                    yPos = d3.event.pageY-5;
                }
            }

            if(xPos + WIDTH > window.innerWidth){
            console.log('condition 1');
                xPos = d3.event.pageX - WIDTH;
                if(xPos < 0){
                    xPos = 0;
                }
            }

            if(yPos + HEIGHT + 50 > window.innerHeight){
                console.log('condition 2');
                yPos = d3.event.pageY - HEIGHT - 50;
                if(yPos < 0){
                    yPos = 0;
                }
            }

            d3.select(".group-overview")
                .style('position', 'absolute')
                .style('left', (xPos) + "px")
                .style('top', (yPos) + "px")
                .style('display', 'block');

            addRouters();
        };

        api.hideView = function(){
            d3.select(".group-overview")
                .style("display", "none");
        };

        api.link = function(green, black){
            gLinks = green;
            kLinks = black;

            api.renderLinks();
        };

        api.renderLinks = function(){
            filter();
            addLinks();
        };

        return api;
    };
});
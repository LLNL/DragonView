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

        var link = {id: 'green', id:'black'};

        var WIDTH = ((params.xMargin*2)+(params.radius*2*16)+(params.xFactor*15));
        var HEIGHT = ((params.yMargin+10)+(params.radius*2*6)+(params.yFactor*5));


        var view = d3.select('body')
            .append('g')
            .attr('class', 'grid-overview')
            .style('class', 'none');


        var link_control = view.append('div')
            .attr('class', 'link-ctrl')
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

        var drag = d3.behavior.drag()
            //.origin(function(d){
            //    console.log('in origin');
            //    //return d
            //
            //    var t = d3.select(this);
            //    return {x: t.attr("x"), y: t.attr("y")};
            //
            //})
            .on('dragstart', function(){
                console.log('dragging started');
                d3.event.preventDefault();
                d3.event.stopPropagation();
            })
            .on('drag', function(){
                console.log("dragging");

                console.log(d3.event.x, d3.event.y, d3.event.dx, d3.event.dy);

                view.style("left", d3.event.x+"px")
                    .style("top", d3.event.y+"px");

                //view.attr("transform", "translate(" + d3.event.x + "," + d3.event.y + ")");
            });

        var svg = view.append('svg')
            .attr('class', 'svg')
            .attr('width', WIDTH + 'px')
            .attr('height', HEIGHT +'px')
            .style('cursor', 'move')
            //.call(drag);
            .on('drag', function(){
                console.log("dragging");

                d3.event.preventDefault();
                d3.event.stopPropagation();
                view.style("left", d3.event.pageX+"px").style("top", d3.event.pageY+"px");
            })
            .on('dragend', function(){
                console.log("dragend")
                view.style("left", d3.event.pageX+"px").style("top", d3.event.pageY+"px");
            });


        svg.append('g')
            .attr('class', 'nodes');


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

        function addGreenLinks(){

            linkMatrix = getLinkMatrix('green');
            linkMatrix = populateLinkMatrix(linkMatrix, greenLinks);

            //apply link algorithm
            //greenLinkPaths = createReducedLinks('green', linkMatrix);
            greenPaths = createCondensedLinks('green', linkMatrix);
            //greenLinkPaths = createNaiveLinks('green', linkMatrix);


            addLinks('green');
        }

        function addBlackLinks(){

            linkMatrix = getLinkMatrix('black');
            linkMatrix = populateLinkMatrix(linkMatrix, blackLinks);

            //apply link algorithm
            //blackLinkPaths = createReducedLinks('black', linkMatrix);
            blackPaths = createCondensedLinks('black', linkMatrix);
            //blackLinkPaths = createNaiveLinks('black', linkMatrix);


            addLinks('black');
        }

        function addLinks(color){
            if(color == 'green'){
                showGreenLinks();
            }
            else if(color == 'black'){
                showBlackLinks();
            }
        }

        function showGreenLinks(){
            var links = greenPaths.links;
            var arcs = greenPaths.arcs;

            svg.select('.greenLinks').remove();
            svg.select('.greenArcs').remove();

            svg.append('g')
                .attr('class', 'greenLinks');

            svg.append('g')
                .attr('class', 'greenArcs');

            var d3Links = svg.select('.greenLinks')
                .selectAll('links')
                .data(links)
                .enter()
                .append('line')
                .attr("x1", function(d){ return d.source.x})
                .attr("y1", function(d){ return d.source.y})
                .attr("x2", function(d){ return d.target.x})
                .attr("y2", function(d){ return d.target.y})
                .attr('stroke', function(d){return d.color;});

            var arc = d3.svg.arc()
                .startAngle(function(d){return d.startAngle*(Math.PI/180);})
                .endAngle(function(d){return d.endAngle*(Math.PI/180);})
                .innerRadius(function(){return params.channelGap-0.5;})
                .outerRadius(function(){return  params.channelGap+0.5;});

            var d3Arcs = svg.select('.greenArcs')
                .selectAll('Arc')
                .data(arcs)
                .enter()
                .append('path')
                .attr('d', arc)
                .attr('fill', function(d){return d.color})
                .attr("transform", function(d){
                    return "translate("+ d.center.x+","+ d.center.y+")"; });
        }

        function showBlackLinks(){
            var links = blackPaths.links;
            var arcs = blackPaths.arcs;

            svg.select('.blackLinks').remove();
            svg.select('.blackArcs').remove();

            svg.append('g')
                .attr('class', 'blackLinks');

            svg.append('g')
                .attr('class', 'blackArcs');

            var d3Links = svg.select('.blackLinks')
                .selectAll('links')
                .data(links)
                .enter()
                .append('line')
                .attr("x1", function(d){ return d.source.x})
                .attr("y1", function(d){ return d.source.y})
                .attr("x2", function(d){ return d.target.x})
                .attr("y2", function(d){ return d.target.y})
                .attr('stroke', function(d){return d.color;});

            var arc = d3.svg.arc()
                .startAngle(function(d){return d.startAngle*(Math.PI/180);})
                .endAngle(function(d){return d.endAngle*(Math.PI/180);})
                .innerRadius(function(){return params.channelGap-0.5;})
                .outerRadius(function(){return  params.channelGap+0.5;});

            var d3Arcs = svg.select('.blackArcs')
                .selectAll('Arc')
                .data(arcs)
                .enter()
                .append('path')
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

        api.showView = function(){
            d3.select(".grid-overview")
                .style('position', 'absolute')
                .style('left', (d3.event.pageX-5) + "px")
                .style('top', (d3.event.pageY-5) + "px")
                .style('display', 'block');

            addRouters();
        };

        api.hideView = function(){
            d3.select(".grid-overview")
                .style("display", "none");
        };

        api.link = function(green, black){
            gLinks = green;
            kLinks = black;

            api.renderLinks();
        };

        api.renderLinks = function(){
            filter();
            if(showGreen){
                addGreenLinks();
            }
            if(showBlack){
                addBlackLinks();
            }
        };

        return api;
    };

});
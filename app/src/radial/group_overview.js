/**
 * Created by divraj on 5/4/15.
 */

define(function(require){

    var d3 = require('d3');
    var naive_layout = require('grid/naive_link_layout');
    var condensed_layout = require('grid/condensed_link_layout');
    var reduced_layout = require('grid/reduced_link_layout');
    var param = require('grid/parameters');

    return function(){
        var selectedGroupId, selectedGroup;
        var gLinks, kLinks;
        var greenLinks, blackLinks;
        var linkMatrix;

        var WIDTH = ((params.xMargin*2)+(params.radius*2*16)+(params.xFactor*15));
        var HEIGHT = ((params.yMargin+10)+(params.radius*2*6)+(params.yFactor*5));


        var view = d3.select('body')
            .append('g')
            .attr('id', 'grid-view_new')
            .attr('class', 'grid-view')
            .style('class', 'none');

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

                //d3.event.preventDefault();
                //d3.event.stopPropagation();
            });

        var svg = view.append('svg')
            .attr('class', 'svg')
            .attr('width', WIDTH + 'px')
            .attr('height', HEIGHT +'px')
            .style('cursor', 'move')
            .call(drag);



        svg.append('rect')
            .attr('class', 'background')
            .attr('rx', 10)
            .attr('ry', 10)
            .attr('width', WIDTH + 'px')
            .attr('height', HEIGHT +'px')
            .attr('fill', 'none');

        svg.append('g')
            .attr('class', 'nodes');

        svg.append('g')
            .attr('class', 'greenLinks');

        svg.append('g')
            .attr('class', 'greenArcs');

        svg.append('g')
            .attr('class', 'blackLinks');

        svg.append('g')
            .attr('class', 'blackArcs');



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
            //greenLinkPaths = createCondensedLinks('green', linkMatrix);
            greenLinkPaths = createNaiveLinks('green', linkMatrix);


            addLinks('green', greenLinkPaths);
        }

        function addBlackLinks(){

            linkMatrix = getLinkMatrix('black');
            linkMatrix = populateLinkMatrix(linkMatrix, blackLinks);

            //apply link algorithm
            //blackLinkPaths = createReducedLinks('black', linkMatrix);
            //blackLinkPaths = createCondensedLinks('black', linkMatrix);
            blackLinkPaths = createNaiveLinks('black', linkMatrix);


            addLinks('black', blackLinkPaths);
        }

        function blackLinks(){

        }

        function addLinks(color, path){
            if(color == 'green'){
                showGreenLinks(path);
            }
            else if(color == 'black'){
                showBlackLinks(path);
            }
        }

        function showGreenLinks(path){
            var links = path.links;
            var arcs = path.arcs;

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
                .attr("x1", function(d){
                    console.log("d ---", d);
                    return d.source.x})
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
                .attr('stroke', function(d){return d.color;})
                .attr("transform", function(d){
                    return "translate("+ d.center.x+","+ d.center.y+")"; });
        }

        function showBlackLinks(paths){
            var links = paths.links;
            var arcs = paths.arcs;

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
                .attr('stroke', function(d){return d.color;})
                .attr("transform", function(d){
                    return "translate("+ d.center.x+","+ d.center.y+")"; });
        }


        var api = {};

        api.selectGroup = function(group){
            selectedGroup = group;
            selectedGroupId = group.id;
        };

        api.showView = function(){
            d3.select(".grid-view")
                .style('position', 'absolute')
                .style('left', (d3.event.pageX-5) + "px")
                .style('top', (d3.event.pageY-5) + "px")
                .style('display', 'block');

            svg.select('rect')
                .attr('fill', 'gray')
                .attr('opacity', '0.3')
                .attr('stroke', 'black')
                .attr('stroke-width', '1');

            addRouters();


        };

        api.hideView = function(){
            d3.select(".grid-view")
                .style("display", "none");
        };

        api.link = function(green, black){
            gLinks = green;
            kLinks = black;

            api.renderLinks();
        };

        api.renderLinks = function(){
            filter();
            addGreenLinks();
            addBlackLinks();
        };

        return api;
    };

});
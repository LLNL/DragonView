/**
* Created by divraj on 4/22/15.
*/
//var params = {xMargin: 20,
//    yMargin: 60,
//
//    xFactor: 35,
//    yFactor: 70,
//    radius: 2,
//
//    channelGap: 3,
//    linkBuf: 3,
//    controlBuf: 2};

var d3, svg;
var _data;
var links, linksInGroup, greenLinks, blackLinks;
var group, groupId;
var linkMatrix;
var active;

define(function(require){

   var config = require('config'),
       Radio = require('radio'),
       link_matrix = require('grid/link_matrix'),
       reduced_link_layout= require('grid/reduced_link_layout'),
       condensed_link_layout= require('grid/condensed_link_layout'),
       naive_link_layout = require('grid/naive_link_layout');

    d3 = require('d3');

    return function(){
        Radio.channel('data').on('run', function(data){ _data = data; });
        //Radio.channel('counter').on('change', function(){ addViewComponents(); });


        var view_width = ((params.xMargin*2)+(params.radius*2*16)+(params.xFactor*15));
        var view_height = ((params.yMargin+10)+(params.radius*2*6)+(params.yFactor*5));

        var view = d3.select('body')
            //.select('.views.tabs')
            //.select('.tab-content')
            //.select('.radial')
            //.select('svg')
            .append('g')
            .attr('id', 'grid-view')
            .attr('class', 'grid-view')
            .style('class', 'none');

        //var drag = d3.behavior.drag()
        //    .origin(function(){
        //        var t = d3.select(this);
        //        //return {x: t.attr("x"), y: t.attr("y")};
        //        //console.log('origin: ', t.attr("x"), t.attr("y"))
        //
        //        var x = document.getElementById('gid-view').getBoundingClientRect();
        //        console.log('origin-----------------------------');
        //        console.log(x.left, x.top);
        //        return {x: 500, y: 600};
        //    })
        //    .on('drag', function(d){
        //        console.log(d3.event.x, d3.event.y)
        //        view.style("left", d3.event.x+"px").style("top", d3.event.y+"px");
        //    })
        //    //.on('dragstart', function(){
        //    //    console.log('drag start');
        //    //})
        //    //.on('dragend', function(){
        //    //    console.log('drag end');
        //    //});

        svg = view.append('svg')
            .attr('width', view_width + 'px')
            .attr('height', view_height +'px')
            .style('cursor', 'move')
            //.call(drag);
            //.origin(function(){
            //    return {x: view.getBoundingClientRect().left, y: view.getBoundingClientRect().top};
            //})
            .on('drag', function(){
                console.log("dragging");

                d3.event.preventDefault();
                d3.event.stopPropagation();
                view.style("left", d3.event.pageX+"px").style("top", d3.event.pageY+"px");
            })
            .on('dragend', function(){
                console.log("dragend")
                //view.style("left", d3.event.pageX+"px").style("top", d3.event.pageY+"px");
            });

        svg.append('rect')
            .attr('class', 'background')
            .attr('rx', 10)
            .attr('ry', 10)
            .attr('width', view_width + 'px')
            .attr('height', view_height +'px')
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
    };
});

//function setSelectedGroup(d){
//    group = d;
//    //if(active) \\
//    showGrid()
//}

function showGrid(d) {

    groupId = d.id;
    group = d;

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


    addViewComponents();
}

function hideGrid(require){
    console.log("hide grid");

    d3.select(".grid-view")
        .style("display", "none");
}

function addViewComponents(){
    addRouters();

    addGreenLinks();

    addBlackLinks();

}

function addRouters(){
    var rows = svg.select('.nodes')
        .selectAll(".rows")
        .data(group.routers)
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
    links = _data.greens;
    linksInGroup = getLinksInGroup(links);
    console.log("number of green links", linksInGroup.length);

    //create link matrix
    linkMatrix = getLinkMatrix('green');

    //populate link martix
    linkMatrix = populateLinkMatrix(linkMatrix, linksInGroup);

    //apply link algorithm
    //greenLinks = createReducedLinks('green', linkMatrix);
    //greenLinks = createCondensedLinks('green', linkMatrix);
    greenLinks = createNaiveLinks('green', linkMatrix);



    //show the link
    addLinks('green', greenLinks);
}

function addBlackLinks(){
    links = _data.blacks;
    linksInGroup = getLinksInGroup(links);
    console.log("number of black links", linksInGroup.length);

    //create link matrix
    linkMatrix = getLinkMatrix('black');

    //populate link martix
    linkMatrix = populateLinkMatrix(linkMatrix, linksInGroup);

    //apply link algorithm
    //blackLinks = createReducedLinks('black', linkMatrix);
    //blackLinks = createCondensedLinks('black', linkMatrix);
    blackLinks = createNaiveLinks('black', linkMatrix);



    //show the link
    addLinks('black', blackLinks);
}

function getLinksInGroup(links){
    var linksInGroup = [];
    for(var i=0; i<links.length; i++){
        if(links[i].srcId.g==groupId){
            linksInGroup.push(links[i]);
        }
    }
    return linksInGroup;
}

function addLinks(color, paths){
    if(color == 'green'){
        showGreenLinks(paths);
    }
    else if(color == 'black'){
        showBlackLinks(paths);
    }
}

function showGreenLinks(paths){
    var links = paths.links;
    var arcs = paths.arcs;

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
        .attr("y2", function(d){ return d.target.y});

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
        .attr("y2", function(d){ return d.target.y});

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
        .attr("transform", function(d){
            return "translate("+ d.center.x+","+ d.center.y+")"; });
}
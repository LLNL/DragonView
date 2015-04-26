/**
 * Created by divraj on 4/22/15.
 */
var params = {xMargin: 20,
    yMargin: 60,

    xFactor: 35,
    yFactor: 70,
    radius: 2,

    channelGap: 3,
    linkBuf: 3,
    controlBuf: 2};

var d3, svg;
var _data;
var links, linksInGroup, greenLinks;
var groupId;
var linkMatrix;

define(function(require){

   var config = require('config'),
       Radio = require('radio'),
       link_matrix = require('grid/link_matrix'),
       reduced_link_layout= require('grid/reduced_link_layout');
    d3 = require('d3');

    return function(){
        Radio.channel('data').on('run', function(data){ _data = data; });

        var view = d3.select('body').append('div')
            .attr('class', 'grid-view')
            .style('class', 'none');

        svg =  view.append('svg')
                .attr('width', ((params.xMargin*2)+(params.radius*2*16)+(params.xFactor*15))+ 'px')
                .attr('height', ((params.yMargin+10)+(params.radius*2*6)+(params.yFactor*5))+'px')
            .on('mouseover', function(){
                view.style('cursor', 'move');
            })
            .on('drag', function(){
                console.log("dragging");

                d3.event.preventDefault();
                d3.event.stopPropagation();
                view.style("left", d3.event.pageX+"px").style("top", d3.event.pageY+"px");
            })
            .on('dragend', function(){
                console.log("dragend")
                view.style("left", d3.event.pageX+"px").style("top", d3.event.pageY+"px");
                d3.select(this).classed("dragging", false);
            });

        svg.append('rect')
            .attr('rx', 6)
            .attr('ry', 6)
            .attr('width', ((params.xMargin*2)+(params.radius*2*16)+(params.xFactor*15))+ 'px')
            .attr('height', ((params.yMargin+10)+(params.radius*2*6)+(params.yFactor*5))+'px')
            .attr('fill', 'none');

        svg.append('g')
            .attr('class', 'routers');

        svg.append('g')
            .attr('class', 'greenLinks');

        svg.append('g')
            .attr('class', 'greenArcs');
    };
});

function showGrid(d) {
    console.log("show grid ");
    groupId = d.id;

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

    var rows = svg.select('.routers')
        .selectAll(".rows")
        .data(d.routers)
        .enter()
        .append("svg:g");

    var routers = rows.selectAll(".nodes")
        .data(function(d){return d;})
        .enter()
        .append("circle")
        .attr('cx', function(d){return (params.xMargin+(((d.c*2)+1)*params.radius)+((d.c)*params.xFactor));})
        .attr('cy', function(d){return (params.yMargin+(((d.r*2)+1)*params.radius)+((d.r)*params.yFactor));})
        .attr('r', params.radius)
        .attr('stroke', 'red')
        .attr('stroke-width', 1)
        .attr('fill', 'red');

    showGreenLinks();
}

function showGreenLinks(){
    links = _data.greens;

    //create link matrix
    linkMatrix = createLinkMatrix();
    linksInGroup = getLinksInGroup(links);
    console.log("number of links in this group", linksInGroup.length);

    //populate link martix
    linkMatrix = populateLinkMatrix(linkMatrix, linksInGroup);

    //apply link algorithm
    greenLinks = createReducedLinks();

    showLinks(greenLinks);
}

function getLinksInGroup(greenLinks){
    var linksInGroup = [];
    for(var i=0; i<greenLinks.length; i++){
        if(greenLinks[i].srcId.g==groupId){
            linksInGroup.push(greenLinks[i]);
        }
    }
    return linksInGroup;
}

function showLinks(greenLinks){

    var greenLink = greenLinks.links;
    var greenArc = greenLinks.arcs;


    svg.select('.greenLinks').remove();
    svg.select('.greenArcs').remove();

    var d3Links = svg.append('g')
        .attr('class', 'greenLinks');

    var d3Arcs = svg.append('g')
        .attr('class', 'greenArcs');

    d3Links.selectAll('link')
        .data(greenLink)
        .enter()
        .append('line')
        .attr("x1", function(d){ return d.source.x})
        .attr("y1", function(d){ return d.source.y})
        .attr("x2", function(d){ return d.target.x})
        .attr("y2", function(d){ return d.target.y})
        .attr("stroke-width", 1)
        .attr("stroke", "red");

    var arc = d3.svg.arc()
        .startAngle(function(d){return d.startAngle*(Math.PI/180);})
        .endAngle(function(d){return d.endAngle*(Math.PI/180);})
        .innerRadius(function(){return params.channelGap-0.5;})
        .outerRadius(function(){return  params.channelGap+0.5;});

    var d3arcs = svg.select('.greenArcs')
        .selectAll('Arc')
        .data(greenArc)
        .enter()
        .append('path')
        .attr('d', arc)
        .attr("transform", function(d){
            return "translate("+ d.center.x+","+ d.center.y+")"; })
        .attr('fill', 'red');
}

function hideGrid(require){
  console.log("hide grid");

    d3.select(".grid-view")
        .style("display", "none");

}
// jQuery tutorial: https://learn.jquery.com/using-jquery-core/jquery-object/

//https://stackoverflow.com/questions/3698200/window-onload-vs-document-ready


// jQuery:
// jQuery tutorial: https://learn.jquery.com/using-jquery-core/jquery-object/
// #: id
// .: class
// nothing: tag(h1, h2..)
//d3 tutorial: https://www.tutorialsteacher.com/d3js/dom-manipulation-using-d3js

var svg;

//Initialize graph dimension variables
var margin;
var viewWidth;
var viewHeight;
var width; //was 600
var height;
var innerRadius;
var outerRadius;
var left;
var bottom;

// To store temparary data
var data = []
var temp

//
var line = true;
var bar = false


//Wait until the dom object is ready before doing anything else;
$(document).ready(function () {
	setGraphDimension();
	createSVG();
	svg = 0;

	// Receive message from server.
	var socket = io()

	

	fetch('/today')
	.then(response => response.json()) //response.json() return a promise
	.then(json => makeGraph(json)) // "arrow function"


	socket.on('message', function (msg) {
		makeGraph(msg)
	});




	// Change graph:
	$('#lineGraph').click(function(e){
		$('pickGraphStyle').text('Line Graph');
		$.ajax({
			url:'/changeGraph',
			type: 'GET',
			success: function(response){
				makeLineGraph(response)
			}
		});
		line = true
		bar = false
	})
	$('#barGraph').click(function(e){
		$('pickGraphstyle').text('Bar Graph')
		$.ajax({
			url:'/changeGraph',
			type: 'GET',
			success: function(response){
				makeBarGraph(response)
			}
		});
		line = false
		bar = true
	})





	//Welcome message
	addTip("Welcome to ElecViz!", "welcomeTip");

	function makeGraph(data){
		if(line){
			makeLineGraph(data)
		}
		if(bar){
			makeBarGraph(data)
		}
	}

	function createSVG() {
		//Create an svg element that can be used to hold any graph type.
		svg = d3.select("#graph")
			.classed("svg-container", true) // Apply CSS rules
			.append("svg") // Append svg tag (<svg></svg>) which is like a canvas to paint on
			.attr("preserveAspectRatio", "xMinYMin meet")
			.attr("viewBox", `0 0 ${this.viewWidth} ${this.viewHeight}`)
			.classed("svg-content-responsive", true)
			.append("g") //g is used to group things together.
			.attr("width", width)
			.attr("height", height + margin.top + margin.bottom)
			.attr("transform", "translate(" + margin.left + "," + margin.top + ")");// https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/transform

	}

	function setGraphDimension(){
		//Specify graph dimensions
		margin = { top: 15, right: 30, bottom: 30, left: 90 };
		viewWidth = $('#graph').width();
		viewHeight = $('#graph').height() - 30;
		width = viewWidth - margin.left - margin.right; //was 600
		height = viewHeight - margin.top - margin.bottom - 30;
		innerRadius = 90;
		outerRadius = Math.min(width, height) / 2;
		left = 0;
		bottom = 0;
	}

	function makeLineGraph(data) {
		cleanSVG();

		var minutes = []
		// 24*60 = 1440
		for(var i = 0; i <= 1440; i++){
			minutes.push(i)
		}

		// Set up the x axis (date).
		var x = d3.scaleLinear()
			.domain([0, 23])   	//domain takes in [min, max] and specifies the range the graph shows
			.range([0, width]);

		var hours = []
		for(var i = 0; i <= 23; i++){
			hours.push(i)
		}
		console.log(hours)
		var xAxis = d3.axisBottom(x).tickValues(hours)

		svg.append("g")
			.attr("transform", "translate(0," + height + ")")
			.call(xAxis);

		// Set up the y axis (energy usage/cost).
		var y = d3.scaleLinear()
			.domain([0, d3.max(data, function (d) { return +d.value; })])
			.range([height, 0]);
		svg.append("g")
			.call(d3.axisLeft(y));

		// Set up labels:
		svg.append("text")
			.attr("transform", "translate(" + (width / 2) + " ," + (height + margin.top + 20) + ")")
			.style("text-anchor", "middle")
			.text("Time")
			.classed('graphText', true);


		svg.append("text")
			.attr("transform", "rotate(-90)")
			.attr("y", 0 - margin.left + 15) // y coordinate
			.attr("x", 0 - (height / 2)) // x coordinate
			.attr("dy", "3em")
			.style("text-anchor", "middle") // text-anchor: align the text
			.text("Energy Usage (kW/h)")
			.classed('graphText', true);// Match the CSS
		
		

		// Add the line and line styles
		svg.append("path")
			.datum(data)
			.attr("fill", "none")       //area under line
			.attr("stroke", "blue")     //line color
			.attr("stroke-width", 1.5)
			.attr("d", d3.line()
				.x(function (d) { return x(d.date) })
				.y(function (d) { return y(d.value) })
			).attr("class", "graphline"); 
	
	}
	
	function makeBarGraph(data) {
		cleanSVG();

		// Set up the x axis (date).
		var x = d3.scaleTime()
			.domain([data[0].date, data[data.length - 1].date])
			.range([0, width]);
		svg.append("g")
			.attr("transform", "translate(0," + height + ")")
			.call(d3.axisBottom(x));

		// Set up the y axis (energy usage/cost).
		var y = d3.scaleLinear()
			.domain([0, d3.max(data, function (d) { return +d.value; })])
			.range([height, 0]);
		svg.append("g")
			.call(d3.axisLeft(y));
	
		// Set up labels:
		svg.append("text")
			.attr("transform", "translate(" + (width / 2) + " ," + (height + margin.top + 20) + ")")
			.style("text-anchor", "middle")
			.text("Time")
			.classed('graphText', true);
	
		svg.append("text")
			.attr("transform", "rotate(-90)")
			.attr("y", 0 - margin.left + 15) // y coordinate
			.attr("x", 0 - (height / 2)) // x coordinate
			.attr("dy", "3em")
			.style("text-anchor", "middle") // text-anchor: align the text
			.text("Energy Usage (kW/h)")
			.classed('graphText', true);// Match the CSS

		// Add the bar and bar styles.
		svg.selectAll(".bar")
			.data(data)
			.enter().append("rect")
			.attr("class", "bar")
			.attr("x", function (d) { return x(d.date); })
			.attr("y", function (d) { return y(d.value); })
			.attr("width", width / data.length)
			.attr("height", function (d) { return height - y(d.value); });

	}

	function cleanSVG(){
		//Delete the three graph g objects created in the course of displaying a graph.
		for (i = 0; i < 3; i++) {
			elt = d3.select("#graph g")
		}
		//Delete the old graph svg object.
		elt = d3.select("#graph svg")
		elt.remove();

		//Create a new svg to display the graph in.
		createSVG();
	}

	//appends a <p> element with specified message and id to the tips bar. if same id as another element, replaces that element
	function addTip(text, tipid) {
		$('#' + tipid).remove();
		let tip = $('<p>', {
			class: 'tip',
			id: tipid,
			html: text
		}).appendTo( $('#tips') );
	}



});





	  
	  
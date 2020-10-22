var startDate;
var endDate;

//every time start date changes, update dateEntered value
$('#start').on("change", function () {
	var inputStart = this.value;
	if(inputStart != null){
		startDate = new Date(inputStart);
	}
	console.log(inputStart);
	console.log(startDate);
});

$('#end').on("change", function () {
	var inputEnd = this.value;
	if(inputEnd != null){
		endDate = new Date(inputEnd);
	}
	console.log(inputEnd);
	console.log(endDate);
});

$("#lineGraph").click(function(e){
	$("#pickGraphStyle").text("Line Graph");
});
$("#barGraph").click(function(e){
	$("#pickGraphStyle").text("Bar Graph");
});

//on submit, read data, set domain range, append graph
$("#submitButton").click(function () {

	if ($('#pickGraphStyle').text() == "Bar Graph"){
		makeBarGraph();
	} else {
		makeLineGraph();
	}
	
   
});
function makeLineGraph(){
	//get file and then create temporary url for d3 to read
	let fileURL = URL.createObjectURL($('#csvData').prop('files')[0]);

	//specify height and width
	var margin = { top: 10, right: 30, bottom: 30, left: 60 },
		width = 1200 - margin.left - margin.right, //was 600
		height = 400 - margin.top - margin.bottom;

	// append the svg object in #graph
	var svg = d3.select("#graph")
		.append("svg")
		.attr("width", width + margin.left + margin.right)
		.attr("height", height + margin.top + margin.bottom)
		.append("g")
		.attr("transform",
			"translate(" + margin.left + "," + margin.top + ")");

	//d3.csv(URL, function to format data, function to use data)
	d3.csv(fileURL,
		function (d) {
			/*
				need to use d['END TIME'] to select, because of the space
				d3.timeparse puts into a Date object that d3 can use to auto scale
				%H is on 24 hr time, %I is 12 hr
			*/
			return { test: d3.timeParse("%m/%d/%Y")(d.DATE), date: d3.timeParse("%m/%d/%Y-%H:%M")(d.DATE + "-" + d['END TIME']), value: d.USAGE }
		},

		function (data) {

			//check for date input so that date is valid
			//extent(array) returns [min, max] 
			let minmax = d3.extent(data, function (d) { return d.date; }); 
			let min = minmax[0];
			let max = minmax[1];
			console.log(minmax);

			if (startDate == null || startDate < min || startDate > max) {
				startDate = min;
			}
			if (endDate == null || endDate < startDate || endDate < min || endDate > max) {
				endDate = max;
			}

			// x axis (date)
			var x = d3.scaleTime()
				.domain([startDate, endDate])  	//domain takes in [min, max] and specifies the range the graph shows
				.range([0, width]);
			svg.append("g")
				.attr("transform", "translate(0," + height + ")")
				.call(d3.axisBottom(x));

			// y axis
			var y = d3.scaleLinear()
				.domain([0, d3.max(data, function (d) { return +d.value; })])
				.range([height, 0]);
			svg.append("g")
				.call(d3.axisLeft(y));

				
			// line and line styles
			svg.append("path")
				.datum(data)
				.attr("fill", "none")       //area under line
				.attr("stroke", "blue")     //line color
				.attr("stroke-width", 1.5)
				.attr("d", d3.line()
					.defined(function(d) { 
						return d.date < endDate && d.date > startDate; 
					})
					.x(function (d) { return x(d.date) })
					.y(function (d) { return y(d.value) })
				).attr("class", "graphline")    // so we can css select .graphline for further styling

		});
}
function makeBarGraph(){
	let fileURL =  URL.createObjectURL($('#csvData').prop('files')[0]); //get file and then create temporary url for d3 to read

	var margin = { top: 10, right: 30, bottom: 30, left: 60 },
		width = 1000 - margin.left - margin.right,
		height = 400 - margin.top - margin.bottom;

	var svg = d3.select("#graph")
		.append("svg")
		.attr("width", width + margin.left + margin.right)
		.attr("height", height + margin.top + margin.bottom)
		.append("g")
		.attr("transform",
			"translate(" + margin.left + "," + margin.top + ")");

	d3.csv(fileURL,
		function(d) {
			return { date: d3.timeParse("%m/%d/%Y-%H:%M")(d.DATE + "-" + d['END TIME']), value: d.USAGE }
		},

		function(data) {
			var x = d3.scaleTime()
				.domain(d3.extent(data, function (d) { return d.date; }))
				.range([0, width]);
			svg.append("g")
				.attr("transform", "translate(0," + height + ")")
				.call(d3.axisBottom(x));

			var y = d3.scaleLinear()
				.domain([0, d3.max(data, function (d) { return +d.value; })])
				.range([height, 0]);
			svg.append("g")
				.call(d3.axisLeft(y));

			svg.selectAll(".bar")
				.data(data)
				.enter().append("rect")
				.attr("class", "bar")
				.attr("x", function(d) { return x(d.date); })
				.attr("y", function(d) { return y(d.value); })
				.attr("width", width/data.length)
				.attr("height", function(d) { return height - y(d.value); });

		});
}

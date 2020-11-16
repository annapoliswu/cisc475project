
var inputStartDate;
var inputEndDate;
var firstClick;
var svg;

//specify graph dimensions
var margin;
var viewWidth;
var viewHeight;
var width;
var height;
var innerRadius;
var outerRadius;
var left;
var bottom;

$( document ).ready(function() {

	firstClick = true;
	svg = 0;

	margin = { top: 15, right: 30, bottom: 30, left: 90 };
	viewWidth = $('#graph').width();
	viewHeight = $('#graph').height()-30;
	width = viewWidth - margin.left - margin.right; //was 600
	height = viewHeight - margin.top - margin.bottom - 30;
	innerRadius = 90;
	outerRadius = Math.min(width, height) / 2;
	left = 0;
	bottom = 0;

	
$('#navbar').load('./navbar.html');

//every time start date changes, update dateEntered value
$('#start').on("change", function () {
	var inputStart = this.value;
	if (inputStart != null) {
		inputStartDate = new Date(inputStart);
	}
	updateGraph();
});

$('#end').on("change", function () {
	var inputEnd = this.value;
	if (inputEnd != null) {
		inputEndDate = new Date(inputEnd);
	}
	updateGraph();
});

$("#lineGraph").click(function (e) {
	$("#pickGraphStyle").text("Line Graph");
	updateGraph();
});
$("#barGraph").click(function (e) {
	$("#pickGraphStyle").text("Bar Graph");
	updateGraph();
});
$("#radialPlot").click(function (e) {
	$("#pickGraphStyle").text("Radial Plot");
	updateGraph();
});
$("#fifteenMinutes").click(function (e) {
	$("#pickInfoSize").text("Fifteen Minutes");
	updateGraph();
});
$("#hour").click(function (e) {
	$("#pickInfoSize").text("One Hour");
	updateGraph();
});
$("#twelveHours").click(function (e) {
	$("#pickInfoSize").text("Twelve Hours");
	updateGraph();
});
$("#day").click(function (e) {
	$("#pickInfoSize").text("One Day");
	updateGraph();
});
$("#month").click(function (e) {
	$("#pickInfoSize").text("One Month");
	updateGraph();
});
$("#year").click(function (e) {
	$("#pickInfoSize").text("One Year");
	updateGraph();
});

//on submit, read data, set domain range, append graph
$("#submitButton").click(function () {updateGraph () });
function updateGraph () {
	if ($('#csvData').prop('files').length <= 0) {
		alert('Please enter a file');
	}else{
		
		$('#spinner').css('display','block');

		let fileURL = URL.createObjectURL($('#csvData').prop('files')[0]); //get file and then create temporary url for d3 to read

		if (firstClick) {
			createSVG();
			firstClick = false;
			//console.log(svg.html());
		} else {
			for (i = 0; i < 3; i++) {
				elt = d3.select("#graph g")
				//console.log(d3.select("#graph").html());
			}
			elt = d3.select("#graph svg")
			elt.remove();

			createSVG();
		}


		d3.csv(fileURL,
			function (d) {
				return { rawDate: d.DATE + "-" + d['START TIME'], date: d3.utcParse("%m/%d/%Y-%H:%M")(d.DATE + "-" + d['END TIME']), value: d.USAGE, cost: d.COST }
			},
			function (data) {

				let minmax = d3.extent(data, function (d) { return d.date; });
				let min = minmax[0];
				let max = minmax[1];
				let startDate;
				let endDate;

				if (inputStartDate == null || inputStartDate < min || inputStartDate > max) {
					startDate = min;
				} else {
					startDate = inputStartDate;
				}

				if (inputEndDate == null || inputEndDate < inputStartDate || inputEndDate < min || inputEndDate > max) {
					endDate = max;
				} else {
					endDate = inputEndDate;
				}

				if ($('#pickInfoSize').text() == "Fifteen Minutes") {
					newData = []
					newDataIndices = []
					for (i = 0; i < data.length; i++) {
						if (data[i].date <= endDate && data[i].date >= startDate) {
							newData.push(data[i])
						} else {
							//console.log(data[i].date, endDate, startDate);
						}
					}
					data = newData;
				} else if ($('#pickInfoSize').text() == "One Hour") {
					newData = []
					newDataIndices = []
					for (i = 0; i < data.length; i++) {
						if (data[i].date <= endDate && data[i].date >= startDate) {
							localId = data[i]["rawDate"].slice(0, -3)
							if (!newDataIndices.includes(localId)) {
								newDataIndices.push(localId);
								newData.push({ rawDate: localId, date: d3.utcParse("%m/%d/%Y-%H")(localId), value: parseFloat(data[i].value) })
							} else {
								localIndex = newDataIndices.indexOf(localId);
								newData[localIndex].value += parseFloat(data[i].value);
							}
						}
					}
					data = newData;
				} else if ($('#pickInfoSize').text() == "Twelve Hours") {
					newData = []
					newDataIndices = []
					for (i = 0; i < data.length; i++) {
						if (data[i].date <= endDate && data[i].date >= startDate) {
							localId = data[i]["rawDate"].slice(0, -3)
							last2 = localId.slice(-2);
							localId = localId.slice(0, -2);
							firstLast = last2.slice(0, 1);
							if (firstLast == "-") {
								localId = localId.concat("-0");
							} else if (last2 == "10" || last2 == "11") {
								localId = localId.concat("0");
							} else {
								localId = localId.concat("12");
							}
							if (localId)
								if (!newDataIndices.includes(localId)) {
									newDataIndices.push(localId);
									newData.push({ rawDate: localId, date: d3.utcParse("%m/%d/%Y-%H")(localId), value: parseFloat(data[i].value) })
								} else {
									localIndex = newDataIndices.indexOf(localId);
									newData[localIndex].value += parseFloat(data[i].value);
								}
						}
					}
					data = newData;
				} else if ($('#pickInfoSize').text() == "One Day") {
					newData = []
					newDataIndices = []
					for (i = 0; i < data.length; i++) {
						if (data[i].date <= endDate && data[i].date >= startDate) {
							localId = data[i]["rawDate"].slice(0, -5)
							if (localId.slice(-1) == "-") {
								localId = localId.slice(0, -1);
							}
							if (!newDataIndices.includes(localId)) {
								newDataIndices.push(localId);
								newData.push({ rawDate: localId, date: d3.utcParse("%m/%d/%Y")(localId), value: parseFloat(data[i].value) })
							} else {
								localIndex = newDataIndices.indexOf(localId);
								newData[localIndex].value += parseFloat(data[i].value);
							}
						}
					}
					data = newData;
				} else if ($('#pickInfoSize').text() == "One Month") {
					newData = []
					newDataIndices = []
					for (i = 0; i < data.length; i++) {
						if (data[i].date <= endDate && data[i].date >= startDate) {
							localId = data[i]["rawDate"].slice(0, 2);

							if (localId.slice(-1) != "/") {
								localId = localId.concat("/");
								if (data[i]["rawDate"].slice(4, 5) == "/") {
									localId = localId.concat(data[i]["rawDate"].slice(5, 9))
								} else {
									localId = localId.concat(data[i]["rawDate"].slice(6, 10))
								}
							} else if (data[i]["rawDate"].slice(3, 4) == "/") {
								localId = localId.concat(data[i]["rawDate"].slice(4, 8));
							} else {
								localId = localId.concat(data[i]["rawDate"].slice(5, 9))
							}
							if (!newDataIndices.includes(localId)) {
								newDataIndices.push(localId);
								newData.push({ rawDate: localId, date: d3.utcParse("%m/%Y")(localId), value: parseFloat(data[i].value) })
							} else {
								localIndex = newDataIndices.indexOf(localId);
								newData[localIndex].value += parseFloat(data[i].value);
							}
						}
					}
					data = newData;
				} else {
					newData = []
					newDataIndices = []
					for (i = 0; i < data.length; i++) {
						if (data[i].date <= endDate && data[i].date >= startDate) {
							localId = data[i]["rawDate"];
							if (localId.slice(3, 4) == "/") {
								localId = localId.slice(4, 8);
							} else if (localId.slice(4, 5) == "/") {
								localId = localId.slice(5, 9);
							} else {
								localId = localId.slice(6, 10);
							}
							if (!newDataIndices.includes(localId)) {
								newDataIndices.push(localId);
								newData.push({ rawDate: localId, date: d3.utcParse("%Y")(localId), value: parseFloat(data[i].value) })
							} else {
								localIndex = newDataIndices.indexOf(localId);
								newData[localIndex].value += parseFloat(data[i].value);
							}
						}
					}
					data = newData;
				}
				console.log(data[0].date, startDate);
				console.log(data[0].date >= startDate);
				let minData = d3.min(data, function(d) {return +d.value});
				if ($('#pickGraphStyle').text() == "Bar Graph") {
					makeBarGraph(data, minData);
				} else if ($('#pickGraphStyle').text() == "Radial Plot") {
					makeRadialPlot(data, minData)
				} else {
					makeLineGraph(data, minData);
				}
			
				//add labels 
				svg.append("text")             
					.attr("transform", "translate(" + (width/2) + " ," + (height + margin.top + 20) + ")")
					.style("text-anchor", "middle")
					.text("Time")
					.classed('graphText',true);

				svg.append("text")
					.attr("transform", "rotate(-90)")
					.attr("y", 0 - margin.left + 15)
					.attr("x",0 - (height / 2))
					.attr("dy", "1.5em")
					.style("text-anchor", "middle")
					.text("Energy Usage (kWh)")
					.classed('graphText',true);
				
				//hide spinner
				$('#spinner').css('display','none');

			});
	}
};

function createSVG() {
	svg = d3.select("#graph")
		.classed("svg-container", true)
		.append("svg")
		.attr("preserveAspectRatio", "xMinYMin meet")
		.attr("viewBox", `0 0 ${this.viewWidth} ${this.viewHeight}`)
		.classed("svg-content-responsive", true)
		.append("g")
		.attr("width", width)
		.attr("height", height + margin.top + margin.bottom)
		.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

}

function makeLineGraph(data, min) {

	// x axis (date)
	var x = d3.scaleTime()
		.domain([data[0].date, data[data.length - 1].date])  	//domain takes in [min, max] and specifies the range the graph shows
		.range([0, width]);
	var gX = svg.append("g")
		.attr("transform", "translate(0," + height + ")")
		.call(d3.axisBottom(x));

	gX.selectAll(".tick").each(function (d) {
		if (this.textContent === d3.timeFormat("%B")(d)) {
			d3.select(this).select("text").text(d3.timeFormat("%b")(d))
		}
	})
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
			.x(function (d) { return x(d.date) })
			.y(function (d) { return y(d.value) })
		).attr("class", "graphline")    // so we can css select .graphline for further styling
}

function makeBarGraph(data, min) {

	var x = d3.scaleTime()
		.domain([data[0].date, data[data.length - 1].date])
		.range([0, width]);
	var gX = svg.append("g")
		.attr("transform", "translate(0," + height + ")")
		.call(d3.axisBottom(x));

	gX.selectAll(".tick").each(function (d) {
		if (this.textContent === d3.timeFormat("%B")(d)) {
			d3.select(this).select("text").text(d3.timeFormat("%b")(d))
		}
	})
	var y = d3.scaleLinear()
		.domain([0, d3.max(data, function (d) { return +d.value; })])
		.range([height, 0]);
	svg.append("g")
		.call(d3.axisLeft(y));

	svg.selectAll(".bar")
		.data(data)
		.enter().append("rect")
		.attr("class", "bar")
		.attr("x", function (d) { return x(d.date); })
		.attr("y", function (d) { return y(d.value); })
		.attr("width", width / data.length)
		.attr("height", function (d) { return height - y(d.value); });  

}

function makeRadialPlot(data, min){
	var x = d3.scaleBand()
        	.range([0, 2 * Math.PI])
		.align(0)
		.domain(data.map(function(d) { return d.date; }));
        var y = d3.scaleRadial()
		.range([innerRadius, outerRadius])
		.domain([0, d3.max(data, function (d) { return +d.value; })]);
        svg.append("g")
		.attr("transform", "translate(" + width/2 + "," + height/2 + ")")
                .selectAll("path")
		.data(data)
		.enter()
		.append("path")
			.attr("fill", "#000000")
			.attr("d", d3.arc()
				.innerRadius(innerRadius)
				.outerRadius(function(d) { return y(d.value); })
				.startAngle(function(d) { return x(d.date); })
				.endAngle(function(d) { return x(d.date) + x.bandwidth(); })
				.padAngle(0.01)
				.padRadius(innerRadius));
	/*svg.append("g")
		.attr("transform", "translate(" + width/2 + "," + height/2 + ")")
		.selectAll("g")
		.data(data)
		.enter()
		.append("g")
			.attr("text-anchor", function(d) { return (x(d.date) + x.bandwidth() / 2 + Math.PI) % (2 * Math.PI) < Math.PI ? "end" : "start"; })
        		.attr("transform", function(d) { return "rotate(" + ((x(d.date) + x.bandwidth() / 2) * 180 / Math.PI - 90) + ")"+"translate(" + (y(d.value)+10) + ",0)"; })
		.append("text")
			.text(function(d) { return (d.date)})
			.attr("transform", function(d) { return (x(d.date) + x.bandwidth() / 2 + Math.PI) % (2 * Math.PI) < Math.PI ? "rotate(180)" : "rotate(0)"; })
			.style("font-size", "10px")
			.attr("alignment-baseline", "middle");*/
}

});


var inputStartDate;
var inputEndDate;
var firstClick = true;
var svg = 0;

//specify graph dimensions
var margin = { top: 10, right: 30, bottom: 30, left: 60 };
var viewWidth = $('#graph').width();
var viewHeight = $('#graph').height() - 60;
var width = viewWidth - margin.left - margin.right; //was 600
var height = viewHeight - margin.top - margin.bottom;
var left = 0;
var bottom = 0;

/*
//get size of things on every window resize
$(window).resize(function() {
	let width =  $('#graph').width();
	let height =  $('#graph').height();
	console.log('Height: ' + height + ' Width: ' + width);
});
*/

//every time start date changes, update dateEntered value
$('#start').on("change", function () {
	var inputStart = this.value;
	if (inputStart != null) {
		inputStartDate = new Date(inputStart);
	}
});

$('#end').on("change", function () {
	var inputEnd = this.value;
	if (inputEnd != null) {
		inputEndDate = new Date(inputEnd);
	}
});

$("#lineGraph").click(function (e) {
	$("#pickGraphStyle").text("Line Graph");
});
$("#barGraph").click(function (e) {
	$("#pickGraphStyle").text("Bar Graph");
});
$("#Usage").click(function (e) {
	$("#pickYaxis").text("Usage");
});
$("#Cost").click(function (e) {
	$("#pickYaxis").text("Cost");
});

$("#fifteenMinutes").click(function (e) {
	$("#pickInfoSize").text("Fifteen Minutes");
});
$("#hour").click(function (e) {
	$("#pickInfoSize").text("One Hour");
});
$("#twelveHours").click(function (e) {
	$("#pickInfoSize").text("Twelve Hours");
});
$("#day").click(function (e) {
	$("#pickInfoSize").text("One Day");
});
$("#month").click(function (e) {
	$("#pickInfoSize").text("One Month");
});
$("#year").click(function (e) {
	$("#pickInfoSize").text("One Year");
});

//on submit, read data, set domain range, append graph
$("#submitButton").click(function () {
	if ($('#csvData').prop('files').length > 0) {
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
				return { rawDate: d.DATE + "-" + d['START TIME'], date: d3.timeParse("%m/%d/%Y-%H:%M")(d.DATE + "-" + d['END TIME']), value: d.USAGE, cost: d.COST.replace ("$","") }
				
			},	
			function (data) {
				if ($('#pickYaxis').text() == "Cost"){
					
					if ($('#pickInfoSize').text() == "Fifteen Minutes") {
					} else if ($('#pickInfoSize').text() == "One Hour") {
						newData = []
						newDataIndices = []
						for (i = 0; i < data.length; i++) {
							localId = data[i]["rawDate"].slice(0, -3)
							if (!newDataIndices.includes(localId)) {
								newDataIndices.push(localId);
								newData.push({ rawDate: localId, date: d3.timeParse("%m/%d/%Y-%H")(localId), cost: parseFloat(data[i].cost) })
							} else {
								localIndex = newDataIndices.indexOf(localId);
								newData[localIndex].cost += parseFloat(data[i].cost);
							}
						}
						data = newData;
					} else if ($('#pickInfoSize').text() == "Twelve Hours") {
						newData = []
						newDataIndices = []
						for (i = 0; i < data.length; i++) {
							localId = data[i]["rawDate"].slice(0, -3)
							last2 = localId.slice(-2);
							localId = localId.slice(0, -2);
							firstLast = last2.slice(-1);
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
									newData.push({ rawDate: localId, date: d3.timeParse("%m/%d/%Y-%H")(localId), cost: parseFloat(data[i].cost) })
								} else {
									localIndex = newDataIndices.indexOf(localId);
									newData[localIndex].cost += parseFloat(data[i].cost);
								}
						}
						data = newData;
					} else if ($('#pickInfoSize').text() == "One Day") {
						newData = []
						newDataIndices = []
						for (i = 0; i < data.length; i++) {
							localId = data[i]["rawDate"].slice(0, -5)
							if (localId.slice(-1) == "-") {
								localId = localId.slice(0, -1);
							}
							if (!newDataIndices.includes(localId)) {
								newDataIndices.push(localId);
								newData.push({ rawDate: localId, date: d3.timeParse("%m/%d/%Y")(localId), cost: parseFloat(data[i].cost) })
							} else {
								localIndex = newDataIndices.indexOf(localId);
								newData[localIndex].cost += parseFloat(data[i].cost);
							}
						}
						data = newData;
					} else if ($('#pickInfoSize').text() == "One Month") {
						newData = []
						newDataIndices = []
						for (i = 0; i < data.length; i++) {
							localId = data[i]["rawDate"].slice(0, 2);

							if (localId.slice(-1) != "/") {
								localId = localId.concat("/");
								if (data[i]["rawDate"].slice(4, 5) == "/") {
									localId = localId.concat(data[i]["rawDate"].slice(5, 9))
								} else {
									localId = localId.concat(data[i]["rawDate"].slice(6, 10))
								}
							} else if (localId.slice(3, 4) == "/") {
								localId = localId.concat(data[i]["rawDate"].slice(4, 8));
							} else {
								localId = localId.concat(data[i]["rawDate"].slice(5, 9))
							}
							if (!newDataIndices.includes(localId)) {
								newDataIndices.push(localId);
								newData.push({ rawDate: localId, date: d3.timeParse("%m/%Y")(localId), cost: parseFloat(data[i].cost) })
							} else {
								localIndex = newDataIndices.indexOf(localId);
								newData[localIndex].cost += parseFloat(data[i].cost);
							}
						}
						data = newData;
					} else {
						newData = []
						newDataIndices = []
						for (i = 0; i < data.length; i++) {
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
								newData.push({ rawDate: localId, date: d3.timeParse("%Y")(localId), cost: parseFloat(data[i].cost) })
							} else {
								localIndex = newDataIndices.indexOf(localId);
								newData[localIndex].cost += parseFloat(data[i].cost);
							}
						}
						data = newData;
					}
					if ($('#pickGraphStyle').text() == "Bar Graph") {
						makeBarGraphCost(data);
					} else {
						makeLineGraphCost(data);
					}
				} else{
					if ($('#pickInfoSize').text() == "Fifteen Minutes") {
					} else if ($('#pickInfoSize').text() == "One Hour") {
						newData = []
						newDataIndices = []
						for (i = 0; i < data.length; i++) {
							localId = data[i]["rawDate"].slice(0, -3)
							if (!newDataIndices.includes(localId)) {
								newDataIndices.push(localId);
								newData.push({ rawDate: localId, date: d3.timeParse("%m/%d/%Y-%H")(localId), value: parseFloat(data[i].value) })
							} else {
								localIndex = newDataIndices.indexOf(localId);
								newData[localIndex].value += parseFloat(data[i].value);
							}
						}
						data = newData;
					} else if ($('#pickInfoSize').text() == "Twelve Hours") {
						newData = []
						newDataIndices = []
						for (i = 0; i < data.length; i++) {
							localId = data[i]["rawDate"].slice(0, -3)
							last2 = localId.slice(-2);
							localId = localId.slice(0, -2);
							firstLast = last2.slice(-1);
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
									newData.push({ rawDate: localId, date: d3.timeParse("%m/%d/%Y-%H")(localId), value: parseFloat(data[i].value) })
								} else {
									localIndex = newDataIndices.indexOf(localId);
									newData[localIndex].value += parseFloat(data[i].value);
								}
						}
						data = newData;
					} else if ($('#pickInfoSize').text() == "One Day") {
						newData = []
						newDataIndices = []
						for (i = 0; i < data.length; i++) {
							localId = data[i]["rawDate"].slice(0, -5)
							if (localId.slice(-1) == "-") {
								localId = localId.slice(0, -1);
							}
							if (!newDataIndices.includes(localId)) {
								newDataIndices.push(localId);
								newData.push({ rawDate: localId, date: d3.timeParse("%m/%d/%Y")(localId), value: parseFloat(data[i].value) })
							} else {
								localIndex = newDataIndices.indexOf(localId);
								newData[localIndex].value += parseFloat(data[i].value);
							}
						}
						data = newData;
					} else if ($('#pickInfoSize').text() == "One Month") {
						newData = []
						newDataIndices = []
						for (i = 0; i < data.length; i++) {
							localId = data[i]["rawDate"].slice(0, 2);

							if (localId.slice(-1) != "/") {
								localId = localId.concat("/");
								if (data[i]["rawDate"].slice(4, 5) == "/") {
									localId = localId.concat(data[i]["rawDate"].slice(5, 9))
								} else {
									localId = localId.concat(data[i]["rawDate"].slice(6, 10))
								}
							} else if (localId.slice(3, 4) == "/") {
								localId = localId.concat(data[i]["rawDate"].slice(4, 8));
							} else {
								localId = localId.concat(data[i]["rawDate"].slice(5, 9))
							}
							if (!newDataIndices.includes(localId)) {
								newDataIndices.push(localId);
								newData.push({ rawDate: localId, date: d3.timeParse("%m/%Y")(localId), value: parseFloat(data[i].value) })
							} else {
								localIndex = newDataIndices.indexOf(localId);
								newData[localIndex].value += parseFloat(data[i].value);
							}
						}
						data = newData;
					} else {
						newData = []
						newDataIndices = []
						for (i = 0; i < data.length; i++) {
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
								newData.push({ rawDate: localId, date: d3.timeParse("%Y")(localId), value: parseFloat(data[i].value) })
							} else {
								localIndex = newDataIndices.indexOf(localId);
								newData[localIndex].value += parseFloat(data[i].value);
							}
						}
						data = newData;
					}
					if ($('#pickGraphStyle').text() == "Bar Graph") {
						makeBarGraph(data);
					} else {
						makeLineGraph(data);
					}
				}
				
			})
	}
});

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

function makeLineGraph(data) {
	//check for date input so that date is valid
	//extent(array) returns [min, max] 
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


	console.log(startDate + "\n" + endDate);

	// x axis (date)
	var x = d3.scaleTime()
		.domain([startDate, endDate])  	//domain takes in [min, max] and specifies the range the graph shows
		.range([0, width]);
	//console.log(svg.html());
	bottom = svg.append("g")
		.attr("transform", "translate(0," + height + ")")
		.call(d3.axisBottom(x));
	//console.log(svg.html());

	// y axis
	var y = d3.scaleLinear()
		.domain([0, d3.max(data, function (d) { return +d.value; })])
		.range([height, 0]);
	left = svg.append("g")
		.call(d3.axisLeft(y));


	// line and line styles
	svg.append("path")
		.datum(data)
		.attr("fill", "none")       //area under line
		.attr("stroke", "blue")     //line color
		.attr("stroke-width", 1.5)
		.attr("d", d3.line()
			.defined(function (d) {
				return d.date < endDate && d.date > startDate;
			})
			.x(function (d) { return x(d.date) })
			.y(function (d) { return y(d.value) })
		).attr("class", "graphline")    // so we can css select .graphline for further styling


}

function makeLineGraphCost(data) {
	//check for date input so that date is valid
	//extent(array) returns [min, max] 
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


	console.log(startDate + "\n" + endDate);

	// x axis (date)
	var x = d3.scaleTime()
		.domain([startDate, endDate])  	//domain takes in [min, max] and specifies the range the graph shows
		.range([0, width]);
	//console.log(svg.html());
	bottom = svg.append("g")
		.attr("transform", "translate(0," + height + ")")
		.call(d3.axisBottom(x));
	//console.log(svg.html());

	// y axis
	var y = d3.scaleLinear()
		.domain([0, d3.max(data, function (d) { return +d.cost; })])
		.range([height, 0]);
	left = svg.append("g")
		.call(d3.axisLeft(y));


	// line and line styles
	svg.append("path")
		.datum(data)
		.attr("fill", "none")       //area under line
		.attr("stroke", "blue")     //line color
		.attr("stroke-width", 1.5)
		.attr("d", d3.line()
			.defined(function (d) {
				return d.date < endDate && d.date > startDate;
			})
			.x(function (d) { return x(d.date) })
			.y(function (d) { return y(d.cost) })
		).attr("class", "graphline")    // so we can css select .graphline for further styling


}

function makeBarGraph(data) {
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
		.attr("x", function (d) { return x(d.date); })
		.attr("y", function (d) { return y(d.value); })
		.attr("width", width / data.length)
		.attr("height", function (d) { return height - y(d.value); });

}
function makeBarGraphCost(data) {
	var x = d3.scaleTime()
		.domain(d3.extent(data, function (d) { return d.date; }))
		.range([0, width]);
	svg.append("g")
		.attr("transform", "translate(0," + height + ")")
		.call(d3.axisBottom(x));

	var y = d3.scaleLinear()
		.domain([0, d3.max(data, function (d) { return +d.cost; })])
		.range([height, 0]);
	svg.append("g")
		.call(d3.axisLeft(y));

	svg.selectAll(".bar")
		.data(data)
		.enter().append("rect")
		.attr("class", "bar")
		.attr("x", function (d) { return x(d.date); })
		.attr("y", function (d) { return y(d.cost); })
		.attr("width", width / data.length)
		.attr("height", function (d) { return height - y(d.cost); });

}

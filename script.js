
//Initialize a few global variables
var inputStartDate;
var inputEndDate;
var firstClick;
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

//Wait until the dom object is ready before doing anything else;
$(document).ready(function () {

	firstClick = true;
	svg = 0;

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

	//Start up the navbar
	$('#navbar').load('./navbar.html');

	//Every time start date changes, update inputStartDate value and the displayed graph.
	$('#start').on("change", function () {
		var inputStart = this.value;
		if (inputStart != null) {
			inputStartDate = new Date(inputStart);
		}
		updateGraph();
	});

	//Every time end date changes, update inputEndDate value and the displayed graph.
	$('#end').on("change", function () {
		var inputEnd = this.value;
		if (inputEnd != null) {
			inputEndDate = new Date(inputEnd);
		}
		updateGraph();
	});

	//Change to a line graph
	$("#lineGraph").click(function (e) {
		$("#pickGraphStyle").text("Line Graph");
		updateGraph();
	});

	//Change to a bar graph
	$("#barGraph").click(function (e) {
		$("#pickGraphStyle").text("Bar Graph");
		updateGraph();
	});

	//Change to a radial plot 
	$("#radialPlot").click(function (e) {
		$("#pickGraphStyle").text("Radial Plot");
		updateGraph();
	});

	//Change the time scale to 15 minutes.
	$("#fifteenMinutes").click(function (e) {
		$("#pickInfoSize").text("Fifteen Minutes");
		updateGraph();
	});

	//Change the time scale to 1 hour.
	$("#hour").click(function (e) {
		$("#pickInfoSize").text("One Hour");
		updateGraph();
	});

	//Change the time scale to 12 hours.
	$("#twelveHours").click(function (e) {
		$("#pickInfoSize").text("Twelve Hours");
		updateGraph();
	});

	//Change the time scale to 1 day.
	$("#day").click(function (e) {
		$("#pickInfoSize").text("One Day");
		updateGraph();
	});

	//Change the time scale to 1 month.
	$("#month").click(function (e) {
		$("#pickInfoSize").text("One Month");
		updateGraph();
	});

	//Change the time scale to 1 year.
	$("#year").click(function (e) {
		$("#pickInfoSize").text("One Year");
		updateGraph();
	});

	//On file input change, update the graph
	$("#csvData").on( 'change' , function () { updateGraph(); });

	//Take the data from the CSV file, pare it down to the date range and data size, and create the right kind of graph.
	function updateGraph() {
		//If there is no csv file, tell the user to input one.
		if ($('#csvData').prop('files').length <= 0) {
			alert('Please enter a file');
		}
		//If there is a csv file, do everything necessary to create a graph.
		else {

			//Display a 'loading' symbol.
			$('#spinner').css('display', 'block');

			//Get the csv file and create a temporary url for d3 to read
			let fileURL = URL.createObjectURL($('#csvData').prop('files')[0]);

			//If this is the first graph to be created, just create the graph svg.
			if (firstClick) {
				createSVG();
				firstClick = false;
			}
			//If this isn't the first graph to be created, delete the old graph and create a new graph svg.
			else {
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

			//Parse the csv file, then create the graph.
			d3.csv(fileURL,
				//Parse the file, converting the data into the form we want.
				function (d) {
					return { rawDate: d.DATE + "-" + d['START TIME'], date: d3.timeParse("%m/%d/%Y-%H:%M")(d.DATE + "-" + d['END TIME']), value: d.USAGE, cost: d.COST }
				},
				//Now pare down the data, and use the data to create the graph
				function (data) {

					//Find the earliest and latest dates in the dataset.
					let minmax = d3.extent(data, function (d) { return d.date; });
					let min = minmax[0];
					let max = minmax[1];

					//Initialize the startDate and endDate variables.
					let startDate;
					let endDate;

					//Choose the later of 1) the inputed start date or 2) the earliest date in the data.
					if (inputStartDate == null || inputStartDate < min || inputStartDate > max) {
						startDate = min;
					} else {
						startDate = inputStartDate;
					}

					//Choose the earlier of 1) the inputed end date or 2) the latest date in the data.
					if (inputEndDate == null || inputEndDate < inputStartDate || inputEndDate < min || inputEndDate > max) {
						endDate = max;
					} else {
						endDate = inputEndDate;
					}

					//If the data size is 15 min, pare down the data to the correct range.
					if ($('#pickInfoSize').text() == "Fifteen Minutes") {
						newData = [] //The new dataset
						for (i = 0; i < data.length; i++) {
							if (data[i].date <= endDate && data[i].date >= startDate) {
								newData.push(data[i])
							} else {
							}
						}
						//Set data to be the new dataset.
						data = newData;
					}
					//If the desired data size is 1 h, condense the data and pare it down to the correct range.
					else if ($('#pickInfoSize').text() == "One Hour") {
						newData = [] //The new dataset
						newDataIndices = [] //List of dates that are already in the new dataset
						for (i = 0; i < data.length; i++) {
							if (data[i].date <= endDate && data[i].date >= startDate) {
								//Remove the minute data from the raw date.
								localId = data[i]["rawDate"].slice(0, -3);
								//Check if the date for this data is already in the dataset. If it isn't, add the date.
								if (!newDataIndices.includes(localId)) {
									newDataIndices.push(localId);
									newData.push({ rawDate: localId, date: d3.timeParse("%m/%d/%Y-%H")(localId), value: parseFloat(data[i].value) })
								}
								//If the date is already in the dataset, add this element's data to the sum of that date's data.
								else {
									localIndex = newDataIndices.indexOf(localId);
									newData[localIndex].value += parseFloat(data[i].value);
								}
							}
						}
						//Set data to be the new dataset.
						data = newData;
					}
					//If the desired data size is 12 h, condense the data and pare it down to the correct range.					
					else if ($('#pickInfoSize').text() == "Twelve Hours") {
						newData = [] //The new dataset
						newDataIndices = [] //List of dates that are already in the new dataset
						for (i = 0; i < data.length; i++) {
							if (data[i].date <= endDate && data[i].date >= startDate) {
								//Remove the minute data from the raw date.
								localId = data[i]["rawDate"].slice(0, -3)
								//Get the hour data and call it last2
								last2 = localId.slice(-2);
								//Remove the hour data from the raw date
								localId = localId.slice(0, -2);
								//Now change the date to either the 0th hour or the 12th hour - whichever precedes the actual hour.
								firstLast = last2.slice(0, 1);
								if (firstLast == "-") {
									localId = localId.concat("-0");
								} else if (last2 == "10" || last2 == "11") {
									localId = localId.concat("0");
								} else {
									localId = localId.concat("12");
								}
								//Check if the date for this data is already in the dataset. If it isn't, add the date.
								if (!newDataIndices.includes(localId)) {
									newDataIndices.push(localId);
									newData.push({ rawDate: localId, date: d3.timeParse("%m/%d/%Y-%H")(localId), value: parseFloat(data[i].value) })
								}
								//If the date is already in the dataset, add this element's data to the sum of that date's data.
								else {
									localIndex = newDataIndices.indexOf(localId);
									newData[localIndex].value += parseFloat(data[i].value);
								}
							}
						}
						//Set data to be the new dataset.
						data = newData;
					}
					//If the desired data size is 1 d, condense the data and pare it down to the correct range.					
					else if ($('#pickInfoSize').text() == "One Day") {
						newData = [] //The new dataset
						newDataIndices = [] //List of dates that are already in the new dataset
						for (i = 0; i < data.length; i++) {
							if (data[i].date <= endDate && data[i].date >= startDate) {
								//Remove the minute and hour data from the raw date.
								localId = data[i]["rawDate"].slice(0, -5)
								if (localId.slice(-1) == "-") {
									localId = localId.slice(0, -1);
								}
								//Check if the date for this data is already in the dataset. If it isn't, add the date.
								if (!newDataIndices.includes(localId)) {
									newDataIndices.push(localId);
									newData.push({ rawDate: localId, date: d3.timeParse("%m/%d/%Y")(localId), value: parseFloat(data[i].value) })
								}
								//If the date is already in the dataset, add this element's data to the sum of that date's data.
								else {
									localIndex = newDataIndices.indexOf(localId);
									newData[localIndex].value += parseFloat(data[i].value);
								}
							}
						}
						//Set data to be the new dataset.
						data = newData;
					}
					//If the desired data size is 1 mo, condense the data and pare it down to the correct range.					
					else if ($('#pickInfoSize').text() == "One Month") {
						newData = [] //The new dataset
						newDataIndices = [] //List of dates that are already in the new dataset
						for (i = 0; i < data.length; i++) {
							if (data[i].date <= endDate && data[i].date >= startDate) {
								//Get the month data	
								localId = data[i]["rawDate"].slice(0, 2);
								//If the month data is two digits, add a slash and the year data.
								if (localId.slice(-1) != "/") {
									localId = localId.concat("/");
									if (data[i]["rawDate"].slice(4, 5) == "/") {
										localId = localId.concat(data[i]["rawDate"].slice(5, 9))
									} else {
										localId = localId.concat(data[i]["rawDate"].slice(6, 10))
									}
								} 
								//If the month data is one digit, add the year data.
								else if (data[i]["rawDate"].slice(3, 4) == "/") {
									localId = localId.concat(data[i]["rawDate"].slice(4, 8));
								} else {
									localId = localId.concat(data[i]["rawDate"].slice(5, 9))
								}
								//Check if the date for this data is already in the dataset. If it isn't, add the date.
								if (!newDataIndices.includes(localId)) {
									newDataIndices.push(localId);
									newData.push({ rawDate: localId, date: d3.timeParse("%m/%Y")(localId), value: parseFloat(data[i].value) })
								}
								//If the date is already in the dataset, add this element's data to the sum of that date's data.
								else {
									localIndex = newDataIndices.indexOf(localId);
									newData[localIndex].value += parseFloat(data[i].value);
								}
							}
						}
						//Set data to be the new dataset.
						data = newData;
					}
					//If the desired data size is 1 y, condense the data and pare it down to the correct range.					
					else {
						newData = [] //The new dataset
						newDataIndices = [] //List of dates that are already in the new dataset
						for (i = 0; i < data.length; i++) {
							if (data[i].date <= endDate && data[i].date >= startDate) {
								localId = data[i]["rawDate"];
								//Get the year data.	
								if (localId.slice(3, 4) == "/") {
									localId = localId.slice(4, 8);
								} else if (localId.slice(4, 5) == "/") {
									localId = localId.slice(5, 9);
								} else {
									localId = localId.slice(6, 10);
								}
								//Check if the date for this data is already in the dataset. If it isn't, add the date.
								if (!newDataIndices.includes(localId)) {
									newDataIndices.push(localId);
									newData.push({ rawDate: localId, date: d3.timeParse("%Y")(localId), value: parseFloat(data[i].value) })
								}
								//If the date is already in the dataset, add this element's data to the sum of that date's data.
								else {
									localIndex = newDataIndices.indexOf(localId);
									newData[localIndex].value += parseFloat(data[i].value);
								}
							}
						}
						//Set data to be the new dataset.
						data = newData;
					}
					/* Testing code
					console.log(data[0].date, startDate);
					console.log(data[0].date >= startDate);
					*/

					//Find the baseline of the data for use in the graph.
					let minData = d3.min(data, function (d) { return +d.value });

					//Generate a bar graph.
					if ($('#pickGraphStyle').text() == "Bar Graph") {
						makeBarGraph(data, minData);
					} 
					//Generate a radial plot.
					else if ($('#pickGraphStyle').text() == "Radial Plot") {
						makeRadialPlot(data, minData)
					} 
					//Generate a line graph.
					else {
						makeLineGraph(data, minData);
					}

					//add labels that apply no matter what kind of graph
					svg.append("text")
						.attr("transform", "translate(" + (width / 2) + " ," + (height + margin.top + 20) + ")")
						.style("text-anchor", "middle")
						.text("Time")
						.classed('graphText', true);

					svg.append("text")
						.attr("transform", "rotate(-90)")
						.attr("y", 0 - margin.left + 15)
						.attr("x", 0 - (height / 2))
						.attr("dy", "1.5em")
						.style("text-anchor", "middle")
						.text("Energy Usage (kWh)")
						.classed('graphText', true);

					//Hide the 'loading' symbol.
					$('#spinner').css('display', 'none');

				});
		}
	};

	function createSVG() {
		//Create an svg element that can be used to hold any graph type.
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

		// Set up the x axis (date).
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
		// Set up the y axis (energy usage/cost).
		var y = d3.scaleLinear()
			.domain([0, d3.max(data, function (d) { return +d.value; })])
			.range([height, 0]);
		svg.append("g")
			.call(d3.axisLeft(y));


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

		// Add baseline line
		svg.append("line")
			.attr("x1", 0)
			.attr("x2", x(data[data.length - 1].date) )
			.attr("y1", y(min))		//note the x() and y() functions scale the data to the graph
			.attr("y2", y(min))
			.attr("stroke-width", 1.5)
			.attr("stroke-dasharray",4)
			.attr("stroke", "darkgreen")
			.attr("class", "baseline");

		svg.append("text")
			.attr("y", y(min)-5)//magic number here
			.attr("x", 5)
			.attr('text-anchor', 'left')
			.attr("class", "baselineText")//easy to style with CSS
			.text("Baseline Energy Usage");
	
	}

	function makeBarGraph(data, min) {

		// Set up the x axis (date).
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
		// Set up the y axis (energy usage/cost).
		var y = d3.scaleLinear()
			.domain([0, d3.max(data, function (d) { return +d.value; })])
			.range([height, 0]);
		svg.append("g")
			.call(d3.axisLeft(y));

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

	function makeRadialPlot(data, min) {
		// If there's too much data, radial plot lines become too small to display
		if (data.length > 400) {
			svg.append("text")
				.style("text-anchor", "right")
                                .text("Too much data for radial plot.")
		}
		else {
			// Scale the x and y parts of the plot.
			var x = d3.scaleBand()
				.range([0, 2 * Math.PI])
				.align(0)
				.domain(data.map(function (d) { return d.date; }));
			var y = d3.scaleRadial()
				.range([innerRadius, outerRadius])
				.domain([0, d3.max(data, function (d) { return +d.value; })]);

			// Add the data in a radial plot form.
			svg.append("g")
				.attr("transform", "translate(" + width / 2 + "," + height / 2 + ")")
				.selectAll("path")
				.data(data)
				.enter()
				.append("path")
				.attr("fill", "#000000")
				.attr("d", d3.arc()
					.innerRadius(innerRadius)
					.outerRadius(function (d) { return y(d.value); })
					.startAngle(function (d) { return x(d.date); })
					.endAngle(function (d) { return x(d.date) + x.bandwidth(); })
					.padAngle(0.01)
					.padRadius(innerRadius));
		}
	}

	//appends a <p> element with specified message and id to the tips bar
	function addTip(text, tipid) {
		let tip = $('<p>', {
			class: 'tip',
			id: tipid,
			html: text
		}).appendTo( $('#tips') );
	}

	addTip("Average daily usage: __ kwh", "avgMonthly");
	addTip("Average monthly usage: __ kwh", "avgDaily");
	addTip("Tip 1", "tip1");
	addTip("Tip 2", "tip2");

});


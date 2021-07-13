// jQuery:
// jQuery tutorial: https://learn.jquery.com/using-jquery-core/jquery-object/
// #: id
// .: class
// nothing: tag(h1, h2..)
//d3 tutorial: https://www.tutorialsteacher.com/d3js/dom-manipulation-using-d3js

//Initialize hardcoded averages from UMass Dataset
var fifteenMinuteAve = 8.56337475270227
var hourAve = 34.2500476070234
var twelveHourAve = 410.74591662059
var dayAve = 820.1013523886276
var monthAve = 24372.043358063114
var yearAve = 292464.502967567
var comparisonAve = 0;

var fifteenMinuteMin = 0.006684516407407407;
var hourMin = 0.05255550403703703;
var twelveHourMin = 3.4257760907314814;
var dayMin = 9.691182263518519;
var monthMin = 960.0608583119911;
var yearMin = 44998.51727650482;
var comparisonMin = 0;

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
	//https://stackoverflow.com/questions/205853/why-would-a-javascript-variable-start-with-a-dollar-sign
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
	//Load data from the server and place the returned HTML into the matched elements.
	$('#navbar').load('./navbar.html');

	//Welcome message
	addTip("Welcome to ElecViz! To start visualizing, submit a CSV file of your energy data.", "welcomeTip");
	
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
	//https://stackoverflow.com/questions/10323392/in-javascript-jquery-what-does-e-mean
	//https://stackoverflow.com/questions/34142022/difference-between-functione-and-function/34142318
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
		//prop: property
		if ($('#csvData').prop('files').length <= 0) {
			alert('Please enter a file');
		}
		//If there is a csv file, do everything necessary to create a graph.
		else {

			//Display a 'loading' symbol.
			$('#spinner').css('display', 'block');

			//Get the csv file and create a temporary url for d3 to read
			//fileURL is a DOMString
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
					// console.log(data)
					//Find the earliest and latest dates in the dataset. 
					// Anonymous function(just like an object), d: current data object(https://www.informit.com/articles/article.aspx?p=2247311&seqNum=5)
					let minmax = d3.extent(data, function (d) { return d.date; }); 
					let minDate = minmax[0];
					let maxDate = minmax[1];
					//function to format the date to automatically update the start and end dates with dates from file
					//Nested function: In Javascript, function is like a variable.
					function formatDate(date) {
						var d = new Date(date), 
							month = '' + (d.getMonth() + 1),
							day = '' + d.getDate(),
							year = d.getFullYear();

						if (month.length < 2) 
							month = '0' + month;
						if (day.length < 2) 
							day = '0' + day;

						return [year, month, day].join('-');
					}
					//Initialize the startDate and endDate variables.
					let startDate;
					let endDate;

					//Choose the later of 1) the inputed start date or 2) the earliest date in the data.
					if (inputStartDate == null || inputStartDate < minDate || inputStartDate > maxDate) {
						startDate = minDate;
					} else {
						startDate = inputStartDate;
					}
					//update start date field with file start date
					htmlStartDate = formatDate (startDate);
					// querySelector only returns the first element found, not an array (and elements can't be accessed like arrays).
					// https://stackoverflow.com/questions/15148659/how-can-i-use-queryselector-on-to-pick-an-input-element-by-name
					var dateControl = document.querySelector('input[id="start"]');
					dateControl.value = htmlStartDate;
					//Choose the earlier of 1) the inputed end date or 2) the latest date in the data.
					if (inputEndDate == null || inputEndDate < inputStartDate || inputEndDate < minDate || inputEndDate > maxDate) {
						endDate = maxDate;
					} else {
						endDate = inputEndDate;
					}
					htmlEndDate = formatDate (endDate);
					var dateControl = document.querySelector('input[id="end"]');
					dateControl.value = htmlEndDate;
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
						comparisonAve = fifteenMinuteAve;
						comparisonMin = fifteenMinuteMin;
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
						comparisonAve = hourAve;
						comparisonMin = hourMin;
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
						comparisonAve = twelveHourAve;
						comparisonMin = twelveHourMin;
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
						comparisonAve = dayAve;
						comparisonMin = dayMin;
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
						comparisonAve = monthAve;
						comparisonMin = monthMin;
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
						comparisonAve = yearAve;
						comparisonMin = yearMin;
					}


					//Find the baseload of the data for use in the graph.
					//the + is used to coerce a value to a number:
					let minData = d3.min(data, function (d) { return +d.value });
					let aveData = d3.mean(data, function (d) { return +d.value});
					infoSize = $("#pickInfoSize").text();
					aveRelation = "less than";
					aveFeedback = "Great job!"
					if (aveData > comparisonAve) {
						aveRelation = "more than"
						aveFeedback = "You should try to reduce your energy usage."
					}

					minRelation = "less than";
					minFeedback = "Great job!"
					if (minData > comparisonMin) {
						minRelation = "more than"
						aveFeedback = "You should try to reduce your baseload."
					}
					addTip("Baseload is the minimum amount of energy delivered. <br>Your " + infoSize.toLowerCase() + " baseload usage for this selected time range is " + Math.round(minData * 100)/100 + " kWh. This is " + minRelation + " the UMass " + infoSize.toLowerCase() + " baseload of " + Math.round(comparisonMin * 100)/100 + " kWh. " + aveFeedback + " If you want to reduce your energy usage, if you have unused electronics, try turning them off.", "baseloadTip");
					addTip("Your " + infoSize.toLowerCase() + " average usage for this selected time range is " + Math.round(aveData * 100)/100 + " kWh. This is " + aveRelation + " the UMass " + infoSize.toLowerCase() + " average of "+  Math.round(comparisonAve * 100)/100 + " kWh. " + minFeedback + " If you want to reduce your energy baseload, you could try turning down the set temperatures on hot water heaters or your HVAC.", "averageTip");
					//Generate a bar graph.
					if ($('#pickGraphStyle').text() == "Bar Graph") {
						makeBarGraph(data, minData, aveData);
					} 
					//Generate a radial plot.
					else if ($('#pickGraphStyle').text() == "Radial Plot") {
						makeRadialPlot(data, minData, aveData)
					} 
					//Generate a line graph.
					else {
						makeLineGraph(data, minData, aveData);
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

	function makeLineGraph(data, min, ave) {

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

		// Add baseload line
		svg.append("line")
			.attr("x1", 0)
			.attr("x2", x(data[data.length - 1].date) )
			.attr("y1", y(min))		//note the x() and y() functions scale the data to the graph
			.attr("y2", y(min))
			.attr("stroke-width", 1.5)
			.attr("stroke-dasharray",4)
			.attr("stroke", "darkgreen")
			.attr("class", "baseload");

		svg.append("text")
			.attr("y", y(min)-5)//magic number here
			.attr("x", 5)
			.attr('text-anchor', 'left')
			.attr("class", "baseloadText")//easy to style with CSS
			.text("Baseload Energy Usage");
	
	}
	
	function makeBarGraph(data, min, ave) {

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

		// Add baseload line
                svg.append("line")
                        .attr("x1", 0)
                        .attr("x2", x(data[data.length - 1].date) )
                        .attr("y1", y(min))             //note the x() and y() functions scale the data to the graph
                        .attr("y2", y(min))
                        .attr("stroke-width", 1.5)
                        .attr("stroke-dasharray",4)
                        .attr("stroke", "darkgreen")
                        .attr("class", "baseload");

		svg.append("text")
                        .attr("y", y(min)-5)//magic number here
                        .attr("x", 5)
                        .attr('text-anchor', 'left')
                        .attr("class", "baseloadText")//easy to style with CSS
                        .text("Baseload Energy Usage");

	}

	function makeRadialPlot(data, min, ave) {
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


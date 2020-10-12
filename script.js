$("#submitButton").click(function () {
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
});

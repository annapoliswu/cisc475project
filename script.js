$("#submitButton").click(function () {
    let fileURL =  URL.createObjectURL($('#csvData').prop('files')[0]); //get file and then create temporary url for d3 to read

    d3.csv(fileURL).then(function(data) {

	    var svg = d3.select('svg')
	    	.attr("width", "100%")
	    	.attr("height", "100%")
	    	.attr("class", "graph-component");

	    var usages = [];
	    for(var j = 0; j < data.length; j++){
		    usages[j] = data[j].USAGE;
	    }

	    svg.selectAll("rect")
	    	.data(usages)
	    	.enter().append("rect")
	    		.attr("class", "bar")
	    		.attr("height", function(d,i) {return (d * 1000)})
	    		.attr("width","40")
	    		.attr("x", function(d,i) {return i * 60 + 45})
	    		.attr("y", function(d,i) {return(800 - (d * 1000))});

	    svg.selectAll("text")
	    	.data(usages)
	    	.enter().append("text")
	    	.text(function(d) {return d})
	    		.attr("class", "text")
	    		.attr("x", function(d,i) {return i * 60 + 50})
	    		.attr("y", function(d,i) {return(815 - (d * 1000))});

	    var yscale = d3.scaleLinear()
	    	.domain([0, d3.max(usages)])
	    	.range([800,0]);

	    var yaxis = d3.axisLeft()
	    	.scale(yscale);

	    svg.append("g")
	    	.attr("transform", "translate(50, 10)")
	    	.call(yaxis);

    }).catch( function(error){
        alert('error' + error);
    });
});

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
	    		.attr("x", function(d,i) {return i * 60 + 25})
	    		.attr("y", function(d,i) {return(800 - (d * 1000))});

	    svg.selectAll("text")
	    	.data(usages)
	    	.enter().append("text")
	    	.text(function(d) {return d})
	    		.attr("class", "text")
	    		.attr("x", function(d,i) {return i * 60 + 30})
	    		.attr("y", function(d,i) {return(815 - (d * 1000))});

    }).catch( function(error){
        alert('error' + error);
    });
});

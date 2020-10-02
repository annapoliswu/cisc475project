$("#submitButton").click(function () {
    let fileURL =  URL.createObjectURL($('#csvData').prop('files')[0]); //get file and then create temporary url for d3 to read

    /*
    var csv = URL.createObjectURL(new Blob([
    `12,43,21
    45,54,21
    87,13,17
    98,69,17`
    ]));
    */

    d3.csv(fileURL).then(function(data) {
	/*
        alert('data submitted, wait for display');
        $("#out").text(JSON.stringify(data));  //in array, data[i] for each item
	*/
	    console.log(data)

	    var svg = d3.select('svg')
	    	.attr("width", "100%")
	    	.attr("height", "100%")
	    	.attr("class", "graph-component");

	    var usages = [];
	    for(var j = 0; j < data.length; j++){
		    usages[j] = data[j].USAGE;
	    }
	    console.log(usages);

	    svg.selectAll("rect")
	    	.data(usages)
	    	.enter().append("rect")
	    		.attr("class", "bar")
	    		.attr("height", function(d,i) {return (d * 1000)})
	    		.attr("width","40")
	    		.attr("x", function(d,i) {return i * 60 + 25})
	    		.attr("y", function(d,i) {return(800 - (d * 1000))});



    }).catch( function(error){
        alert('error' + error);
    });
});

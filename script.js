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
        alert('data submitted, wait for display');
        $("#out").text(JSON.stringify(data));  //in array, data[i] for each item
        
    }).catch( function(error){
        alert('error' + error);
    });
});
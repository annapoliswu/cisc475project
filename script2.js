alert("script loaded");

var dictArray = [];
var referenceArray = [];
$("#submitButton").click(function () {
    alert("submit pressed");
    var fileInput = document.getElementById("csvData");

    var data = "";
    var readFile = function () {
        var reader = new FileReader();
        reader.onload = function () {
            data = reader.result;

            var allRows = data.split(/\r?\n|\r/);
            var table = '<table>';
            for (var singleRow = 0; singleRow < allRows.length; singleRow++) {
                if (singleRow === 0) {
                    table += '<thead>';
                    table += '<tr>';
                } else {
                    table += '<tr>';
                    var dict = {};
                }
                var rowCells = allRows[singleRow].split(',');
                for (var rowCell = 0; rowCell < rowCells.length; rowCell++) {
                    if (singleRow === 0) {
                        table += '<th>';
                        table += rowCells[rowCell];
                        table += '</th>';
                        referenceArray.push(rowCells[rowCell]);
                    } else {
                        table += '<td>';
                        table += rowCells[rowCell];
                        table += '</td>';
                        dict[referenceArray[rowCell]] = rowCells[rowCell];
                    }

                    document.getElementById('out').innerHTML = String(singleRow);
                }
                if (singleRow === 0) {
                    table += '</tr>';
                    table += '</thead>';
                    table += '<tbody>';
                } else {
                    table += '</tr>';
                    dictArray.push(dict);
                }
            }
            table += '</tbody>';
            table += '</table>';
            $('body').append(table);

            console.log(referenceArray);
            console.log(dictArray[0]);

        };
        // start reading the file. When it is done, calls the onload event defined above.
        reader.readAsText(fileInput.files[0]);
    };



    readFile();


});
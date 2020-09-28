alert("script loaded");

$("#submitButton").click(function () {
    alert("submit pressed");
    var fileInput = document.getElementById("csvData");

    var data = "";
    var readFile = function () {
        var reader = new FileReader();
        reader.onload = function () {
            data = reader.result;

            console.log(data);
            var allRows = data.split(/\r?\n|\r/);
            var table = '<table>';
            for (var singleRow = 0; singleRow < allRows.length; singleRow++) {
                if (singleRow === 0) {
                    table += '<thead>';
                    table += '<tr>';
                } else {
                    table += '<tr>';
                }
                var rowCells = allRows[singleRow].split(',');
                for (var rowCell = 0; rowCell < rowCells.length; rowCell++) {
                    if (singleRow === 0) {
                        table += '<th>';
                        table += rowCells[rowCell];
                        table += '</th>';
                    } else {
                        table += '<td>';
                        table += rowCells[rowCell];
                        table += '</td>';
                    }
                    document.getElementById('out').innerHTML = String(singleRow);
                }
                if (singleRow === 0) {
                    table += '</tr>';
                    table += '</thead>';
                    table += '<tbody>';
                } else {
                    table += '</tr>';
                }
            }
            table += '</tbody>';
            table += '</table>';
            $('body').append(table);

        };
        // start reading the file. When it is done, calls the onload event defined above.
        reader.readAsText(fileInput.files[0]);
    };



    readFile();


});
var XLSX = require('xlsx');
var color = require('chalk');
var workbook = XLSX.readFile('botData.xlsx');
var sheet_name_list = workbook.SheetNames;
var data = [];
data = sheet_name_list.map(function(y) {
    var worksheet = workbook.Sheets[y];
    var headers = {};
    var data = [];
    for(z in worksheet) {
        // if(z[0] === '!') continue;
        //parse out the column, row, and value
        var tt = 0;
        for (var i = 0; i < z.length; i++) {
            if (!isNaN(z[i])) {
                tt = i;
                break;
            }
        }
        var col = z.substring(0,tt);
        var row = parseInt(z.substring(tt));
        var value = worksheet[z].v;

        //store header names
        if(row == 1 && value) {
            headers[col] = value;
            continue;
        }

        if(!data[row]) data[row]={};
        data[row][headers[col]] = value;
    }
    //drop those first two rows which are empty
    data.shift();
    data.shift();
    // console.log(data);

    return data;
});

module.exports = data;
// console.log("DATA", data)


var workbook2 = XLSX.readFile('botData2.xlsx');
var sheet_name_list = workbook2.SheetNames;
var data2 = [];
data2 = sheet_name_list.map(function(y) {
    var worksheet = workbook2.Sheets[y];
    var headers = {};
    var data = [];
    for(z in worksheet) {
        // if(z[0] === '!') continue;
        //parse out the column, row, and value
        var tt = 0;
        for (var i = 0; i < z.length; i++) {
            if (!isNaN(z[i])) {
                tt = i;
                break;
            }
        }
        var col = z.substring(0,tt);
        var row = parseInt(z.substring(tt));
        var value = worksheet[z].v;

        //store header names
        if(row == 1 && value) {
            headers[col] = value;
            continue;
        }

        if(!data[row]) data[row]={};
        data[row][headers[col]] = value;
    }
    //drop those first two rows which are empty
    data.shift();
    data.shift();
    // console.log(data);

    return data;
});

module.exports = {
    data2,
    data
};
// console.log("DATA", data2)

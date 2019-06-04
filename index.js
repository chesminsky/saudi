const xlsxj = require('xlsx-to-json');

xlsxj({
    input: './files/saudi.xlsx',
    output: './data/output.json',
    sheet: 'Coverage I'
}, function (err, result) {
    if (err) {
        console.error(err);
    } else {
        console.log(result);
    }
});
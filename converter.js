const xlsxj = require('xlsx-to-json');
const fs = require('fs');
const dataColumns = require('./config.json').columns;

xlsxj({
    input: './files/saudi.xlsx',
    output: null,
    sheet: 'Coverage I'
}, function (err, result) {
    if (err) {
        console.error(err);
    } else {
        result = result.filter((item) => Boolean(item['id_on_map']));
        if (!fs.existsSync('./data')){
            fs.mkdirSync('./data');
        }
        fs.writeFileSync('./data/output.json', JSON.stringify(parseToNumbers(result)));
    }
});

function parseToNumbers(data) {
    return data.map((dataRow) => {
        dataColumns.forEach((key) => dataRow[key] = parseNumber(dataRow[key]));
        return dataRow;
    });
}

function parseNumber(number) {
    if (number === '' || number === '-' || number === '0') {
        return 0;
    }
    return parseFloat(number.replace(/\W|_|,+/g, ''));
}
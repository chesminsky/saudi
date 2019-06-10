const xlsxj = require('xlsx-to-json');
const fs = require('fs');
const config = require('./config.json');
const dataColumns = config.columns;
const sheet = config.sheet;

xlsxj({
    input: './files/saudi.xlsx',
    output: null,
    sheet
}, function (err, result) {
    if (err) {
        console.error(err);
    } else {
        if (!fs.existsSync('./data')){
            fs.mkdirSync('./data');
        }
        const allKeys = dataColumns.concat(['Region', 'Governorate']);
        result = result.filter((item) => Boolean(item['Region']) && Boolean(item['Governorate']));
        result = parseToNumbers(result);
        result = result.map((item) => {
            const lowered = {};
            Object.keys(item).forEach((key) => {
                if (allKeys.includes(key))
                lowered[key.toLowerCase()] = item[key];
            });
            return lowered;
        });
        fs.writeFileSync('./data/output.json', JSON.stringify(result));
    }
});

function parseToNumbers(data) {
    return data.map((dataRow) => {
        dataColumns.forEach((key) => dataRow[key] = parseNumber(dataRow[key]));
        return dataRow;
    });
}

function parseNumber(number) {
    if (!number || number === '-' || number === '0') {
        return 0;
    }
    return parseFloat(number.replace(/\W|_|,+/g, ''));
}
const xlsxj = require('xlsx-to-json');
const fs = require('fs');

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
        dataKeys.forEach((key) => dataRow[key] = parseNumber(dataRow[key]));
        return dataRow;
    });
}

function parseNumber(number) {
    if (number === '' || number === '-' || number === '0') {
        return 0;
    }
    return parseFloat(number.replace(/\W|_|,+/g, ''));
}

const dataKeys = [
    'number_of_connections',
    'number_of_households',
    'number_of_people',
    'population_off_grid',
    'population_supplied_with_standpipes_within_administrative_area',
    'population_supplied_with_tankers_within_administrative_area',
    'population_with_alternate_means_of_service'
];
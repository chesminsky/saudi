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
        fs.writeFileSync('./data/output.json', JSON.stringify(result));
    }
});
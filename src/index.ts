const { Highcharts } = (<any>window);
import series from './map.json';
import data from '../data/output.json';

document.addEventListener('DOMContentLoaded', function () {
    var chart = new Highcharts.mapChart('container', {
        series,

        plotOptions: {
            map: {
                tooltip: {
                    headerFormat: '',
                    pointFormat: '{point.name}'
                }
            },
            series: {
                point: {
                    events: {
                        click: function () {
                            const found = (<any>data).find((item: any) => {
                               return item.governorate.replace(/\W+/g, '') === this.name.replace(/\W+/g, '');
                            });

                            if (found) {
                                render(found);
                            } else {
                                clear();
                            }
                        }
                    }
                }
            }
        },
    });
});

function clear() {
    document.getElementById('table').innerHTML = 'no data';
}

function render(found: any) {
    document.getElementById('table').innerHTML = getTableRows(found);
}

function getTableRows(found: any) {
    return Object.keys(found).map((key) => {
        return `<tr><td>${key}</td><td>${found[key]}</td></tr>`
    }).join('');
}
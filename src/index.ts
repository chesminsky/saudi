const { Highcharts } = (<any>window);
import series from './map';

console.log(series);

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
                            console.log(this.name);
                        }
                    }
                }
            }
        },
    });
});


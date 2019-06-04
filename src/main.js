document.addEventListener('DOMContentLoaded', function () {
    var chart = new Highcharts.mapChart('container', {
        series: window.customMap,

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


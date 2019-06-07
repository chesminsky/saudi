import * as Highcharts from 'highcharts/highmaps';
import series from './map.json';
import data from '../data/output.json';
import groupBy from 'lodash/groupBy';

interface DataRow {
    governorate: string;
    id_on_map: string;
    number_of_connections: string;
    number_of_households: string;
    number_of_people: string;
    population_off_grid: string;
    population_supplied_with_standpipes_within_administrative_area: string;
    population_supplied_with_tankers_within_administrative_area: string;
    population_with_alternate_means_of_service: string;
    region: string;
    [key: string]: string;
};

interface MapSerie {
    type: string;
    data: Array<MapSerieItem>;
}

interface MapSerieItem {
    name: string;
    path: string;
}

class SaudiMap extends HTMLElement {

    data: Array<DataRow>;
    series: Array<MapSerie>;
    groupedSeries: Array<MapSerie>;

    constructor() {
        super();

        this.data = data;
        this.series = series;
    }

    connectedCallback() {
        this.innerHTML = this.template;

        const groupedData = groupBy(this.data, 'region');

        this.groupedSeries = Object.keys(groupedData).map((region: string) => {
            return 	{
                type: 'map',
                data: groupedData[region].map((d: DataRow) => {
                    return this.findInMap(d.governorate);
                }).filter((d) => Boolean(d))
            }
        });

        console.log(this.groupedSeries);

        this.initChart();
    }

    /**
     * Поиск по карте
     * @param name - имя из таблице
     */
    findInMap(name: string): MapSerieItem {
        return this.series[0].data.find((item: MapSerieItem) => {
            const regex = /\W|_+/g
            const mapName = item.name.replace(regex, '');
            const dataName = name.replace(regex, '');
            return mapName === dataName;
        });
    }

    /**
     * Поиск по таблице
     * @param name - имя из карты
     */
    findInTable(name: string): DataRow {
        return this.data.find((item: DataRow) => {
            const regex = /\W|_+/g
            const dataName = item.governorate.replace(regex, '');
            const mapName = name.replace(regex, '');
            return mapName === dataName;
        });
    }

    initChart() {
        const self = this;
        Highcharts.mapChart('container', {
            title: { text: 'Saudi Arabia' },
            series: (<any>this.groupedSeries),

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
                                const found = self.findInTable(this.name);

                                if (found) {
                                    self.render(found);
                                } else {
                                    self.clear();
                                }
                            }
                        }
                    }
                }
            },
        });

        Highcharts.mapChart('container2', {
            title: { text: 'Saudi Arabia' },
            series: (<any>this.series),

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
                                const found = self.findInTable(this.name);

                                if (found) {
                                    self.render(found);
                                } else {
                                    self.clear();
                                }
                            }
                        }
                    }
                }
            },
        });
    }



    clear() {
        this.querySelector('#table').innerHTML = 'no data';
    }

    render(found: DataRow) {
        this.querySelector('#table').innerHTML = this.getTableRows(found);
    }

    getTableRows(found: DataRow) {
        return Object.keys(found).map((key: string) => {
            return `<tr><td>${key}</td><td>${found[key]}</td></tr>`
        }).join('');
    }

    get template() {
        return `
            <style>
                #container {
                    height:600px;
                }
                #container2 {
                    height:600px;
                }
                .table {
                    table-layout: fixed;
                }
            </style>
            <div class="container">
                <div id="container"></div>
                <div id="container2"></div>
                <table id="table" class="table"></table>
            </div>
        `;
    }
}

customElements.define('saudi-map', SaudiMap);
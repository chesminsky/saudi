import * as Highcharts from 'highcharts/highmaps';
import series from './map.json';
import data from '../data/output.json';
import nodata from './no-data.json';
import groupBy from 'lodash/groupBy';
import capitalize from 'lodash/capitalize';
import pick from 'lodash/pick';
import { TableRow, MapSerie, MapSerieItem, MapFilter } from './types';

class SaudiMap extends HTMLElement {
    map: Highcharts.Chart;
    data: Array<TableRow>;
    series: Array<MapSerie>;
    groupedData: { [key: string]: Array<TableRow>}
    groupedSeries: Array<MapSerie>;
    selectedRegion: string;
    filter: MapFilter

    constructor() {
        super();
        this.data = data.concat(nodata);
        this.series = series;
        this.filter = this.options[0];
        this.selectedRegion = null;
    }

    connectedCallback() {
        this.innerHTML = this.template;

        this.groupedData = groupBy(this.data, 'region');

        this.groupedSeries = this.makeSeries();
        console.log(this.groupedData);
        console.log(this.groupedSeries);

        this.initChart();
        this.events();
    }

    makeSeries() {

        let data;
        if (this.selectedRegion) {
            data = pick(this.groupedData, this.selectedRegion);
        } else {
            data = this.groupedData;
        }
        return Object.keys(data).map((region: string) => {
            return 	{
                type: 'map',
                name: region,
                data: this.groupedData[region].map((d: TableRow) => {
                    const item = this.findInMap(d.governorate);
                    let value;
                    if (!this.selectedRegion) {
                        value = this.getRegionValue(this.filter, region);
                    } else {
                        value = this.getGovernotateValue(this.filter, region, d.governorate);
                    }
                    if (item) {
                        Object.assign(item, { region, value });
                    }
                    return item;
                }).filter((d) => Boolean(d))
            }
        });
    }

    /**
     * Поиск по карте
     * @param name - имя из таблицы
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
    findInTable(name: string): TableRow {
        return this.data.find((item: TableRow) => {
            const regex = /\W|_+/g
            const dataName = item.governorate.replace(regex, '');
            const mapName = name.replace(regex, '');
            return mapName === dataName;
        });
    }

    initChart() {
        const self = this;
        let text = 'Saudi Arabia';
        if (this.selectedRegion) {
            text += ` (${this.selectedRegion})`;
            this.$button.classList.remove('hidden');
        } else {
            this.$button.classList.add('hidden');
        }
        this.map = Highcharts.mapChart(<HTMLElement>(this.$map), {
            title: { text },
            series: (<any>this.makeSeries()),

            colorAxis: {
                min: 0
            },

            chart: {
                backgroundColor: '#fafafa'
            },
            plotOptions: {
                map: {
                    tooltip: {
                        headerFormat: '',
                        pointFormat: this.selectedRegion ? '{point.name}' : '{point.region}'
                    }
                },
                series: { 
                    states: {
                        hover: {
                            enabled: false
                        },
                    },
                    borderWidth: 0,
                    point: {
                        events: {
                            click: function (e) {
                                const found = self.findInTable(this.name);

                                if (found) {
                                    self.render(found);
                                } else {
                                    self.clear();
                                }
                                self.selectedRegion = this.region;
                                self.initChart();
                            }
                        }
                    }
                }
            },
        });
    }

    // --- template ---
    get $table() {
        return this.querySelector('.table');
    }

    get $map() {
        return this.querySelector('.map');
    }

    get $button() {
        return this.querySelector('.btn');
    }

    get $select() {
        return this.querySelector('.select');
    }

    clear() {
        this.$table.innerHTML = 'no data';
    }

    render(found: TableRow) {
        this.$table.innerHTML = this.getTableRows(found);
    }

    getTableRows(found: TableRow) {
        return Object.keys(found).map((key: string) => {
            if (key !== 'id_on_map') {
                return `<tr><td>${this.formatCode(key)}</td><td>${found[key]}</td></tr>`
            } else {
                return '';
            }
        }).join('');
    }

    get options(): Array<MapFilter> {
        return [
            'number_of_connections',
            'number_of_households',
            'number_of_people',
            'population_off_grid',
            'population_supplied_with_standpipes_within_administrative_area',
            'population_supplied_with_tankers_within_administrative_area',
            'population_with_alternate_means_of_service'
        ]
    }

    get template() {

        return `
            <style>
                saudi-map .map {
                    height:600px;
                }
                saudi-map .container {   
                    position: relative;
                }
                saudi-map .table {
                    table-layout: fixed;
                }
                saudi-map .select {
                    position: absolute;
                    top: 6px;
                    width: 300px;
                    left: 20px;
                    z-index: 1;
                }
                saudi-map .btn {
                    position: absolute;
                    top: 6px;
                    right: 20px;
                    z-index: 1;
                }
                .hidden {
                    display: none;
                }
            </style>
            <div class="container">
                <select class="select">
                    ${ this.options.map((o) => `<option value="${o}">${this.formatCode(o)}</option>`) }
                </select>
                <button class="btn btn-primary">Zoom out</button>
                <div class="map"></div>
                <table class="table"></table>
            </div>
        `;
    }

    events() {
        this.$select.addEventListener('change', (e: any) => {
            this.filter = e.target.value;
            this.initChart();
        });

        this.$button.addEventListener('click', (e: any) => {
            this.selectedRegion = null;
            this.initChart();
        });
    }

    // --- data calculations ---

    getGovernotateValue(filter: string, region: string, governorate: string): number {
        return <number>(this.groupedData[region].find((item) => item.governorate === governorate)[filter]);
    }


    getRegionValue(filter: string, region: string): number {
        return this.groupedData[region].reduce((acc: number, curr: TableRow) => acc += <number>(curr[filter]), 0)
    }

    // -- utils --
    formatCode(c: string) {
        return capitalize(c.replace(/_+/g, ' '));
    }
}

window.customElements.define('saudi-map', SaudiMap);
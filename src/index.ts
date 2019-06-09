import * as Highcharts from 'highcharts/highmaps';
import series from './map.json';
import data from '../data/output.json';
import nodata from './no-data.json';
import groupBy from 'lodash/groupBy';
import capitalize from 'lodash/capitalize';
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
        this.filter = 'number_of_connections';
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
        return Object.keys(this.groupedData).map((region: string) => {
            return 	{
                type: 'map',
                name: region,
                joinBy: ['name', this.filter],
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
        this.map = Highcharts.mapChart(<HTMLElement>(this.querySelector('.map')), {
            title: { text: 'Saudi Arabia' },
            series: (<any>this.groupedSeries),

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
                                self.hideOtherSeries(this.region);
                                self.updateMap();
                                self.map.zoomOut();
                                // self.map.mapZoom(0.7, self.map.xAxis[0].toValue(e.chartX), self.map.yAxis[0].toValue(e.y));
                            }
                        }
                    }
                }
            },
        });
    }

    showAllSeries() {
        this.map.series.forEach((s) => s.show());
    }

    hideOtherSeries(region: string) {
        this.map.series.forEach((s) => {
            if (s.name !== region) {
                s.hide();
            }
        });
    }

    updateMap() {
        this.map.update({
            series: (<any>this.makeSeries()),
            plotOptions: {
                map: {
                    tooltip: {
                        headerFormat: '',
                        pointFormat: this.selectedRegion ? '{point.name}' : '{point.region}'
                    }
                },
            }
        })
    }
    

    // --- template ---

    clear() {
        this.querySelector('.table').innerHTML = 'no data';
    }

    render(found: TableRow) {
        this.querySelector('.table').innerHTML = this.getTableRows(found);
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

    get options() {
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
                .map {
                    height:600px;
                }
                .container {   
                    position: relative;
                }
                .table {
                    table-layout: fixed;
                }
                .select {
                    position: absolute;
                    top: 6px;
                    width: 300px;
                    left: 20px;
                    z-index: 1;
                }
            </style>
            <div class="container">
                <select class="select">
                    ${ this.options.map((o) => `<option value="${o}">${this.formatCode(o)}</option>`) }
                </select>
                <div class="map"></div>
                <table class="table"></table>
            </div>
        `;
    }

    events() {
        this.querySelector('.select').addEventListener('change', (e: any) => {
            this.filter = e.target.value;
            this.updateMap();
        });
    }

    // --- data calculations ---

    getGovernotateValue(filter: string, region: string, governorate: string): number {
        return <number>(this.groupedData[region].find((item) => item.governorate === governorate)[filter]);
    }

    /*
    getGovernotateMaximumValue(filter: string, region: string): number {
        const byGovernorates =  this.groupedData[region].map((item) => this.getGovernotateValue(filter, region, item.governorate));
        const max = Math.max.apply(Math, byGovernorates);
        console.log('max governorate', max);
        return max;
    }
    */

    getRegionValue(filter: string, region: string): number {
        return this.groupedData[region].reduce((acc: number, curr: TableRow) => acc += <number>(curr[filter]), 0)
    }

    /*
    getRegionMaximumValue(filter: string): number {
        const byRegions =  Object.keys(this.groupedData).map((region) => this.getRegionValue(filter, region));
        return Math.max.apply(Math, byRegions);
    }
    */

    // -- utils --
    formatCode(c: string) {
        return capitalize(c.replace(/_+/g, ' '));
    }
}

customElements.define('saudi-map', SaudiMap);
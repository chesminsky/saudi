import * as Highcharts from 'highcharts/highmaps';
import series from './map.json';
import data from '../data/output.json';
import nodata from './no-data.json';
import groupBy from 'lodash/groupBy';
import capitalize from 'lodash/capitalize';

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
    name?: string;
    joinBy?: string[];
}

interface MapSerieItem {
    name: string;
    path: string;
    region?: string;
}

class SaudiMap extends HTMLElement {
    map: Highcharts.Chart;
    data: Array<DataRow>;
    series: Array<MapSerie>;
    groupedData: { [key: string]: Array<DataRow>}
    groupedSeries: Array<MapSerie>;
    mode: 'region' | 'governorate';
    selectedRegion: string;
    filter: 'number_of_connections' |
            'number_of_households' |
            'number_of_people' |
            'population_off_grid' |
            'population_supplied_with_standpipes_within_administrative_area' |
            'population_supplied_with_tankers_within_administrative_area' |
            'population_with_alternate_means_of_service'

    constructor() {
        super();
        this.mode = 'region';
        this.data = data.concat(nodata);
        this.series = series;
        this.filter = 'number_of_connections';
        this.selectedRegion = null;
    }

    connectedCallback() {
        this.innerHTML = this.template;

        this.groupedData = groupBy(this.data, 'region');

        this.groupedSeries = Object.keys(this.groupedData).map((region: string) => {
            return 	{
                type: 'map',
                name: region,
                // joinBy: ['name', 'value'],
                data: this.groupedData[region].map((d: DataRow) => {
                    const item = this.findInMap(d.governorate);
                    if (item) {
                        Object.assign(item, { region });
                    }
                    return item;
                }).filter((d) => Boolean(d))
            }
        });
        console.log(this.groupedData);
        console.log(this.groupedSeries);

        this.initChart();
        this.events();
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
        this.map = Highcharts.mapChart(<HTMLElement>(this.querySelector('.map')), {
            title: { text: 'Saudi Arabia' },
            series: (<any>this.groupedSeries),

            // colors: this.getRegionColors(),

            // colorAxis: {
            //     min: 1,
            //     max: 1000,
            //     type: 'logarithmic'
            // },

            chart: {
                backgroundColor: '#fafafa'
            },
            plotOptions: {
                map: {
                    tooltip: {
                        headerFormat: '',
                        pointFormat: this.mode === 'region' ? '{point.region}' : '{point.name}'
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
                                self.hideOtherSeries(this.region);
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

    clear() {
        this.querySelector('.table').innerHTML = 'no data';
    }

    render(found: DataRow) {
        this.querySelector('.table').innerHTML = this.getTableRows(found);
    }

    getTableRows(found: DataRow) {
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

    updateMap() {
        this.map.update({
            colors: this.getRegionColors()
        })
    }

    // colors calc

    getRegionColors() {
        return Object.keys(this.groupedData).map((region) => {
            const value = this.getRegionValue(this.filter, region);
            const maxValue = this.getRegionMaximumValue(this.filter);
            console.log(value);
            console.log(maxValue);
            return `rgba(100,149,237, ${ value/maxValue })`;
        });
    }

    getGovernorateColors() {
        return this.groupedData[this.selectedRegion].map((item) => {
            const value = this.getGovernotateValue(this.filter, this.selectedRegion, item.governorate);
            const maxValue = this.getGovernotateMaximumValue(this.filter, this.selectedRegion);
            console.log(value);
            console.log(maxValue);
            return `rgba(100,149,237, ${ value/maxValue })`;
        });
    }

    // --- data calculations ---

    getGovernotateValue(param: string, region: string, governorate: string): number {
        return this.parseNumber(this.groupedData[region].find((item) => item.governorate === governorate)[param]);
    }

    getGovernotateMaximumValue(param: string, region: string): number {
        const byGovernorates =  this.groupedData[region].map((item) => this.getGovernotateValue(param, region, item.governorate));
        return Math.max.apply(Math, byGovernorates);
    }

    getRegionValue(param: string, region: string): number {
        return this.groupedData[region].reduce((acc: number, curr: DataRow) => acc += this.parseNumber(curr[param]), 0)
    }

    getRegionMaximumValue(param: string): number {
        const byRegions =  Object.keys(this.groupedData).map((region) => this.getRegionValue(param, region));
        return Math.max.apply(Math, byRegions);
    }

    // -- utils --
    parseNumber(number: string) {
        if (number === '' || number === '-') {
            return 0;
        }
        return parseFloat(number.replace(/\W|_|,+/g, ''));
    }

    formatCode(c: string) {
        return capitalize(c.replace(/_+/g, ' '));
    }
}

customElements.define('saudi-map', SaudiMap);
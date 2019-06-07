import * as Highcharts from 'highcharts/highmaps';
import series from './map.json';
import data from '../data/output.json';

class SaudiMap extends HTMLElement {

    constructor() {
        super();
    }

    connectedCallback() {
        this.innerHTML = this.template;
        this.initChart();
    }

    initChart() {
        const self = this;
        Highcharts.mapChart('container', {
            title: { text: 'Saudi Arabia' },
            series: (<any>series),

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
                                    const regex = /\W|_+/g
                                    const dataName = item.governorate.replace(regex, '');
                                    const mapName = this.name.replace(regex, '');
                                    console.log(dataName, ' | ', mapName);
                                    return mapName.includes(dataName);
                                });

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

    render(found: any) {
        this.querySelector('#table').innerHTML = this.getTableRows(found);
    }

    getTableRows(found: any) {
        return Object.keys(found).map((key) => {
            return `<tr><td>${key}</td><td>${found[key]}</td></tr>`
        }).join('');
    }

    get template() {
        return `
            <style>
                #container {
                    height:600px;
                }
                .table {
                    table-layout: fixed;
                }
            </style>
            <div class="container">
                <div id="container"></div>
                <table id="table" class="table"></table>
            </div>
        `;
    }
}

customElements.define('saudi-map', SaudiMap);
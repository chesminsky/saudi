 export interface TableRow extends DataRow {
    governorate: string;
    id_on_map: string;
    region: string;
    [key: string]: string | number;
};

export interface DataRow {
    number_of_connections?: number;
    number_of_households?: number;
    number_of_people?: number;
    population_off_grid?: number;
    population_supplied_with_standpipes_within_administrative_area?: number;
    population_supplied_with_tankers_within_administrative_area?: number;
    population_with_alternate_means_of_service?: number;
}

export interface MapSerie {
    type: string;
    data: Array<MapSerieItem>;
    name?: string;
    joinBy?: string[];
}

export interface MapSerieItem extends DataRow {
    name: string;
    path: string;
    region?: string;
}

export type MapFilter = 'number_of_connections' |
                        'number_of_households' |
                        'number_of_people' |
                        'population_off_grid' |
                        'population_supplied_with_standpipes_within_administrative_area' |
                        'population_supplied_with_tankers_within_administrative_area' |
                        'population_with_alternate_means_of_service';
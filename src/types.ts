 export interface TableRow extends DataRow {
    governorate: string;
    id_on_map: string;
    region: string;
    [key: string]: string;
};

export interface DataRow {
    number_of_connections?: string;
    number_of_households?: string;
    number_of_people?: string;
    population_off_grid?: string;
    population_supplied_with_standpipes_within_administrative_area?: string;
    population_supplied_with_tankers_within_administrative_area?: string;
    population_with_alternate_means_of_service?: string;
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
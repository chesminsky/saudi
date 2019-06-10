 export interface TableRow {
    governorate: string;
    region: string;
    [key: string]: string | number;
};

export interface MapSerie {
    type: string;
    data: Array<MapSerieItem>;
    name?: string;
}

export interface MapSerieItem  {
    name: string;
    path: string;
    region?: string;
    [key: string]: string | number;
}

declare module 'table-extractor' {
    export interface TableData {
        headers: string[];
        rows: string[][];
    }

    export class TableExtractor {
        constructor();

        extract(text: string): Promise<TableData[]>;
    }
}



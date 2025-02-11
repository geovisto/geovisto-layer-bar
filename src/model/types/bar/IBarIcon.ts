// Geovisto core
import { IMap } from "geovisto";

/**
 * This type provides options for bar icon
 * 
 * @author Petr Cermak
 * @author Vladimir Korencik
 */
type IBarIconOptions = {
    data: IBarIconData;
    map: () => IMap | undefined;
    isGroup?: boolean;
    chartSize?: number;
    chartColor?: string;
    showAxisLabels?: boolean;
};

/**
 * This type provides values for bar icon
 * 
 * @author Petr Cermak
 * @author Vladimir Korencik
 */
type IBarIconData = {
    id?: string;
    // 2D table of values
    values: BarIconValues;
    // values are aggregated for each category (both primary and secondary)
    aggregatedValues: { [categoryName: string]: number };
    // category colors can be set for each category, secondary categories having precedence over primary categories
    categoryColors: { [categoryName: string]: string };
    aggregatedLocationNames: Set<string>;
};

type BarIconValues = { 
    [primaryCategoryName: string]: {
        [secondaryCategoryName: string]: number
    }
};

export type { IBarIconOptions, IBarIconData, BarIconValues };

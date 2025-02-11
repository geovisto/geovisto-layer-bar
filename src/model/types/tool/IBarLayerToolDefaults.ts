// Geovisto core
import {
    IIntegerRangeManager,
    ILayerToolDefaults,
    IMap,
    IMapAggregationFunction,
    IMapDataDomain,
    IMapDomainDimension,
    IMapFilterManager,
    IMapFilterOperation,
    IMapTypeDimension,
} from "geovisto";

import IBarLayerToolDimensions from "./IBarLayerToolDimensions";

/**
 * This interface provides functions which return the default state values.
 * 
 * @author Petr Cermak
 * @author Vladimir Korencik
 */
interface IBarLayerToolDefaults extends ILayerToolDefaults {
    getFiltersManager(): IMapFilterManager;

    getDimensions(map?: IMap): IBarLayerToolDimensions;

    getLocationNameDimension(map?: IMap): IMapDomainDimension<IMapDataDomain>;

    getLatitudeDimension(map?: IMap): IMapDomainDimension<IMapDataDomain>;

    getLongitudeDimension(map?: IMap): IMapDomainDimension<IMapDataDomain>;

    getPrimaryCategoryDimension(map?: IMap): IMapDomainDimension<IMapDataDomain>;

    getSecondaryCategoryDimension(map?: IMap): IMapDomainDimension<IMapDataDomain>;

    getValueDimension(map?: IMap): IMapDomainDimension<IMapDataDomain>;

    getChartColorDimension(): IMapTypeDimension<string>;

    getAggregationDimension(
        map?: IMap
    ): IMapDomainDimension<IMapAggregationFunction>;

    getChartSizeDimension(): IMapTypeDimension<number, IIntegerRangeManager>;

    getShowAxisLabelsDimension(): IMapTypeDimension<boolean>;

    getCategoryColorOperationDimension(): IMapDomainDimension<IMapFilterOperation>;

    getCategoryColorValueDimension(): IMapTypeDimension<string>;

    getCategoryColorDimension(): IMapTypeDimension<string>;
}

export default IBarLayerToolDefaults;

// Geovisto core
import {
    IIntegerRangeManager,
    ILayerToolDimensions,
    IMapAggregationFunction,
    IMapDataDomain,
    IMapDomainDimension,
    IMapFilterOperation,
    IMapTypeDimension,
} from "geovisto";

/**
 * This type provides the specification of the bar layer tool dimensions model.
 * 
 * @author Petr Cermak
 * @author Vladimir Korencik
 */
type IBarLayerToolDimensions = ILayerToolDimensions & {
    locationName: IMapDomainDimension<IMapDataDomain>;
    latitude: IMapDomainDimension<IMapDataDomain>;
    longitude: IMapDomainDimension<IMapDataDomain>;
    primaryCategory: IMapDomainDimension<IMapDataDomain>;
    secondaryCategory: IMapDomainDimension<IMapDataDomain>;
    value: IMapDomainDimension<IMapDataDomain>;
    aggregation: IMapDomainDimension<IMapAggregationFunction>;
    chartColor: IMapTypeDimension<string>;
    chartSize: IMapTypeDimension<number, IIntegerRangeManager>;
    showAxisLabels: IMapTypeDimension<boolean>;
    categoryColorOp: IMapDomainDimension<IMapFilterOperation>;
    categoryColorValue: IMapTypeDimension<string>;
    categoryColor: IMapTypeDimension<string>;
};

export default IBarLayerToolDimensions;

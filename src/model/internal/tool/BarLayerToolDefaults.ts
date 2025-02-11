// Geovisto core
import {
    BooleanTypeManager,
    CountAggregationFunction,
    EqFilterOperation,
    IIntegerRangeManager,
    IMap,
    IMapAggregationFunction,
    IMapDataDomain,
    IMapDomainDimension,
    IMapFilterManager,
    IMapFilterOperation,
    IMapTypeDimension,
    IntegerRangeManager,
    LayerToolDefaults,
    MapDomainArrayManager,
    MapDomainDimension,
    MapDynamicDomainDimension,
    MapFiltersManager,
    MapTypeDimension,
    NeqFilterOperation,
    RegFilterOperation,
    StringTypeManager,
    SumAggregationFunction,
} from "geovisto";

import IBarLayerToolDefaults from "../../types/tool/IBarLayerToolDefaults";
import IBarLayerToolDimensions from "../../types/tool/IBarLayerToolDimensions";

/**
 * This class provide functions which return the default state values.
 * 
 * @author Petr Cermak
 * @author Vladimir Korencik
 */
class BarLayerToolDefaults
    extends LayerToolDefaults
    implements IBarLayerToolDefaults {
    public static TYPE = "geovisto-tool-layer-bar";

    public getType(): string {
        return BarLayerToolDefaults.TYPE;
    }

    public getLayerName(): string {
        return "Bar layer";
    }

    public getLabel(): string {
        return this.getLayerName();
    }

    public getIcon(): string {
        return '<i class="fa fa-pie-chart"></i>';
    }

    public getFiltersManager(): IMapFilterManager {
        return new MapFiltersManager([
            new EqFilterOperation(),
            new NeqFilterOperation(),
            new RegFilterOperation(),
        ]);
    }


    public getDimensions(map?: IMap): IBarLayerToolDimensions {
        return {
            locationName: this.getLocationNameDimension(map),
            latitude: this.getLatitudeDimension(map),
            longitude: this.getLongitudeDimension(map),
            primaryCategory: this.getPrimaryCategoryDimension(map),
            secondaryCategory: this.getSecondaryCategoryDimension(map),
            value: this.getValueDimension(map),
            aggregation: this.getAggregationDimension(),
            chartColor: this.getChartColorDimension(),
            chartSize: this.getChartSizeDimension(),
            showAxisLabels: this.getShowAxisLabelsDimension(),
            categoryColorOp: this.getCategoryColorOperationDimension(),
            categoryColorValue: this.getCategoryColorValueDimension(),
            categoryColor: this.getCategoryColorDimension(),
        };
    }

    public getLocationNameDimension(map?: IMap): IMapDomainDimension<IMapDataDomain> {
        return new MapDynamicDomainDimension(
            "Location Name",
            () => map?.getState().getMapData() ?? this.getDataManager(),
            ""
        );
    }

    public getLatitudeDimension(map?: IMap): IMapDomainDimension<IMapDataDomain> {
        return new MapDynamicDomainDimension(
            "Latitude",
            () => map?.getState().getMapData() ?? this.getDataManager(),
            ""
        );
    }

    public getLongitudeDimension(
        map?: IMap
    ): IMapDomainDimension<IMapDataDomain> {
        return new MapDynamicDomainDimension(
            "Longitude",
            () => map?.getState().getMapData() ?? this.getDataManager(),
            ""
        );
    }

    public getPrimaryCategoryDimension(map?: IMap): IMapDomainDimension<IMapDataDomain> {
        return new MapDynamicDomainDimension(
            "Primary Category",
            () => map?.getState().getMapData() ?? this.getDataManager(),
            ""
        );
    }

    public getSecondaryCategoryDimension(map?: IMap): IMapDomainDimension<IMapDataDomain> {
        return new MapDynamicDomainDimension(
            "Secondary Category",
            () => map?.getState().getMapData() ?? this.getDataManager(),
            ""
        );
    }

    public getValueDimension(map?: IMap): IMapDomainDimension<IMapDataDomain> {
        return new MapDynamicDomainDimension(
            "Value",
            () => map?.getState().getMapData() ?? this.getDataManager(),
            ""
        );
    }

    public getAggregationDimension(): IMapDomainDimension<IMapAggregationFunction> {
        const domainManager = new MapDomainArrayManager([
            new CountAggregationFunction(),
            new SumAggregationFunction(),
        ]);

        return new MapDomainDimension(
            "Aggregation",
            domainManager,
            domainManager.getDefault()
        );
    }

    public getChartColorDimension(): IMapTypeDimension<string> {
        return new MapTypeDimension<string>(
            "Chart Color",
            new StringTypeManager(),
            "#E32400"
        );
    }

    public getChartSizeDimension(): IMapTypeDimension<
        number,
        IIntegerRangeManager
    > {
        return new MapTypeDimension<number, IIntegerRangeManager>(
            "Chart Size",
            new IntegerRangeManager(0, 50),
            0
        );
    }

    public getShowAxisLabelsDimension(): IMapTypeDimension<boolean>
    {
        return new MapTypeDimension<boolean>(
            "Show Axis Labels",
            new BooleanTypeManager()
        );
    }

    public getCategoryColorOperationDimension(): IMapDomainDimension<IMapFilterOperation> {
        const domainManager = new MapDomainArrayManager([
            new RegFilterOperation(),
            new EqFilterOperation(),
            new NeqFilterOperation(),
        ]);

        return new MapDomainDimension(
            "Operation",
            domainManager,
            domainManager.getDefault()
        );
    }

    public getCategoryColorValueDimension(): IMapTypeDimension<string> {
        return new MapTypeDimension<string>("Value", new StringTypeManager(), "");
    }

    public getCategoryColorDimension(): IMapTypeDimension<string> {
        return new MapTypeDimension<string>(
            "Color",
            new StringTypeManager(),
            "#4682B4"
        );
    }
}

export default BarLayerToolDefaults;

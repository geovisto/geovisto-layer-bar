// Geovisto core
import {
    IMapFilterManager,
    IMapToolInitProps,
    LayerToolState,
} from "geovisto";

// Internal
import { ICategoryColorRules } from "../../types/categoryColor/ICategoryColor";
import IBarLayerTool from "../../types/tool/IBarLayerTool";
import {
    IBarLayerToolConfig,
    IBarLayerToolDimensionsConfig,
} from "../../types/tool/IBarLayerToolConfig";
import IBarLayerToolDefaults from "../../types/tool/IBarLayerToolDefaults";
import IBarLayerToolDimensions from "../../types/tool/IBarLayerToolDimensions";
import IBarLayerToolProps from "../../types/tool/IBarLayerToolProps";
import IBarLayerToolState, {
    IWorkData,
} from "../../types/tool/IBarLayerToolState";

/**
 * This class provide functions for using the state of the layer tool.
 * 
 * @author Petr Cermak
 * @author Vladimir Korencik
 */
class BarLayerToolState
    extends LayerToolState
    implements IBarLayerToolState {
    private layer?: L.LayerGroup;
    private markers: L.Marker[];
    private workData: IWorkData[];
    private categoryColorRules!: ICategoryColorRules[];
    private manager!: IMapFilterManager;

    public constructor(tool: IBarLayerTool) {
        super(tool);

        this.markers = [];
        this.workData = [];
        this.categoryColorRules = [];
    }

    public initialize(
        defaults: IBarLayerToolDefaults,
        props: IBarLayerToolProps,
        initProps: IMapToolInitProps<IBarLayerToolConfig>
    ): void {
        if (props.dimensions) {
            this.setDimensions({
                locationName:
                    props.dimensions.locationName === undefined
                        ? defaults.getLocationNameDimension(initProps.map)
                        : props.dimensions.locationName,
                latitude:
                    props.dimensions.latitude === undefined
                        ? defaults.getLatitudeDimension(initProps.map)
                        : props.dimensions.latitude,
                longitude:
                    props.dimensions.longitude === undefined
                        ? defaults.getLongitudeDimension(initProps.map)
                        : props.dimensions.longitude,
                primaryCategory:
                    props.dimensions.primaryCategory === undefined
                        ? defaults.getPrimaryCategoryDimension(initProps.map)
                        : props.dimensions.primaryCategory,
                secondaryCategory:
                    props.dimensions.secondaryCategory === undefined
                        ? defaults.getSecondaryCategoryDimension(initProps.map)
                        : props.dimensions.secondaryCategory,
                value:
                    props.dimensions.value === undefined
                        ? defaults.getValueDimension(initProps.map)
                        : props.dimensions.value,
                aggregation:
                    props.dimensions.aggregation == undefined
                        ? defaults.getAggregationDimension()
                        : props.dimensions.aggregation,
                chartColor:
                    props.dimensions.chartColor == undefined
                        ? defaults.getChartColorDimension()
                        : props.dimensions.chartColor,
                chartSize:
                    props.dimensions.chartSize == undefined
                        ? defaults.getChartSizeDimension()
                        : props.dimensions.chartSize,
                showAxisLabels:
                        props.dimensions.showAxisLabels == undefined
                            ? defaults.getShowAxisLabelsDimension()
                            : props.dimensions.showAxisLabels,
                categoryColorOp:
                    props.dimensions.categoryColorOp === undefined
                        ? defaults.getCategoryColorOperationDimension()
                        : props.dimensions.categoryColorOp,
                categoryColorValue:
                    props.dimensions.categoryColorValue === undefined
                        ? defaults.getCategoryColorValueDimension()
                        : props.dimensions.categoryColorValue,
                categoryColor:
                    props.dimensions.categoryColor == undefined
                        ? defaults.getCategoryColorDimension()
                        : props.dimensions.categoryColor,
            });
        } else {
            this.setDimensions(defaults.getDimensions(initProps.map));
        }

        this.setFiltersManager(defaults.getFiltersManager());

        super.initialize(defaults, props, initProps);
    }

    public deserialize(config: IBarLayerToolConfig): void {
        super.deserialize(config);

        const rules: ICategoryColorRules[] = [];
        if (!config.categoryColorRules) {
            return;
        }

        config.categoryColorRules.forEach((filter) => {
            const operationName = filter.operation;
            if (operationName) {
                const operation = this
                    .getFiltersManager()
                    .getDomain(operationName);
                if (operation) {
                    rules.push({
                        operation,
                        value: filter.value,
                        color: filter.color,
                    });
                }
            }
        });
        config.categoryColorRules = rules.map(rule => {
            return {
                ...rule,
                operation: rule.operation?.getName()
            };
        });
        this.setCategoryColorRules(rules);
    }

    public deserializeDimensions(
        dimensionsConfig: IBarLayerToolDimensionsConfig
    ): void {
        const dimensions = this.getDimensions();

        if (dimensionsConfig.locationName)
            dimensions.locationName.setValue(
                dimensions.latitude
                    .getDomainManager()
                    .getDomain(dimensionsConfig.locationName)
            );
        if (dimensionsConfig.latitude)
            dimensions.latitude.setValue(
                dimensions.latitude
                    .getDomainManager()
                    .getDomain(dimensionsConfig.latitude)
            );
        if (dimensionsConfig.longitude)
            dimensions.longitude.setValue(
                dimensions.longitude
                    .getDomainManager()
                    .getDomain(dimensionsConfig.longitude)
            );
        if (dimensionsConfig.primaryCategory)
            dimensions.primaryCategory.setValue(
                dimensions.primaryCategory
                    .getDomainManager()
                    .getDomain(dimensionsConfig.primaryCategory)
            );
        if (dimensionsConfig.secondaryCategory)
            dimensions.secondaryCategory.setValue(
                dimensions.secondaryCategory
                    .getDomainManager()
                    .getDomain(dimensionsConfig.secondaryCategory)
            );
        if (dimensionsConfig.value)
            dimensions.value.setValue(
                dimensions.value.getDomainManager().getDomain(dimensionsConfig.value)
            );
        if (dimensionsConfig.aggregation)
            dimensions.aggregation.setValue(
                dimensions.aggregation
                    .getDomainManager()
                    .getDomain(dimensionsConfig.aggregation)
            );
        if (dimensionsConfig.chartColor)
            dimensions.chartColor.setValue(dimensionsConfig.chartColor);
        if (dimensionsConfig.chartSize !== undefined)
            dimensions.chartSize.setValue(dimensionsConfig.chartSize);
        if (dimensionsConfig.showAxisLabels !== undefined)
            dimensions.showAxisLabels.setValue(dimensionsConfig.showAxisLabels);
        if (dimensionsConfig.categoryColorOp)
            dimensions.categoryColorOp.setValue(
                dimensions.categoryColorOp
                    .getDomainManager()
                    .getDomain(dimensionsConfig.categoryColorOp)
            );
        if (dimensionsConfig.categoryColorValue)
            dimensions.categoryColorValue.setValue(
                dimensionsConfig.categoryColorValue
            );

        if (dimensionsConfig.categoryColor)
            dimensions.categoryColor.setValue(dimensionsConfig.categoryColor);
    }

    public serialize(
        defaults: IBarLayerToolDefaults | undefined
    ): IBarLayerToolConfig {
        const config: IBarLayerToolConfig = <IBarLayerToolConfig>(
            super.serialize(defaults)
        );

        config.categoryColorRules = [];
        this.categoryColorRules.forEach((filter: ICategoryColorRules) => {
            config.categoryColorRules?.push({
                operation: filter.operation?.getName(),
                value: filter.value,
                color: filter.color,
            });
        });

        const dimensions = this.getDimensions();

        config.data = {
            locationName: dimensions.locationName.getValue()?.getName(),
            latitude: dimensions.latitude.getValue()?.getName(),
            longitude: dimensions.longitude.getValue()?.getName(),
            primaryCategory: dimensions.primaryCategory.getValue()?.getName(),
            secondaryCategory: dimensions.secondaryCategory.getValue()?.getName(),
            value: dimensions.value.getValue()?.getName(),
            aggregation: dimensions.aggregation.getValue()?.getName(),
            chartColor: dimensions.chartColor.getValue(),
            chartSize: dimensions.chartSize.getValue(),
            showAxisLabels: dimensions.showAxisLabels.getValue(),
            categoryColorOp: dimensions.categoryColorOp.getValue()?.getName(),
            categoryColorValue: dimensions.categoryColorValue.getValue(),
            categoryColor: dimensions.categoryColor.getValue(),
        };

        return config;
    }


    public getFiltersManager(): IMapFilterManager {
        return this.manager;
    }


    public setFiltersManager(manager: IMapFilterManager): void {
        this.manager = manager;
    }


    public getDimensions(): IBarLayerToolDimensions {
        return super.getDimensions() as IBarLayerToolDimensions;
    }

    public setDimensions(dimensions: IBarLayerToolDimensions): void {
        super.setDimensions(dimensions);
    }

    public getLayer(): L.LayerGroup | undefined {
        return this.layer;
    }

    public setLayer(layer: L.LayerGroup): void {
        this.layer = layer;
    }

    public getMarkers(): L.Marker[] {
        return this.markers;
    }

    public setMarkers(markers: L.Marker[]): void {
        this.markers = markers;
    }

    public setCategoryColorRules(rules: ICategoryColorRules[]): void {
        this.categoryColorRules = rules;
    }

    public getCategoryColorRules(): ICategoryColorRules[] {
        return this.categoryColorRules;
    }

    public setWorkData(workData: Array<IWorkData>): void {
        this.workData = workData;
    }

    public getWorkData(): Array<IWorkData> {
        return this.workData;
    }
}

export default BarLayerToolState;

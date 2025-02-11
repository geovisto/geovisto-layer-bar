// Leaflet
import L from "leaflet";
import "leaflet.markercluster";
import "leaflet/dist/leaflet.css";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";
import tinycolor from "tinycolor2";

// own styles
import "../../../style/barLayer.scss";

// Geovisto core
import {
    AbstractLayerTool,
    DataChangeEvent,
    IMapAggregationFunction,
    IMapData,
    IMapDataDomain,
    IMapDataManager,
    IMapDomain,
    IMapDomainDimension,
    IMapEvent,
    IMapForm,
    IMapFormControl,
    IMapToolInitProps,
    LayerToolRenderType,
} from "geovisto";

// Geovisto Selection Tool API
import {
    ISelectionToolAPI,
    ISelectionToolAPIGetter,
} from "geovisto-selection";

// Internal
import IBarLayerTool from "../../types/tool/IBarLayerTool";
import { IBarLayerToolConfig } from "../../types/tool/IBarLayerToolConfig";
import IBarLayerToolDefaults from "../../types/tool/IBarLayerToolDefaults";
import IBarLayerToolProps from "../../types/tool/IBarLayerToolProps";
import IBarLayerToolState, {
    IWorkData,
} from "../../types/tool/IBarLayerToolState";
import BarLayerToolMapForm from "../form/BarLayerToolMapForm";
import BarLayerToolDefaults from "./BarLayerToolDefaults";
import BarLayerToolState from "./BarLayerToolState";
import IBarLayerToolDimensions from "../../types/tool/IBarLayerToolDimensions";
import BarIcon from "../bar/BarIcon";
import {
    IBarIconOptions,
    IBarIconData,
} from "../../types/bar/IBarIcon";

/**
* This class represents bar layer tool. It works with d3 to create bar icons and Leaflet MarkerCluster
* Icons are created {@link BarIcon}
*
* @author Petr Cermak
* @author Vladimir Korencik
* @author Petr Kaspar
*/
class BarLayerTool
    extends AbstractLayerTool
    implements IBarLayerTool, IMapFormControl {
    private selectionToolAPI: ISelectionToolAPI | undefined;
    private mapForm!: IMapForm;

    public constructor(props?: IBarLayerToolProps) {
        super(props);
    }

    public copy(): IBarLayerTool {
        return new BarLayerTool(this.getProps());
    }

    public getProps(): IBarLayerToolProps {
        return <IBarLayerToolProps>super.getProps();
    }

    public getDefaults(): IBarLayerToolDefaults {
        return <IBarLayerToolDefaults>super.getDefaults();
    }

    public getState(): IBarLayerToolState {
        return <IBarLayerToolState>super.getState();
    }

    protected createDefaults(): IBarLayerToolDefaults {
        return new BarLayerToolDefaults();
    }

    protected createState(): IBarLayerToolState {
        return new BarLayerToolState(this);
    }

    private getSelectionTool(): ISelectionToolAPI | undefined {
        if (this.selectionToolAPI == undefined) {
            const api = this.getMap()
                ?.getState()
                .getToolsAPI() as ISelectionToolAPIGetter;
            if (api.getGeovistoSelectionTool) {
                this.selectionToolAPI = api.getGeovistoSelectionTool();
            }
        }
        return this.selectionToolAPI;
    }

    public getMapForm(): IMapForm {
        if (this.mapForm == undefined) {
            this.mapForm = this.createMapForm();
        }
        return this.mapForm;
    }

    protected createMapForm(): IMapForm {
        return new BarLayerToolMapForm(this);
    }

    public initialize(
        initProps: IMapToolInitProps<IBarLayerToolConfig>
    ): this {
        return super.initialize(initProps);
    }

    protected createLayerItems(): L.MarkerClusterGroup[] {
        const layer = L.markerClusterGroup({
            spiderfyOnMaxZoom: false,
            maxClusterRadius: 65,
            iconCreateFunction: (cluster) => {
                const markers = cluster.getAllChildMarkers();
                const options = markers[0]?.options?.icon
                    ?.options as IBarIconOptions;
                const map = options.map;
                const data = this.getClusterData(markers);

                // create custom icon
                return new BarIcon({
                    data: data,
                    map,
                    isGroup: true,
                    chartSize: options.chartSize,
                    chartColor: options.chartColor,
                    showAxisLabels: options.showAxisLabels
                });
            },
        });

        const map = this.getMap()?.getState().getLeafletMap();

        // create handlers for cluster popups
        if (map) {
            layer
                .on("clustermouseover", (c) => {
                    const markers = c.propagatedFrom.getAllChildMarkers();
                    const data = this.getClusterData(markers);
                    const popupMsg = this.createPopupMessage(data);
                    L.popup()
                        .setLatLng(c.propagatedFrom.getLatLng())
                        .setContent(popupMsg)
                        .openOn(map);
                })
                .on("clustermouseout", function () {
                    map.closePopup();
                })
                .on("clusterclick", function () {
                    map.closePopup();
                });
        }
        // update state
        this.getState().setLayer(layer);

        this.render(LayerToolRenderType.LAYER);

        return [layer];
    }

    protected prepareMapData(): void {
        const dimensions: IBarLayerToolDimensions =
            this.getState().getDimensions();

        const locationNameDimension: IMapDataDomain | undefined =
            dimensions.locationName.getValue();

        const latitudeDimension: IMapDataDomain | undefined =
            dimensions.latitude.getValue();
        const longitudeDimension: IMapDataDomain | undefined =
            dimensions.longitude.getValue();

        const primaryCategoryDimension: IMapDataDomain | undefined =
            dimensions.primaryCategory.getValue();
        const secondaryCategoryDimension: IMapDataDomain | undefined =
            dimensions.secondaryCategory.getValue();

        const valueDimension: IMapDataDomain | undefined =
            dimensions.value.getValue();

        const aggregationDimension: IMapAggregationFunction | undefined =
            dimensions.aggregation.getValue();

        const map = this.getMap();
        const workData: IWorkData[] = [];

        if (
            locationNameDimension &&
            latitudeDimension &&
            longitudeDimension &&
            primaryCategoryDimension &&
            secondaryCategoryDimension &&
            valueDimension &&
            map
        ) {
            const mapData: IMapDataManager = map.getState().getMapData();
            const data: IMapData = map.getState().getCurrentData();

            for (let i = 0; i < data.length; i++) {
                const foundLocationNames = mapData.getDataRecordValues(
                    locationNameDimension,
                    data[i]
                );

                const locationName = 
                    foundLocationNames.length === 1 && typeof foundLocationNames[0] === "string" 
                            ? foundLocationNames[0] 
                            : "Unknown location";

                const foundLats = mapData.getDataRecordValues(latitudeDimension, data[i]);
                if (foundLats.length !== 1 || typeof foundLats[0] !== "number") {
                    continue;
                }

                const latitude = foundLats[0];

                const foundLongs = mapData.getDataRecordValues(longitudeDimension, data[i]);
                if (foundLongs.length !== 1 || typeof foundLongs[0] !== "number") {
                    continue;
                }

                const longitude = foundLongs[0];

                let dataItem = workData.find(
                    (item) => item.lat === foundLats[0] && item.lng === foundLongs[0]
                );

                if (!dataItem) {
                    dataItem = {
                        lat: latitude,
                        lng: longitude,
                        aggregatedValues: {},
                        values: {},
                        categoryColors: {},
                        aggregatedLocationNames: new Set<string>([locationName])
                    };

                    workData.push(dataItem);
                }

                const foundValues = mapData.getDataRecordValues(valueDimension, data[i]);
                if (foundValues.length !== 1 && typeof foundValues[0] !== "number") {
                    continue;
                }

                const value = foundValues[0] as number;

                const foundPrimaryCategories = mapData.getDataRecordValues(
                    primaryCategoryDimension,
                    data[i]
                );
                if (foundPrimaryCategories.length !== 1 || typeof foundPrimaryCategories[0] !== "string") {
                    continue;
                }

                const primaryCategory = foundPrimaryCategories[0];
                
                if (!dataItem.values[primaryCategory]) {
                    dataItem.values[primaryCategory] = {};
                }

                if (!dataItem.aggregatedValues[primaryCategory]) {
                    dataItem.aggregatedValues[primaryCategory] = 0;
                }

                const foundSecondaryCategories = mapData.getDataRecordValues(
                    secondaryCategoryDimension,
                    data[i]
                );
                
                const secondaryCategory = 
                    foundSecondaryCategories.length === 1 && typeof foundSecondaryCategories[0] === "string" 
                        ? foundSecondaryCategories[0] 
                        : "";

                if (!dataItem.aggregatedValues[secondaryCategory]) {
                    dataItem.aggregatedValues[secondaryCategory] = 0;
                }
                    
                dataItem.values[primaryCategory][secondaryCategory] = value;

                if (aggregationDimension) {
                    this.aggregateValues(dataItem, aggregationDimension, value, primaryCategory, secondaryCategory);
                }

                this.setCategoryColors(dataItem, primaryCategory, secondaryCategory);
            }
        }
        this.getState().setWorkData(workData);
    }

    private setCategoryColors(dataItem: IWorkData, primaryCategory: string, secondaryCategory: string): void {
        const rules = this.getState().getCategoryColorRules();

        for (const rule of rules) {
            if (rule.operation?.match(primaryCategory, rule.value)) {
                dataItem.categoryColors[primaryCategory] = rule.color ?? "steelblue";
                continue;
            }

            if (rule.operation?.match(secondaryCategory, rule.value)) {
                dataItem.categoryColors[secondaryCategory] = rule.color ?? "steelblue";
            }
        }
    }

    private aggregateValues(dataItem: IWorkData, aggregationDimension: IMapAggregationFunction, foundValue: number, primaryCategory: string, secondaryCategory: string): void {
        switch (aggregationDimension?.getName()) {
            case 'count': {
                dataItem.aggregatedValues[primaryCategory]++;
                dataItem.aggregatedValues[secondaryCategory]++;
                break;
            }
            case 'sum': {
                dataItem.aggregatedValues[primaryCategory] += foundValue;
                dataItem.aggregatedValues[secondaryCategory] += foundValue;
                break;
            }
            default:
                break;
        }
    }

    protected updateStyle(): void {
        const dimensions = this.getState().getDimensions();
        const barSizeDimension = dimensions.chartSize.getValue();
        const colorDimension = dimensions.chartColor.getValue();

        if (barSizeDimension) {
            this.getState()
                .getMarkers()
                ?.every((item: L.Marker) => {
                    const options = item?.options?.icon?.options as IBarIconOptions;
                    options.chartSize = barSizeDimension;
                });
        }

        if (colorDimension) {
            this.getState()
                .getMarkers()
                ?.every((item) => {
                    const options = item?.options?.icon?.options as IBarIconOptions;
                    options.chartColor = colorDimension;
                });
        }
    }

    public render(type: number): void {
        const layer = this.getState().getLayer();
        if (!layer) {
            return;
        }
        layer.clearLayers();

        switch (type) {
            case LayerToolRenderType.LAYER:
            case LayerToolRenderType.DATA:
                this.prepareMapData();
                this.createMarkers();
                this.updateStyle();
                break;
            default:
                this.createMarkers();
                this.updateStyle();
                break;
        }

        super.render(type);
    }

    protected createMarkers(): void {
        const data = this.getState().getWorkData();

        const markers = [];

        const layer = this.getState().getLayer();
        for (let i = 0; i < data.length; i++) {
            const point = this.createMarker(data[i]);
            if (point) {
                layer?.addLayer(point);
                markers.push(point);
            }
        }

        this.getState().setMarkers(markers);
    }

    protected createMarker(data: IWorkData): L.Marker | undefined {
        const popupMsg = this.createPopupMessage(data);
        const dimensions = this.getState().getDimensions();

        if (!data.lat || !data.lng) {
            return;
        }

        const point = L.marker([data.lat, data.lng], {
            icon: new BarIcon({
                data: data,
                isGroup: false,
                map: () => this.getMap(),
                chartSize: dimensions.chartSize.getValue(),
                chartColor: dimensions.chartColor.getValue(),
                showAxisLabels: dimensions.showAxisLabels.getValue()
            }),
        }).bindPopup(popupMsg);

        point
            .on("mouseover", function () {
                point.openPopup();
            })
            .on("mouseout", () => {
                point.closePopup();
            });

        return point;
    }

    protected getClusterData(childMarkers: L.Marker[]): IBarIconData {
        const clusterData: IBarIconData = {
            id: "<Group>",
            values: {},
            aggregatedValues: {},
            categoryColors: {},
            aggregatedLocationNames: new Set<string>()
        };

        for (const childMarker of childMarkers) {
            const options = childMarker.options?.icon?.options as IBarIconOptions;
            const markerData = options.data;
            const markerValues = markerData.values;

            for (const [primaryCategory, secondaryCategories] of Object.entries(markerValues)) {
                if (!clusterData.values[primaryCategory]) {
                    clusterData.values[primaryCategory] = {};
                }

                for (const secondaryCategory in secondaryCategories) {
                    if (!clusterData.values[primaryCategory][secondaryCategory]) {
                        clusterData.values[primaryCategory][secondaryCategory] = 0;
                    }

                    clusterData.values[primaryCategory][secondaryCategory] += markerValues[primaryCategory][secondaryCategory];
                }
            }

            markerData.aggregatedLocationNames.forEach((name) => clusterData.aggregatedLocationNames.add(name));
        }

        for (const childMarker of childMarkers) {
            const options = childMarker.options?.icon?.options as IBarIconOptions;
            const markerAggregatedValues = options.data.aggregatedValues;

            for (const [category, value] of Object.entries(markerAggregatedValues)) {
                if (!clusterData.aggregatedValues[category]) {
                    clusterData.aggregatedValues[category] = 0;
                }

                clusterData.aggregatedValues[category] += value;
            }
        }

        if (childMarkers.length !== 0) {
            const firstChildMarker = childMarkers[0];
            const options = firstChildMarker.options?.icon?.options as IBarIconOptions;
            clusterData.categoryColors = options.data.categoryColors;
        }

        return clusterData;
    }

    protected createPopupMessage(data: IBarIconData): string {
        const formatNumber = (num: number) => {
            const numParts = num.toString().split(".");
            numParts[0] = numParts[0].replace(/\B(?=(\d{3})+(?!\d))/g, " ");
            return numParts.join(".");
        };

        const getFontColor = (backgroundColor: string) => {
            const backgroundColorObject = tinycolor(backgroundColor);
            
            if (backgroundColorObject.isLight()) {
                return "#000000";
            }

            return "#FFFFFF";
        };

        const createHeaderElement = (scope: "row" | "col", text: string) => {
            const headerElement = document.createElement("th");
            headerElement.scope = scope;
            headerElement.textContent = text;

            return headerElement;
        };

        const primaryCategories: string[] = [];
        const secondaryCategories = new Set<string>();

        Object.entries(data.values).forEach(entry => {
            const [key, value] = entry;

            primaryCategories.push(key);

            Object.keys(value).forEach(key => {
                secondaryCategories.add(key);
            });
        });

        const tableElement = document.createElement("table");

        const captionElement = document.createElement("caption");
        tableElement.appendChild(captionElement);
        captionElement.textContent = Array.from(data.aggregatedLocationNames).join(", ");

        const tableHeadElement = document.createElement("thead");
        tableElement.appendChild(tableHeadElement);

        let rowElement = document.createElement("tr");
        tableHeadElement.appendChild(rowElement);

        let headerElement = createHeaderElement("col", secondaryCategories.size === 1 ? "Category" : "Primary / secondary");
        rowElement.appendChild(headerElement);

        secondaryCategories.forEach(secondaryCategory => {
            headerElement = createHeaderElement("col", secondaryCategory ? secondaryCategory : "Value");
            rowElement.appendChild(headerElement);
        });

        if (secondaryCategories.size > 1) {
            headerElement = createHeaderElement("col", "Aggregated");
            rowElement.appendChild(headerElement);
        }

        const tableBodyElement = document.createElement("tbody");
        tableElement.appendChild(tableBodyElement);

        primaryCategories.forEach(primaryCategory => {
            rowElement = document.createElement("tr");
            tableBodyElement.appendChild(rowElement);

            headerElement = createHeaderElement("row", primaryCategory);
            rowElement.appendChild(headerElement);

            secondaryCategories.forEach(secondaryCategory => {
                const dataElement = document.createElement("td");
                rowElement.appendChild(dataElement);

                const value = data.values[primaryCategory][secondaryCategory];
                dataElement.textContent = value ? value.toString() : "-";

                const categoryColor = data.categoryColors[secondaryCategory] ?? data.categoryColors[primaryCategory];
                if (categoryColor) {
                    dataElement.style["backgroundColor"] = categoryColor;
                }

                const backgroundColor = dataElement.style["backgroundColor"] ?? "#FFFFFF";
                const fontColor = getFontColor(backgroundColor);
                dataElement.style["color"] = fontColor;
            });

            if (secondaryCategories.size > 1) {
                const dataElement = document.createElement("td");
                rowElement.appendChild(dataElement);

                const value = data.aggregatedValues[primaryCategory];
                const valueString = value ? formatNumber(value) : "-";
                dataElement.textContent = valueString;
            }
        });

        const tableFootElement = document.createElement("tfoot");
        tableElement.appendChild(tableFootElement);

        rowElement = document.createElement("tr");
        tableFootElement.appendChild(rowElement);

        headerElement = createHeaderElement("row", "Aggregated");
        rowElement.appendChild(headerElement);

        secondaryCategories.forEach(secondaryCategory => {
            const dataElement = document.createElement("td");
            rowElement.appendChild(dataElement);

            const value = data.aggregatedValues[secondaryCategory];
            const valueString = value ? formatNumber(value) : "-";
            dataElement.textContent = valueString;
        });

        return tableElement.outerHTML;
    }

    public updateDimension(
        dimension: IMapDomainDimension<IMapDomain>,
        value: string,
        redraw: number | undefined
    ): void {
        if (!redraw) {
            const dimensions = this.getState().getDimensions();
            switch (dimension) {
                case dimensions.latitude:
                case dimensions.longitude:
                    redraw = LayerToolRenderType.LAYER;
                    break;
                case dimensions.locationName:
                case dimensions.aggregation:
                case dimensions.value:
                case dimensions.primaryCategory:
                case dimensions.secondaryCategory:
                    redraw = LayerToolRenderType.DATA;
                    break;
                default:
                    redraw = LayerToolRenderType.STYLE;
                    break;
            }
        }
        super.updateDimension(dimension, value, redraw);
    }

    public handleEvent(event: IMapEvent): void {
        switch (event.getType()) {
            case DataChangeEvent.TYPE():
                this.render(LayerToolRenderType.DATA);
                break;
            case this.getSelectionTool()?.getChangeEventType():
                this.render(LayerToolRenderType.STYLE);
                break;

            default:
                break;
        }
    }
}

export default BarLayerTool;

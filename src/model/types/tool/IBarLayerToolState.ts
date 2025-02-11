// Leaflet
import { LatLngLiteral } from "leaflet";

// Geovisto core
import { ILayerToolState, IMapFilterManager } from "geovisto";

import { IBarIconData } from "../bar/IBarIcon";
import { ICategoryColorRules } from "../categoryColor/ICategoryColor";
import {
    IBarLayerToolConfig,
    IBarLayerToolDimensionsConfig,
} from "./IBarLayerToolConfig";
import IBarLayerToolDefaults from "./IBarLayerToolDefaults";
import IBarLayerToolDimensions from "./IBarLayerToolDimensions";
import IBarLayerToolProps from "./IBarLayerToolProps";

/**
 * This type provides types for work data
 * 
 * @author Petr Cermak
 * @author Vladimir Korencik
 */
export type IWorkData = Partial<LatLngLiteral> & IBarIconData;

/**
 * This interface declares functions for using the state of the layer tool.
 * 
 * @author Petr Cermak
 * @author Vladimir Korencik
 */
interface IBarLayerToolState<
    TProps extends IBarLayerToolProps = IBarLayerToolProps,
    TDefaults extends IBarLayerToolDefaults = IBarLayerToolDefaults,
    TConfig extends IBarLayerToolConfig = IBarLayerToolConfig,
    TDimensionsConfig extends IBarLayerToolDimensionsConfig = IBarLayerToolDimensionsConfig,
    TDimensions extends IBarLayerToolDimensions = IBarLayerToolDimensions
> extends ILayerToolState<
    TProps,
    TDefaults,
    TConfig,
    TDimensionsConfig,
    TDimensions
> {
    getFiltersManager(): IMapFilterManager;

    setFiltersManager(manager: IMapFilterManager): void;

    setLayer(layer: L.LayerGroup): void;

    getLayer(): L.LayerGroup | undefined;

    getMarkers(): L.Marker[];

    setMarkers(markers: L.Marker[]): void;

    setCategoryColorRules(rules: ICategoryColorRules[]): void;

    getCategoryColorRules(): ICategoryColorRules[];

    setWorkData(workData: Array<IWorkData>): void;

    getWorkData(): Array<IWorkData>;
}

export default IBarLayerToolState;

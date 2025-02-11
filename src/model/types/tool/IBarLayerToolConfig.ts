// Geovisto core
import {
    ILayerToolConfig,
    ILayerToolDimensionsConfig,
} from "geovisto";

import { ICategoryColorRulesConfig } from "../categoryColor/ICategoryColor";

/**
 * This type provides specification of the bar layer tool config model.
 * 
 * @author Petr Cermak
 * @author Vladimir Korencik
 */
type IBarLayerToolConfig = ILayerToolConfig & {
    data?: IBarLayerToolDimensionsConfig;
    categoryColorRules?: ICategoryColorRulesConfig[];
};

/**
 * This type provides specification of the bar layer tool dimensions config model.
 * 
 * @author Petr Cermak
 * @author Vladimir Korencik
 */
type IBarLayerToolDimensionsConfig = ILayerToolDimensionsConfig & {
    locationName?: string;
    latitude?: string;
    longitude?: string;
    primaryCategory?: string;
    secondaryCategory?: string;
    value?: string;
    aggregation?: string;
    chartColor?: string;
    chartSize?: number;
    showAxisLabels?: boolean;
    categoryColorOp?: string;
    categoryColorValue?: string;
    categoryColor?: string;
};

export type { IBarLayerToolConfig, IBarLayerToolDimensionsConfig };

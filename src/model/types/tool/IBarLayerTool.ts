// Geovisto core
import { ILayerTool, IMapToolInitProps } from "geovisto";

import { IBarLayerToolConfig } from "./IBarLayerToolConfig";
import IBarLayerToolDefaults from "./IBarLayerToolDefaults";
import IBarLayerToolProps from "./IBarLayerToolProps";
import IBarLayerToolState from "./IBarLayerToolState";

/**
 * This interface declares the bar layer.
 * 
 * @author Petr Cermak
 * @author Vladimir Korencik
 */
interface IBarLayerTool<
    TProps extends IBarLayerToolProps = IBarLayerToolProps,
    TDefaults extends IBarLayerToolDefaults = IBarLayerToolDefaults,
    TState extends IBarLayerToolState = IBarLayerToolState,
    TConfig extends IBarLayerToolConfig = IBarLayerToolConfig,
    TInitProps extends IMapToolInitProps<TConfig> = IMapToolInitProps<TConfig>
> extends ILayerTool<TProps, TDefaults, TState, TConfig, TInitProps> {
    copy(): IBarLayerTool;
}

export default IBarLayerTool;

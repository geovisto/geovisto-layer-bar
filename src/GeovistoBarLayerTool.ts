import BarLayerTool from "./model/internal/tool/BarLayerTool";
import BarLayerToolDefaults from "./model/internal/tool/BarLayerToolDefaults";
import IBarLayerTool from "./model/types/tool/IBarLayerTool";
import IBarLayerToolProps from "./model/types/tool/IBarLayerToolProps";


export const GeovistoBarLayerTool: {
    getType: () => string;
    createTool: (props?: IBarLayerToolProps) => IBarLayerTool;
} = {
    getType: () => BarLayerToolDefaults.TYPE,
    createTool: (props) => new BarLayerTool(props),
};

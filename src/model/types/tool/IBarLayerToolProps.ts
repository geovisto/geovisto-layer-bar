// Geovisto core
import { ILayerToolProps } from "geovisto";

import IBarLayerToolDimensions from "./IBarLayerToolDimensions";

/**
 * This type provides the specification of the bar layer tool props model.
 * 
 * @author Petr Cermak
 * @author Vladimir Korencik
 */
type IBarLayerToolProps = ILayerToolProps & {
    dimensions?: IBarLayerToolDimensions;
};

export default IBarLayerToolProps;

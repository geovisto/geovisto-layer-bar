// Geovisto core
import {
    IIntegerRangeManager,
    IMapAggregationFunction,
    IMapDataDomain,
    IMapDomainDimension,
    IMapFilterOperation,
    IMapForm,
    IMapFormInput,
    IMapTypeDimension,
    LayerToolRenderType,
    MapLayerToolForm,
    TabDOMUtil,
} from "geovisto";

// Internal
import {
    ICategoryColorForm,
    ICategoryColorRules,
} from "../../types/categoryColor/ICategoryColor";
import IBarLayerTool from "../../types/tool/IBarLayerTool";
import IBarLayerToolDimensions from "../../types/tool/IBarLayerToolDimensions";

/**
 * This class provides controls for management of the layer sidebar tab.
 * 
 * @author Petr Cermak
 * @author Vladimir Korencik
 */
class BarLayerToolMapForm
    extends MapLayerToolForm<IBarLayerTool>
    implements IMapForm {
    private htmlContent!: HTMLDivElement;
    private tool: IBarLayerTool;
    private btnGroup: HTMLDivElement | null;
    private categoryColor!: HTMLDivElement;

    private inputs?: {
        locationName: IMapFormInput;
        latitude: IMapFormInput;
        longitude: IMapFormInput;
        primaryCategory: IMapFormInput;
        secondaryCategory: IMapFormInput;
        value: IMapFormInput;
        aggregation: IMapFormInput;
        chartColor: IMapFormInput;
        chartSize: IMapFormInput;
        showAxisLabels: IMapFormInput;
    };

    private categoryColorForm?: ICategoryColorForm[];

    public constructor(tool: IBarLayerTool) {
        super(tool);
        this.btnGroup = null;
        this.tool = tool;

        this.categoryColorForm = [];
    }

    public getTool(): IBarLayerTool {
        return this.tool;
    }

    public setInputValues(dimensions: IBarLayerToolDimensions): void {
        this.inputs?.locationName.setValue(
            dimensions.locationName.getValue()?.getName() ?? ""
        );
        this.inputs?.latitude.setValue(
            dimensions.latitude.getValue()?.getName() ?? ""
        );
        this.inputs?.longitude.setValue(
            dimensions.longitude.getValue()?.getName() ?? ""
        );
        this.inputs?.primaryCategory.setValue(
            dimensions.primaryCategory.getValue()?.getName() ?? ""
        );
        this.inputs?.secondaryCategory.setValue(
            dimensions.secondaryCategory.getValue()?.getName() ?? ""
        );
        this.inputs?.value.setValue(dimensions.value.getValue()?.getName() ?? "");
        this.inputs?.aggregation.setValue(
            dimensions.aggregation.getValue()?.getName() ?? ""
        );
        this.inputs?.chartColor.setValue(dimensions.chartColor.getValue() ?? "");
        this.inputs?.chartSize.setValue(dimensions.chartSize.getValue() ?? "");
        this.inputs?.showAxisLabels.setValue(false);
    }

    public getContent(): HTMLDivElement {
        if (this.htmlContent === undefined) {
            this.htmlContent = document.createElement("div");
            const elem = this.htmlContent.appendChild(document.createElement("div"));

            const dimensions: IBarLayerToolDimensions = this.getMapObject()
                .getState()
                .getDimensions();

            this.inputs = {
                locationName: this.getInputLocationName(dimensions.locationName),
                latitude: this.getInputLatitude(dimensions.latitude),
                longitude: this.getInputLongtitude(dimensions.longitude),
                primaryCategory: this.getInputPrimaryCategory(dimensions.primaryCategory),
                secondaryCategory: this.getInputSecondaryCategory(dimensions.secondaryCategory),
                value: this.getInputValue(dimensions.value),
                aggregation: this.getInputAggregation(dimensions.aggregation),
                chartColor: this.getInputChartColor(dimensions.chartColor),
                chartSize: this.getInputChartSize(dimensions.chartSize),
                showAxisLabels: this.getInputShowAxisLabels(dimensions.showAxisLabels)
            };

            elem.appendChild(this.inputs.locationName.create());
            elem.appendChild(this.inputs.latitude.create());
            elem.appendChild(this.inputs.longitude.create());
            elem.appendChild(this.inputs.primaryCategory.create());
            elem.appendChild(this.inputs.secondaryCategory.create());
            elem.appendChild(this.inputs.value.create());
            elem.appendChild(this.inputs.aggregation.create());
            elem.appendChild(this.inputs.chartColor.create());
            elem.appendChild(this.inputs.chartSize.create());
            elem.appendChild(this.inputs.showAxisLabels.create());

            elem.appendChild(this.getCategoryColorContent());

            this.setInputValues(dimensions);
        }

        return this.htmlContent;
    }

    private addSelectItem(rule?: ICategoryColorRules): void {
        if (this.htmlContent) {
            const elem: HTMLDivElement = this.htmlContent.insertBefore(
                document.createElement("div"),
                this.btnGroup
            );
            elem.setAttribute("class", "categoryClassesGroup");

            const minusButton = TabDOMUtil.createButton(
                '<i class="fa fa-minus-circle"></i>',
                (e: MouseEvent) => {
                    this.removeSelectItem(e);
                },
                "minusBtn"
            );

            elem.appendChild(minusButton);

            const dimensions: IBarLayerToolDimensions = this.getMapObject()
                .getState()
                .getDimensions();

            const categoryColorInputs = {
                operation: this.getInputCategoryColorOperation(
                    dimensions.categoryColorOp
                ),
                value: this.getInputCategoryColorValue(dimensions.categoryColorValue),
                color: this.getInputCategoryColor(dimensions.categoryColor),
            };

            elem.appendChild(categoryColorInputs.operation.create());
            elem.appendChild(categoryColorInputs.value.create());
            elem.appendChild(categoryColorInputs.color.create());

            if (rule) {
                categoryColorInputs.operation.setValue(rule.operation?.getName() ?? "");
                categoryColorInputs.value.setValue(rule.value ?? "");
                categoryColorInputs.color.setValue(rule.color ?? "");    
            }

            this.categoryColorForm?.push({
                inputs: categoryColorInputs,
                container: elem,
            });
        }
    }

    private removeSelectItem(e: MouseEvent): void {
        if (e.target) {
            const form = (<HTMLInputElement>e.target).closest(
                ".categoryClassesGroup"
            );

            this.categoryColorForm = this.categoryColorForm?.filter(
                (item) => item.container !== form
            );

            form?.remove();
        }
    }

    private applyFilters(): void {
        const rules: ICategoryColorRules[] = [];
        if (this.categoryColorForm) {
            this.categoryColorForm.forEach((form) => {
                const operationName = form.inputs?.operation.getValue() as string;
                const operation = this.getTool().getDefaults()
                    .getFiltersManager()
                    .getDomain(operationName);
                const value = form.inputs?.value.getValue() as string;
                const color = form.inputs?.color?.getValue() as string;

                if (operation && value && color) {
                    rules.push({
                        operation,
                        value: value,
                        color: color,
                    });
                }
            });
        }
        this.getTool()
            .getState()
            .setCategoryColorRules(rules as ICategoryColorRules[]);

        this.getTool().render(LayerToolRenderType.DATA);
    }

    private getCategoryColorContent(): HTMLDivElement {
        if (this.categoryColor === undefined) {
            const categoryColor = (this.categoryColor =
                document.createElement("div"));
            categoryColor.setAttribute("class", "categoryClasses");

            categoryColor.appendChild(document.createElement("hr"));

            const header = document.createElement("h2");
            header.innerText = "Category colors";
            categoryColor.appendChild(header);
        }

        this.btnGroup = this.htmlContent.appendChild(document.createElement("div"));

        this.btnGroup.appendChild(
            TabDOMUtil.createButton(
                '<i class="fa fa-plus-circle"></i>',
                () => {
                    this.addSelectItem();
                },
                "plusBtn"
            )
        );

        this.btnGroup.appendChild(
            TabDOMUtil.createButton(
                "Apply",
                () => {
                    this.applyFilters();
                },
                "applyBtn"
            )
        );

        const initialRules = this.getMapObject().getState().getCategoryColorRules();
        initialRules.forEach(rule => {
            this.addSelectItem(rule);
        });

        return this.categoryColor;
    }

    public getInputLocationName(
        dimension: IMapDomainDimension<IMapDataDomain>
    ): IMapFormInput {
        return this.getAutocompleteInput(dimension);
    }

    public getInputLatitude(
        dimension: IMapDomainDimension<IMapDataDomain>
    ): IMapFormInput {
        return this.getAutocompleteInput(dimension);
    }

    public getInputLongtitude(
        dimension: IMapDomainDimension<IMapDataDomain>
    ): IMapFormInput {
        return this.getAutocompleteInput(dimension);
    }

    public getInputPrimaryCategory(
        dimension: IMapDomainDimension<IMapDataDomain>
    ): IMapFormInput {
        return this.getAutocompleteInput(dimension);
    }

    public getInputSecondaryCategory(
        dimension: IMapDomainDimension<IMapDataDomain>
    ): IMapFormInput {
        return this.getAutocompleteInput(dimension);
    }

    public getInputValue(
        dimension: IMapDomainDimension<IMapDataDomain>
    ): IMapFormInput {
        return this.getAutocompleteInput(dimension);
    }

    public getInputAggregation(
        dimension: IMapDomainDimension<IMapAggregationFunction>
    ): IMapFormInput {
        return this.getAutocompleteInput(dimension);
    }

    public getInputChartColor(dimension: IMapTypeDimension<string>): IMapFormInput {
        return this.getColorInput(dimension);
    }

    public getInputChartSize(
        dimension: IMapTypeDimension<number, IIntegerRangeManager>
    ): IMapFormInput {
        return this.getSliderInput(dimension);
    }

    public getInputShowAxisLabels(
        dimension: IMapTypeDimension<boolean>
    ): IMapFormInput {
        return this.getCheckboxInput(dimension);
    }

    public getInputCategoryColorOperation(
        dimension: IMapDomainDimension<IMapFilterOperation>
    ): IMapFormInput {
        return this.getAutocompleteInput(dimension);
    }

    public getInputCategoryColorValue(
        dimension: IMapTypeDimension<string>
    ): IMapFormInput {
        return this.getTextInput(dimension);
    }
    
    public getInputCategoryColor(
        dimension: IMapTypeDimension<string>
    ): IMapFormInput {
        return this.getColorInput(dimension);
    }
}

export default BarLayerToolMapForm;

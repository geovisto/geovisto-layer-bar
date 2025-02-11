// d3
import * as d3 from "d3";

// Leaflet
import L from "leaflet";

import { IBarIconOptions, BarIconValues } from "../../types/bar/IBarIcon";

/** 
 * Provides creation of bar icon using d3.js
 * 
 * @author Petr Cermak
 */
const BarIcon: (new (options?: IBarIconOptions) => L.DivIcon) & typeof L.Class = 
    L.DivIcon.extend({
        options: {
            className: "div-country-icon",
        },

        createIcon: function (oldIcon: HTMLElement) {
            const div =
                oldIcon && oldIcon.tagName === "DIV"
                    ? oldIcon
                    : document.createElement("div");
            const divContent = div.appendChild(document.createElement("div"));

            const options = this.options;

            const data = options.data.values;

            const primaryCategoriesSums = getPrimaryCategoriesSums(data);
            const maxPrimaryCategorySum = Math.max(...Object.values(primaryCategoriesSums));
            const sortedPrimaryCategories = getSortedPrimaryCategories(primaryCategoriesSums);

            const sortedSecondaryCategories = getSortedSecondaryCategories(data);
            const stackedBarchartData = getStackedBarchartData(data, sortedPrimaryCategories, sortedSecondaryCategories);

            const chartColor = options.chartColor;
            const categoryColors = options.data.categoryColors;

            const leafletMap = options.map()?.getState().getLeafletMap();
            const zoom = leafletMap.getZoom();

            const barsSize = zoom * (10 + options.chartSize);

            const upperTextReserve = options.showAxisLabels ? 10 : 0;
            const xPathWidth = options.showAxisLabels ? 2 : 1;
            const yPathWidth = options.showAxisLabels ? 2 : 0;
            const tickSize = options.showAxisLabels ? 6 : 0;
            const fontSize = options.showAxisLabels ? Math.min(options.chartSize + 2, 20) : 0;
            const xAxisLegendHeight = options.showAxisLabels ? 200 : 0;
            const yAxisLegendWidth = options.showAxisLabels ? 200 : 0;

            const svgWidth = yAxisLegendWidth + barsSize;
            const svgHeight = upperTextReserve + xAxisLegendHeight + barsSize;

            options.iconSize = [svgWidth, svgHeight];
            options.iconAnchor = [yAxisLegendWidth + barsSize / 2, upperTextReserve + barsSize / 2];

            const divSelection = d3.select(divContent);
            const svg = divSelection.append("svg");
            svg
                .attr("width", svgWidth)
                .attr("height", svgHeight);

            const xAxisScale = d3.scaleBand()
                .domain(sortedPrimaryCategories)
                .range([0, barsSize])
                .padding(0.1);

            const yAxisScale = d3.scaleLinear()
                .domain([0, maxPrimaryCategorySum])
                .range([barsSize, 0]);

            const barsGroup = svg.append("g");
            barsGroup
                .attr("transform", `translate(${yAxisLegendWidth}, ${upperTextReserve})`);

            // add bars
            barsGroup
                .selectAll()
                .data(stackedBarchartData)
                .join("rect")
                    .attr("x", (dataElement) => xAxisScale(dataElement.primaryCategory) as number)
                    .attr("y", (dataElement) => yAxisScale(dataElement.yEnd))
                    .attr("height", (dataElement) => {
                        return yAxisScale(dataElement.yStart) - yAxisScale(dataElement.yEnd);
                    })
                    .attr("width", xAxisScale.bandwidth())
                    .attr("fill", (dataElement) => {
                        const secondaryCategory = dataElement.secondaryCategory;
                        const primaryCategory = dataElement.primaryCategory;

                        if (categoryColors && categoryColors[secondaryCategory]) {
                            return categoryColors[secondaryCategory];
                        }

                        if (categoryColors && categoryColors[primaryCategory]) {
                            return categoryColors[primaryCategory];
                        }

                        return chartColor ?? "steelblue";
                    });

            // add x-axis
            const xAxisSelection = svg.append("g");
            xAxisSelection
                .attr("transform", `translate(${yAxisLegendWidth}, ${barsSize + upperTextReserve})`)
                .call(d3.axisBottom(xAxisScale).tickSizeOuter(0));
            
            xAxisSelection
                .selectAll("path")
                .style("stroke", "black")
                .style("stroke-width", `${xPathWidth}px`);

            xAxisSelection
                .selectAll("line")
                .attr("y2", `${tickSize}px`)
                .style("stroke", "black");

            xAxisSelection
                .selectAll("text")
                .style("fill", "black")
                .style("font-size", `${fontSize}px`);

            // add y-axis
            const yAxisSelection = svg.append("g")
                .attr("transform", `translate(${yAxisLegendWidth}, ${upperTextReserve})`)
                .call(d3.axisLeft(yAxisScale));

            yAxisSelection
                .selectAll("path")
                .style("stroke", "black")
                .style("stroke-width", `${yPathWidth}px`);

            yAxisSelection
                .selectAll("line")
                .attr("x2", `-${tickSize}px`)
                .style("stroke", "black");

            yAxisSelection
                .selectAll("text")
                .style("fill", "black")
                .style("font-size", `${fontSize}px`);

            this._setIconStyles(div, "icon");

            return div;
        },
    });

export default BarIcon;

function getPrimaryCategoriesSums(data: BarIconValues) {
    const sums: {[primaryCategory: string]: number} = {};

    for (const primaryCategory in data) {
        const categoryValues = Object.values(data[primaryCategory]);

        sums[primaryCategory] = categoryValues.reduce((acc, value) => acc + value, 0);
    }

    return sums;
}

function getSortedPrimaryCategories(primaryCategoriesSums: {[primaryCategory: string]: number}) {
    const primaryCategories = Object.keys(primaryCategoriesSums);
    primaryCategories.sort((firstCategory, secondCategory) => primaryCategoriesSums[secondCategory] - primaryCategoriesSums[firstCategory]);
    return primaryCategories;
}

function getSortedSecondaryCategories(data: BarIconValues) {
    const sums: {[secondaryCategory: string]: number} = {};

    for (const primaryCategory in data) {
        for (const secondaryCategory in data[primaryCategory]) {
            if (!(secondaryCategory in sums)) {
                sums[secondaryCategory] = 0;
            }

            sums[secondaryCategory] += data[primaryCategory][secondaryCategory];
        }
    }

    const secondaryCategories = Object.keys(sums);
    secondaryCategories.sort((firstCategory, secondCategory) => sums[secondCategory] - sums[firstCategory]);
    return secondaryCategories;
}

type StackedBarchartData = {
    primaryCategory: string,
    secondaryCategory: string,
    yStart: number,
    yEnd: number
}[];

function getStackedBarchartData(data: BarIconValues, sortedPrimaryCategories: string[], sortedSecondaryCategories: string[]) {
    const stackedBarchartData: StackedBarchartData = [];

    for (const primaryCategory of sortedPrimaryCategories) {
        let yStart = 0;
        let yEnd = 0;

        for (const secondaryCategory of sortedSecondaryCategories) {
            yEnd += data[primaryCategory][secondaryCategory];

            stackedBarchartData.push({
                primaryCategory,
                secondaryCategory,
                yStart,
                yEnd
            });

            yStart = yEnd;
        }
    }

    return stackedBarchartData;
}

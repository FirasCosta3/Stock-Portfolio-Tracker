import {Line} from "react-chartjs-2";
import {Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Tooltip} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip)

export const LineGraph = ({graphData, symbol}) => {
    if (!graphData || Object.values(graphData).length === 0){
        return <p className="main-font" id="line-loading">Loading your stocks now...</p>
    }
    const graphPrices = Object.values(graphData)
    const graphTimes = Object.keys(graphData)
    const options = {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
        x: {
            display: false,
        },
        y: {
            ticks:{
                callback: function (value) {
                        const yAxisLabel = Number(value).toLocaleString("en-GB",{
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                        });
                        return `${symbol}${yAxisLabel}`;
                }
            }
            }
    },
        plugins: {
            legend: {
                display: false,
            },
            tooltip: {
                enables: true,
                backgroundColor: "transparent",
                titleFont: {
                    family: "sans-serif",
                    size: 16,
                },
                bodyFont: {
                    family: "sans-serif",
                    size: 15,
                },
                callbacks: {
                    label: function (value){
                        return ` ${symbol}`+(value.raw).toLocaleString("en-GB", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                        })
                    }
                }
            }
        }
    };

    const LineData = {
        labels: graphTimes,

        datasets: [
            {
                label: "Stock",
                data: graphPrices,
                borderColor: "green",
                backgroundColor: "green",
            }
        ]
    };

    return (
    <div id="line-chart-sizing">
        <Line options={options} data={LineData}/>
    </div>

    );
}
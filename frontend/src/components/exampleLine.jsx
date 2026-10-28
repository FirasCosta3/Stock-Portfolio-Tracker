import {Line} from "react-chartjs-2";
import {Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Tooltip} from "chart.js";
import {useState, useEffect} from "react"

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip)
export const ExampleLine = ({symbol, setBestWorst}) => {
    const randomPrices = Array.from({ length: 20 }, () => (Math.random() * 200) + 100);
    const [lineLoaded, setLineLoaded] = useState("")
    useEffect(() => {
        setBestWorst("Example stock graph")
        setLineLoaded(true)
    })
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
                enabled: true,
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
        labels: ["09/21 at 9:30", "09/22 at 9:30", "09/23 at 9:30", "09/24 at 9:30", "09/25 at 9:30", "09/26 at 9:30", "09/27 at 9:30", "09/28 at 9:30", "09/29 at 9:30", "09/30 at 9:30", "10/01 at 9:30", "10/02 at 9:30", "10/03 at 9:30",  "10/04 at 9:30", "10/05  at 9:30", "10/06  at 9:30", "10/07 at 9:30", "10/08 at 9:30", "10/09 at 9:30", "10/10 at 9:30"],

        datasets: [
            {
                label: "Stock",
                data: randomPrices,
                borderColor: "green",
                backgroundColor: "green",
            }
        ]
    };
    if (lineLoaded){
        return (
        <div className="line-chart-sizing">
            <Line options={options} data={LineData}/>
        </div>
        )
    }
}
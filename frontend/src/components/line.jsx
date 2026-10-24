import {Line} from "react-chartjs-2";
import {Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Title, Legend,} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Title, Legend)

export const LineGraph = (graphData) => {
    const data = graphData["graphData"] 
    const graphPrices = Object.values(data)
    const graphTimes = Object.keys(data)
    const options = {
        responsive: true,
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

    return <Line options={options} data={LineData}/>;
}
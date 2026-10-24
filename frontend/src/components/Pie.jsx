import { Pie } from "react-chartjs-2"
import { Chart as ChartJS, Tooltip, Legend, ArcElement, Title } from "chart.js"

ChartJS.register(Tooltip, Legend, ArcElement, Title);
 const randomColor = () =>{
        return "#" + Math.floor(Math.random()*16777215).toString(16).padStart(6, "0")
    };

export const PieChart = ({portfolio, symbol}) => {
    if (!portfolio || !portfolio || Object.keys(portfolio).length === 0){
        return <p className="main-font" id="loading-data">Loading your data...</p>
    }
    const options = {
        responsive: true,
    };
    const portfolio_data = portfolio
    const labels = Object.keys(portfolio_data)
    const stockValues = Object.values(portfolio_data)
    const investedAmount = stockValues.map((stock) => stock[2])
    const dynamicColors = labels.map(() => randomColor());
    const PieData = {
        labels: labels,
        datasets: [
            {
                label: "Value",
                data: investedAmount,
                borderColor: "#3DDC97",
                backgroundColor: dynamicColors,
                hoverOffset: 35,
                radius: "90%",
            }
        ]
    }

    return <Pie options={options} data={PieData}/>
};


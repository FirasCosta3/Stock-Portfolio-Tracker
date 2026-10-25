import { Pie } from "react-chartjs-2"
import { Chart as ChartJS, Tooltip, Legend, ArcElement, } from "chart.js"

ChartJS.register(Tooltip, Legend, ArcElement);
 const randomColor = () =>{
        return "#" + Math.floor(Math.random()*16777215).toString(16).padStart(6, "0")
    };

export const PieChart = ({portfolio, symbol}) => {
    if (!portfolio || Object.keys(portfolio).length === 0){
        return <p className="main-font" id="loading-data">Loading your data...</p>
    }
    const options = {
        responsive: true,
        plugins:{
            tooltip: {
                enabled: true,
                backgroundColor: "#38B521",
                titleColor: "black",
                bodyColor: "black",
                cornerRadius: 8,
                padding: 7,
                titleFont: {
                    family: "sans-serif",
                    size: 16,  
                },
                bodyFont: {
                    family: "sans-serif",
                    size: 16,
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
    const portfolio_data = portfolio
    const labels = Object.keys(portfolio_data)
    const stockValues = Object.values(portfolio_data)
    const investedAmount = stockValues.map((stock) => stock[2])
    const dynamicColors = labels.map(() => randomColor());
    const PieData = {
        labels: labels,
        datasets: [
            {
                data: investedAmount,
                borderColor: "green",
                backgroundColor: dynamicColors,
                hoverOffset: 35,
                radius: "90%",
            }
        ]
    }

    return <Pie options={options} data={PieData}/>
};


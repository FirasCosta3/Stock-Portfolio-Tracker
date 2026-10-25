import { Pie } from "react-chartjs-2"
import { Chart as ChartJS, Tooltip, Legend, ArcElement, } from "chart.js"
import {ExamplePie} from "./examplePie.jsx"
import {randomColor} from "../constants/randomColor.js"

ChartJS.register(Tooltip, Legend, ArcElement);

export const PieChart = ({portfolio, symbol, setPortfolioValue}) => {
    if (!portfolio || Object.keys(portfolio).length === 0){
        return <ExamplePie symbol={symbol} setPortfolioValue ={setPortfolioValue}/>
    }
    const options = {
        responsive: true,
        plugins:{
            animation: {
                duration: 2500,
            },
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

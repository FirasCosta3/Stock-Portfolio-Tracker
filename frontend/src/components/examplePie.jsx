import {Pie} from "react-chartjs-2"
import {Chart as ChartJS, Tooltip, Legend, ArcElement} from "chart.js"
import {randomColor} from "../constants/randomColor.js"
import {useEffect, useState} from "react"

ChartJS.register(Tooltip,Legend, ArcElement)
export const ExamplePie = ({symbol, setPortfolioValue}) => {
    const [portDone, setPortDone] = useState(false)
    const labels = ["Example 1", "Example 2", "Example 3"]
    const options = {
        responsive: true,
        animation: {
            duration: 1000,
        },
        plugins:{
            tooltip: {
                enabled: true,
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
    const dynamicColors = labels.map(() => randomColor())
    const numberStocks = labels.map(() => Math.floor((Math.random()+1)*10)*2635.34)
    useEffect(() => {
    const total = numberStocks.reduce((value, total) =>{
        return value+total
    }); 
    setPortfolioValue(total.toLocaleString("en-GB"))
    setPortDone(true)
    },[])
    const pieData = {
        labels: labels,
        datasets: [
            {
                data: numberStocks,
                borderColor: "green",
                backgroundColor: dynamicColors,
                hoverOffset: 35,
                radius: "90%",
            }
        ]
    }
    if (portDone){
        return <Pie options={options} data={pieData}/>
    }
}   
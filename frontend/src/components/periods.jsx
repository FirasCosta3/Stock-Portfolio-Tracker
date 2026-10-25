import {periods} from "../constants/periods.js"
import "../App.css"

const period = Object.keys(periods)
export const PeriodButtons = ({periodChange, setTimePeriod, timePeriod}) => {
    return (
        <div id="periods-div">
            {period.map((times) => {
                return (
                    <button className={timePeriod === times ? "active": ""} key={times} onClick={() => {periodChange(times); setTimePeriod(times)}} id="period-button">{times}</button>
                )
            })}
        </div>
    )
}
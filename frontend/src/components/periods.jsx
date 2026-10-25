import {periods} from "../constants/periods.js"
import "../App.css"

const period = Object.keys(periods)
export const PeriodButtons = ({periodChange}) => {
    return (
        <div id="periods-div">
            {period.map((times) => {
                return (
                    <button key={times} onClick={() => periodChange(times)} className="period-button">{times}</button>
                )
            })}
        </div>
    )
}
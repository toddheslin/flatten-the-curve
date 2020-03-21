import React, { useContext } from 'react'
import {GlobalStateContext} from "../context/GlobalContextProvider"
import {LineChart, Line, XAxis, YAxis, Tooltip, Legend, Label} from 'recharts'

const CumulativeGraph = ({max_countries = 10, field = 'confirmed', max_days = 30}) => {
    const {cumulative_confirmed, cumulative_deaths} = useContext(GlobalStateContext)
    

    const ready_to_graph = [];
    (field == 'confirmed' ? cumulative_confirmed : cumulative_deaths).slice(0,max_countries).forEach((c) => {
        
        c[field].forEach(time => {
            if(ready_to_graph.length <= parseInt(time.num_day)){
                ready_to_graph[time.num_day] = {
                    num_day: time.num_day,
                    [c.country_name]: time[field]
                }
            }
            else ready_to_graph[time.num_day][c.country_name] = time[field]

        })
        
    })

    const colors= [
        "#40407a",
        "#2c2c54",
        "#ff5252",
        "#b33939",
        "#706fd3",
        "#474787",
        "#ff793f",
        "#cd6133",
        "#34ace0",
        "#227093",
        "#ffb142",
        "#cc8e35",
        "#33d9b2",
        "#218c74",
        "#ffda79",
        "#ccae62"
    ]

    // Make one big array of objects 
    
    for(let i = 0; i < max_days; i++){
        if(i == 0) ready_to_graph[i]['30% Growth'] = field == 'confirmed' ? 100: 10
        else ready_to_graph[i]['30% Growth'] = (ready_to_graph[i - 1]['30% Growth'] * 1.3).toFixed(0)
    }




    return (
        <>
            <LineChart width={1000} height={450} data={ready_to_graph} margin={{right: 20}}>
                <XAxis dataKey="num_day" name="Days" type="number" />
                <YAxis width={55} type="number" scale="log" domain={['auto', 'auto']}/>
                {Object.keys(ready_to_graph[0]).filter(key => key != 'num_day' && key != '30% Growth').map( (key, i) => {
                    return <Line type="monotone" stroke={colors[i]} dataKey={key} dot={false} strokeWidth={3}/>
                })}
                <Line type="monotone" stroke='#aaa' dataKey='30% Growth' strokeOpacity={0.25} dot={false} strokeWidth={3}/>
                <Tooltip/>
                <Legend align="right" verticalAlign="middle" layout="vertical" iconType="square"/>
            
            </LineChart>
        </>
    )
}

export default CumulativeGraph
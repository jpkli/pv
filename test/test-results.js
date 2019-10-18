import p5 from '..'
import {vis} from 'p3'

import jsonResults from './results/p5-json-2m.json'
import binaryResults from './results/p5-typedArray-2m.json'

export default function() {
  jsonResults[0].time = jsonResults[0].ProcTime;
  for(let i = 1, l = jsonResults.length; i < l; i++) {
    jsonResults[i].ProcTime += jsonResults[i-1].ProcTime;
  }

  console.log(jsonResults)
  let data = {
    json: jsonResults,
    vmap: {
        x: 'completed',
        y: 'ProcTime',
        size: 1,
        color: 'steelblue'
    }
  }
  
  let view = {
    container: 'body',
    width: 800,
    height: 500,
    padding: {left: 100, right: 10, top: 10, bottom: 60},
    axes: true
  }

  new vis.Spline(data, view).render()
}

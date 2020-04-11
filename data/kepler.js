import { randomJSONs, randomArrays } from './utils';

let dataProps = [
    {name: 'ApparentMagnitude', dtype: 'float', dist: 'normal', min: -27, max: 27, mean: 12, std: 3},
    {name: 'GroundLongtitude', dtype: 'float', dist: 'uniform', min: 65.0, max: 85.0},
    {name: 'GroundLatitude', dtype: 'float', dist: 'uniform', min: 5.0, max: 25.0},  
    {name: 'RightAscension', dtype: 'float', dist: 'uniform', min: 279.62749, max: 301.82369},
    {name: 'Decline', dtype: 'float', dist: 'uniform', min: 36.55995, max: 52.47462},  
]

let schema = {};
for(let prop of dataProps) {
    schema[prop.name] = prop.dtype;
}

function Kepler(arg) {
    let dataSize = (Number.isInteger(arg)) ? arg : arg.size;
    let props = arg.props || dataProps;
    let type = arg.type || 'json';
    let data = (type === 'json') ? randomJSONs({props: props, size: dataSize}): randomArrays({props: props, size: dataSize});
    return { data, schema };
}

Kepler.schema = schema;

export default Kepler;
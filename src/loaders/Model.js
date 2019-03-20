import p4 from 'p4';

let dataModels = {
  TimeSeries: {
    timesteps: 1,
    series: 512,
    interval: 100,
    props: [
        {name: 'traffic', dtype: 'int',  dist: 'normal', min: 0, max: 10000, mean: 500, std: 180},
        {name: 'sattime', dtype: 'float',  dist: 'normal', min: 0, max: 10000, mean: 500, std: 180}
    ]
  },
  Babies: {}
}

export default class Synthetic {
  constructor({
    name = 'Babies',
    prop = {}
  }) {
    if (Object.keys(dataModels).indexOf(name) === -1) {
      throw Error('No data model found for ' + name)
    }
    this.model = name
    this.prop = prop
  }

  fetch (nrows = 1000) {
    let modelProps = Object.assign(this.prop, dataModels[this.model])
    modelProps.size = nrows
    modelProps.timesteps = nrows  
    let data = p4.datasets[this.model](modelProps)
    return new Promise((resolve, reject) => {
      resolve(data)
    })
  }
}

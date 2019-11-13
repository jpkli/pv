# PV: Portable Progressive Parallel Processing Pipelines

PV is a JavaScript toolkit for progressive parallel processing and visualization. PV leverages [P4](https://github.com/jpkli/p4) for parallel data processing and rendering, and provides an intuitive API for implementing progressive workflows. 

## Demo
This [demo](https://jpkli.github.io/pv/demos) shows how PV can support progressive visualizations with multiple views and user interactions. 


## Development

The development of PV is still in early stage. More development and software engineering efforts will be given to make PV more useful for building progressive visualization and visual analytics application. Please comment, discuss, or request new features using [the PV GitHub issue page](https://github.com/jpkli/pv/issues). 


## Reference Paper

The current work is based on the following research paper.

Jianping Kelvin Li and Kwan-Liu Ma. "P5: Portable Progressive Parallel Processing Pipelines for Interactive Data Analysis and Visualization". IEEE Transactions on Visualization and Computer Graphics, 2019. DOI [10.1109/TVCG.2019.2934537](https://doi.org/10.1109/TVCG.2019.2934537).


## Build

To build and run locally:

```
npm install
npm start
```

The demos can be accessed via http://localhost:8080/demos/

## Example 
```javascript
let example = pv(config)
.input({
  source: 'data.csv',
  method: 'file',
  batchSize: 500000,
  type: 'text/csv',
  delimiter: ','
})
.batch([
  {
    match: {
      MotherAge: [18, 50],
      FatherAge: [18, 70]
    },
    aggregate: {
      $group: ['FatherAge', 'MotherAge'],
      $collect: {
        Babies: {$count: '*'}
      }
    }
  }
])
.progress([
  {
    visualize: {
      mark: 'rect',
      x: 'MotherAge',
      y: 'FatherAge',
      color: 'Babies'
  }
])
.execute({mode: ‘automatic’})
```

<img width=600 src="https://jpkli.github.io/demos/images/p5/example.png">


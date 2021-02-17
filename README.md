# PV: Portable Progressive Parallel Processing Pipelines

PV is a research prototype for developing a progressive parallel processing and visualization toolkit in JavaScript. PV leverages [P4](https://github.com/jpkli/p4) for parallel data processing and rendering, and provides an intuitive API for implementing progressive workflows. 

## Demo
This [demo](https://jpkli.github.io/pv/demos) shows how PV can support progressive visualizations with multiple views and user interactions. 


## Development

The development of PV is still in early stage. More development and software engineering efforts will be given to make PV more useful for building progressive visualization and visual analytics application. Please comment, discuss, or request new features using [the PV GitHub issue page](https://github.com/jpkli/pv/issues). 


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


## Reference Paper

This work is based on my research paper:

Jianping Kelvin Li and Kwan-Liu Ma. "P5: Portable Progressive Parallel Processing Pipelines for Interactive Data Analysis and Visualization". IEEE Transactions on Visualization and Computer Graphics, 2019. DOI [10.1109/TVCG.2019.2934537](https://doi.org/10.1109/TVCG.2019.2934537).

```bibtex
@article{li2019p5,
    title={P5: Portable Progressive Parallel Processing Pipelines for Interactive Data Analysis and Visualization},
    author={Li, Jianping Kelvin and Ma, Kwan-Liu},
    journal={IEEE Transactions on Visualization and Computer Graphics},
    volume={26},
    number={1},
    pages={1151--1160},
    year={2019},
    publisher={IEEE}
}
```

## Acknowledgement

This research was sponsored in part by the U.S. National Science Foundation through grant NSF  IIS-1528203 and U.S. Department of Energy through grant DE-SC0014917.

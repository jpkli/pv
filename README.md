# PV: Portable Progressive Parallel Processing Pipelines

PV is a JavaScript toolkit for progressive parallel processing and visualization. P5 leverages [P4](https://github.com/jpkli/p4) for parallel data processing and rendering, and provides an intuitive API for implementing progressive workflows. 


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


## Visualizations
PV provides the following charts for progressive visualization:

<img width=600 src="https://jpkli.github.io/demos/images/p5/charts.png">

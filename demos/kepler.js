import pv from '..';
import KeplerDataset from '../data/kepler';

export default function() {
  let config = {
    container: "pv-vis",
    viewport: [1000, 1000],
    profiling: true
  }
  
  let views = [
    {
      id: 'chart2', width: 800, height: 300,
      padding: {left: 80, right: 10, top: 20, bottom: 50},
      offset: [50, 0],
      gridlines: {y: true},
      legend: false
    },
    {
      id: 'map_id', offset: [50,350],
      padding: {left: 80, right: 10, top: 20, bottom: 50},
      width: 400, height: 450,
    },
    {
      id: 'map_aggr', offset: [450,350],
      padding: {left: 80, right: 10, top: 20, bottom: 50},
      width: 400, height: 450,
    }
  ]

  let app = pv(config).view(views).input({
    method: 'memory',
    source: function(nrows) {
      let dataset = KeplerDataset({size: nrows, type: 'array'});
      let data = dataset.data;
      console.log(data)
      console.log(dataset.schema)
      return data;
    },
    batchSize: 500,
    schema: KeplerDataset.schema
  }).batch([
    {
      aggregate: {
        $group: 'ApparentMagnitude',
        $collect: {count: {$count: '*'}},
      },
      out: 'byMagnitude'
    },
    {
      match: {
        GroundLongtitude: [65, 85],
        GroundLatitude: [5, 25]
      },
      aggregate: {
        $bin: [{GroundLatitude: 128}, {GroundLongtitude: 128}],
        $collect: {
          values: {$count: '*'}
        },
      },
      out: 'map'
    }
  ]).progress([
    {
      visualize: {
        id: 'chart2',
        in: 'byMagnitude',
        mark: 'area',
        x: 'ApparentMagnitude',
        y: 'count',
        zero: true,
        color: 'teal'
      }
    },
    {
      visualize: {
        id: 'map_id',
        mark: 'circle',
        color: 'red',
        opacity: 0.35,
        x: 'GroundLongtitude',
        y: 'GroundLatitude',
      }
    },
    {
      visualize: {
          id: 'map_aggr',
          in: 'map',
          mark: 'circle',
          color: {
            field: 'values',
            exponent: '0.15'
          },
          x: 'GroundLongtitude', 
          y: 'GroundLatitude',
        }
      }
  ])
  // .interact([
  //   {
  //     event: 'brush', 
  //     from: 'map_id', 
  //     response: {
  //       chart2: {
  //         selected: {color: 'orange'}
  //       }
  //     }
  //   }
  // ])
  .onEach(function(stats, profile) {
    document.getElementById('stats').innerHTML = '(completed: ' + stats.completed + ')';
  })

  document.getElementById('next-button').onclick = () => {
    try {
      app.next();
    }
    catch(e) {
      console.log(e);
    }
  }
}


document.getElementById('pv-demo-description').innerHTML = `
<h3>Kepler Demo </h3>
<p>
  This demo uses sythnetic data to show how PV can be used to create a progressive visualization application with mulitple linked views and interactions.
</p>
<p>
  Press "progress" butoon to incrementally process and visualize data. "Brush-and-link" interaction can be used.
  The incremental data processing, visualizations, and interactions are accelerated using the GPU.
</p>
`;
import pv from '..';

export default function() {
  let config = {
    container: 'pv-vis',
    viewport: [960, 720],
    profiling: true
  }

  let views = [
    {
      id: 'v1', width: 480, height: 360,
      padding: {left: 100, right: 10, top: 20, bottom: 50},
      offset: [0, 0],
      gridlines: {y: true},
      legend: false
    },
    {
      id: 'v2', width: 480, height: 360, 
      gridlines: {y: true},
      padding: {left: 100, right: 10, top: 20, bottom: 50},
      offset: [480, 0]
    },
    {
      id: 'v3', width: 960, height: 360, 
      gridlines: {y: true},
      padding: {left: 100, right: 10, top: 20, bottom: 50},
      offset: [0, 360]
    }
  ];

  let p = pv(config).view(views);

  p.input({
    method: 'memory',
    source: function(nrows) {
      let dataset = pv.datasets.Babies({size: nrows, type: 'array'});
      let data = dataset.data;
      return data;
    },
    batchSize: 100000,
    schema: pv.datasets.Babies.schema
  });

  p.batch([
    {
      aggregate:{
        $group: 'MotherEdu',
        $collect: {
          count: {$count: '*'}
        }
      },
      out: 'byMotherEdu'
    },
    {
      aggregate:{
        $group: 'FatherEdu',
        $collect: {
          count: {$count: '*'}
        }
      },
      out: 'byFatherEdu'
    },
    {
      aggregate:{
        $group: 'FatherAge',
        $collect: {
          count: {$count: '*'}
        }
      },
      out: 'byFatherAge'
    }
  ])
  .progress([
    {
      visualize: {
        id: 'v1',
        in: 'byMotherEdu',
        mark: 'column',
        x: 'MotherEdu',
        y: 'count',
        zero: true,
        color: '#FA0000'
      }
    },
    {
      visualize: {
        id: 'v2',
        in: 'byFatherEdu',
        mark: 'column',
        x: 'FatherEdu',
        y: 'count',
        zero: true,
        color: 'steelblue'
      }
    },
    {
      visualize: {
        id: 'v3',
        in: 'byFatherAge',
        mark: 'area',
        x: 'FatherAge',
        y: 'count',
        zero: true,
        color: 'steelblue'
      }
    }
  ])
  .interact([
    {
      event: "brush",
      from: "v3",
      condition: {x: true},
      response: {
        v1: {
          selected: { color: 'orange' }
        },
        v2: {
          selected: { color: 'orange' }
        },
      }
    }
  ])
  .onEach(function(stats, profile) {
    document.getElementById('stats').innerHTML = '(completed: ' + stats.completed + ')';
  })

  document.getElementById('next-button').onclick = () => {
    try {
      p.next();
    }
    catch(e) {
      console.log(e);
    }
  }

  document.getElementById('pv-demo-description').innerHTML = `
  <h3>PV Demo </h3>
  <p>
    This demo uses sythnetic data to show how PV can be used to create a progressive visualization application with mulitple linked views and interactions.
  </p>
  <p>
    Press "progress" butoon to incrementally process and visualize data. "Brush-and-link" interaction can be used on the area chart at the bottom to highlight data at the two bar charts above.
    The incremental data processing, visualizations, and interactions are accelerated using the GPU.
  </p>
  `;
}

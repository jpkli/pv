import p5 from '..'

export default function() {

  let TextArea = document.createElement('textarea')
  TextArea.setAttribute('cols', 100)
  TextArea.setAttribute('rows', 60)
  document.body.appendChild(TextArea)

  let config = {
    container: 'p5',
    viewport: [1280, 640],
    profiling: true
  }

  let views = [
    {
      id: 'v1', width: 640, height: 640, 
      padding: {left: 70, right: 0, top: 50, bottom: 70},
      offset: [0, 0],
      legend: false
    },
    {
      id: 'v2', width: 640, height: 640, 
      gridlines: {y: true},
      padding: {left: 50, right: 10, top: 20, bottom: 50},
      offset: [640, 0]
    },
  ];

  let p = p5(config).view(views);

  let MAX_SIZE = 100000000

  let counter = 0
  p.input({
    method: 'memory',
    source: function(nrows) {
      if (counter > MAX_SIZE) {
        throw Error('rows > '+ counter)
      }
      counter += nrows
      let dataset = p5.datasets.Babies({size: nrows, type: 'array'})
      let data = dataset.data
      // let store = p5.cstore({}).import({schema: dataset.schema, data: dataset.data})
      // let data = store.data()
      return data
    },
    batchSize: 2000000,
    schema: p5.datasets.Babies.schema
  })
  .batch([
    {
      match: {
        MotherAge: [18, 50],
        FatherAge: [18, 70]
      },
      aggregate:{
        $group: ['MotherAge', 'FatherAge'],
        $collect: {
          count: {$count: '*'}
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
        color: 'count'
      }
    }
  ])
  .onEach(function(status, profile) {
    console.log(status, profile)
    if(status.completed > MAX_SIZE) {
      TextArea.value = benchmarkResults.join(',\n'); 
    } else {
      profile.completed = status.completed;
      benchmarkResults.push(JSON.stringify(profile))
    }
  })

  let benchmarkResults = []

  document.getElementById('next-button').onclick = () => {
    try {
      p.next() 
    }
    catch(e) {
      console.log(e)
    }
    
  }
  document.getElementById('start-button').onclick = () => { p.start() }
}

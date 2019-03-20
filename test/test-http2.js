import p5 from '..'

export default function() {
  let config = {
    container: 'p5',
    viewport: [1180, 720]
  }

  let views = [
    {
      id: 'v1', width: 760, height: 720, 
      // gridlines: {y: true, x: true},
      padding: {left: 70, right: 0, top: 50, bottom: 70},
      offset: [0, 0],
      // "color": {
      //     "range": ["red", "steelblue"],
      //     "interpolate": false
      // },
      legend: false
    },
    {
      id: 'v2', width: 380, height: 240, 
      gridlines: {y: true},
      padding: {left: 50, right: 10, top: 20, bottom: 50},
      offset: [780, 0]
    },
    {
      id: 'v3', width: 380, height: 240, 
      gridlines: {y: true},
      padding: {left: 50, right: 10, top: 20, bottom: 50},
      offset: [780, 240]
    },
    {
      id: 'v4', width: 380, height: 240, 
      gridlines: {y: true},
      padding: {left: 50, right: 10, top: 20, bottom: 50},
      offset: [780, 480]
    },
  ];

  let p = p5(config).view(views);
    p.input({
      method: 'http',
      source: '/data/brightkitefile',
      batchSize: 10000,
        "schema" : {
          "uid": "int",
          "time": "time",
          "lat": "float",
          "lng": "float",
          "loc": "float"
      }
    })
    .batch([
      {
        match: {
          lng: [-130, -66],
          lat: [22, 55]
        },
        derive: {
          month: '$month(time)',
          // hour: '$hour(time)',
          // dayOfWeek: '$dayOfWeek(time)'
        },
        aggregate: {
          $bin: [{lat: 256}, {lng: 256}],
          $group: ['month'],
          $collect: {
            values: {$count: '*'}
          },
        }
      }
    ])
    .progress([
      // {
      //   aggregate: {
      //     $group: ['month'],
      //     $collect: {
      //       values: {$sum: 'values'}
      //     },
      //     out: 'test'
      //   }
      // },
      {
        visualize: {
          id: 'v1',
          mark: 'circle',
          // in: 'test',
          color: 'teal',
          y: 'values',
          x: 'month',
          // y: 'FatherAge',
          // size: 10,
          opacity: 0.5
        },
      },
    ])

  document.getElementById('next-button').onclick = () => { p.next() }
  document.getElementById('start-button').onclick = () => { p.start() }
}

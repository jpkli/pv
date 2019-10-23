import p5 from '..'

export default function() {
  let config = {
    container: 'p5',
    viewport: [1200, 680]
  }

  let views = [
    {
      id: 'v1', width: 700, height: 600, 
      padding: {left: 0, right: 0, top: 0, bottom: 0},
      offset: [320, 0],
      legend: true
    },
    {
      id: 'v2', width: 320, height: 240, 
      padding: {left: 90, right: 10, top: 20, bottom: 50},
      offset: [0, 0]
    },
    {
      id: 'v3', width: 320, height: 225, 
      padding: {left: 90, right: 10, top: 20, bottom: 50},
      offset: [0, 225]
    },
    {
      id: 'v4', width: 320, height: 225, 
      padding: {left: 90, right: 10, top: 20, bottom: 50},
      offset: [0, 450],
      legend: true
    },
  ];

  let p = p5(config).view(views);
    p.input({
      method: 'http',
      source: '/data/brightkitefile',
      batchSize: 50000,
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
          hour: '$hour(time)'
        },
        aggregate: {
          $group: 'hour',
          $collect: {
            count: {$count: '*'}
          }
        },
        out: 'byHour'
      },
      {
        match: {
          lng: [-130, -66],
          lat: [22, 55]
        },
        derive: {
          month: '$month(time)'
        },
        aggregate: {
          $group: 'month',
          $collect: {
            count: {$count: '*'}
          }
        },
        out: 'byMonth'
      },
      {
        match: {
          lng: [-130, -66],
          lat: [22, 55]
        },
        derive: {
          DayOfWeek: '$dayOfWeek(time)'
        },
        aggregate: {
          $group: 'DayOfWeek',
          $collect: {
            count: {$count: '*'}
          }
        },
        out: 'byDayOfWeek'
      },
      {
        match: {
          lng: [-130, -66],
          lat: [22, 55]
        },
        aggregate: {
          $bin: [{lat: 256}, {lng: 256}],
          $collect: {
            values: {$count: '*'}
          },
        },
        out: 'map'
      }
    ])
    .progress([
      {
        visualize: {
          id: 'v2',
          in: 'byHour',
          mark: 'column',
          y: 'count',
          x: 'hour',
          color: 'teal',
          zero: true
        }
      },
      {
        visualize: {
          id: 'v3',
          in: 'byMonth',
          mark: 'column',
          y: 'count',
          x: 'month',
          zero: true,
          color: 'teal'
        }
      },
      {
        visualize: {
          id: 'v4',
          in: 'byDayOfWeek',
          mark: 'column',
          y: 'count',
          x: 'DayOfWeek',
          color: 'teal',
          zero: true
        }
      },
      {
        visualize: {
          id: 'v1',
          in: 'map',
          mark: 'rect',
          project: 'geo',
          dropZeros: true,
          color: {
            field: 'values',
            exponent: '0.15'
          },
          y: 'lat',
          x: 'lng'
        },
      }
    ])
    .interact([
      {
        event: "brush",
        from: "v1",
        // condition: {x: true},
        response: {
          v2: {
            selected: { color: 'orange' }
          },
          v3: {
            selected: { color: 'orange' }
          },
          v4: {
            selected: { color: 'orange' }
          },
        }
      }
    ])

  p.onEach(function(stats) {
    document.getElementById('stats').innerHTML = '(completed: ' + stats.completed + ')';
  })

  document.getElementById('next-button').onclick = () => { p.next() }
  document.getElementById('start-button').onclick = () => { p.start() }
}

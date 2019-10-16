import p5 from '..'

export default function() {
  let config = {
    container: 'p5',
    viewport: [1280, 720]
  }

  let views = [
    {
      id: 'v1', width: 860, height: 680, 
      // gridlines: {y: true, x: true},
      padding: {left: 0, right: 0, top: 0, bottom: 0},
      offset: [0, 0],
      // "color": {
      //     "range": ["orange", "red"],
      //     "interpolate": true
      // },
      legend: false
    },
    {
      id: 'v2', width: 380, height: 240, 
      padding: {left: 50, right: 10, top: 20, bottom: 50},
      offset: [880, 0]
    },
    {
      id: 'v3', width: 380, height: 240, 
      padding: {left: 50, right: 10, top: 20, bottom: 50},
      offset: [880, 240]
    },
    {
      id: 'v4', width: 380, height: 240, 
      padding: {left: 50, right: 10, top: 20, bottom: 50},
      offset: [880, 480]
    },
  ];

  let p = p5(config).view(views);
    p.input({
      method: 'http',
      source: '/data/brightkitefile',
      batchSize: 100000,
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
          zero: true,
          // y: 'FatherAge',
          // size: 10,
          // opacity: "auto"
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
          color: 'teal',
          // y: 'FatherAge',
          // size: 10,
          // opacity: "auto"
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
          zero: true,
          // y: 'FatherAge',
          // size: 10,
          // opacity: "auto"
        }
      },
      {
        visualize: {
          id: 'v1',
          in: 'map',
          mark: 'point',
          // color: 'teal',
          // size: {
          //   field: 'values',
          //   exponent: '0.333'
          // },
          color: {
            field: 'values',
            exponent: '0.15'
          },
          project: 'geo',
          // size: 'values',
          y: 'lat',
          x: 'lng',
          // brush: {
          //   selected: {
          //     color: 'red'
          //   }
          // }
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
        },
        // callback: function (interaction) {
        //   console.log(interaction)
        //   p.pipeline.visualize({
        //         id: 'v4',
        //         in: 'byDayOfWeek',
        //         mark: 'bar',
        //         height: 'count',
        //         x: 'DayOfWeek',
        //         color: 'red'
        //         // y: 'FatherAge',
        //         // size: 10,
        //         // opacity: "auto"
        //       }
        //   )
        // }
      }
    ])

  p.onEach(function(stats) {
    console.log(stats)
    document.getElementById('stats').innerHTML = '(completed: ' + stats.completed + ')';
  })

  document.getElementById('next-button').onclick = () => { p.next() }
  document.getElementById('start-button').onclick = () => { p.start() }
}

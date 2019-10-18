import p5 from '..'

export default function() {
  let config = {
    container: 'p5',
    viewport: [800, 800]
  }

  let views = [
    {
    id: 'v1', width: 800, height: 800, 
    gridlines: {y: true, x: true},
    padding: {left: 70, right: 150, top: 50, bottom: 70},
    offset: [0, 0],
    "color": {
      "range": ["red", "steelblue"],
      "interpolate": false
    },
    legend: false
    },
  ];

  let p = p5(config).view(views);

  let run = (evt) => {
    p.input({
      source: evt.target.files[0],
      batchSize: 1024 * 1024 * 2
    })
    .batch([{
      aggregate: {
        $group: ['BirthMonth'],
        $reduce: {
          babies: {
            $count: '*'
          }
        }
      }
    }]) 
    .progress([{
      visualize: {
        id: 'v1',
        mark: 'rect',
        color: 'teal',
        height: 'babies',
        x: 'BirthMonth',
        zero: true,
      }
    }])
  }

  document.getElementById('p5-control').innerHTML = `<input type="file" id="input-file" />`

  document.getElementById('input-file').onchange = run
  document.getElementById('next-button').onclick = () => { p.next() }
  document.getElementById('start-button').onclick = () => { p.start() }

}

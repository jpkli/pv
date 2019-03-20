import p5 from '..'

export default function() {
  let config = {
    container: 'p5',
    viewport: [1180, 720]
  }


  let p = p5(config)
  let p1 = {
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
  };

  let p2 = {
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



  console.log(p.mergedPipeline(p1,p2))

}

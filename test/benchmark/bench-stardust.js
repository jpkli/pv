import p3 from 'p3'

export default function(option) {

  let width = option.width || 640;
  let height = option.height || 640;

  let data = option.data || [];
  let motherAgeRange = [18, 50]
  let fatherAgeRange = [18, 70]
  let accumulatedResult = []
  let rectDim = [
    width /  (motherAgeRange[1] -  motherAgeRange[0]),
    height / (fatherAgeRange[1] -  fatherAgeRange[0])
  ]
  let div = document.getElementById('p5');
  
  let canvas = document.createElement('canvas');
  div.appendChild(canvas);

  let platform = Stardust.platform("webgl-2d", canvas, width, height);

  let update = () => {
    let dataset = p5.datasets.Babies({size: 2000000, type: 'json'})
    let start = performance.now()
    let results = p3.pipeline()
    .match( {
        MotherAge: [18, 50],
        FatherAge: [18, 70]
    })
    .aggregate({
        $group: ['MotherAge', 'FatherAge'],
        $collect: {
        count: {$count: '*'}
        }
    })
    .execute(dataset.data)

    accumulatedResult = accumulatedResult.concat(results)

    accumulatedResult = p3.pipeline()
    .match( {
      MotherAge: [18, 50],
      FatherAge: [18, 70]
    })
    .aggregate({
      $group: ['MotherAge', 'FatherAge'],
      $collect: {
        count: {$sum: 'count'}
      }
    })
    .execute(accumulatedResult)

    data = accumulatedResult
    

    let vmap = {
        x: 'MotherAge',
        y: 'FatherAge',
        opacity: 'count'
    };


    // let rectMark = Stardust.mark.rect();
    // let marks = Stardust.mark.create(rectMark, platform);
    let circle = new Stardust.mark.circle(4); // use 4 to make rendering cost of circle to be the same as rect
    let marks = Stardust.mark.create(circle, platform);


    let scaleX = Stardust.scale.linear()
        .domain(d3.extent(data, d => d[vmap.x]))
        .range([0, width]);

    let scaleY = Stardust.scale.linear()
        .domain(d3.extent(data, d => d[vmap.y]))
        .range([0, height]);

    let scaleOpacity = Stardust.scale.linear()
        .domain(d3.extent(data, d => d[vmap.opacity]))
        .range([0, 1]);

    
    marks.data(data);

    let colorScale = Stardust.scale.custom(`
        Color(0.0, 0.0, 0.9, value)
    `);

    marks.attr("center", Stardust.scale.Vector2(scaleX(d => d[vmap.x]), scaleY(d => d[vmap.y])));
    marks.attr("radius", Math.min(...rectDim) / 2);
    // marks.attr("p1", Stardust.scale.Vector2(scaleX(d => d[vmap.x]), scaleX(d => d[vmap.x]) + 10.0));
    // marks.attr("p2", Stardust.scale.Vector2(scaleY(d => d[vmap.y]), scaleY(d => d[vmap.y]) + 10.0));
    marks.attr("color", colorScale(scaleOpacity(d => d[vmap.opacity])));
    marks.render();
    // let gl = platform._GL;
    // let pixel = new Uint8Array(4);
    // gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixel);


    return performance.now() - start;
  }

  let count = 0;
  let totalTime = 0;
  document.getElementById('next-button').onclick = () => {
    count += 1
    let newTime = update()
    totalTime += newTime
    
    console.log(totalTime / count, totalTime);
  }
}

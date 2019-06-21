import p3 from 'p3'

export default function() {

  let TextArea = document.createElement('textarea')
  TextArea.setAttribute('cols', 100)
  TextArea.setAttribute('rows', 60)
  document.body.appendChild(TextArea)

  let motherAgeRange = [18, 50]
  let fatherAgeRange = [18, 70]
  let accumulatedResult = []

  let width = 640
  let height = 640
  let rectDim = [
    width /  (motherAgeRange[1] -  motherAgeRange[0]),
    height / (fatherAgeRange[1] -  fatherAgeRange[0])
  ]

  let vis = d3.select('#p5')
    .append('svg')
      .attr('width', width)
      .attr('height', height)
      .append('g')


  let update = () => {
    let dataset = p5.datasets.Babies({size: 1000000, type: 'json'})

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
    let countValues = accumulatedResult.map(d=>d.count)

    let x = d3.scaleLinear().domain(motherAgeRange).range([0, width])
    let y = d3.scaleLinear().domain(fatherAgeRange).range([0, height])
    let opacity = d3.scaleLinear().domain(d3.extent(countValues)).range([0, 1])
  
    let marks = vis.selectAll('rect')
      .data(accumulatedResult)

    marks.enter()
      .append('rect')
        .attr('width', rectDim[0])
        .attr('height', rectDim[1])
        .attr('x', d => x(d.MotherAge))
        .attr('y', d => y(d.FatherAge))
      .merge(marks)
        .style('fill', 'steelblue')
        .style('opacity', d => opacity(d.count))

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

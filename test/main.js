import p4 from 'p4';
import p5 from '..';

function genData(size) {
    let babies = new p4.datasets.Babies(size);
    let db = p4.cstore({})
    db.import(babies)
    return db.data()
}

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
      legend: true
    },
];

let testConfig = [
    {
        $aggregate: {
            $group: ['MotherEdu', 'FatherEdu'],
            $include: ['MotherHeight', 'MotherWeight'],
            $calculate: ['avg', 'sum']
        }
    },
    {
        $visualize: {
            mark: 'rect',
            zero: true,
            height: 'sum.MotherHeight',
            x: 'FatherEdu',
            color: 'teal'
        }
    }
]

let testData = genData(1000)
let tplr = new p5.Transpiler(testData.keys)
console.log(tplr.transpile(testConfig))

let p = p4(config).view(views);
p.data(testData)
let res = p.runSpec(tplr.transpile(testConfig)).result('row')
console.log(res)

document.getElementById('input-file').onchange = function(evt) {
    p.input({
        source: evt.target.files[0],
        size: 1024 * 1024 * 8
    })
    .aggregate({
        $group: 'FatherEdu',
        $reduce: {
            babies: {
                $count: '*'
            }
        }

    })
    .visualize({
        id: 'v1',
        mark: 'bar',
        height: 'babies',
        x: 'FatherEdu',
        // y: 'FatherAge',
        // size: 12,
        // opacity: 0.5
    })
}

document.getElementById('next-button').onclick = function() {
    let r = p.next();
    console.log(r)
}

document.getElementById('start-button').onclick = function() {
    let r = p.start()
}

// .data(genData(1000))
// .view(views)
// .aggregate({
//     $group: ['FatherAge', 'MotherAge'],
//     babies: {
//         $count: '*'
//     }
// })
// .visualize({
//     id: 'v1',
//     mark: 'rect',
//     color: 'babies',
//     x: 'MotherAge',
//     y: 'FatherAge',
//     // size: 12,
//     // opacity: 0.5
// })

// console.log(p.result('row'))
// let total = 0;

// let loopTest = setInterval(progress, 3000);

// function progress() {
//     total += 1000
//     p.progress(genData(1000))
//     if( total > 1000 * 10) {
//         clearInterval(loopTest)
//     }
// }
// console.log(p.result('row'))


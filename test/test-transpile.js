import p5 from '..'

function genData(size) {
    let babies = new p4.datasets.Babies(size);
    let db = p5.cstore({})
    db.import(babies)
    return db.data()
}

export default function() {
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
                projection: 'geo',
                zero: true,
                height: 'sum.MotherHeight',
                x: 'FatherEdu',
                color: 'teal',
                zero: true
            }
        }
    ]
    let testData = genData(1000)
    let tplr = new p5.Transpiler(testData.keys)
    console.log(tplr.transpile(testConfig))
}

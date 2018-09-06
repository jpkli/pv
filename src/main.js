import p4 from 'p.4';

export default function(arg) {
    let p5 = p4(Object.assign({preserveDrawingBuffer: true}, arg));

    p5.data = function (data) {
        console.log('data size: ', data.length);
    }

    p5.progress = function(newData) {
        p5.updateData(newData)
        p5.ctx._progress = true;
        p5.run()
    }

    return p5;
}
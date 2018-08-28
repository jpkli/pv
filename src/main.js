import p4 from 'p.4';

export default function(arg) {
    let p5 = p4(arg);

    p5.data = (data) => {
        console.log('data size: ', data.length);
    }

    return p5;
}
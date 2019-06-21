import benchP5 from './bench-p5'
import benchD3 from './bench-d3'
import benchStardust from './bench-stardust'


let hash = location.hash.slice(1);

switch (hash) {
    case 'd3':
        benchD3();
        break;
    case 'stardust':
        benchStardust({});
        break;
    default: 
        benchP5();
}


import p5 from './src/main';
import Transpiler from './src/Transpiler';

var root = typeof self == 'object' && self.self === self && self ||
           typeof global == 'object' && global.global === global && global ||
           this;

p5.Transpiler = Transpiler;
root.p5 = p5;

export default p5;

if(typeof module != 'undefined' && module.exports)
    module.exports = p5;
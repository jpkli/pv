import pv from './src/main';
import Transpiler from './src/Transpiler';

var root = typeof self == 'object' && self.self === self && self ||
           typeof global == 'object' && global.global === global && global ||
           this;

pv.Transpiler = Transpiler;
root.pv = pv;

export default pv;

if(typeof module != 'undefined' && module.exports)
    module.exports = pv;

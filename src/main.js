import p4 from 'p4';
import FileLoader from './FileLoader';
import Transpiler from './Transpiler';

const PROGRESS_MODES = ['automatic', 'semi-automatic', 'manual'];
const INPUT_METHODS = ['http', 'file', 'websocket'];
const OPERATIONS = ['aggregate', 'derive', 'match', 'visualize'];

export default function(arg) {
    let p5 = {}
    
    let p4x = p4(Object.assign({preserveDrawingBuffer: true}, arg));

    let dataSchema;
    let dataSource;
    let fetchData;
    let progressStep = 0;
    let jobs = [];
    let dataSize = 0;
    let batchSize;
    let progressedSize = 0;
    let inProgress = false;

    p5.mode = arg.mode || PROGRESS_MODES[2];
    p5.data = function(arg) { p4x.data(arg); return p5};
    p5.view = function(arg) { p4x.view(arg); return p5};
    p5.runSpec = p4x.runSpec;
    p5.input = function({
        method = 'file',
        type = 'csv',
        delimiter = ',',
        source,
        size,
        schema
    }) {
        dataSchema = schema;
        batchSize = size;
        if(method == 'file') {
            dataSource = new FileLoader({
                file: source,
                chunk: size,
                delimiter
            })
            dataSize = source.size;
        } else {
            p4.ajax.get({
                url: source + '?size=' + size,
                dataType: type
            })
        }
        
        fetchData = function() {
            return dataSource.read('json')
        }

        return p5;
    }

    for(let ops of OPERATIONS) {
        p5[ops] = function(arg) {
            let job = {};
            job[ops] = arg;
            jobs.push(job);
            return p5;
        }
    }

    p5.transpile = function(spec) {
        console.log(p4x.ctx.fields)
        let tplr = new Transpiler(p4x.ctx.fields)
        return tplr.transpile(spec)
    }

    p5.jobs = function() {
        return jobs; 
    }

    p5.progress = function(newData, specs) {
        let jobs;
        if(Array.isArray(specs)) {
            jobs = [];
            specs.forEach(function(spec){
                let job = {};
                let opt = Object.keys(spec)[0];
                let arg = spec[opt];
                opt = opt.slice(1); // ignore $ sign 
                if(typeof p5[opt] == 'function') {
                    job[opt] = arg;
                }
                jobs.push(job);
            })
        }
        p4x.ctx._progress = true;
        p4x.head();
    
        p4x.updateData(newData);
        p4x.run(jobs);
        return p5;
    }

    p5.prepareData = function(data) {
        let cache = p4.cstore({
            schema: dataSchema,
            size: data.size
        })
        cache.addRows(data);
        return cache.data();
    }

    p5.autoProgress = function() {
        p5.next().then(function(status){
            if (!status.done) {
                requestAnimationFrame(p5.autoProgress);
            }
        });
    }

    p5.start = function() {
        requestAnimationFrame(p5.autoProgress);
    }

    p5.next = function() {
        progressStep++;
        progressedSize += batchSize
        let done = (progressedSize >= dataSize ) ? true : false;
            
        let status =  {
            count: progressStep,
            done: done,
            completed: progressedSize,
            percentage: progressedSize / dataSize
        }

        if (done) {
            return new Promise((resolve, reject) => { resolve(status) })
        }

        return new Promise((resolve, reject) => {
            if(progressStep == 1) {
                if(dataSchema === undefined) {
                    dataSource.getSchema().then( schema => {
                        dataSchema = schema;
                        fetchData().then(data => {
                            p4x.data(p5.prepareData(data));
                            p4x.run(jobs);
                            resolve(status);
                        })
                    });
                }
            } else {
                fetchData().then(data => {
                    p4x.ctx._progress = true;
                    p4x.head();
                    p4x.updateData(p5.prepareData(data));
                    p4x.run(jobs);
                    resolve(status);
                })
            }

        })

    }

    return p5;
}
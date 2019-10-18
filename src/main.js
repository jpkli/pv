import p4 from 'p4';
import p3 from 'p3';
import FileLoader from './FileLoader';
import Transpiler from './Transpiler';

const PROGRESS_MODES = ['automatic', 'semi-automatic', 'manual'];
const INPUT_METHODS = ['http', 'file', 'websocket'];
const OPERATIONS = ['aggregate', 'derive', 'match', 'visualize', 'in', 'out'];

export default function(arg) {
  let p4x = p4(Object.assign({preserveDrawingBuffer: true}, arg));
  let p5 = {}
  let dataSchema;
  let dataSource;
  let fetchData;
  let progressStep = 0;
  let jobs = [];
  let dataSize = 0;
  let progressedSize = 0;
  let inProgress = false;
  let batchProcessing;
  let progression;
  let crossViewProc = [];
  let inputType = 'array'
  let profiling = arg.profiling || false
  let profile = {
    LoadTime: 0,
    ProcTime: 0,
    AccuTime: 0
  }

  let onEach = () => {}

  let interactionData = [];

  p5.batchSize = 0;
  p5.pipeline = p4x;
  p5.mode = arg.mode || PROGRESS_MODES[2];
  p5.data = function(arg) {p4x.data(arg); return p5};

  p5.view = function(arg) {p4x.view(arg); return p5};

  p5.runSpec = p4x.runSpec;
  p5.input = function({
    method = 'file',
    type = 'csv',
    delimiter = ',',
    source,
    batchSize,
    schema
  }) {
    dataSchema = schema;
    p5.batchSize = batchSize;
    
    if(method == 'file') {
      dataSource = new FileLoader({
        file: source,
        chunk: batchSize,
        delimiter
      })
      dataSize = source.size;
      if (dataSchema === undefined) {
        fetchData = () => {
          return new Promise( (resolve, reject) => {
            dataSource.getSchema().then( schema => {
              dataSchema = schema;
              return dataSource.read('json');
            })
            .then(res => {
              resolve(res)
            })
            .catch(err => {
              reject(err)
            })
          });
        };
      } else {
        fetchData = () => {
          return dataSource.read('json')
        };
      }

    } else if (method == 'memory') {
      fetchData = () => {
        return new Promise( (resolve, reject) => {
          resolve(source(batchSize))
        });
      };
    } else {
      inputType = 'json'
      fetchData = () => {
        return new Promise( (resolve, reject) => {
          p4.ajax.get({
            url: source + '?nrows=' + batchSize,
            dataType: 'json'
          })
          .then((res) => {
            dataSchema = res.schema;
            resolve(res.data);
          })
          .catch((err) =>  {
            reject(err);
          })
        })
      };
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
    let tplr = new Transpiler(p4x.ctx.fields)
    return tplr.transpile(spec)
  }

  p5.compile = function(specs) {
    let jobs = [];
    if(Array.isArray(specs)) {
      specs.forEach(function(spec){
        let job = {};
        let opt = Object.keys(spec)[0];
        let arg = spec[opt];
        if (opt[0] === '$'){
          opt = opt.slice(1); // ignore $ sign 
        }
        if(typeof p5[opt] == 'function') {
          job[opt] = arg;
        }
        jobs.push(job);
      })
    }
    return jobs;
  }

  p5.jobs = function() {
    return jobs; 
  }

  p5.jobsToPipeline = function(jobs) {
    let pipeline = [];
    Object.keys(jobs).forEach(opt => {
      let task = {};
      task[opt] = jobs[opt];
      if(opt == 'aggregate' && jobs.out) {
        task[opt].out = jobs.out;
      }
      pipeline.push(task);
    })
    return pipeline;
  }

  p5.batch = function(jobs) {
    let batches = [];
    jobs.forEach(jobs => {
      let opts = p5.jobsToPipeline(jobs)
      batches.push(opts);
    })
    batchProcessing = batches.map(batch => {
      return p5.compile(p5.transpile(batch));
    });
    // console.log(batchProcessing);
    return p5;
  }

  p5.update = function(newData, specs) {
    p4x.ctx._progress = true;
    p4x.head();
    p4x.updateData(newData);
    p4x.run(p5.compile(p5.transpile(specs)));
    return p5;
  }

  p5.progress = function(specs) {
    progression = p5.compile(specs);
    return p5;
  }

  p5.prepareData = function(data) {
    let cache = p4.cstore({})
    cache.import({
      data: data.slice(1),
      schema: dataSchema,
      type: inputType
    });
    return cache.data();
  }

  p5.onEach = function(f) {
    onEach = f;
    return p5;
  }
  p5.onComplete = function() {}

  p5.autoProgress = function() {
    p5.next().then(function(status){
      if (!status.done) {
        requestAnimationFrame(p5.autoProgress);
      }
    });
  }

  p5.start = function() {
    requestAnimationFrame(p5.autoProgress);
    return p5;
  }

  p5.next = function(callback) {
    if(typeof(callback) === 'function') {
      onEach = callback;
    }

    progressStep++;
    progressedSize += p5.batchSize;
    // let done = (progressedSize >= dataSize ) ? true : false;
    
    let status =  {
        count: progressStep,
        // done: done,
        completed: progressedSize,
        // percentage: progressedSize / dataSize
    }

    // if (done) {
    //     return new Promise((resolve, reject) => { resolve(status) })
    // }

    return new Promise((resolve, reject) => {
     
      fetchData().then(data => {
        let loadStart = performance.now();
        let inputData;
        if(data._p4_cstore_version) {
          inputData = data;
        } else {
          inputData = p5.prepareData(data);
        }
        profile.LoadTime = performance.now() - loadStart;
        let processStart = performance.now()
        if(progressStep == 1) {
          p4x.data(inputData);
        } else {
          p4x.ctx._progress = true;
          p4x.head();
          p4x.updateData(inputData);
        }

        if(batchProcessing.length) {
          batchProcessing.forEach(pp => {
            p4x.head().run(pp);
          })
        }

        if(crossViewProc.length) {
          crossViewProc.forEach(pp => {
            p4x.head().run(p5.jobsToPipeline(pp.jobs));
            pp.result = p4x.result({outputTag: pp.jobs.out}).filter(d=>d.count !== 0)
          })
        }

        p4x.run(progression);
        // console.log(p4x.result('row'))
        profile.ProcTime = performance.now() - loadStart;
        profile.AccuTime += profile.ProcTime;
        // console.log(profile)
        resolve(status);
        onEach(status, profile);
      })
    })
  }

  p5.mergedPipeline = function(p1, p2) {
    let props = Object.keys(p1).concat(Object.keys(p2))
    .filter(prop => prop !== 'out')
    .reduce(function(b, c) {
      if (b.indexOf(c) < 0) b.push(c);
      return b;
    }, [])
    .sort()
    .reverse();

    let merged = {};
    props.forEach(prop => {
      merged[prop] = Object.assign({}, p1[prop], p2[prop]);
    })

    return merged;
  }

  p5.setup = (jsonSpecs) => {
    jsonSpecs.forEach((spec) => {
      let opt = Object.keys(spec)[0]
      if (typeof(p5[opt]) === 'function') {
        p5[opt](spec[opt]);
      }
    })
    return p5;
  }

  p5.runSpec = (jsonSpecs) => {
    p5.setup(jsonSpecs);
    p5.next();
  }

  p5.interact = function(interactions) {
    interactions.forEach(interaction => {
      let spec = interaction;

      p4x.interact(interaction);
      let connection = {
        sourceView: spec.from,
        targetViews: Object.keys(spec.response)
      }

      let sourceProc = progression.find(p => {
        let key = Object.keys(p)[0];
      
        return p[key].id === connection.sourceView;
      })

      let sourcePipeline = {};
      
      batchProcessing.find(pipeline => {
        let out = pipeline.find(p => p.out)
        return out.out === sourceProc.visualize.in
      })
      .forEach(p => Object.assign(sourcePipeline, p))

      batchProcessing.filter(p => p.out && p.out ==='')

      connection.targetViews.forEach(tv => {
        let vmap = progression.find(p => {
          let key = Object.keys(p)[0];
          return p[key].id === tv;
        }).visualize

        let targetPipeline = {}
        
        batchProcessing.find(pipeline => {
          let out = pipeline.find(p => p.out)
          return out.out === vmap.in
        })
        .forEach(p => Object.assign(targetPipeline, p));
        // console.log(targetPipeline);
 
        let interProc = p5.mergedPipeline(sourcePipeline, targetPipeline);
        interProc.out = ['interResult', connection.sourceView, tv].join('-');
        crossViewProc.push({
          jobs: interProc,
          result: [],
          sourceView: connection.sourceView,
          targetView: tv
        })
      })
      console.log(crossViewProc)

      spec.callback = (selection) => {

        // let interactionStart = performance.now();
        let connections = crossViewProc.filter(p => p.sourceView === connection.sourceView);
        connections.forEach(conn => {
          let view = p4x.getViews().find(v => v.id === conn.targetView);
          // console.log(selection)
          // let matches = conn.result.filter(d => d.lng > selection.lng[0] && d.lng < selection.lng[1] && d.lat > selection.lat[0] && d.lat < selection.lat[1])
          // console.log(conn.result)
          let matches = conn.result.filter(d => {
            let validate = true;
            Object.keys(selection).forEach(attr => {
              validate = validate && (d[attr] > selection[attr][0] && d[attr] < selection[attr][1])
            })
            return validate;
          })
          if(matches.length) {
            let result = p3.pipeline().aggregate({
              $group: view.vmap.x,
              $collect: {
                count: {$sum: 'count'}
              }
            })
            .execute(matches);

            if(result.length) {
              view.plot.update(result, 'orange')
            }
          }         
        })
        // console.log(performance.now() - interactionStart)
        
      }
    })

    p5.getProfile = function() {
      return profile;
    }

    return p5
  }

  return p5;
}
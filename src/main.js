import p4 from 'p4';
import p3 from 'p3';
import FileLoader from './FileLoader';
import Transpiler from './Transpiler';

const PROGRESS_MODES = ['automatic', 'semi-automatic', 'manual'];
const INPUT_METHODS = ['http', 'file', 'websocket'];
const OPERATIONS = ['aggregate', 'derive', 'match', 'visualize', 'in', 'out'];

export default function(arg) {
  let p4x = p4(Object.assign({preserveDrawingBuffer: true}, arg));
  let pv = {}
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
  let strValues = null;

  let onEach = () => {}

  let interactionData = [];

  pv.batchSize = 0;
  pv.pipeline = p4x;
  pv.mode = arg.mode || PROGRESS_MODES[2];
  pv.data = function(arg) {p4x.data(arg); return pv};

  pv.view = function(arg) {p4x.view(arg); return pv};

  pv.runSpec = p4x.runSpec;
  pv.input = function({
    method = 'file',
    type = 'csv',
    delimiter = ',',
    source,
    batchSize,
    schema
  }) {
    dataSchema = schema;
    pv.batchSize = batchSize;
    
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
  
    return pv;
  }

  for(let ops of OPERATIONS) {
    pv[ops] = function(arg) {
      let job = {};
      job[ops] = arg;
      jobs.push(job);
      return pv;
    }
  }

  pv.transpile = function(spec) {
    let tplr = new Transpiler(p4x.ctx.fields)
    return tplr.transpile(spec)
  }

  pv.compile = function(specs) {
    let jobs = [];
    if(Array.isArray(specs)) {
      specs.forEach(function(spec){
        let job = {};
        let opt = Object.keys(spec)[0];
        let arg = spec[opt];
        if (opt[0] === '$'){
          opt = opt.slice(1); // ignore $ sign 
        }
        if(typeof pv[opt] == 'function') {
          job[opt] = arg;
        }
        jobs.push(job);
      })
    }
    return jobs;
  }

  pv.jobs = function() {
    return jobs; 
  }

  pv.jobsToPipeline = function(jobs) {
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

  pv.batch = function(jobs) {
    let batches = [];
    jobs.forEach(jobs => {
      let opts = pv.jobsToPipeline(jobs)
      batches.push(opts);
    })
    batchProcessing = batches.map(batch => {
      return pv.compile(pv.transpile(batch));
    });
    // console.log(batchProcessing);
    return pv;
  }

  pv.update = function(newData, specs) {
    p4x.ctx._progress = true;
    p4x.head();
    p4x.updateData(newData);
    p4x.run(pv.compile(pv.transpile(specs)));
    return pv;
  }

  pv.progress = function(specs) {
    progression = pv.compile(specs);
    return pv;
  }

  pv.prepareData = function(data) {

    let cache = p4.cstore((strValues !== null) ? {strValues} : {})
    cache.import({
      data: data.slice(1),
      schema: dataSchema,
      type: inputType
    });
    let cdata = cache.data()
    if (strValues === null) {
      strValues = cdata.strValues;
    }
    return cdata;
  }

  pv.onEach = function(f) {
    onEach = f;
    return pv;
  }
  pv.onComplete = function() {}

  pv.autoProgress = function() {
    pv.next().then(function(status){
      if (!status.done) {
        requestAnimationFrame(pv.autoProgress);
      }
    });
  }

  pv.start = function() {
    requestAnimationFrame(pv.autoProgress);
    return pv;
  }

  pv.next = function(callback) {
    if(typeof(callback) === 'function') {
      onEach = callback;
    }

    progressStep++;
    progressedSize += pv.batchSize;
    // let done = (progressedSize >= dataSize ) ? true : false;

    let status =  {
        count: progressStep,
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
          inputData = pv.prepareData(data);
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
            p4x.head().run(pv.jobsToPipeline(pp.jobs));
            pp.result = p4x.result({outputTag: pp.jobs.out}).filter(d=>d.count !== 0)
          })
        }

        p4x.run(progression);
        profile.ProcTime = performance.now() - loadStart;
        profile.AccuTime += profile.ProcTime;
        // console.log(profile)
        resolve(status);
        onEach(status, profile);
      })
    })
  }

  pv.mergedPipeline = function(p1, p2) {
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
      if (typeof p1[prop].$group === 'string' && typeof p2[prop].$group === 'string') {
        merged[prop].$group = [p1[prop].$group, p2[prop].$group];
      }
    })

    return merged;
  }

  pv.setup = (jsonSpecs) => {
    jsonSpecs.forEach((spec) => {
      let opt = Object.keys(spec)[0]
      if (typeof(pv[opt]) === 'function') {
        pv[opt](spec[opt]);
      }
    })
    return pv;
  }

  pv.runSpec = (jsonSpecs) => {
    pv.setup(jsonSpecs);
    pv.next();
  }

  pv.interact = function(interactions) {
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
 
        let interProc = pv.mergedPipeline(sourcePipeline, targetPipeline);
        interProc.out = ['interResult', connection.sourceView, tv].join('-');
        crossViewProc.push({
          jobs: interProc,
          result: [],
          sourceView: connection.sourceView,
          targetView: tv
        })
      })
      // console.log(crossViewProc)

      spec.callback = (selection) => {
        let selectedAttrs = Object.keys(selection);

        if (interaction.condition) {
          if (interaction.condition.hasOwnProperty('x') && !interaction.condition.x) {
            selectedAttrs.shift();
          }
          if (interaction.condition.hasOwnProperty('y') && !interaction.condition.y) {
            selectedAttrs.pop();
          }
        }
        // let interactionStart = performance.now();
        let connections = crossViewProc.filter(p => p.sourceView === connection.sourceView);
        connections.forEach(conn => {
          let view = p4x.getViews().find(v => v.id === conn.targetView);
          
          let matches = conn.result.filter(d => {
            let validate = true;
            selectedAttrs.forEach(attr => {
              if (selection[attr].length === 1) {
                validate = validate && (d[attr] === parseInt(selection[attr][0]));
              } else {
               
                validate = validate && (d[attr] > selection[attr][0] && d[attr] < selection[attr][1]);
              }
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
              let updateData = result.sort((a,b) => {
                if (a[view.vmap.x] <  b[view.vmap.x]) return -1;
                if (a[view.vmap.x] >  b[view.vmap.x]) return 1;
                return 0;
              });
              view.plot.update(updateData, interaction.response[view.id].selected.color)
            }
          }         
        })
      }
    })

    pv.getProfile = function() {
      return profile;
    }

    return pv
  }

  return pv;
}
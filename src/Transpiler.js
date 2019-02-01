 
export default class Transpiler {
  constructor(attributes, categories) {
   this.attributes = attributes
  }

  transpile (rules) {
    let spec = []
    console.log(rules)
    for (let rule of rules) {
      let opt = Object.keys(rule)[0]
      if(opt == '$aggregate') {
        spec.push({$aggregate: this.aggregate(rule[opt])})
      // } else if(opt == '$visualize') {
      //   spec.push({$visualize: this.visualize(rule[opt])})
      } else {
        spec.push(Object.assign({}, rule))
      }
    }
    return spec
  }

  aggregate (rule) {
    let includes = rule.$include || this.attributes
    let excludes = rule.$exclude || []
    let calculates = rule.$calculate || []
    let fields = includes.filter(attr => excludes.indexOf(attr) === -1)
    let collection = {}

    for (let opt of calculates) {
      if (opt === 'count') {
        collection['count'] = {$count: '*'}
      } else {
        fields.forEach( field => {
          let metric = [opt, field].join('.');
          collection[metric] = {}
          collection[metric]['$'+opt] = field
        })
      }
    }
    return Object.assign({$collect: collection}, rule)
  }

  visualize (rule) {
    let facets = rule.facets || rule.facet

    if (facets === undefined) return rule

    let rows = facets.rows || facets.row
    let columns = facets.columns || facets.column
    let spec = rows || columns

    let encodings = Object.keys(rule).filter(k => k !== 'facets')

    let variables = Object.keys(spec)

    let minLoopCount = Math.min(...variables.map(v => spec[v].length))

    let vmaps = new Array(minLoopCount)
    for(let i = 0; i < minLoopCount; i++) {
      let vmap = {}
      encodings.forEach(code => {
        let vi = variables.indexOf(rule[code])
        if(vi < 0) {
          vmap[code] = rule[code]     
        } else {
          vmap[code] = spec[variables[vi]][i]
        }
      })
      vmaps[i] = vmap
    }
    vmaps.facets = facets
    vmaps.order = facets.order
    vmaps.sortBy = facets.sortBy
    return vmaps
  }
}

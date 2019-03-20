import testFile from './test-file'
import testHttp from './test-http'
import testPipelineMerge from './test-pipeline-merge'
import testBenchmark from './test-benchmark'
import testD3 from './test-d3-benchmark'
import testResults from './test-results'

let hash = location.hash.slice(1);

switch (hash) {
    case 'http':
        testHttp();
        break;
    case 'benchmark':
        testBenchmark();
        break;
    case 'results':
        testResults();
        break;
    case 'd3':
        testD3();
        break;
    case 'merge':
        testPipelineMerge();
        break;
    default: 
        testFile()
}


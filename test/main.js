import testFile from './test-file';
import testMemory from './test-memory';
import testHttp from './test-http';
import testPipelineMerge from './test-pipeline-merge';
import testResults from './test-results';

let hash = location.hash.slice(1);

switch (hash) {
    case 'http':
        testHttp();
        break;
    case 'results':
        testResults();
        break;
    case 'merge':
        testPipelineMerge();
        break;
    case 'memory':
        testMemory();
        break;
    default: 
        testFile()
}


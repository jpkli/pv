import testFile from './test-file';
import testMemory from './test-memory';
import testHttp from './test-http';
import testPipelineMerge from './test-pipeline-merge';
let hash = location.hash.slice(1);

switch (hash) {
  case 'http':
    testHttp();
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


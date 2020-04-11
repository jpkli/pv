import BabyModel from './babies';
import Kepler from './kepler';

if (window.location.hash.slice(1) === 'kepler') {
  Kepler();
} else {
  BabyModel();
}



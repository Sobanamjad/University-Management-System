import * as migration_20260303_083619 from './20260303_083619';

export const migrations = [
  {
    up: migration_20260303_083619.up,
    down: migration_20260303_083619.down,
    name: '20260303_083619'
  },
];

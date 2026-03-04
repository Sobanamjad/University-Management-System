import * as migration_20260304_053409 from './20260304_053409';

export const migrations = [
  {
    up: migration_20260304_053409.up,
    down: migration_20260304_053409.down,
    name: '20260304_053409'
  },
];

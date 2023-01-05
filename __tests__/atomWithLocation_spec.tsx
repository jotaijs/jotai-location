import { atomWithLocation } from '../src/index';

describe.skip('atomWithLocation', () => {
  // FIXME please someone help me with this test
});

describe('atomWithLocation without window', () => {
  let savedWindow: any;
  beforeEach(() => {
    savedWindow = global.window;
    delete (global as any).window;
  });
  afterEach(() => {
    global.window = savedWindow;
  });

  it('define atomWithLocation', async () => {
    atomWithLocation();
  });
});

import assert from 'node:assert/strict';
import { after, before, test } from 'node:test';
import { fileURLToPath } from 'node:url';
import axios from 'axios';
import { createServer } from 'vite';

let server;
let isProductBarcode;
let suggestedActions;

before(async () => {
  server = await createServer({
    root: fileURLToPath(new URL('..', import.meta.url)),
    server: { middlewareMode: true },
    appType: 'custom',
  });
  ({ isProductBarcode } = await server.ssrLoadModule('/src/utils/barcode.ts'));
  ({ suggestedActions } = await server.ssrLoadModule('/src/admin/tickets/flagActions.ts'));
});
after(async () => { await server?.close(); });

const flag = {
  type: 'image', reason: 'wrong_product', barcode: '1234567890123',
  image_id: '2', flavor: 'off', extra_data: { correct_barcode: '0001234567890' },
};

test('barcode validation preserves strings and rejects malformed identifiers', () => {
  for (const value of ['0001', '0'.repeat(30)]) assert.equal(isProductBarcode(value), true);
  for (const value of [null, undefined, 1234, '', '123', '0'.repeat(31), '12/34', '1234\n', '１２３４']) {
    assert.equal(isProductBarcode(value), false, String(value));
  }
});

for (const [name, override] of [
  ['non-image report', { type: 'product' }],
  ['selected crop', { image_id: 'front_fr' }],
  ['missing image', { image_id: null }],
  ['same product', { extra_data: { correct_barcode: flag.barcode } }],
  ['missing target', { extra_data: null }],
  ['invalid target', { extra_data: { correct_barcode: '../1234' } }],
]) {
  test(`does not offer an image move for a ${name}`, () => {
    assert.equal(suggestedActions({ ...flag, ...override }).length, 0);
  });
}

test('moves only the reported upload, preserving the destination barcode', async (t) => {
  const request = t.mock.method(axios, 'request', async () => ({}));
  const [action] = suggestedActions(flag);
  assert.equal(action.destructive, true);
  assert.notEqual(action.closesTicket, true);
  assert.match(action.confirm, /without copying the source product's fields/);
  await action.run();
  const [options] = request.mock.calls[0].arguments;
  assert.equal(options.method, 'post');
  assert.ok(options.url.endsWith('/products/1234567890123/images/move'));
  assert.equal(options.withCredentials, true);
  assert.deepEqual(options.data, {
    imgids: [2], flavor: 'off', move_to: '0001234567890', copy_data: false,
  });
});

test('propagates a rejected move so the caller does not close the ticket', async (t) => {
  t.mock.method(axios, 'request', async () => { throw { response: { data: { detail: 'Session expired' } } }; });
  await assert.rejects(suggestedActions(flag)[0].run(), /Session expired/);
});

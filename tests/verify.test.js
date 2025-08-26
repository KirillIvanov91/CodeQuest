import { expect } from 'chai';
import { verifyTelegramInitData } from '../verifyTelegram.js';

describe('verifyTelegramInitData', () => {
  it('returns false for empty', () => {
    expect(verifyTelegramInitData('', 'token')).to.equal(false);
  });
});

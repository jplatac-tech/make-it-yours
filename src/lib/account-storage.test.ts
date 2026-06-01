import { describe, it, beforeEach } from 'node:test'
import assert from 'node:assert/strict'
import { hashPassword, loginAccount, registerAccount } from './account-storage'

const storage = new Map<string, string>()

const mockStorage = {
  getItem: (k: string) => storage.get(k) ?? null,
  setItem: (k: string, v: string) => {
    storage.set(k, v)
  },
  removeItem: (k: string) => storage.delete(k),
  clear: () => storage.clear(),
  key: () => null,
  length: 0,
} as Storage

beforeEach(() => {
  storage.clear()
  ;(globalThis as { window?: { localStorage: Storage } }).window = {
    localStorage: mockStorage,
  }
})

describe('account-storage', () => {
  it('registers and logs in with email and password', async () => {
    const reg = await registerAccount({
      email: 'user@test.com',
      password: 'secret12',
      name: 'Ana',
    })
    assert.equal(reg.ok, true)

    const bad = await loginAccount({
      email: 'user@test.com',
      password: 'wrong',
    })
    assert.equal(bad.ok, false)

    const ok = await loginAccount({
      email: 'user@test.com',
      password: 'secret12',
    })
    assert.equal(ok.ok, true)
    if (ok.ok) {
      assert.equal(ok.profile?.name, 'Ana')
      assert.equal(ok.profile?.email, 'user@test.com')
    }
  })

  it('hashPassword is stable', async () => {
    const a = await hashPassword('test')
    const b = await hashPassword('test')
    assert.equal(a, b)
  })
})

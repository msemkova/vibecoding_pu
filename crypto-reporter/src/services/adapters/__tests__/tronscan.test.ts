import { describe, it, expect, beforeAll, afterEach, afterAll } from 'vitest'
import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { TronscanAdapter } from '../tronscan'

// ---------------------------------------------------------------------------
// Fixture data
// ---------------------------------------------------------------------------

const ADDRESS = 'TLsV52sRDL79HXGGm9yzwKibb6BeruhUzy'
const DATE_FROM = new Date('2024-01-01T00:00:00Z')
const DATE_TO = new Date('2024-01-31T23:59:59Z')

const TRX_TX_FIXTURE = {
  hash: 'abc123trxhash',
  ownerAddress: 'TAnotherAddress111111111111111111111',
  toAddress: ADDRESS,
  amount: 5_000_000, // 5 TRX
  timestamp: new Date('2024-01-10T12:00:00Z').getTime(),
  cost: { fee: 100_000 }, // 0.1 TRX
  confirmed: true,
}

const TRC20_TX_FIXTURE = {
  transaction_id: 'def456trc20hash',
  from_address: ADDRESS,
  to_address: 'TAnotherAddress111111111111111111111',
  quant: '10000000', // 10 USDT (6 decimals)
  block_ts: new Date('2024-01-15T08:00:00Z').getTime(),
  tokenInfo: { tokenAbbr: 'USDT', tokenDecimal: 6 },
}

// ---------------------------------------------------------------------------
// MSW server
// ---------------------------------------------------------------------------

const BASE = 'https://apilist.tronscanapi.com/api'

const server = setupServer(
  http.get(`${BASE}/transaction`, () =>
    HttpResponse.json({
      data: [TRX_TX_FIXTURE],
      total: 1,
      rangeTotal: 1,
    }),
  ),
  http.get(`${BASE}/token_trc20/transfers`, () =>
    HttpResponse.json({
      token_transfers: [TRC20_TX_FIXTURE],
      total: 1,
      rangeTotal: 1,
    }),
  ),
)

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('TronscanAdapter', () => {
  const adapter = new TronscanAdapter()

  it('has name "Tronscan"', () => {
    expect(adapter.name).toBe('Tronscan')
  })

  it('returns combined TRX + TRC-20 transactions sorted by timestamp', async () => {
    const txs = await adapter.fetchTransactions({
      address: ADDRESS,
      dateFrom: DATE_FROM,
      dateTo: DATE_TO,
    })

    expect(txs).toHaveLength(2)
    // sorted ascending by timestamp
    expect(txs[0].timestamp).toBeLessThanOrEqual(txs[1].timestamp)
  })

  it('maps TRX transaction fields correctly', async () => {
    const txs = await adapter.fetchTransactions({
      address: ADDRESS,
      dateFrom: DATE_FROM,
      dateTo: DATE_TO,
    })

    const trx = txs.find((t) => t.hash === 'abc123trxhash')!
    expect(trx).toBeDefined()
    expect(trx.network).toBe('tron')
    expect(trx.direction).toBe('in')
    expect(trx.from).toBe('TAnotherAddress111111111111111111111')
    expect(trx.to).toBe(ADDRESS)
    expect(trx.value).toBe('5.000000 TRX')
    expect(trx.fee).toBe('0.100000 TRX')
    expect(trx.timestamp).toBe(TRX_TX_FIXTURE.timestamp)
  })

  it('maps TRC-20 transfer fields correctly', async () => {
    const txs = await adapter.fetchTransactions({
      address: ADDRESS,
      dateFrom: DATE_FROM,
      dateTo: DATE_TO,
    })

    const trc20 = txs.find((t) => t.hash === 'def456trc20hash')!
    expect(trc20).toBeDefined()
    expect(trc20.network).toBe('tron')
    expect(trc20.direction).toBe('out')
    expect(trc20.from).toBe(ADDRESS)
    expect(trc20.value).toBe('10.000000 USDT')
    expect(trc20.fee).toBe('0 TRX')
  })

  it('handles empty TRX response', async () => {
    server.use(
      http.get(`${BASE}/transaction`, () =>
        HttpResponse.json({ data: [], total: 0, rangeTotal: 0 }),
      ),
    )

    const txs = await adapter.fetchTransactions({
      address: ADDRESS,
      dateFrom: DATE_FROM,
      dateTo: DATE_TO,
    })

    const trxTxs = txs.filter((t) => t.hash !== 'def456trc20hash')
    expect(trxTxs).toHaveLength(0)
  })

  it('handles empty TRC-20 response', async () => {
    server.use(
      http.get(`${BASE}/token_trc20/transfers`, () =>
        HttpResponse.json({ token_transfers: [], total: 0, rangeTotal: 0 }),
      ),
    )

    const txs = await adapter.fetchTransactions({
      address: ADDRESS,
      dateFrom: DATE_FROM,
      dateTo: DATE_TO,
    })

    const trc20 = txs.filter((t) => t.hash === 'def456trc20hash')
    expect(trc20).toHaveLength(0)
  })

  it('paginates TRX transactions correctly', async () => {
    // First page returns 2 items with total=3, second returns 1
    const page1 = [
      { ...TRX_TX_FIXTURE, hash: 'page1tx1', amount: 1_000_000, timestamp: 1000 },
      { ...TRX_TX_FIXTURE, hash: 'page1tx2', amount: 2_000_000, timestamp: 2000 },
    ]
    const page2 = [
      { ...TRX_TX_FIXTURE, hash: 'page2tx1', amount: 3_000_000, timestamp: 3000 },
    ]

    let callCount = 0
    server.use(
      http.get(`${BASE}/transaction`, () => {
        callCount++
        if (callCount === 1) {
          return HttpResponse.json({ data: page1, total: 3, rangeTotal: 3 })
        }
        return HttpResponse.json({ data: page2, total: 3, rangeTotal: 3 })
      }),
      http.get(`${BASE}/token_trc20/transfers`, () =>
        HttpResponse.json({ token_transfers: [], total: 0, rangeTotal: 0 }),
      ),
    )

    const txs = await adapter.fetchTransactions({
      address: ADDRESS,
      dateFrom: DATE_FROM,
      dateTo: DATE_TO,
    })

    expect(txs).toHaveLength(3)
    expect(txs.map((t) => t.hash)).toEqual(['page1tx1', 'page1tx2', 'page2tx1'])
    expect(callCount).toBe(2)
  })

  it('throws on HTTP error from Tronscan', async () => {
    server.use(
      http.get(`${BASE}/transaction`, () => new HttpResponse(null, { status: 503 })),
    )

    await expect(
      adapter.fetchTransactions({ address: ADDRESS, dateFrom: DATE_FROM, dateTo: DATE_TO }),
    ).rejects.toThrow('Tronscan HTTP 503')
  })

  it('throws on malformed API response', async () => {
    server.use(
      http.get(`${BASE}/transaction`, () =>
        HttpResponse.json({ unexpected: 'shape' }),
      ),
    )

    await expect(
      adapter.fetchTransactions({ address: ADDRESS, dateFrom: DATE_FROM, dateTo: DATE_TO }),
    ).rejects.toThrow()
  })
})

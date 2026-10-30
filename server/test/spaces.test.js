import { test } from 'node:test'
import assert from 'node:assert/strict'
import { spaces, spaceIds } from '../src/spaces.js'
import { openDatabase, addReport, occupancy } from '../src/db.js'

const earlierIds = ['koerner', 'ikb', 'nest', 'woodward', 'life', 'icics', 'lam', 'education']
const newIds = ['law', 'asian', 'xwi7xwa', 'hennings', 'edc']
const CATEGORIES = new Set(['library', 'learning-commons', 'informal', 'building'])
const VERIFICATIONS = new Set(['confirmed', 'check-access', 'building-only'])

test('catalog contains 13 unique, evidenced UBC Point Grey places', () => {
  assert.equal(spaces.length, 13)
  assert.equal(spaceIds.size, spaces.length)
  const rankings = new Set()
  for (const space of spaces) {
    assert.match(space.id, /^[a-z0-9-]+$/)
    assert.ok(space.name.trim())
    assert.ok(space.address.trim())
    assert.ok(space.studyNotes.trim())
    assert.ok(space.directionsQuery.trim())
    assert.ok(CATEGORIES.has(space.category))
    assert.ok(VERIFICATIONS.has(space.verification))
    assert.ok(space.coordinates.lat >= 49.25 && space.coordinates.lat <= 49.28)
    assert.ok(space.coordinates.lng >= -123.27 && space.coordinates.lng <= -123.24)
    assert.match(space.sourceUrl, /^https:\/\//)
    if (space.hoursUrl) assert.match(space.hoursUrl, /^https:\/\//)
    assert.ok(!rankings.has(space.recommendedRank))
    rankings.add(space.recommendedRank)
  }
  for (const id of [...earlierIds, ...newIds]) assert.ok(spaceIds.has(id), id)
})

test('Education Library renamed without changing report identity', () => {
  const space = spaces.find((entry) => entry.id === 'education')
  assert.equal(space.name, 'Education Learning Commons')
  assert.equal(space.verification, 'check-access')
  const db = openDatabase(':memory:')
  try {
    addReport(db, 'education', 'low', 100_000)
    assert.equal(occupancy(db, space.id, 100_002).recentReportCount, 1)
  } finally { db.close() }
})

test('ICICS reports refer to documented drop-in study areas, not restricted labs', () => {
  const icics = spaces.find((entry) => entry.id === 'icics')
  assert.equal(icics.name, 'ICICS / CS Study Areas')
  assert.equal(icics.verification, 'confirmed')
  assert.equal(icics.category, 'informal')
  assert.match(icics.studyNotes, /first- and second-floor atrium/)
  assert.match(icics.studyNotes, /booking/)
  assert.match(icics.sourceUrl, /cs.ubc.ca\/students\/undergrad\/services\/informal-learning-spaces/)
})

test('X̱wi7x̱wa official Unicode spelling and stable ASCII report ID are preserved', () => {
  const library = spaces.find((entry) => entry.id === 'xwi7xwa')
  // Exact UBC Library spelling: both X/x characters carry COMBINING MACRON BELOW.
  assert.equal(library.name, 'X\u0331wi7x\u0331wa Library')
  assert.equal(library.name.normalize('NFD'), 'X\u0331wi7x\u0331wa Library')
  assert.ok(library.directionsQuery.startsWith(library.name))
  assert.equal(library.sourceUrl, 'https://xwi7xwa.library.ubc.ca/about/')
  assert.match(library.studyNotes, /Sḵwx̱wú7mesh Sníchim/)
  assert.ok(spaceIds.has('xwi7xwa'))
})

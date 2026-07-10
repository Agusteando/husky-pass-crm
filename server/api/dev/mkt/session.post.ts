import { defineEventHandler } from 'h3'
import type { AppSessionUser } from '~/types/session'
import { assertDevOnly } from '~/server/utils/devOnly'
import { setAppSession } from '~/server/utils/session'

export default defineEventHandler((event) => {
  assertDevOnly()
  const user: AppSessionUser = {
    id: 900000001,
    kind: 'admin',
    email: 'codex.mkt@example.test',
    username: 'codex-mkt-fixture',
    displayName: 'Mariana MKT',
    picture: null,
    campus: 'IECS · IEDIS',
    empresa: 'Mercadotecnia',
    sala: null,
    roles: ['ROLE_MKT'],
    unidades: [],
    plantel: [],
    routes: [],
    productScopes: ['marketingAdmin'],
    scopes: {},
    anonymous: false,
    loggedin: true
  }
  setAppSession(event, user)
  return { user, loggedin: true, defaultPath: '/mkt' }
})

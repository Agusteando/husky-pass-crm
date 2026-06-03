import type { AdminImpersonationOrigin, AppSessionUser } from '~/types/session'

export function adminOrigin(user: AppSessionUser): AdminImpersonationOrigin {
  return {
    id: user.id,
    kind: 'admin',
    isSuperAdmin: user.isSuperAdmin,
    email: user.email,
    username: user.username,
    displayName: user.displayName,
    picture: user.picture,
    campus: user.campus,
    empresa: user.empresa,
    sala: user.sala,
    roles: user.roles,
    unidades: user.unidades,
    plantel: user.plantel,
    routes: user.routes,
    productScopes: [],
    scopes: {},
    anonymous: false,
    loggedin: true
  }
}

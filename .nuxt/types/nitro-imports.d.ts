declare global {
  const DEV_HUSKY_PASS_SCENARIOS: typeof import('../../server/utils/devHuskyPassFixtures').DEV_HUSKY_PASS_SCENARIOS
  const DEV_HUSKY_PASS_VARIANTS: typeof import('../../server/utils/devHuskyPassFixtures').DEV_HUSKY_PASS_VARIANTS
  const H3Error: typeof import('../../node_modules/h3').H3Error
  const H3Event: typeof import('../../node_modules/h3').H3Event
  const PASSWORD_MAX_LENGTH: typeof import('../../server/utils/passwordPolicy').PASSWORD_MAX_LENGTH
  const PASSWORD_MIN_LENGTH: typeof import('../../server/utils/passwordPolicy').PASSWORD_MIN_LENGTH
  const SURVEY_NIVEL_OPTIONS: typeof import('../../server/utils/personasConfig').SURVEY_NIVEL_OPTIONS
  const __buildAssetsURL: typeof import('../../node_modules/@nuxt/nitro-server/dist/runtime/utils/paths').buildAssetsURL
  const __publicAssetsURL: typeof import('../../node_modules/@nuxt/nitro-server/dist/runtime/utils/paths').publicAssetsURL
  const adminOrigin: typeof import('../../server/utils/impersonation').adminOrigin
  const appendAccessActionLog: typeof import('../../server/utils/personasConfig').appendAccessActionLog
  const appendCorsHeaders: typeof import('../../node_modules/h3').appendCorsHeaders
  const appendCorsPreflightHeaders: typeof import('../../node_modules/h3').appendCorsPreflightHeaders
  const appendHeader: typeof import('../../node_modules/h3').appendHeader
  const appendHeaders: typeof import('../../node_modules/h3').appendHeaders
  const appendResponseHeader: typeof import('../../node_modules/h3').appendResponseHeader
  const appendResponseHeaders: typeof import('../../node_modules/h3').appendResponseHeaders
  const assertAccessHistoryAdmin: typeof import('../../server/utils/authz').assertAccessHistoryAdmin
  const assertCommunicationsAdmin: typeof import('../../server/utils/authz').assertCommunicationsAdmin
  const assertDaycareAdmin: typeof import('../../server/utils/authz').assertDaycareAdmin
  const assertDaycareFamily: typeof import('../../server/utils/authz').assertDaycareFamily
  const assertDevOnly: typeof import('../../server/utils/devOnly').assertDevOnly
  const assertMarbetePdfAssets: typeof import('../../server/utils/marbetePdf').assertMarbetePdfAssets
  const assertMethod: typeof import('../../node_modules/h3').assertMethod
  const assertPasswordConfirmation: typeof import('../../server/utils/passwordPolicy').assertPasswordConfirmation
  const assertPersonasAutorizadasFamily: typeof import('../../server/utils/authz').assertPersonasAutorizadasFamily
  const assertRateLimit: typeof import('../../server/utils/antibot').assertRateLimit
  const assertRegistrationAntibot: typeof import('../../server/utils/antibot').assertRegistrationAntibot
  const assertSalaAccess: typeof import('../../server/utils/authz').assertSalaAccess
  const assertUnidadAccess: typeof import('../../server/utils/authz').assertUnidadAccess
  const attendanceOne: typeof import('../../server/utils/attendanceMysql').attendanceOne
  const attendanceQuery: typeof import('../../server/utils/attendanceMysql').attendanceQuery
  const attendanceWrite: typeof import('../../server/utils/attendanceMysql').attendanceWrite
  const buildDevPrintableAuthorizedPerson: typeof import('../../server/utils/devHuskyPassFixtures').buildDevPrintableAuthorizedPerson
  const buildEnvChecklist: typeof import('../../server/utils/envChecklist').buildEnvChecklist
  const buildMarbeteRenderValues: typeof import('../../server/utils/marbeteTemplates').buildMarbeteRenderValues
  const cachedEventHandler: typeof import('../../node_modules/nitropack/dist/runtime/internal/cache').cachedEventHandler
  const cachedFunction: typeof import('../../node_modules/nitropack/dist/runtime/internal/cache').cachedFunction
  const callNodeListener: typeof import('../../node_modules/h3').callNodeListener
  const clearAppSession: typeof import('../../server/utils/session').clearAppSession
  const clearResponseHeaders: typeof import('../../node_modules/h3').clearResponseHeaders
  const clearSession: typeof import('../../node_modules/h3').clearSession
  const createApp: typeof import('../../node_modules/h3').createApp
  const createAppEventHandler: typeof import('../../node_modules/h3').createAppEventHandler
  const createCaptchaChallenge: typeof import('../../server/utils/antibot').createCaptchaChallenge
  const createError: typeof import('../../node_modules/h3').createError
  const createEvent: typeof import('../../node_modules/h3').createEvent
  const createEventStream: typeof import('../../node_modules/h3').createEventStream
  const createRouter: typeof import('../../node_modules/h3').createRouter
  const csvToList: typeof import('../../server/utils/mysql').csvToList
  const dataUrlToUploadFile: typeof import('../../server/utils/externalUpload').dataUrlToUploadFile
  const defaultContentType: typeof import('../../node_modules/h3').defaultContentType
  const defineAppConfig: typeof import('../../node_modules/@nuxt/nitro-server/dist/runtime/utils/config').defineAppConfig
  const defineCachedEventHandler: typeof import('../../node_modules/nitropack/dist/runtime/internal/cache').defineCachedEventHandler
  const defineCachedFunction: typeof import('../../node_modules/nitropack/dist/runtime/internal/cache').defineCachedFunction
  const defineEventHandler: typeof import('../../node_modules/h3').defineEventHandler
  const defineLazyEventHandler: typeof import('../../node_modules/h3').defineLazyEventHandler
  const defineNitroErrorHandler: typeof import('../../node_modules/nitropack/dist/runtime/internal/error/utils').defineNitroErrorHandler
  const defineNitroPlugin: typeof import('../../node_modules/nitropack/dist/runtime/internal/plugin').defineNitroPlugin
  const defineNodeListener: typeof import('../../node_modules/h3').defineNodeListener
  const defineNodeMiddleware: typeof import('../../node_modules/h3').defineNodeMiddleware
  const defineRenderHandler: typeof import('../../node_modules/nitropack/dist/runtime/internal/renderer').defineRenderHandler
  const defineRequestMiddleware: typeof import('../../node_modules/h3').defineRequestMiddleware
  const defineResponseMiddleware: typeof import('../../node_modules/h3').defineResponseMiddleware
  const defineRouteMeta: typeof import('../../node_modules/nitropack/dist/runtime/internal/meta').defineRouteMeta
  const defineTask: typeof import('../../node_modules/nitropack/dist/runtime/internal/task').defineTask
  const defineWebSocket: typeof import('../../node_modules/h3').defineWebSocket
  const defineWebSocketHandler: typeof import('../../node_modules/h3').defineWebSocketHandler
  const deleteCookie: typeof import('../../node_modules/h3').deleteCookie
  const deriveSipaePlantelFromStudent: typeof import('../../server/utils/sipaePlantel').deriveSipaePlantelFromStudent
  const devHuskyPassPhotoUrl: typeof import('../../server/utils/devHuskyPassFixtures').devHuskyPassPhotoUrl
  const devHuskyPassScenario: typeof import('../../server/utils/devHuskyPassFixtures').devHuskyPassScenario
  const devHuskyPassVariant: typeof import('../../server/utils/devHuskyPassFixtures').devHuskyPassVariant
  const dynamicEventHandler: typeof import('../../node_modules/h3').dynamicEventHandler
  const ensureRequestId: typeof import('../../server/utils/logger').ensureRequestId
  const errorSummary: typeof import('../../server/utils/logger').errorSummary
  const eventHandler: typeof import('../../node_modules/h3').eventHandler
  const externalUploadFolder: typeof import('../../server/utils/externalUpload').externalUploadFolder
  const fallbackTemplateColor: typeof import('../../server/utils/marbeteTemplates').fallbackTemplateColor
  const fetchSipaeAttendanceDetail: typeof import('../../server/utils/sipaeAttendance').fetchSipaeAttendanceDetail
  const fetchSipaeTardies: typeof import('../../server/utils/sipaeAttendance').fetchSipaeTardies
  const fetchWithEvent: typeof import('../../node_modules/h3').fetchWithEvent
  const fromNodeMiddleware: typeof import('../../node_modules/h3').fromNodeMiddleware
  const fromPlainHandler: typeof import('../../node_modules/h3').fromPlainHandler
  const fromWebHandler: typeof import('../../node_modules/h3').fromWebHandler
  const getAppSession: typeof import('../../server/utils/session').getAppSession
  const getCookie: typeof import('../../node_modules/h3').getCookie
  const getHeader: typeof import('../../node_modules/h3').getHeader
  const getHeaders: typeof import('../../node_modules/h3').getHeaders
  const getMethod: typeof import('../../node_modules/h3').getMethod
  const getProxyRequestHeaders: typeof import('../../node_modules/h3').getProxyRequestHeaders
  const getQuery: typeof import('../../node_modules/h3').getQuery
  const getRequestFingerprint: typeof import('../../node_modules/h3').getRequestFingerprint
  const getRequestHeader: typeof import('../../node_modules/h3').getRequestHeader
  const getRequestHeaders: typeof import('../../node_modules/h3').getRequestHeaders
  const getRequestHost: typeof import('../../node_modules/h3').getRequestHost
  const getRequestIP: typeof import('../../node_modules/h3').getRequestIP
  const getRequestPath: typeof import('../../node_modules/h3').getRequestPath
  const getRequestProtocol: typeof import('../../node_modules/h3').getRequestProtocol
  const getRequestURL: typeof import('../../node_modules/h3').getRequestURL
  const getRequestWebStream: typeof import('../../node_modules/h3').getRequestWebStream
  const getResponseHeader: typeof import('../../node_modules/h3').getResponseHeader
  const getResponseHeaders: typeof import('../../node_modules/h3').getResponseHeaders
  const getResponseStatus: typeof import('../../node_modules/h3').getResponseStatus
  const getResponseStatusText: typeof import('../../node_modules/h3').getResponseStatusText
  const getRouteRules: typeof import('../../node_modules/nitropack/dist/runtime/internal/route-rules').getRouteRules
  const getRouterParam: typeof import('../../node_modules/h3').getRouterParam
  const getRouterParams: typeof import('../../node_modules/h3').getRouterParams
  const getSession: typeof import('../../node_modules/h3').getSession
  const getValidatedQuery: typeof import('../../node_modules/h3').getValidatedQuery
  const getValidatedRouterParams: typeof import('../../node_modules/h3').getValidatedRouterParams
  const handleCacheHeaders: typeof import('../../node_modules/h3').handleCacheHeaders
  const handleCors: typeof import('../../node_modules/h3').handleCors
  const hasFamilyProductScope: typeof import('../../server/utils/authz').hasFamilyProductScope
  const isCorsOriginAllowed: typeof import('../../node_modules/h3').isCorsOriginAllowed
  const isError: typeof import('../../node_modules/h3').isError
  const isEvent: typeof import('../../node_modules/h3').isEvent
  const isEventHandler: typeof import('../../node_modules/h3').isEventHandler
  const isMethod: typeof import('../../node_modules/h3').isMethod
  const isPreflightRequest: typeof import('../../node_modules/h3').isPreflightRequest
  const isServerlessRuntime: typeof import('../../server/utils/serverlessPaths').isServerlessRuntime
  const isStream: typeof import('../../node_modules/h3').isStream
  const isSuperAdmin: typeof import('../../server/utils/authz').isSuperAdmin
  const isWebResponse: typeof import('../../node_modules/h3').isWebResponse
  const lazyEventHandler: typeof import('../../node_modules/h3').lazyEventHandler
  const legacyOne: typeof import('../../server/utils/mysql').legacyOne
  const legacyQuery: typeof import('../../server/utils/mysql').legacyQuery
  const legacyWrite: typeof import('../../server/utils/mysql').legacyWrite
  const listMarbeteTemplates: typeof import('../../server/utils/marbeteTemplates').listMarbeteTemplates
  const logErrorOnce: typeof import('../../server/utils/logger').logErrorOnce
  const logEvent: typeof import('../../server/utils/logger').logEvent
  const logPersonasDebug: typeof import('../../server/utils/personasDiagnostics').logPersonasDebug
  const logPersonasDiagnostic: typeof import('../../server/utils/personasDiagnostics').logPersonasDiagnostic
  const logPersonasWarning: typeof import('../../server/utils/personasDiagnostics').logPersonasWarning
  const logSecurityDiagnostic: typeof import('../../server/utils/securityDiagnostics').logSecurityDiagnostic
  const logSecurityWarning: typeof import('../../server/utils/securityDiagnostics').logSecurityWarning
  const marbeteDownloadName: typeof import('../../server/utils/marbeteTemplates').marbeteDownloadName
  const marbeteTemplateThemes: typeof import('../../server/utils/marbeteTemplates').marbeteTemplateThemes
  const nitroPlugin: typeof import('../../node_modules/nitropack/dist/runtime/internal/plugin').nitroPlugin
  const normalizeGoogleFormEmbedUrl: typeof import('../../server/utils/personasConfig').normalizeGoogleFormEmbedUrl
  const parseCookies: typeof import('../../node_modules/h3').parseCookies
  const plantelMatches: typeof import('../../server/utils/sipaePlantel').plantelMatches
  const prepareMarbeteSvgForPdf: typeof import('../../server/utils/marbetePdf').prepareMarbeteSvgForPdf
  const promisifyNodeListener: typeof import('../../node_modules/h3').promisifyNodeListener
  const proxyRequest: typeof import('../../node_modules/h3').proxyRequest
  const publicError: typeof import('../../server/utils/httpError').publicError
  const readBody: typeof import('../../node_modules/h3').readBody
  const readFormData: typeof import('../../node_modules/h3').readFormData
  const readLastAccessActions: typeof import('../../server/utils/personasConfig').readLastAccessActions
  const readLatestRecoveryEmailPreview: typeof import('../../server/utils/recoveryEmail').readLatestRecoveryEmailPreview
  const readMarbeteTemplateSvg: typeof import('../../server/utils/marbeteTemplates').readMarbeteTemplateSvg
  const readMultipartFormData: typeof import('../../node_modules/h3').readMultipartFormData
  const readPersonasConfig: typeof import('../../server/utils/personasConfig').readPersonasConfig
  const readRawBody: typeof import('../../node_modules/h3').readRawBody
  const readValidatedBody: typeof import('../../node_modules/h3').readValidatedBody
  const redactContext: typeof import('../../server/utils/logger').redactContext
  const removeResponseHeader: typeof import('../../node_modules/h3').removeResponseHeader
  const renderMarbetePdf: typeof import('../../server/utils/marbetePdf').renderMarbetePdf
  const renderMarbeteSvg: typeof import('../../server/utils/marbeteTemplates').renderMarbeteSvg
  const requireSession: typeof import('../../server/utils/session').requireSession
  const resolveGrupoSigil: typeof import('../../server/utils/grupoIcons').resolveGrupoSigil
  const resolveSipaePlantel: typeof import('../../server/utils/sipaePlantel').resolveSipaePlantel
  const resolveSurveyForStudent: typeof import('../../server/utils/personasConfig').resolveSurveyForStudent
  const runTask: typeof import('../../node_modules/nitropack/dist/runtime/internal/task').runTask
  const runtimeDataDir: typeof import('../../server/utils/serverlessPaths').runtimeDataDir
  const sanitizeStatusCode: typeof import('../../node_modules/h3').sanitizeStatusCode
  const sanitizeStatusMessage: typeof import('../../node_modules/h3').sanitizeStatusMessage
  const saveMarbeteTemplate: typeof import('../../server/utils/marbeteTemplates').saveMarbeteTemplate
  const savePersonasConfig: typeof import('../../server/utils/personasConfig').savePersonasConfig
  const sealSession: typeof import('../../node_modules/h3').sealSession
  const securityHash: typeof import('../../server/utils/securityDiagnostics').securityHash
  const selectDevHuskyPassTemplate: typeof import('../../server/utils/devHuskyPassFixtures').selectDevHuskyPassTemplate
  const selectMarbeteTemplate: typeof import('../../server/utils/marbeteTemplates').selectMarbeteTemplate
  const send: typeof import('../../node_modules/h3').send
  const sendError: typeof import('../../node_modules/h3').sendError
  const sendIterable: typeof import('../../node_modules/h3').sendIterable
  const sendNoContent: typeof import('../../node_modules/h3').sendNoContent
  const sendPasswordRecoveryEmail: typeof import('../../server/utils/recoveryEmail').sendPasswordRecoveryEmail
  const sendProxy: typeof import('../../node_modules/h3').sendProxy
  const sendRedirect: typeof import('../../node_modules/h3').sendRedirect
  const sendStream: typeof import('../../node_modules/h3').sendStream
  const sendWebResponse: typeof import('../../node_modules/h3').sendWebResponse
  const serveStatic: typeof import('../../node_modules/h3').serveStatic
  const setAppSession: typeof import('../../server/utils/session').setAppSession
  const setCookie: typeof import('../../node_modules/h3').setCookie
  const setHeader: typeof import('../../node_modules/h3').setHeader
  const setHeaders: typeof import('../../node_modules/h3').setHeaders
  const setResponseHeader: typeof import('../../node_modules/h3').setResponseHeader
  const setResponseHeaders: typeof import('../../node_modules/h3').setResponseHeaders
  const setResponseStatus: typeof import('../../node_modules/h3').setResponseStatus
  const shortHash: typeof import('../../server/utils/logger').shortHash
  const sipaeErrorMessage: typeof import('../../server/utils/sipaeAttendance').sipaeErrorMessage
  const sipaeErrorState: typeof import('../../server/utils/sipaeAttendance').sipaeErrorState
  const splitCookiesString: typeof import('../../node_modules/h3').splitCookiesString
  const surveyNivelFromStudent: typeof import('../../server/utils/personasConfig').surveyNivelFromStudent
  const timeoutError: typeof import('../../server/utils/httpError').timeoutError
  const toEventHandler: typeof import('../../node_modules/h3').toEventHandler
  const toNodeListener: typeof import('../../node_modules/h3').toNodeListener
  const toPlainHandler: typeof import('../../node_modules/h3').toPlainHandler
  const toWebHandler: typeof import('../../node_modules/h3').toWebHandler
  const toWebRequest: typeof import('../../node_modules/h3').toWebRequest
  const unavailableError: typeof import('../../server/utils/httpError').unavailableError
  const unsealSession: typeof import('../../node_modules/h3').unsealSession
  const updateSession: typeof import('../../node_modules/h3').updateSession
  const uploadToExternalService: typeof import('../../server/utils/externalUpload').uploadToExternalService
  const useAppConfig: typeof import('../../node_modules/nitropack/dist/runtime/internal/config').useAppConfig
  const useBase: typeof import('../../node_modules/h3').useBase
  const useEvent: typeof import('../../node_modules/nitropack/dist/runtime/internal/context').useEvent
  const useNitroApp: typeof import('../../node_modules/nitropack/dist/runtime/internal/app').useNitroApp
  const useRuntimeConfig: typeof import('../../node_modules/nitropack/dist/runtime/internal/config').useRuntimeConfig
  const useSession: typeof import('../../node_modules/h3').useSession
  const useStorage: typeof import('../../node_modules/nitropack/dist/runtime/internal/storage').useStorage
  const validateFamilyPassword: typeof import('../../server/utils/passwordPolicy').validateFamilyPassword
  const validateMarbeteRequirements: typeof import('../../server/utils/marbeteTemplates').validateMarbeteRequirements
  const verifyCaptchaChallenge: typeof import('../../server/utils/antibot').verifyCaptchaChallenge
  const withRequestBoundary: typeof import('../../server/utils/logger').withRequestBoundary
  const writeEarlyHints: typeof import('../../node_modules/h3').writeEarlyHints
  const writePersonasConfig: typeof import('../../server/utils/personasConfig').writePersonasConfig
}
// for type re-export
declare global {
  // @ts-ignore
  export type { EventHandler, EventHandlerRequest, EventHandlerResponse, EventHandlerObject, H3EventContext } from '../../node_modules/h3'
  import('../../node_modules/h3')
  // @ts-ignore
  export type { DevHuskyPassVariant, DevHuskyPassScenario } from '../../server/utils/devHuskyPassFixtures'
  import('../../server/utils/devHuskyPassFixtures')
  // @ts-ignore
  export type { UploadInputFile, ExternalUploadResult } from '../../server/utils/externalUpload'
  import('../../server/utils/externalUpload')
  // @ts-ignore
  export type { LogLevel } from '../../server/utils/logger'
  import('../../server/utils/logger')
  // @ts-ignore
  export type { MarbetePdfInput } from '../../server/utils/marbetePdf'
  import('../../server/utils/marbetePdf')
  // @ts-ignore
  export type { MarbeteRenderValues, MarbeteRequirementStatus } from '../../server/utils/marbeteTemplates'
  import('../../server/utils/marbeteTemplates')
  // @ts-ignore
  export type { SipaeAbsentStudent, SipaeAttendanceGroup, SipaeAttendanceDay, SipaeAttendanceDetailResponse, SipaeTardyRecord, SipaeTardiesResponse } from '../../server/utils/sipaeAttendance'
  import('../../server/utils/sipaeAttendance')
}
export { H3Event, H3Error, appendCorsHeaders, appendCorsPreflightHeaders, appendHeader, appendHeaders, appendResponseHeader, appendResponseHeaders, assertMethod, callNodeListener, clearResponseHeaders, clearSession, createApp, createAppEventHandler, createError, createEvent, createEventStream, createRouter, defaultContentType, defineEventHandler, defineLazyEventHandler, defineNodeListener, defineNodeMiddleware, defineRequestMiddleware, defineResponseMiddleware, defineWebSocket, defineWebSocketHandler, deleteCookie, dynamicEventHandler, eventHandler, fetchWithEvent, fromNodeMiddleware, fromPlainHandler, fromWebHandler, getCookie, getHeader, getHeaders, getMethod, getProxyRequestHeaders, getQuery, getRequestFingerprint, getRequestHeader, getRequestHeaders, getRequestHost, getRequestIP, getRequestPath, getRequestProtocol, getRequestURL, getRequestWebStream, getResponseHeader, getResponseHeaders, getResponseStatus, getResponseStatusText, getRouterParam, getRouterParams, getSession, getValidatedQuery, getValidatedRouterParams, handleCacheHeaders, handleCors, isCorsOriginAllowed, isError, isEvent, isEventHandler, isMethod, isPreflightRequest, isStream, isWebResponse, lazyEventHandler, parseCookies, promisifyNodeListener, proxyRequest, readBody, readFormData, readMultipartFormData, readRawBody, readValidatedBody, removeResponseHeader, sanitizeStatusCode, sanitizeStatusMessage, sealSession, send, sendError, sendIterable, sendNoContent, sendProxy, sendRedirect, sendStream, sendWebResponse, serveStatic, setCookie, setHeader, setHeaders, setResponseHeader, setResponseHeaders, setResponseStatus, splitCookiesString, toEventHandler, toNodeListener, toPlainHandler, toWebHandler, toWebRequest, unsealSession, updateSession, useBase, useSession, writeEarlyHints } from 'h3';
export { useNitroApp } from 'nitropack/runtime/internal/app';
export { useRuntimeConfig, useAppConfig } from 'nitropack/runtime/internal/config';
export { defineNitroPlugin, nitroPlugin } from 'nitropack/runtime/internal/plugin';
export { defineCachedFunction, defineCachedEventHandler, cachedFunction, cachedEventHandler } from 'nitropack/runtime/internal/cache';
export { useStorage } from 'nitropack/runtime/internal/storage';
export { defineRenderHandler } from 'nitropack/runtime/internal/renderer';
export { defineRouteMeta } from 'nitropack/runtime/internal/meta';
export { getRouteRules } from 'nitropack/runtime/internal/route-rules';
export { useEvent } from 'nitropack/runtime/internal/context';
export { defineTask, runTask } from 'nitropack/runtime/internal/task';
export { defineNitroErrorHandler } from 'nitropack/runtime/internal/error/utils';
export { buildAssetsURL as __buildAssetsURL, publicAssetsURL as __publicAssetsURL } from 'C:/Users/hp/husky-pass-crm/node_modules/@nuxt/nitro-server/dist/runtime/utils/paths';
export { defineAppConfig } from 'C:/Users/hp/husky-pass-crm/node_modules/@nuxt/nitro-server/dist/runtime/utils/config';
export { createCaptchaChallenge, verifyCaptchaChallenge, assertRateLimit, assertRegistrationAntibot } from 'C:/Users/hp/husky-pass-crm/server/utils/antibot';
export { attendanceQuery, attendanceOne, attendanceWrite } from 'C:/Users/hp/husky-pass-crm/server/utils/attendanceMysql';
export { hasFamilyProductScope, isSuperAdmin, assertDaycareFamily, assertPersonasAutorizadasFamily, assertDaycareAdmin, assertCommunicationsAdmin, assertAccessHistoryAdmin, assertUnidadAccess, assertSalaAccess } from 'C:/Users/hp/husky-pass-crm/server/utils/authz';
export { DEV_HUSKY_PASS_VARIANTS, DEV_HUSKY_PASS_SCENARIOS, devHuskyPassVariant, devHuskyPassScenario, devHuskyPassPhotoUrl, buildDevPrintableAuthorizedPerson, selectDevHuskyPassTemplate } from 'C:/Users/hp/husky-pass-crm/server/utils/devHuskyPassFixtures';
export { assertDevOnly } from 'C:/Users/hp/husky-pass-crm/server/utils/devOnly';
export { buildEnvChecklist } from 'C:/Users/hp/husky-pass-crm/server/utils/envChecklist';
export { externalUploadFolder, uploadToExternalService, dataUrlToUploadFile } from 'C:/Users/hp/husky-pass-crm/server/utils/externalUpload';
export { resolveGrupoSigil } from 'C:/Users/hp/husky-pass-crm/server/utils/grupoIcons';
export { publicError, timeoutError, unavailableError } from 'C:/Users/hp/husky-pass-crm/server/utils/httpError';
export { adminOrigin } from 'C:/Users/hp/husky-pass-crm/server/utils/impersonation';
export { shortHash, redactContext, errorSummary, ensureRequestId, logEvent, logErrorOnce, withRequestBoundary } from 'C:/Users/hp/husky-pass-crm/server/utils/logger';
export { prepareMarbeteSvgForPdf, assertMarbetePdfAssets, renderMarbetePdf } from 'C:/Users/hp/husky-pass-crm/server/utils/marbetePdf';
export { listMarbeteTemplates, marbeteTemplateThemes, readMarbeteTemplateSvg, selectMarbeteTemplate, saveMarbeteTemplate, buildMarbeteRenderValues, validateMarbeteRequirements, renderMarbeteSvg, marbeteDownloadName, fallbackTemplateColor } from 'C:/Users/hp/husky-pass-crm/server/utils/marbeteTemplates';
export { legacyQuery, legacyOne, legacyWrite, csvToList } from 'C:/Users/hp/husky-pass-crm/server/utils/mysql';
export { PASSWORD_MIN_LENGTH, PASSWORD_MAX_LENGTH, validateFamilyPassword, assertPasswordConfirmation } from 'C:/Users/hp/husky-pass-crm/server/utils/passwordPolicy';
export { SURVEY_NIVEL_OPTIONS, normalizeGoogleFormEmbedUrl, readPersonasConfig, writePersonasConfig, savePersonasConfig, surveyNivelFromStudent, resolveSurveyForStudent, appendAccessActionLog, readLastAccessActions } from 'C:/Users/hp/husky-pass-crm/server/utils/personasConfig';
export { logPersonasDiagnostic, logPersonasWarning, logPersonasDebug } from 'C:/Users/hp/husky-pass-crm/server/utils/personasDiagnostics';
export { sendPasswordRecoveryEmail, readLatestRecoveryEmailPreview } from 'C:/Users/hp/husky-pass-crm/server/utils/recoveryEmail';
export { securityHash, logSecurityDiagnostic, logSecurityWarning } from 'C:/Users/hp/husky-pass-crm/server/utils/securityDiagnostics';
export { isServerlessRuntime, runtimeDataDir } from 'C:/Users/hp/husky-pass-crm/server/utils/serverlessPaths';
export { setAppSession, clearAppSession, getAppSession, requireSession } from 'C:/Users/hp/husky-pass-crm/server/utils/session';
export { sipaeErrorMessage, sipaeErrorState, fetchSipaeAttendanceDetail, fetchSipaeTardies } from 'C:/Users/hp/husky-pass-crm/server/utils/sipaeAttendance';
export { resolveSipaePlantel, deriveSipaePlantelFromStudent, plantelMatches } from 'C:/Users/hp/husky-pass-crm/server/utils/sipaePlantel';
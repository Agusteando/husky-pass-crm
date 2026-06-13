import { defineEventHandler } from 'h3'
import { assertDevOnly } from '~/server/utils/devOnly'
import { DEV_HUSKY_PASS_SCENARIOS, DEV_HUSKY_PASS_VARIANTS } from '~/server/utils/devHuskyPassFixtures'
import { listMarbeteTemplates, marbeteTemplateThemes } from '~/server/utils/marbeteTemplates'

export default defineEventHandler(async () => {
  assertDevOnly()
  return {
    variants: DEV_HUSKY_PASS_VARIANTS,
    scenarios: DEV_HUSKY_PASS_SCENARIOS,
    templates: await listMarbeteTemplates(),
    themes: marbeteTemplateThemes()
  }
})

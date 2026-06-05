import { defineEventHandler } from 'h3'
import { createCaptchaChallenge } from '~/server/utils/antibot'

export default defineEventHandler(() => createCaptchaChallenge())

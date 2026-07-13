import { defineEventHandler, sendRedirect } from 'h3'

const PASES_URL = 'https://pases-digitales.vercel.app/'

export default defineEventHandler((event) => sendRedirect(event, PASES_URL, 302))

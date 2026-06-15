import { defineEventHandler, getQuery, setHeader } from 'h3'
import { z } from 'zod'
import { assertDevOnly } from '~/server/utils/devOnly'

const schema = z.object({
  seed: z.string().optional().default('husky-pass'),
  label: z.string().optional().default('PA'),
  theme: z.string().optional().default('escolar'),
  mode: z.enum(['portrait', 'wide', 'tall', 'transparent', 'large', 'slow']).optional().default('portrait'),
  transparent: z.string().optional().default(''),
  large: z.string().optional().default(''),
  delay: z.coerce.number().int().min(0).max(5000).optional().default(0)
})

const themeColors: Record<string, { primary: string; soft: string }> = {
  escolar: { primary: '#236188', soft: '#EEF7FB' },
  daycare: { primary: '#618B2F', soft: '#EDF6E5' },
  preescolar: { primary: '#E83F4B', soft: '#FFF1F2' },
  primaria: { primary: '#D99A08', soft: '#FFF7D7' },
  secundaria: { primary: '#2C7DB6', soft: '#EAF5FC' },
  iedis: { primary: '#007F92', soft: '#E9F8FA' }
}

function escapeXml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function dimensions(mode: string) {
  if (mode === 'wide') return { width: 720, height: 320 }
  if (mode === 'tall') return { width: 280, height: 720 }
  return { width: 367, height: 485 }
}

function largePayload(enabled: boolean) {
  if (!enabled) return ''
  return Array.from({ length: 650 }, (_item, index) => {
    const x = (index * 37) % 367
    const y = (index * 53) % 485
    const opacity = 0.03 + ((index % 7) * 0.01)
    return `<circle cx="${x}" cy="${y}" r="${10 + (index % 19)}" fill="#ffffff" opacity="${opacity.toFixed(2)}"/>`
  }).join('')
}

export default defineEventHandler(async (event) => {
  assertDevOnly()
  const query = schema.parse(getQuery(event))
  if (query.delay) await new Promise((resolve) => setTimeout(resolve, query.delay))

  const { width, height } = dimensions(query.mode)
  const colors = themeColors[query.theme] || themeColors.escolar
  const transparent = Boolean(query.transparent || query.mode === 'transparent')
  const seed = escapeXml(query.seed)
  const label = escapeXml(query.label.slice(0, 4).toUpperCase())
  const faceRadius = Math.min(width, height) * 0.16
  const headX = width / 2
  const headY = height * 0.33
  const shoulderY = height * 0.82
  const shirtColor = colors.primary
  const background = transparent
    ? `<rect width="${width}" height="${height}" fill="transparent"/>`
    : `<rect width="${width}" height="${height}" rx="34" fill="${colors.soft}"/>`
  const art = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <defs>
    <linearGradient id="skin" x1="0" x2="1" y1="0" y2="1">
      <stop offset="0" stop-color="#ffe0c7"/>
      <stop offset="1" stop-color="#f0a776"/>
    </linearGradient>
    <linearGradient id="shirt" x1="0" x2="1" y1="0" y2="1">
      <stop offset="0" stop-color="${shirtColor}"/>
      <stop offset="1" stop-color="#263241"/>
    </linearGradient>
  </defs>
  ${background}
  <rect x="18" y="18" width="${width - 36}" height="${height - 36}" rx="28" fill="#ffffff" opacity=".42"/>
  ${largePayload(Boolean(query.large))}
  <ellipse cx="${headX}" cy="${height * 0.9}" rx="${width * 0.38}" ry="${height * 0.09}" fill="#111827" opacity=".14"/>
  <path d="M${width * 0.18} ${shoulderY} C ${width * 0.24} ${height * 0.58}, ${width * 0.76} ${height * 0.58}, ${width * 0.82} ${shoulderY} L${width * 0.88} ${height} H${width * 0.12} Z" fill="url(#shirt)"/>
  <path d="M${width * 0.36} ${height * 0.62} C ${width * 0.42} ${height * 0.72}, ${width * 0.58} ${height * 0.72}, ${width * 0.64} ${height * 0.62} L${width * 0.61} ${height * 0.84} H${width * 0.39} Z" fill="url(#skin)"/>
  <path d="M${headX - faceRadius * 1.2} ${headY - faceRadius * 0.2} C ${headX - faceRadius * 1.35} ${headY - faceRadius * 1.25}, ${headX - faceRadius * 0.45} ${headY - faceRadius * 1.65}, ${headX + faceRadius * 0.55} ${headY - faceRadius * 1.45} C ${headX + faceRadius * 1.52} ${headY - faceRadius * 1.22}, ${headX + faceRadius * 1.4} ${headY + faceRadius * 0.32}, ${headX + faceRadius * 0.92} ${headY + faceRadius * 0.9} C ${headX + faceRadius * 0.4} ${headY + faceRadius * 1.5}, ${headX - faceRadius * 0.52} ${headY + faceRadius * 1.43}, ${headX - faceRadius * 0.98} ${headY + faceRadius * 0.78} C ${headX - faceRadius * 1.22} ${headY + faceRadius * 0.44}, ${headX - faceRadius * 1.14} ${headY + faceRadius * 0.04}, ${headX - faceRadius * 1.2} ${headY - faceRadius * 0.2} Z" fill="#2f1f1b"/>
  <circle cx="${headX}" cy="${headY}" r="${faceRadius}" fill="url(#skin)"/>
  <path d="M${headX - faceRadius * 0.95} ${headY - faceRadius * 0.42} C ${headX - faceRadius * 0.5} ${headY - faceRadius * 0.92}, ${headX + faceRadius * 0.42} ${headY - faceRadius * 0.92}, ${headX + faceRadius * 0.96} ${headY - faceRadius * 0.32} C ${headX + faceRadius * 0.82} ${headY - faceRadius * 1.1}, ${headX - faceRadius * 0.85} ${headY - faceRadius * 1.35}, ${headX - faceRadius * 0.95} ${headY - faceRadius * 0.42} Z" fill="#2f1f1b"/>
  <circle cx="${headX - faceRadius * 0.36}" cy="${headY - faceRadius * 0.04}" r="${Math.max(3, faceRadius * 0.07)}" fill="#263241"/>
  <circle cx="${headX + faceRadius * 0.36}" cy="${headY - faceRadius * 0.04}" r="${Math.max(3, faceRadius * 0.07)}" fill="#263241"/>
  <path d="M${headX - faceRadius * 0.18} ${headY + faceRadius * 0.42} Q ${headX} ${headY + faceRadius * 0.58}, ${headX + faceRadius * 0.22} ${headY + faceRadius * 0.42}" fill="none" stroke="#854d3b" stroke-width="${Math.max(3, faceRadius * 0.06)}" stroke-linecap="round"/>
  <rect x="${width * 0.64}" y="${height * 0.66}" width="${width * 0.19}" height="${height * 0.1}" rx="${Math.min(width, height) * 0.03}" fill="#fff" opacity=".92"/>
  <circle cx="${width * 0.69}" cy="${height * 0.71}" r="${Math.min(width, height) * 0.025}" fill="${colors.primary}"/>
  <text x="${width * 0.76}" y="${height * 0.725}" text-anchor="middle" font-family="Montserrat, Arial, sans-serif" font-weight="800" font-size="${Math.max(16, Math.min(width, height) * 0.055)}" fill="${colors.primary}">${label}</text>
  <text x="50%" y="${height - 34}" text-anchor="middle" font-family="Montserrat, Arial, sans-serif" font-weight="700" font-size="18" fill="${colors.primary}">${seed}</text>
</svg>`

  setHeader(event, 'Content-Type', 'image/svg+xml; charset=utf-8')
  setHeader(event, 'Cache-Control', 'no-store')
  return art
})

// Shared admin styles for consistent theming across all admin pages

export const adminStyles = {
  // Page containers
  pageContainer: '',

  // Headers
  pageTitle: 'text-3xl font-bold text-sand',
  pageTitleDecorative: 'text-3xl font-bold text-sand',
  sectionTitle: 'text-lg font-medium text-sand',

  // Cards and containers
  card: 'bg-gradient-to-br from-lavender/20 to-forest/20 backdrop-blur-md border border-sand/20 rounded-lg',
  cardHover: 'bg-gradient-to-br from-lavender/20 to-forest/20 backdrop-blur-md border border-sand/20 rounded-lg hover:border-sunset/50 transition-all',

  // Form elements
  label: 'block text-sm font-bold text-sand',
  labelMuted: 'block text-sm font-medium text-sand/80',
  input: 'mt-1 block w-full rounded-md bg-white/10 border-sand/30 text-sand shadow-sm focus:border-sunset focus:ring-sunset px-4 py-3 placeholder-sand/40',
  select: 'mt-1 block w-full rounded-md bg-white/10 border-sand/30 text-sand shadow-sm focus:border-sunset focus:ring-sunset px-4 py-3',
  textarea: 'mt-1 block w-full rounded-md bg-white/10 border-sand/30 text-sand shadow-sm focus:border-sunset focus:ring-sunset px-4 py-3 placeholder-sand/40',
  checkbox: 'h-4 w-4 text-sunset focus:ring-sunset border-sand/30 rounded bg-white/10',
  checkboxLabel: 'ml-2 block text-sm text-sand',
  helpText: 'mt-1 text-sm text-sand/60',

  // Buttons
  buttonPrimary: 'px-4 py-2 bg-sunset text-sand rounded hover:bg-sunset/80 transition font-medium',
  buttonSecondary: 'px-4 py-2 bg-lavender/30 text-sand border border-sand/20 rounded hover:bg-lavender/40 transition font-medium',
  buttonDanger: 'px-4 py-2 bg-red-600/80 text-sand rounded hover:bg-red-600 transition font-medium',
  buttonSuccess: 'px-4 py-2 bg-forest/60 text-sand rounded hover:bg-forest/80 transition font-medium',
  buttonMuted: 'px-4 py-2 bg-sand/10 text-sand/80 rounded hover:bg-sand/20 transition font-medium',

  // Tables
  table: 'min-w-full divide-y divide-sand/20',
  tableHeader: 'bg-lavender/20',
  tableHeaderCell: 'px-6 py-3 text-left text-xs font-medium text-sand/80 uppercase tracking-wider',
  tableBody: 'divide-y divide-sand/10',
  tableRow: 'hover:bg-lavender/10 transition',
  tableCell: 'px-6 py-4 whitespace-nowrap text-sm text-sand/80',
  tableCellPrimary: 'px-6 py-4 whitespace-nowrap text-sm font-medium text-sand',

  // Badges/Pills
  badgeSuccess: 'px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-forest/30 text-green-300 border border-green-400/30',
  badgeWarning: 'px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-500/20 text-yellow-300 border border-yellow-400/30',
  badgeDanger: 'px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-500/20 text-red-300 border border-red-400/30',
  badgePurple: 'px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-purple-500/20 text-purple-300 border border-purple-400/30',
  badgeOrange: 'px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-orange-500/20 text-orange-300 border border-orange-400/30',
  badgeMuted: 'px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-sand/10 text-sand/60 border border-sand/20',

  // Links
  link: 'text-sunset hover:text-sunset/80 transition',
  linkMuted: 'text-sand/60 hover:text-sand transition',

  // Alerts
  alertError: 'p-4 bg-red-900/30 border border-red-500/50 text-red-200 rounded',
  alertSuccess: 'p-4 bg-green-900/30 border border-green-500/50 text-green-200 rounded',
  alertWarning: 'p-4 bg-yellow-900/30 border border-yellow-500/50 text-yellow-200 rounded',

  // Empty states
  emptyState: 'text-sand/60',

  // Sections
  sectionDivider: 'border-t border-sand/20 pt-6',
  sectionCard: 'bg-sand/5 p-4 rounded border border-sand/10',
} as const

// Type badge colors based on event type
export const getTypeBadgeClass = (type: string) => {
  switch (type) {
    case 'FESTIVAL':
      return adminStyles.badgePurple
    case 'INTENSIVE':
      return adminStyles.badgeOrange
    case 'RETREAT':
      return adminStyles.badgeSuccess
    default:
      return adminStyles.badgeMuted
  }
}

// Status badge based on published state
export const getStatusBadgeClass = (published: boolean) => {
  return published ? adminStyles.badgeSuccess : adminStyles.badgeDanger
}

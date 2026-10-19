/**
 * @typedef {"visits" | "topProperties" | "bookings" | "rating"} KpiId
 *
 * @typedef {Object} Kpi
 * @property {KpiId} id
 * @property {string} label
 * @property {number} value
 * @property {number} delta      
 * @property {string} footnote
 *
 * @typedef {Object} DailyPoint
 * @property {string} date       
 * @property {number} value
 *
 * @typedef {Object} TopProperty
 * @property {string} id
 * @property {string} title
 * @property {string} city
 * @property {string} state
 * @property {number} views
 * @property {string} [imageUrl]
 *
 * @typedef {1 | 2 | 3 | 4 | 5} StarRating
 *
 * @typedef {Object} RatingSummaryData
 * @property {number} average
 * @property {number} total
 * @property {{ stars: StarRating, percent: number }[]} distribution
 *
 * @typedef {Object} ClientLocation
 * @property {string} city
 * @property {string} state
 * @property {number} percent
 *
 * @typedef {"novo" | "atendimento" | "qualificado" | "convertido"} LeadStatus
 *
 * @typedef {Object} Lead
 * @property {string} id
 * @property {string} name
 * @property {string} [avatarUrl]
 * @property {string} property
 * @property {string} createdAt  
 * @property {LeadStatus} status
 *
 * @typedef {"visits" | "propertyViews" | "bookings" | "leads" | "conversion"} PlatformMetricId
 *
 * @typedef {Object} PlatformMetric
 * @property {PlatformMetricId} id
 * @property {string} label
 * @property {number} delta
 *
 * @typedef {Object} DashboardData
 * @property {{ start: string, end: string }} period
 * @property {Kpi[]} kpis
 * @property {DailyPoint[]} visits            
 * @property {TopProperty[]} topProperties
 * @property {DailyPoint[]} bookings          
 * @property {number} bookingsTotal
 * @property {RatingSummaryData} rating
 * @property {ClientLocation[]} locations
 * @property {Lead[]} recentLeads
 * @property {PlatformMetric[]} platform
 *
 * @typedef {Object} AdminUser
 * @property {string} name
 * @property {string} role
 * @property {string} [avatarUrl]
 * @property {number} unreadNotifications
 */

export {};

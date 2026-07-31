import { Link } from "react-router-dom"
import { useState, useEffect } from "react"
import apiClient from "../services/api"
import { useAuthStore } from "../store/authStore"

interface Leader {
  _id: string
  fullName: string
  email: string
  department: string
  designation: string
  profileImage: string
  bio: string
  tenureStartYear?: number
  tenureEndYear?: number
  isCurrent: boolean
}

interface LeadershipGroup {
  year: string
  displayText: string
  leaders: Leader[]
  isCurrent: boolean
}

function getInitials(name: string): string {
  return name.split(" ").map(n => n[0]).join("").toUpperCase()
}

const avatarColors = [
  "from-blue-600 to-blue-800",
  "from-emerald-600 to-emerald-800",
  "from-violet-600 to-violet-800",
  "from-orange-600 to-orange-800",
  "from-teal-600 to-teal-800",
  "from-pink-600 to-pink-800",
]

export default function Leadership() {
  const { token } = useAuthStore()
  const [leadershipGroups, setLeadershipGroups] = useState<LeadershipGroup[]>([])
  const [expandedYears, setExpandedYears] = useState<Set<string>>(new Set(["current"]))
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const toggleYear = (year: string) => {
    setExpandedYears((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(year)) {
        newSet.delete(year)
      } else {
        newSet.add(year)
      }
      return newSet
    })
  }

  useEffect(() => {
    const fetchLeaders = async () => {
      try {
        const response = await apiClient.get("/members")
        const members: Leader[] = response.data
        
        // Add default values for new fields if they don't exist
        const membersWithDefaults = members.map(m => ({
          ...m,
          tenureStartYear: m.tenureStartYear || undefined,
          tenureEndYear: m.tenureEndYear || undefined,
          isCurrent: m.isCurrent !== undefined ? m.isCurrent : false,
        }))
        
        const filtered = membersWithDefaults.filter((m) => {
          const role = (m.designation || "").toLowerCase().trim()
          
          const isLeader = (
            role === "president" ||
            role === "vice president" ||
            role === "vice_president" ||
            role === "secretary" ||
            role === "treasurer" ||
            role === "moderator" ||
            role.includes("lead") ||
            role.includes("director")
          )
          
          return isLeader
        })
        
        // Group leaders by year
        const groups = groupLeadersByYear(filtered)
        setLeadershipGroups(groups)

        // Auto-expand current leadership
        const currentGroup = groups.find(g => g.isCurrent)
        if (currentGroup) {
          setExpandedYears(new Set([currentGroup.year]))
        }
      } catch (err: any) {
        console.error("Error fetching leaders:", err)
        const msg = err?.response?.data?.message || err?.message || "Failed to load leadership data. Please try again later."
        setError(msg)
      } finally {
        setLoading(false)
      }
    }
    fetchLeaders()
  }, [])

  const groupLeadersByYear = (leaders: Leader[]): LeadershipGroup[] => {
    const grouped = new Map<string, Leader[]>()

    leaders.forEach((leader) => {
      let yearKey: string

      if (leader.isCurrent || (!leader.tenureEndYear && leader.tenureStartYear)) {
        // Current leadership
        yearKey = "current"
      } else if (leader.tenureStartYear && leader.tenureEndYear) {
        // Historical leadership with range
        yearKey = `${leader.tenureStartYear}-${leader.tenureEndYear}`
      } else if (leader.tenureStartYear) {
        // Single year
        yearKey = `${leader.tenureStartYear}`
      } else {
        // No year specified - treat as current
        yearKey = "current"
      }

      if (!grouped.has(yearKey)) {
        grouped.set(yearKey, [])
      }
      grouped.get(yearKey)!.push(leader)
    })

    // Convert to array and sort (current first, then by year descending)
    const groups: LeadershipGroup[] = Array.from(grouped.entries()).map(
      ([year, leaders]) => ({
        year,
        displayText:
          year === "current"
            ? leaders[0]?.tenureStartYear
              ? `Current Leadership (${leaders[0].tenureStartYear} - Present)`
              : "Current Leadership"
            : year.includes("-")
              ? year.replace("-", " - ")
              : year,
        leaders,
        isCurrent: year === "current",
      })
    )

    // Sort: current first, then by start year descending
    groups.sort((a, b) => {
      if (a.isCurrent) return -1
      if (b.isCurrent) return 1
      
      const aYear = parseInt(a.year.split("-")[0]) || 0
      const bYear = parseInt(b.year.split("-")[0]) || 0
      return bYear - aYear
    })

    return groups
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950">
        <div className="bg-gradient-to-br from-blue-700 via-indigo-800 to-purple-900 py-24 px-4 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-black/40" />
          <div className="relative z-10">
            <div className="h-12 w-72 bg-white/10 rounded-lg animate-pulse mx-auto mb-4" />
            <div className="h-6 w-96 bg-white/10 rounded-lg animate-pulse mx-auto" />
          </div>
        </div>
        <div className="max-w-6xl mx-auto px-4 py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-6 animate-pulse">
                <div className="w-24 h-24 rounded-full bg-gray-700 mx-auto mb-4" />
                <div className="h-5 w-32 bg-gray-700 rounded mx-auto mb-2" />
                <div className="h-4 w-24 bg-gray-700 rounded mx-auto mb-2" />
                <div className="h-3 w-20 bg-gray-700 rounded mx-auto mb-4" />
                <div className="h-3 w-full bg-gray-700 rounded mb-2" />
                <div className="h-3 w-3/4 bg-gray-700 rounded mx-auto" />
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-700 via-indigo-800 to-purple-900 py-12 sm:py-16 md:py-20 px-4">
        <div className="absolute inset-0 bg-black/40" />
        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight mb-3 sm:mb-4 drop-shadow-lg">
            Our Leadership
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-gray-200 max-w-2xl mx-auto leading-relaxed">
            Meet the dedicated team guiding GBAABW forward with vision and integrity.
          </p>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-3 sm:px-4 py-10 sm:py-16">
        {error && (
          <div className="flex items-center gap-3 bg-red-900/30 border border-red-500/40 text-red-300 rounded-xl px-4 sm:px-6 py-3 sm:py-4 mb-6 sm:mb-8 text-sm">
            <svg className="w-5 h-5 sm:w-6 sm:h-6 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        {leadershipGroups.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-500">
            <p className="text-lg sm:text-xl font-medium">No leadership members found.</p>
            <p className="text-sm mt-2">Leadership information will be displayed here once added.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {leadershipGroups.map((group) => {
              const isExpanded = expandedYears.has(group.year)
              
              return (
                <div
                  key={group.year}
                  className={`bg-gray-800/40 border rounded-xl overflow-hidden transition-all ${
                    group.isCurrent
                      ? "border-primary/50 shadow-lg shadow-primary/10"
                      : "border-gray-700/50"
                  }`}
                >
                  {/* Header - Clickable to expand/collapse */}
                  <button
                    onClick={() => toggleYear(group.year)}
                    className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-700/30 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <h2 className="text-xl sm:text-2xl font-bold text-white">
                        {group.displayText}
                      </h2>
                      {group.isCurrent && (
                        <span className="px-3 py-1 bg-primary/20 text-primary border border-primary/50 rounded-full text-xs font-semibold">
                          Current
                        </span>
                      )}
                      <span className="text-gray-400 text-sm">
                        ({group.leaders.length} {group.leaders.length === 1 ? "member" : "members"})
                      </span>
                    </div>
                    <svg
                      className={`w-6 h-6 text-gray-400 transition-transform duration-200 ${
                        isExpanded ? "rotate-180" : ""
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>

                  {/* Content - Collapsible */}
                  {isExpanded && (
                    <div className="px-6 pb-6">
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 pt-4">
                        {group.leaders.map((leader, index) => {
                          const cardInner = (
                            <>
                              <div className="p-5 sm:p-6 text-center">
                                {leader.profileImage ? (
                                  <img
                                    src={leader.profileImage}
                                    alt={leader.fullName}
                                    className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-full mx-auto mb-4 ring-2 ring-gray-600 group-hover:ring-blue-400 transition-all"
                                  />
                                ) : (
                                  <div
                                    className={`w-20 h-20 sm:w-24 sm:h-24 rounded-full mx-auto mb-4 flex items-center justify-center text-white text-xl sm:text-2xl font-bold bg-gradient-to-br ${
                                      avatarColors[index % avatarColors.length]
                                    } ring-2 ring-gray-600 group-hover:ring-blue-400 transition-all`}
                                  >
                                    {getInitials(leader.fullName)}
                                  </div>
                                )}
                                <h3 className="text-lg sm:text-xl font-bold text-white group-hover:text-blue-300 transition-colors">
                                  {leader.fullName}
                                </h3>
                                <p className="text-blue-400 font-semibold text-sm mt-1">
                                  {leader.designation}
                                </p>
                                {leader.department && (
                                  <p className="text-gray-500 text-xs uppercase tracking-wider mt-1">
                                    {leader.department}
                                  </p>
                                )}
                                {leader.bio && (
                                  <p className="text-gray-400 mt-3 text-sm leading-relaxed line-clamp-3">
                                    {leader.bio}
                                  </p>
                                )}
                              </div>
                              <div className="border-t border-gray-700/50 px-4 sm:px-6 py-3 flex items-center justify-center gap-2 text-gray-400 group-hover:text-blue-400 transition-colors">
                                <span className="text-xs sm:text-sm truncate max-w-full">
                                  {leader.email}
                                </span>
                              </div>
                            </>
                          )

                          const className =
                            "group bg-gray-800/40 border border-gray-700/50 rounded-xl overflow-hidden hover:-translate-y-1 hover:shadow-2xl hover:shadow-blue-500/10 hover:border-blue-500/40 transition-all duration-300 block"

                          // Member profiles require login
                          if (token) {
                            return (
                              <Link
                                key={leader._id}
                                to={`/members/${leader._id}`}
                                className={className}
                              >
                                {cardInner}
                              </Link>
                            )
                          }

                          return (
                            <div key={leader._id} className={className}>
                              {cardInner}
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </section>
    </div>
  )
}

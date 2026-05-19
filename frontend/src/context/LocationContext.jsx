import { createContext, useContext, useState, useEffect } from 'react'

const LocationContext = createContext(null)

// Selection state stored in sessionStorage
const SEL_KEY = 'mm_selected_location'

function readSel() {
  try { return JSON.parse(sessionStorage.getItem(SEL_KEY)) } catch { return null }
}
function writeSel(d) {
  try { sessionStorage.setItem(SEL_KEY, JSON.stringify(d)) } catch {}
}

export function LocationProvider({ children }) {
  const [locationData, setLocationData] = useState(null)   // full JSON once
  const [loading,      setLoading]      = useState(true)

  // Default selection: Chandigarh region
  const [selected, setSelectedRaw] = useState(() => readSel() || {
    regionName:   'Chandigarh',
    regionCode:   'CHD',
    regionSlug:   'chandigarh',
    isSubRegion:  false,
    // cities array used for queries
    cities:       ['Chandigarh', 'Mohali', 'Zirakpur'],
  })

  // Fetch location JSON once on mount
  useEffect(() => {
    fetch('http://localhost:5000/api/v1/location')
      .then(r => r.json())
      .then(d => {
        if (d.success) setLocationData(d.data.BookMyShow)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const selectRegion = (region) => {
    // region = TopCity or OtherCity object
    const cities = region.SubRegions?.length
      ? [region.RegionName, ...region.SubRegions.map(s => s.SubRegionName)]
      : [region.RegionName]

    const sel = {
      regionName:  region.RegionName,
      regionCode:  region.RegionCode,
      regionSlug:  region.RegionSlug,
      isSubRegion: false,
      cities,
    }
    setSelectedRaw(sel)
    writeSel(sel)
  }

  const selectSubRegion = (subRegion, parentRegion) => {
    const sel = {
      regionName:  subRegion.SubRegionName,
      regionCode:  subRegion.SubRegionCode,
      regionSlug:  subRegion.SubRegionSlug,
      isSubRegion: true,
      cities:      [subRegion.SubRegionName],
      parentName:  parentRegion.RegionName,
    }
    setSelectedRaw(sel)
    writeSel(sel)
  }

  return (
    <LocationContext.Provider value={{ locationData, loading, selected, selectRegion, selectSubRegion }}>
      {children}
    </LocationContext.Provider>
  )
}

export const useLocation = () => useContext(LocationContext)

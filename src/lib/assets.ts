// Centralized public asset URLs.
//
// These buckets are public (not secrets) but the same literals were copy-pasted
// across many components (the gold logo alone lived in 6 files). Keeping them
// here means a bucket/rename change is a single edit.
//
// Two Supabase projects are in play — see [[project_supabase]]:
//   RESOURCES_BASE → marketing/resource bucket (logos, cars, fleet photos)
//   APP_BASE       → main app project (hosts the Escalade render)

const RESOURCES_BASE =
    "https://xhcxkvwrjcnioopultzq.supabase.co/storage/v1/object/public/public-resources";
const APP_BASE =
    "https://bglvvffnlgawlcfxctbl.supabase.co/storage/v1/object/public/public-resources";

export const ASSETS = {
    logoGold: `${RESOURCES_BASE}/logos/G4_GOLD_brand.webp`,
    logoTransparent: `${RESOURCES_BASE}/logos/G4-transparent-logo.png`,
    carCorolla: `${RESOURCES_BASE}/cars/corolla.png`,
    carEscalade: `${APP_BASE}/cars/escalade-2026-vehicle.png`,
    // External stock hero image (driver POV) used by the landing slider and login.
    heroDriverPov:
        "https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?q=80&w=2070&auto=format&fit=crop",
} as const;

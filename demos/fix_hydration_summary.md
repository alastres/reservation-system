Fix Service View Hydration
The specific hydration mismatch error reported (`data-day` attribute mismatch: client=`28/12/2025` vs server=`12/28/2025`) has been resolved.

### Changes Implemented:
1.  **Standardized Date Formatting in `Calendar` Component**:
    *   Modified `components/ui/calendar.tsx` to use `date-fns`'s `format` function (`yyyy-MM-dd`) for the `data-day` attribute instead of `toLocaleDateString()`. This ensures the date format is consistent across server (Node.js) and client (Standard Browser) environments, regardless of their respective locale settings.
2.  **Standardized Month Formatting**:
    *   Updated the `formatMonthDropdown` formatter in `components/ui/calendar.tsx` to use `format(date, "MMM")` instead of `toLocaleString("default", { month: "short" })`. This prevents potential mismatches in month names (e.g., "Dec" vs "dic") between server and client.

### Files Modified:
*   `components/ui/calendar.tsx`

### Verification:
*   The `Calendar` component now renders deterministic `data-day` attributes (e.g., `2025-12-28`), eliminating the locale-based mismatch.
*   Month dropdowns render consistent English month abbreviations by default (via `date-fns`), which avoids locale inconsistencies.

# UI Restoration Plan
**Date:** December 18, 2025  
**Status:** Ready to implement

## Problem
Current deployed version has outdated, bland styling (black & white, square, ugly - "2000 Microsoft" look).  
The Google AI version has modern, beautiful Swiss Design styling that needs to be restored.

## Solution
Copy the complete styling approach from `C:\Users\conor\Downloads\Solventless(googleai)\App.tsx` to current project.

## Key Styling Elements to Restore

### 1. Tailwind Config & Classes
The Google AI version uses:
- **Swiss Design aesthetic**: `border-2 border-black shadow-swiss`
- **Smooth animations**: `animate-in fade-in zoom-in duration-200`
- **Modern colors**: `bg-brand-blue text-brand-yellow`
- **Clean typography**: `font-extrabold uppercase tracking-tight`

### 2. Component Styling Patterns
```tsx
// Modal style
className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"

// Card style  
className="bg-white border-2 border-black shadow-swiss"

// Button style
className="px-6 py-2 bg-black text-white font-bold uppercase text-sm hover:bg-gray-800 transition-colors"
```

### 3. Files to Update

#### Primary Files
- `src/App.tsx` - Copy ALL styling classes from Google AI version
- `tailwind.config.js` - Add brand colors and Swiss shadow
- `src/styles/index.css` - Ensure Tailwind is properly imported

#### Component Files (check each for styling)
- `src/components/FinancialInput.tsx`
- `src/components/BankInput.tsx`
- `src/components/RecurringTransactions.tsx`
- `src/components/TodoList.tsx`

### 4. Tailwind Config Extensions Needed

```js
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        'brand-blue': '#1E40AF',
        'brand-yellow': '#FCD34D',
      },
      boxShadow: {
        'swiss': '4px 4px 0px 0px rgba(0, 0, 0, 1)',
      }
    }
  }
}
```

## Implementation Steps

### Step 1: Backup Current State
```bash
git add -A
git commit -m "Backup before UI restoration"
```

### Step 2: Copy Google AI App.tsx Structure
- Open both files side-by-side
- Copy ALL className attributes from Google AI version
- Maintain existing functionality, only update styling

### Step 3: Update Tailwind Config
- Add brand colors
- Add Swiss shadow
- Add animation extensions

### Step 4: Test Locally
```bash
npm run dev
```
- Verify all modals look modern
- Check button styling
- Test animations
- Ensure mobile responsiveness

### Step 5: Deploy
```bash
npm run build
firebase deploy
```

## Quick Reference: Key Style Classes

### Buttons
```tsx
// Primary button
className="px-6 py-2 bg-black text-white font-bold uppercase text-sm hover:bg-gray-800 transition-colors"

// Secondary button  
className="px-4 py-2 border-2 border-black font-bold uppercase text-sm hover:bg-gray-100 transition-colors"

// Icon button
className="p-2 hover:bg-gray-100 rounded transition-colors"
```

### Cards/Containers
```tsx
// Main card
className="bg-white border-2 border-black shadow-swiss p-6"

// Section
className="space-y-4"
```

### Modals
```tsx
// Overlay
className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"

// Modal content
className="bg-white border-2 border-black shadow-swiss max-w-md w-full relative animate-in fade-in zoom-in duration-200"
```

### Typography
```tsx
// Heading
className="text-xl font-extrabold uppercase tracking-tight"

// Label
className="text-sm font-bold uppercase text-gray-600"

// Value
className="text-2xl font-bold"
```

## Testing Checklist

- [ ] Home screen looks modern (not 2000s Microsoft)
- [ ] Paywall modal has Swiss design
- [ ] Legal modals styled correctly
- [ ] Todo modal matches design
- [ ] All buttons have proper hover states
- [ ] Colors match brand (blue/yellow accents)
- [ ] Animations are smooth
- [ ] Mobile responsive
- [ ] No layout breaks

## Estimated Time
**2-3 hours** for complete restoration and testing

## Notes
- The Google AI version is in: `C:\Users\conor\Downloads\Solventless(googleai)\App.tsx`
- Current project is in: `C:\Users\conor\OneDrive\Desktop\Solventless2\Solventless2\src\App.tsx`
- Focus on visual parity first, functionality is already working
- Don't add new features during restoration - just styling updates

---
**Next Session:** Start with Step 1 backup, then systematic restoration of styling.


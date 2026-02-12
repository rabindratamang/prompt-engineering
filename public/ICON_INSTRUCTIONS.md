# PWA Icon Instructions

## Required Icons

Your PWA needs app icons in the `public/` folder. Create these two files:

### 1. icon-192.png (192x192 pixels)
### 2. icon-512.png (512x512 pixels)

## Quick Ways to Create Icons:

### Option 1: Use an Online Icon Generator
1. Go to https://www.pwabuilder.com/imageGenerator
2. Upload your logo or design
3. Download the generated icons
4. Place `icon-192.png` and `icon-512.png` in `/public/` folder

### Option 2: Use Figma/Canva
1. Create a 512x512px square design
2. Use your brand colors (primary: #3b82f6 blue)
3. Add text "PE" or a relevant icon
4. Export as PNG at 512x512 and 192x192

### Option 3: Simple Text Icon (Quick Start)
Use any image editor to create a simple square with:
- Background: #3b82f6 (blue)
- Text: "PE" or "📝" emoji in white
- Size: 512x512 (then resize to 192x192 for the smaller one)

## Design Tips:
- Keep it simple and recognizable at small sizes
- Use high contrast (light text on dark background or vice versa)
- Avoid detailed images (they don't scale well)
- Square format with rounded corners applied by OS
- Consider dark/light mode compatibility

## Current Placeholder:
The app will work without icons, but you should add them for better UX.
Browser will show a default icon until you add custom ones.

## After Adding Icons:
1. Place icons in `/public/` folder
2. Run `npm run build`
3. Test the PWA by opening the site and looking for "Add to Home Screen" prompt

# LumenLayout — Lighting Simulator

A real-time 2D room lighting simulator that helps you plan and visualize light fixture placement before you buy or install anything.

## Features

- **Room Setup** — Define room name, dimensions (length × width in feet), and room type (Bedroom, Living Room, Kitchen, Bathroom, Office, Garage)
- **2D Grid Canvas** — A top-down grid where each cell represents one square foot; drag fixtures anywhere on the canvas
- **Drag-and-Drop Fixtures** — Add as many light fixtures as you need; each is freely draggable within the room bounds
- **Realistic Glow Effects** — Every fixture renders a radial-gradient glow whose:
  - **size** scales with lumen output (200 lm → small; 5000 lm → large)
  - **color** shifts with color temperature (2700 K → warm amber; 4000 K → neutral white; 6500 K → cool blue-white)
- **Light Properties Sidebar** — Click any fixture to edit its label, lumen output (200–5000 lm), and color temperature (2700–6500 K), or delete it
- **Analytics Dashboard** — Live readout of:
  - Total lumens & square footage
  - Lumen density (lm/ft²) vs. target density for the room type
  - Status indicator: *Under-lit* (<80 % of target), *Ideal* (80–120 %), *Over-lit* (>120 %)
  - Weighted-average color temperature across all fixtures
- **Persistent State** — Room configuration and fixture layout are saved to `localStorage` automatically

## Room Type Targets

| Room Type   | Target Density |
|-------------|---------------|
| Bedroom     | 20 lm/ft²     |
| Living Room | 20 lm/ft²     |
| Kitchen     | 50 lm/ft²     |
| Bathroom    | 70 lm/ft²     |
| Office      | 50 lm/ft²     |
| Garage      | 50 lm/ft²     |

## Tech Stack

- [Vite](https://vitejs.dev/) + [React](https://react.dev/) (JavaScript)
- [Tailwind CSS v4](https://tailwindcss.com/) — dark-mode-first styling
- [react-draggable](https://github.com/react-grid-layout/react-draggable) — fixture drag-and-drop
- [framer-motion](https://www.framer.com/motion/) — UI animations
- [lucide-react](https://lucide.dev/) — icons

## Getting Started

```bash
npm install
npm run dev       # start dev server at http://localhost:5173
npm run build     # production build → dist/
npm run preview   # preview production build
```

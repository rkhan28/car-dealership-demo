# Autobot

A cinematic Toronto car showroom demo by Rahmat Khan, presented under the ATELIER concept brand.

Scroll through a continuous 3D McLaren P1 GTR studio sequence, explore illustrative vehicles, save favourites, compare specifications and preview an enquiry flow.

## Run locally

Requires Node.js 22.13 or later.

```sh
npm install
npm run dev
```

```sh
npm run typecheck
npm run build
npm start
```

## Deploy

Import this repository into Vercel using the Next.js preset. No database, credentials or private environment variables are required. The intended project name is `autobot`; `autobot.vercel.app` is subject to availability. If using a different domain, set `NEXT_PUBLIC_SITE_URL` to its full HTTPS URL before building.

## Demo boundaries

This is a portfolio demonstration, not an operating dealership. Inventory, prices and specifications are illustrative. Enquiry forms simulate completion entirely in the browser: personal information is neither sent nor stored. Saved vehicle and comparison IDs use local storage. There are no payments, real appointments, email notifications or public administration endpoints.

## Technology

Next.js, React, TypeScript, Three.js and custom CSS. The renderer uses a studio HDR environment, material textures, gradual assembly separation, wing-door movement and a scroll-controlled camera. Reduced-motion preferences and a still-image fallback are supported.

## Credits

Third-party assets retain their licences and attribution. See `public/models/ATTRIBUTION.md` and the in-app Credits page. The McLaren model is by Desiccated_Lemon (CC BY 4.0); studio lighting is by Sergej Majboroda / Poly Haven (CC0). No manufacturer affiliation is claimed.

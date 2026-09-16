# nutripatrol-frontend
The front-end (React) of our Nutri-Patrol moderation tool. It is deployed @ https://nutripatrol.openfoodfacts.org/

## Nutripatrol API

This repository works with the backend of Nutri-Patrol: [Nutri-Patrol API](https://github.com/openfoodfacts/nutripatrol)
Please check this one before running the frontend.


## Current sources of reports for Nutri-Patrol
- Automatic population by Robotoff, based on Cloud Vision flagging (NSFW flags)
- Manual user reports from the Classic web app, as well as our next generation frontend, Open Food Facts Explorer
- The mobile app is currently not wired to send reports. An open PR awaits your help (Flutter)

## 🎨 Design
- [![Figma](https://img.shields.io/badge/figma-%23F24E1E.svg?logo=figma&logoColor=white) Mockups & Benchmarks for Nutri-Patrol](https://www.figma.com/design/SRU9iQ5DIpKNa6izKEiqyo/NutriPatrol--quality-?node-id=48-36&p=f&t=Ly2rYxJgs4fcTane-0)
- Are you a designer ? [Join the design team](https://github.com/openfoodfacts/openfoodfacts-design)
## Features
- Image reporting
- List of reported images
## Roadmap
- [ ] Improving usability of the tickets dashboard (more tickets per page, filtering tickets based on keyword, seeing the username of the reporter, and the name of the uploader)
- [ ] Adding quick actions to solve issues easily
- [ ] Turn Nutri-Patrol, in complement with Hunger Games into a true Hub for Data Quality

## Get started 🎯

1. You can clone this repository :

` git clone https://github.com/openfoodfacts/nutripatrol-frontend.git `

2. Open the project folder :

` cd nutripatrol-frontend `

3. Install dependencies : 

` npm install `

4. Start vite : 

` npm run dev `

5. Congratulations 🎉 ! [You can open frontend](http://localhost:5173/)

## Signing in during local dev

Open Food Facts sets its session cookie on an `openfoodfacts` host, so a front
end served from `localhost` can never obtain one: there is no real account to
sign into here. With `VITE_DEVELOPPEMENT_MODE=development` (the default in
`.env.local`), `/login` therefore offers a choice of account instead of the
hand-off to Open Food Facts:

| Choice | What the app does |
|---|---|
| **Signed out** | No session: the moderation screens and the flag form both send you back to `/login` |
| **Contributor** | Signed in without moderator rights: the flag form works, the moderation screens land on the "not a moderator" page |
| **Moderator** | Signed in with moderator rights: the whole app is open |

The choice is remembered across reloads, and `/login` is reachable at any time
to change it - the user menu's "Logout" goes back to signed out.

It reaches the API too: each call names the chosen account with the
`X-Dev-User-Id` / `X-Dev-Moderator` headers, so the API filters as it would for
a real one - a contributor lists only the tickets their own flags opened, a
moderator lists every one of them, and signed out gets 401. This needs
`AUTH_DEV_USERS=1` in the API's `.env` (on by default there); see the
[API README](https://github.com/openfoodfacts/nutripatrol#switching-between-users-in-local-dev).

## Useful routes

### Report forms

1. To report an image : 
```
http://localhost:5173/flag/image?barcode=[BARCODE]&source=[SOURCE]&flavor=[FLACOR]&image_id=[IMAGE_ID]
```

2. To report a product :
```
http://localhost:5173/flag/product?barcode=[BARCODE]&source=[SOURCE]&flavor=[FLAVOR]
```

> [!NOTE] 
> Warning, source have to be 'web', 'mobile', 'robotoff'
> flavor have to be 'off', 'obf', 'opff', 'opf', 'off_pro'

## Contributors

<a href="https://github.com/openfoodfacts/nutripatrol-frontend/graphs/contributors">
<img alt="List of contributors to this repository" src="https://contrib.rocks/image?repo=openfoodfacts/nutripatrol-frontend" />
</a>

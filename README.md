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
- [![Figma](https://img.shields.io/badge/figma-%23F24E1E.svg?logo=figma&logoColor=white) Mockups & Benchmarks](https://www.figma.com/design/SRU9iQ5DIpKNa6izKEiqyo/NutriPatrol--quality-?node-id=48-36&p=f&t=Ly2rYxJgs4fcTane-0)
- Are you a designer ? [Join the design team](https://github.com/openfoodfacts/openfoodfacts-design)
## Features
- Image reporting
- List of reported images
## Roadmap
- [ ] Improving usability of the tickets dashboard (more tickets per page, filtering tickets based on keyword, seeing the username of the reporter)
- [ ] Insert main roadmap items here
## Weekly meetings (Frontend meeting)

- We e-meet Wednesdays · 11:00 – 11:25am - Time zone: Europe/Paris
- ![Google Meet](https://meet.google.com/uep-fhvf-gto) Video call link: https://meet.google.com/uep-fhvf-gto
- Join by phone: https://tel.meet/uep-fhvf-gto?pin=8160344286211
- Add the Event to your Calendar by [adding the Open Food Facts community calendar to your calendar](https://wiki.openfoodfacts.org/Events)
- [Weekly Agenda](https://docs.google.com/document/d/1BGHfvrgx5eFIGjK8aTNPK2QwAggRp4oohGuYG9lNX8g/edit?tab=t.0): please add the Agenda items as early as you can. Make sure to check the Agenda items in advance of the meeting, so that we have the most informed discussions possible, leading to argumented decisions.
- The meeting will handle Agenda items first, and if time permits, collaborative bug triage.
- We strive to timebox the core of the meeting (decision making) to 30 minutes, with an optional free discussion/live debugging afterwards.
- We take comprehensive notes in the Weekly Agenda of agenda item discussions and of decisions taken.


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

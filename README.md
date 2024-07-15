# nutripatrol-frontend
The front-end (React) of nutripatrol moderation tool. It is deployed @ https://nutripatrol.openfoodfacts.net/

## Nutripatrol API

This repository works with an other [Nutripatrol API](https://github.com/openfoodfacts/nutripatrol)
Please check this one before running the frontend.

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
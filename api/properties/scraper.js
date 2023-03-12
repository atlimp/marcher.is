import fetch from 'node-fetch';
import * as cheerio from 'cheerio';

const BASE_URL = 'http://fasteignir.visir.is/property';

async function get(url) {
    const result = await fetch(url);

    if (result.ok) {
        return await result.text();
    }

    return null;
}

export async function getPropertyDetails(propertyId) {
    const resultTxt = await get(`${BASE_URL}/${propertyId}`);

    if (!resultTxt) {
        return {
            propertyId,
            name: '',
            price: 0,
            realEstateValue: 0
        };
    }
    const $ = cheerio.load(resultTxt);
    
    const propertyName = $('.property-info h1 .street').text();
    const address = $('.property-info h1 .address').text();
    const propertyPriceTxt = $('.property-info h1 .price').text();
    const loanDetails = $('.loan li');

    let realEstateValueTxt = '';

    loanDetails.each((i, li) => {
        const title = $(li).find('.title').text();

        if (title === 'Fasteignamat') {
            realEstateValueTxt = $(li).find('.data').text();
        }
    });

    const price = Number(propertyPriceTxt.replaceAll('.', '').replaceAll('kr', '').trim());
    const realEstateValue = Number(realEstateValueTxt.replaceAll('.', '').replaceAll('kr', '').trim());

    const property = {
        propertyId,
        name: `${propertyName} ${address}`,
        price,
        realEstateValue,
    };

    return property;
}
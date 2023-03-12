import express from 'express';
import { getPropertyDetails } from './scraper.js';

const app = express();

async function propertyDetails(req, res) {
    const { propertyId } = req.params;

    if (!propertyId) {
        return res.status(404).json({ error: 'missing required parameter propertyId' });
    }

    const details = await getPropertyDetails(propertyId);

    return res.json(details);    
}

app.get('/:propertyId', propertyDetails);

app.listen(3000, () => {
    console.log('server running');
});
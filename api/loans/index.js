import express from 'express';
import { getLoanPayments } from './scraper.js';

const app = express();

async function getMonthlyPayments(req, res) {
    try {
        const {
            realEstateValue: estateValue = 0,
            loanAmount: amount = 0,
            loanType = 'nonIndexed',
        } = req.query;

        const realEstateValue = Number(estateValue);
        const loanAmount = Number(amount);
    
        if (!(realEstateValue && loanAmount && loanType)) {
            return res.status(400).json({ error: 'missing query params'});
        }

        if (!(loanType === 'indexed' || loanType === 'nonIndexed' || loanType === 'mixed')) {
            return res.status(400).json({ error: 'loanType must be one of indexed, nonIndexed, mixed'});
        }
    
        const details = await getLoanPayments(realEstateValue, loanAmount);
        
        if (!details) {
            return res.json({ realEstateValue, loanAmount, loanType, loanAPayment: 0, loanBPayment: 0 });
        }
    
        const { proposal } = details;
        
        const nonIndexed = proposal.find(x => x.indexType === loanType);
    
        let loanAPayment = 0;
        let loanBPayment = 0;
        if (nonIndexed.loanA.length > 0)
            loanAPayment = nonIndexed.loanA.reduce((k, u) => { return k + u.estimatedTotalMonthlyPayment }, 0);
        if (nonIndexed.loanB.length > 0)
            loanBPayment = nonIndexed.loanB.reduce((k, u) => { return k + u.estimatedTotalMonthlyPayment }, 0);;
        
        return res.json({ realEstateValue, loanAmount, loanType, loanAPayment, loanBPayment });
    } catch (e) {
        console.error(e);
        return res.status(500).json({ error: 'unknown server error' }); 
    }
}

app.get('/payments', getMonthlyPayments);

app.listen(3000, () => {
    console.log('server running');
});

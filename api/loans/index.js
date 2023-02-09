import fetch from 'node-fetch';
import express from 'express';

const app = express();

async function getLoanPayments(realEstateValue, loanAmount) {
    const body = {
        userInfo: {
            showMinimum: false,
            firstTimeBuy:3,
            loanType: '3',
            NumberOfPurchasers: 1,
            BuyValue: 0,
            RealEstateValue: realEstateValue,
            DepositValue: 0,
            LoanAmount: loanAmount
        }
    };

    const result = await fetch("https://www.islandsbanki.is/publicapi/mortgage/proposal-refinance", {
        method: 'POST',
        body: JSON.stringify(body),
        headers: {
            "accept": "application/json, text/plain, */*",
            "accept-language": "en-US,en;q=0.5",
            "content-type": "application/json",
            "sec-fetch-dest": "empty",
            "sec-fetch-mode": "cors",
            "sec-fetch-site": "same-origin",
            "sec-gpc": "1",
            "x-dtpc": "31$388757932_411h26vDMRMHSHMGFGQCMTFGDHRAHVQHKVIMVPM-0e0",
            "cookie": "isb_purge_storage=true; rxVisitor=1640462877538K33UDQVSSQRCTVHRNAS04OA1CUQUIU8N; dtCookie=v_4_srv_31_sn_E42EB000487A3392C37337FB9685A31E_perc_100000_ol_0_mul_1_app-3A6e10bb1391ac948c_1_app-3Ae1ca0faea36f0219_1_app-3A6a55251b5a7bbb90_1; dtSa=-; isb_lang=is; CookieConsent={stamp:%27uUxD6FfAeFacPzAfaupim0VcFxknQr19zGICH5r9v2Z8kIqntCZc5Q==%27%2Cnecessary:true%2Cpreferences:true%2Cstatistics:true%2Cmarketing:true%2Cmethod:%27implied%27%2Cver:1%2Cutc:1675588604894%2Cregion:%27is%27}; dtLatC=1; rxvt=1675591389742|1675588598937; dtPC=31$388757932_411h26vDMRMHSHMGFGQCMTFGDHRAHVQHKVIMVPM-0e0",
            "Referer": "https://www.islandsbanki.is/is/reiknivel/husnaedislan/husnaedislanareiknivel",
            "Referrer-Policy": "same-origin"
          }
    });

    if (result.ok) {
        const json = await result.json();
        return json;
    }

    return null;
}

app.get('/payments', async (req, res) => {
    const {
        realEstateValue,
        loanAmount,
    } = req.query;

    const details = await getLoanPayments(realEstateValue, loanAmount);
    
    if (!details) {
        return res.json({loanAPayment: 0, loanBPayment: 0});
    }

    const { proposal } = details;
    
    const nonIndexed = proposal.find(x => x.indexType === 'nonIndexed');

	let loanAPayment = 0;
	let loanBPayment = 0;
	if (nonIndexed.loanA.length > 0 && nonIndexed.loanA[0])
        loanAPayment = nonIndexed.loanA[0].estimatedTotalMonthlyPayment;
	if (nonIndexed.loanB.length > 0 && nonIndexed.loanB[0])
        loanBPayment = nonIndexed.loanB[0].estimatedTotalMonthlyPayment;
    
    return res.json({loanAPayment, loanBPayment});
});

app.listen(3000, () => {
    console.log('server running');
});

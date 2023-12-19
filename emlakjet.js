// single with one link
import PW from 'playwright';
import retry from 'async-retry';
import dotenv from 'dotenv';

dotenv.config();

function sleep(time) {
    return new Promise(function (resolve) {
        setTimeout(resolve, time);
    });
}

// take a screenshot for the page
const takeScreenshot = async(page) =>{
    await page.screenshot({path:'page.png',fullPage:true})
}

async function main(){
    console.log("connecting to Scraping Browser.....");
    const browser = await PW.chromium.launch({
        headless: false,
    });
    console.log("connected! Navigating");
    const page = await browser.newPage();
    try{
        // goto: to go to the website you want to scrape
        await page.goto('https://www.emlakjet.com/ilan/remax-deluxe-basiskele-ekssioglu-villarrinda-52-satilik-villa-14217629/');
        // Wait for the element to be rendered on the page
        
        await page.waitForSelector('._2TxNQv',);
        await page.waitForSelector('._3r_drE',);

        // it give yu some time to take all the data form page (function)
        await sleep(10*1000)

        // the price 
        const price = await page.$eval('._2TxNQv', (element) => {
            return element.textContent.trim();
        });
        console.log('Price:', price);
        // The space
        const Room = await page.$$eval('._3r_drE', (elements) => {
            return elements[0] ? elements[0].textContent.trim() : 'N/A';
        });
        console.log('The Rooms:', Room);
        // The space
        const space = await page.$$eval('._3r_drE', (elements) => {
            return elements[1] ? elements[1].textContent.trim() : 'N/A';
        });
        console.log('The Space:', space);

        await takeScreenshot(page) 

    }catch(err){
        throw err;
    }finally{
        await browser.close();
    }
}

await retry(main,{
    retries: 3,
    onRetry:(err) =>{
        console.error('retrying ...',err);
    }
})
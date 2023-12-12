import PW from 'playwright';
import retry from 'async-retry';
import dotenv from 'dotenv';

dotenv.config();

const SBR_CDP = `wss://brd-customer-hl_4056ab80-zone-scraping_browser:stcb78n178qk@brd.superproxy.io:9222`;

const takeScreenshot = async(page) =>{
    await page.screenshot({path:'page.png',fullPage:true})
}

async function main(){
    console.log("connecting to Scraping Browser.....");
    const browser = await PW.chromium.connectOverCDP(SBR_CDP);
    console.log("connected! Navigating");
    const page = await browser.newPage();

    try{
        await page.goto('https://www.united.com/en/us',{ timeout:2 * 60 * 100 });
        console.log("Navigated! Scraping page content......");
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
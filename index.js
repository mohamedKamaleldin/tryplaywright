import PW from 'playwright';
import retry from 'async-retry';

const takeScreenshot = async(page) =>{
    await page.screenshot({path:'./img/page.png',fullPage:true})
}

async function main(){
    console.log("connecting to Scraping Browser.....");
    const browser = await PW.chromium.launch({
        headless: false,
    });
    console.log("connected! Navigating");
    const page = await browser.newPage();
    try{
        await page.goto('https://www.emlakjet.com/satilik-konut/istanbul/');  
        const urls = await page.$$eval('._3qUI9q > a', (elements) =>
            elements.map((el) => el.href)
        );
        let k=1;
        for(let i=0;i<urls.length;i++){
            console.log("=".repeat(15) + `the ${k++}st `);
            await page.waitForSelector('._3r_drE', { timeout: 60000, visible: true });
            await page.waitForSelector('._2TxNQv', { timeout: 60000, visible: true });
            await page.goto(urls[i])
            const price = await page.$eval('._2TxNQv', (element) => {
                return element.textContent.trim();
            });
            console.log('Price:', price);
            const Room = await page.$$eval('._3r_drE', (elements) => {
                return elements[0] ? elements[0].textContent.trim() : 'N/A';
            });
            console.log('The Rooms:', Room);
            const space = await page.$$eval('._3r_drE', (elements) => {
                return elements[1] ? elements[1].textContent.trim() : 'N/A';
            });
            console.log('The floor:', space);
        }
        

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
import PW from 'playwright';
import retry from 'async-retry';
import pkg from 'pg';
const { Client } = pkg;

async function insertDataIntoDatabase(url,price, room, floor) {
    const client = new Client({
        user: 'postgres',
        host: '192.168.2.129', 
        password: 'mkee',
        port: 5432, 
        database: 'DB1',
    });
    try {
        await client.connect();
        // check if the url already exists in the database
        const checkQuery = 'SELECT COUNT(*) FROM public."Real2" WHERE url = $1';
        const checkValues = [url];
        const result = await client.query(checkQuery, checkValues);
        if (result.rows[0].count > 0) {
            console.log('URL already exists in the database. Skipping insertion.');
            return;
        }
        // if i don't have the url in the database it will run this code 
        const query = 'INSERT INTO public."Real2" (url,price, floor, space) VALUES ($1, $2, $3,$4)';
        const values = [url,price, room, floor];
        await client.query(query, values);
        console.log('Data inserted into PostgreSQL');
    } catch (err) {
        console.error('Error inserting data into PostgreSQL:', err);
    } finally {
        await client.end();
    }
}

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
        await page.goto('https://www.emlakjet.com', { waitUntil: 'load', timeout: 90000 });
        await page.waitForSelector('input.fTNyyb');
        await page.type('input.fTNyyb', 'istanbul');
        await page.click('button[data-ej-label="button_ara"]');
        await page.waitForNavigation({ waitUntil: 'domcontentloaded' });

        const urls = await page.$$eval('._3qUI9q > a', (elements) =>
            elements.map((el) => el.href)
        );
        let k=1;
        for(let i=0;i<urls.length;i++){
            console.log("=".repeat(15) + `the ${k++}st `);
            await page.goto(urls[i], { waitUntil: 'domcontentloaded' }); 
            await page.waitForSelector('._3r_drE', { timeout: 60000, visible: true });
            await page.waitForSelector('._2TxNQv', { timeout: 60000, visible: true });
            await page.goto(urls[i])
            const URL=await urls[i];
            console.log(URL)
            const priceString  = await page.$eval('._2TxNQv', (element) => {
                return element.textContent.trim();
            });
            const price = parseInt(priceString.replace(/[^\d]/g, ''), 10);
            console.log(`Price:, ${price} TL`);
            const room = await page.$$eval('._3r_drE', (elements) => {
                return elements[0] ? elements[0].textContent.trim() : 'N/A';
            });
            console.log('The Room:', room);
            const floor = await page.$$eval('._3r_drE', (elements) => {
                return elements[1] ? elements[1].textContent.trim() : 'N/A';
            });
            console.log("it is build");
        
            await insertDataIntoDatabase(URL,price, room, floor);
            
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
    minTimeout: 1000, 
    maxTimeout: 30000,
    onRetry:(err) =>{
        console.error('retrying ...',err);
    }
})
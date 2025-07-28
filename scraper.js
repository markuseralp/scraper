require('dotenv').config();

const { Builder, Browser, By, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const notifier = require('node-notifier');
const path = require('path');
const nodemailer = require("nodemailer");

let currentRecentJob = 'System Integration Engineer （Hardware Verification Engineer /EE）'
const company = 'Enter Company Name'

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.SENDER,
        pass: process.env.PASS
    }
});


function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

(async function monitorJobs() {
  const options = new chrome.Options();
  options.addArguments('--headless');
  options.addArguments('--disable-logging');
  options.addArguments('--log-level=3');
  options.addArguments('--silent');

  const driver = await new Builder()
    .forBrowser(Browser.CHROME)
    .setChromeOptions(options)
    .build();
    

  try {
    current = (new Date().getHours())
    while (current > 8 && current < 17) {
    // while (current > 8 && current < 23) {

      
      await driver.get('www.example.com');

      try {
        const element = await driver.wait(
          until.elementLocated(By.xpath("//h3/a")),
          6000
        );
    
        const text = await element.getText();

        const location = await driver.wait(
          until.elementLocated(By.xpath("//dl/dd")),
          6500
        );

        const locText = await location.getText();
       
        if (text !== currentRecentJob) {
          notifier.notify({
            title: company + text ,
            message: locText,
          });

          let mailOptions = {
            from: process.env.SENDER,
            to: process.env.RECEIVER,
            subject: text,
            text: locText
        }

          transporter.sendMail(mailOptions, function(error, info){
            if (error) {
                console.log(error)
                console.log(`[${new Date().toLocaleTimeString()}] Error sending email`);

            }
            else {
                console.log(`[${new Date().toLocaleTimeString()}] An email has been sent!`);
            }
          });
          currentRecentJob = text
        }
        else {
            console.log(`[${new Date().toLocaleTimeString()}] No new jobs found`);
            
        }
      } catch (e) {
        console.warn('Element not found or page structure changed.');
      }

      await delay(15 * 60 * 1000);
    }
  } catch (err) {
    console.error('Fatal error:', err);
  } finally {
    await driver.quit();
  }
})();

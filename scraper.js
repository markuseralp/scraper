require('dotenv').config();

const { Builder, Browser, By, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const notifier = require('node-notifier');
const nodemailer = require("nodemailer");

let currentRecentJob = 'Software Engineer）' //** Update exactly to match most recent job to compare changes ** 

const company = 'Enter Company Name' //name to show up on emails and notifications 

const transporter = nodemailer.createTransport({ //optionally change service
    service: 'gmail',
    auth: {
        user: process.env.SENDER,
        pass: process.env.PASS
    }
});


function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms)); //function for periodically checking
}

(async function monitorJobs() {
  const options = new chrome.Options(); //options for decluttering terminal 
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
    while (current > 8 && current < 17) { // optionally adjust, currently set to alter betweeen 9am and 5pm
      
      await driver.get('www.example.com'); // ** Change to workday url **

      try {
        const element = await driver.wait(
          until.elementLocated(By.xpath("//h3/a")), //xpath of most recent job element
          6000
        );
    
        const text = await element.getText();

        const location = await driver.wait(
          until.elementLocated(By.xpath("//dl/dd")), //xpath of job title within most recent job element
          6500
        );

        const locText = await location.getText();
       
        if (text !== currentRecentJob) { //checks to see if it matches the previously returned most recent job
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

      await delay(15 * 60 * 1000); // 15 minute delay
    }
  } catch (err) {
    console.error('Fatal error:', err);
  } finally {
    await driver.quit();
  }
})();

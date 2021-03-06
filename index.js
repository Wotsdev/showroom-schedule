const request = require('unirest');
const cheerio = require('cheerio');
const members = require('./profile.json');
const Promise = require('bluebird');

const parser = (roomId) => {
   return request.get(`https://www.showroom-live.com/room/profile?room_id=${roomId}`).then(res => {
      const $ = cheerio.load(res.body);
      const img = $('p.room-profile-head-image img').attr('src');
      const showLink = $('ul.room-profile-head-action-menu li a').attr('href');
      let result = {};
      $('ul.room-profile-menu').find('li').each(function (i) {
         let schedule = $(this).find('p').text();
         const scheduleClass = $(this).find('p').attr('class');
         const liveNow = scheduleClass === 'is-active';

         if(liveNow) {
            schedule = schedule.replace('Live : ', '');
         } else {
            schedule = schedule.replace('Show : ', '');
         }
         const parseTime = schedule.split(" ");
         if (parseTime.length > 0 && parseTime[0] !== 'TBD') {
            result.liveNow = liveNow;
            result.image = img;
            result.schedule = parseTime.join(' ');
            result.showUrl = `https://www.showroom-live.com${showLink}`;
         }
      })
      return result;
   }).catch(() => false);
}

const main = async () => {
   return Promise.map(members, async (profile, index) => {
      try {
         if (index > 0) {
            console.log("delay 5s")
            await Promise.delay(2000);
         }
         const data = await parser(profile.room_id);
         console.log(profile.name, data);
      } catch (err) {
         console.error(err);
      }
   }, {concurrency: 1})
}

main().then(() => console.log("Completed!"));
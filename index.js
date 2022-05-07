require("dotenv").config();

const { Client } = require("@notionhq/client");
const notion = new Client({ auth: process.env.NOTION_API_KEY });
const databaseId = process.env.NOTION_API_DATABASE;
const myId = process.env.NOTION_MY_ID;

const createCommute = async (date, start, end, hasLunch) => {
  try {
    const response = await notion.pages.create({
      parent: {
        database_id: databaseId,
      },
      properties: {
        '사용일자': {
          type: 'date',
          date: {
            start: date,
          },
        },
        '소속부서' : {
          type: 'multi_select',
          multi_select : [
            { 
              name: '개발',
            },
          ]
        },
        '신청자': {
          type: 'people',
          people: [
            { 
              id: myId,
            }
          ]
        },
        '출근' : {
          type: 'multi_select',
          multi_select : [
            { 
              name: start,
            },
          ]
        },
        '퇴근' : {
          type: 'multi_select',
          multi_select : [
            { 
              name: end,
            },
          ]
        },
        '중식' : {
          type: 'select',
          select : {
            name: (hasLunch ? '포함': '미포함'),
          }
        },
        '관리자' : {
          type: 'people',
          people: [
            { 
              id: myId,
            }
          ]
        },
      },
    });
    console.log(response);
  } catch (error) {
    console.error(error)
  };
};

const formatDate = (date) => {
  var month = '' + (date.getMonth() + 1),
      day = '' + date.getDate(),
      year = date.getFullYear();

  if (month.length < 2) 
      month = '0' + month;
  if (day.length < 2) 
      day = '0' + day;

  return [year, month, day].join('-');
}

const getNextWeekDays = () => {
  const today = new Date();
  const nextMonday = new Date(today.setDate(today.getDate() + (today.getDay() === 0 ? 1 : 8 - today.getDay())));
  const nextWeekDays = [];
  for(let i = 0; i < 5; i++) {
    nextWeekDays.push(formatDate(new Date(nextMonday.setDate(nextMonday.getDate() + (i === 0 ? 0 : 1)))));
  }
  return nextWeekDays;
}

const createCommutesForAWeek = async (start, end, hasLunch) => {
  const nextWeekDays = getNextWeekDays();
  for await(date of nextWeekDays) {
    await createCommute(date, start, end, hasLunch)
  }
}

createCommutesForAWeek('9:00', '18:00', true);
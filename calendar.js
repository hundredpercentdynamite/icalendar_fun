const ics = require('ics');
const fs = require('fs');

const bellList = ['bell_1', 'bell_2', 'bell_3', 'bell_4', 'bell_5'];
const dayList = ['day_1', 'day_2', 'day_3', 'day_4', 'day_5', 'day_6'];
const mapDayToName = {
    'day_1': 'MO',
    'day_2': 'TU',
    'day_3': 'WE',
    'day_4': 'TH',
    'day_5': 'FR',
    'day_6': 'SA'
};
const rawJson = fs.readFileSync('./20.09.json');
const { schedule_header, schedule } = JSON.parse(rawJson);

const formatStartDate = (date, time) => {
    const startDate = date.split('.').reverse();
    startDate[0] = '20' + startDate[0];

    return startDate.concat(time.split(':')).map((item) => Number(item));
}
bellList.forEach((currBell) => {
    const bell = schedule[currBell];
    const start = bell.header.start_lesson;
    const end = bell.header.end_lesson;
    dayList.forEach((currDay) => {
        const date = schedule_header[currDay].date;
        const lessons = bell[currDay].lessons;
        if (lessons.length) {
            lessons.forEach((currLesson) => {
                const { subject_name, room_name, type, teachers } = currLesson;
                const startDate = formatStartDate(date, start);
                const event = {
                    start: startDate,
                    startOutputType:"local",
                    duration: { hours: 1, minutes: 35 },
                    title: subject_name + ' ' + room_name,
                    description: type + '\n' + teachers[0].name,
                    busyStatus: 'BUSY',
                    recurrenceRule: `FREQ=WEEKLY;BYDAY=${mapDayToName[currDay]};INTERVAL=2;UNTIL=20211231T210000Z`
                }
                ics.createEvent(event, (error, value) => {
                    fs.writeFileSync(`${__dirname}/lower/${subject_name}_${type}_${date}_${start}.ics`, value);
                });
            })
        }
    })
});

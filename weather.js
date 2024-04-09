const weather = require('weather-js')

weather.find({search: 'San Francisco, CA', degreeType: 'C'}, function(err, result) {
    if(err) console.log(err);
    // console.log(result);
    const temperature = result[0].current.temperature;
    const skyText = result[0].current.skytext;

    console.log(`Il fait ${temperature} °C à San Francisco.`)
    console.log(`Le temps est ${skyText}`)
});
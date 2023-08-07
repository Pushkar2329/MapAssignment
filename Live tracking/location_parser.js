// const { json } = require('express/lib/response')
const data1 = require('./location-699356735067914240-undefined.json')
//JSON.parse(data1)
for(let i=0; i< 2; i++) {
    for(let j = 0; j < data1[i]['multi_geo'].length; j++){
    console.log(data1[i]['multi_geo'][j]['geocode']['lat'])
    console.log(data1[i]['multi_geo'][j]['geocode']['lng'])
    console.log("///////////////")
        }
}
    

// script to register the service worker, create the database , store currencies and rates in the
// database
function openDatabase() {
    // If the browser doesn't support service worker, we don't care about having a database
    if (!navigator.serviceWorker) {
      return Promise.resolve();
    }
  
    return idb.open('kimconvert', 1, function(upgradeDb) {
      let store = upgradeDb.createObjectStore('currency', {keyPath: "id"});
      let store2 = upgradeDb.createObjectStore('rate', {keyPath: "id"});
    });
  }

  let dbPromise = openDatabase();

// sw registration
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js').then(function(reg) {
  
      if(reg.installing) {
        console.log('Service worker installing');
      } else if(reg.waiting) {
        console.log('Service worker installed');
      } else if(reg.active) {
        console.log('Service worker active');
      }
  
    }).catch(function(error) {
      // registration failed
      console.log('Registration failed with ' + error);
    });
  }
  

// get all currencies available
// first check db and then get from nextwork and store them in database

getCurrencies();
fetchCurrency();

function getCurrencies(){
        dbPromise.then(db => {
            let tx = db.transaction('currency', 'readwrite');
            let store = tx.objectStore('currency');
            return store.openCursor();
        }).then(function readCusrsor(cusr){
            if (!cusr){
                return;
            }
            select_orig_currency = document.getElementById('from_currency');
            select_to_currency = document.getElementById('to_currency');
            let id = cusr.value.id;
            let name = cusr.value.name;
    
            select_orig_currency.add(new Option(name, id));
            select_to_currency.add(new Option(name, id));
    
            cusr.continue().then(readCusrsor);
        })
    
}


function fetchCurrency(){   
    fetch('https://free.currencyconverterapi.com/api/v5/currencies')
    .then(response=> {
    return response.json();
    }).then(data =>{
        // if no data, get currencies from database
        if(!data){
            return;
        }
    //   console.log(data);
    //    const currencies = data.results;
    //   for( const currency in currencies){
    //      console.log(currency);
        
    //   }  

    // console.log(Object.entries(data.results));
    const currencyArray = Object.entries(data.results);
    let testmap = new Map();
    for(const currency of currencyArray){
    //   console.log(currency);
        let currencyName = currency[1].currencyName;
    // let currencySymbole = currency[1].currencySymboll
        let currencyId = currency[1].id;

        testmap.set(currency[1].id, currency[1].currencyName);
        
    // currencies.add(currencyId, currencyName);
        // console.log(currencyId);
        // console.log(currencyName);
        // console.log(testmap.size);     
    }
    return testmap;      
    })
    .then(currencyMap =>{
        select_orig_currency = document.getElementById('from_currency');
        select_to_currency = document.getElementById('to_currency');
        // console.log(currencyMap.size);
        for (const curr of currencyMap) {
            let[id, name] = curr;
        //    console.log(id);
        //    console.log(name);
        select_orig_currency.add(new Option(name, id));
        select_to_currency.add(new Option(name, id));      
        }
        // add this to the indexedBD the currency object store
        dbPromise.then(db => {
            let tx = db.transaction('currency', 'readwrite');
            let store = tx.objectStore('currency');
            for (const curr of currencyMap) {
                let[id, name] = curr;
                let obj = {id, name};
                store.put(obj);        
            }
        }) 
    })
    // .catch(err => {
    //     console.log("There was an error .", err);
    // })

}

// submit request
// https://free.currencyconverterapi.com/api/v5/convert?q=USD_PHP

function submitQuery(fromField, toField){
    urlQuery =  'https://free.currencyconverterapi.com/api/v5/convert?q='
    this.fromField = fromField;
    this.toField = toField;
    let tofromPart = fromField+'_'+toField;
    queryString = urlQuery + tofromPart;
    console.log(queryString);
    

    //   console.log(queryString);
    fetch(queryString)
    .then(response =>{
        return response.json();
    }).then(data => {
        // if no data, return
        if(!data){
            
            return;
        }
        // console.log(data);
        const qResults = Object.entries(data.results);
        //  console.log(qResults);
        // console.log(qResults[0][1].val);
        let rate = qResults[0][1].val;
        let id = qResults[0][1].id;
        let to = qResults[0][1].to;
        let fr = qResults[0][1].fr;
        // Store results in rate object
        dbPromise.then(db => {
            let tx = db.transaction('rate', 'readwrite');
            let store = tx.objectStore('rate');
            let obj = {id, rate, to, fr};
            store.put(obj);        
            
        }) 


        return rate;
        
    }).then(rate => {
        let amountField = document.getElementById('from_amount').value;
        let convertedValue = rate * amountField;
        document.getElementById('to_amount').value = convertedValue;
        

    }).catch(()=>{
        let rateDB = getRateFromDatabase(tofromPart);
        console.log(`${rateDB} is value from database`);
        
        if(rateDB === 0){
            document.getElementById('to_amount').value = "Need Internet";
            return;
        }
        let amountFieldDb = document.getElementById('from_amount').value;
        let convertedValueDb = rateDB * amountFieldDb;
        document.getElementById('to_amount').value = convertedValueDb;

    })
}

//code to handle  pressing the submit button
const form_element = document.getElementById('currency-form');
form_element.addEventListener('submit', event => {
  event.preventDefault();
  let fromField = document.getElementById('from_currency').value;
  let toField = document.getElementById('to_currency').value;
  console.log(`${fromField} and ${toField}`);
  

  submitQuery(fromField, toField);
   


});


function getRateFromDatabase(tofromPart) {
    this.tofromPart = tofromPart;
    let theRate = 0;
    dbPromise.then(db => {
        let tx = db.transaction('rate', 'readwrite');
        let store = tx.objectStore('rate');
        return store.get(tofromPart);
    }).then(obj => {
        if(!obj){
            console.log("Nothig got from db");
            
            return 0;
        }
        console.log(obj.rate);
        
        theRate =  obj.rate;
    })

    return theRate;
}


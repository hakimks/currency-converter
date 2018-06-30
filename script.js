

function openDatabase() {
    // If the browser doesn't support service worker, we don't care about having a database
    if (!navigator.serviceWorker) {
      return Promise.resolve();
    }
  
    return idb.open('kimconvert', 1, function(upgradeDb) {
      var store = upgradeDb.createObjectStore('currency', {keyPath: "id"});
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
fetch('https://free.currencyconverterapi.com/api/v5/currencies')
    .then(response=> {
       return response.json();
    }).then(data =>{
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
    .catch(err => {
        console.log("There was an error .", err);
    })

    
    // submit request
    // https://free.currencyconverterapi.com/api/v5/convert?q=USD_PHP
    // url = 
    // fetch()

const form_element = document.getElementById('currency-form');
form_element.addEventListener('submit', event => {
  event.preventDefault();
  let fromField = document.getElementById('from_currency').value;
  let toField = document.getElementById('to_currency').value;
//   let amountField = document.getElementById('from_amount').value;
   urlQuery =  'https://free.currencyconverterapi.com/api/v5/convert?q='
   queryString = urlQuery+fromField+'_'+toField;
 
//   console.log(queryString);
    fetch(queryString)
    .then(response =>{
        return response.json();
    }).then(data => {
        // console.log(data);
        const qResults = Object.entries(data.results);
        //  console.log(qResults);
        // console.log(qResults[0][1].val);
        let rate = qResults[0][1].val;
        return rate;
        
    }).then(rate => {
        let amountField = document.getElementById('from_amount').value;
        let convertedValue = rate * amountField;
        document.getElementById('to_amount').value = convertedValue;
    })
});

// Index Db transactions , add currency id and name 
// dbPromise.then((db) => {
//     const val = 'hey!'
//     const key = 'Hello again'
  
//     const tx = db.transaction('store1', 'readwrite')
//     tx.objectStore('store1').put(val, key)
//     return tx.complete
//   })
//   .then(() => {
//     console.log('Transaction complete')
//   })
//   .catch(() => {
//     console.log('Transaction failed')
//   })
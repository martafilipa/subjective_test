const n = 360;
const g = 45;        
const gc = 9;
const n_total = n + 72;
module.exports = {

    // get_order: function(){
    //     const n = 168;
    //     const n_total = n + 120; 
    //     const g = 21;
    //     var items   = Array.from({length: n}, (x, i) => i);
    //     var j = -1;
    //     var res = [];
    //     for(var i=0; i<n; i++){
    //         if(j==-1){
    //             x = randomInteger(0, items.length-1);
    //             res[i] = items[x];
    //             j = 0;
    //         }
    //         else{
    //             do{
    //                 x = randomInteger(0, items.length-1);
    //                 res[i] = items[x];
    //                 // console.log('Checking:');
    //                 // console.log(res[i], res[i-1]);
    //                 // console.log(res[i]%g, res[i-1]%g )z
    //             }while(Math.floor(res[i]/g) == Math.floor(res[i-1]/g));
    //         }
    //         items.splice(x, 1);
    //     }
    //     return res;
    // }

    get_order: function(){
        var items   = Array.from({length: n_total}, (x, i) => i);
        var last = [];
        var res = [];
        for(var i=0; i<n; i++){
            if(last.length == 0){
                x = randomInteger(0, items.length-1);
                res[i] = items[x];
                last.push(res[i]);
            }
            else{
                do{
                    x = randomInteger(0, items.length-1);
                    res[i] = items[x];
                }while(last.some(j => getIndex(res[i]).includes(j)));
            }
            items.splice(x, 1);
            last = getIndex(res[i]);
        }
        return res;
    }
}

function randomInteger(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getIndex(x) {
    var cross = {
        0: [0, 1],
        1: [1, 2], 
        2: [2, 3],
        3: [3, 4],
        4: [4, 5], 
        5: [5, 6], 
        6: [6, 7],
        7: [7, 0], 
      };
    if(x < n)
        return [Math.floor(x/g)];
    else
        return cross[Math.floor((x-n)/gc)];
}
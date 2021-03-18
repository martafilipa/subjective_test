const n = 360;
const g = 45;        
const gc = 9;
const n_cross = n + 72;
const gh = 3;
const n_total = n_cross + 24;
const max_it = 5000;

module.exports = {
    get_order: function(){

        var res = try_get_order();
        while(res.length==0){
            res = try_get_order()
        }
        return res;
    }
}
function try_get_order(){
    var items   = Array.from({length: n_total}, (_, i) => i);
    var last = [];
    var res = [];
    var k = 0;
    for(var i=0; i<n_total; i++){
        if(last.length == 0){
            x = randomInteger(0, items.length-1);
            res[i] = items[x];
            last.push(res[i]);
        }
        else{
            do{
                x = randomInteger(0, items.length-1);
                res[i] = items[x];
                k++;
            }while(last.some(j => getIndex(res[i]).includes(j)) && k < max_it);
        }
        if(k>max_it)
            return [];
        items.splice(x, 1);
        last = getIndex(res[i]);
    }
    return res;
}
function randomInteger(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getIndex(x){
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
    else if(x < n_cross)
        return cross[Math.floor((x-n)/gc)];
    else
        return [Math.floor((x-n_cross)/gh)]
}
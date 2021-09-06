const max_it = 5000;

module.exports = {
    get_order: function(pairs_ref){
        var res = try_get_order(pairs_ref);
        while(res.length==0){
            res = try_get_order(pairs_ref)
        }
        return res;
    } 
}

function try_get_order(pairs_ref){
    
    var items   = Array.from({length: pairs_ref.length}, (_, i) => i);
    var last = [];
    var res = [];
    var k = 0;

    for(var i=0; i<items.length; i++){
        if(i == 0){
            x = randomInteger(0, items.length-1);
            res[i] = items[x];        
        }
        else{
            do{
                x = randomInteger(0, items.length-1);
                res[i] = items[x];
                k++;
            }while((last.includes(pairs_ref[id=res[i]].ref_A) || last.includes(pairs_ref[id=res[i]].ref_B)) && k < max_it);
        }
        if(k>max_it)
            return [];
        items.splice(x, 1);
        lastObject = pairs_ref[id=res[i]];
        last = [];
        last.push(lastObject['ref_A']);
        last.push(lastObject['ref_B']);    
    }
    return res;
}
function randomInteger(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
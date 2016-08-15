'use strict';
var exports=module.exports={};

exports.doSomethingCrazy = function (r){  
    var response = 'Hello ' + r.name +". class " + r.class;    
    return response;
}


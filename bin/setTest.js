/**
 * Created by yuhwan on 2016. 1. 22..
 */

var testSet = new Set();
testSet.add('abc');

console.log(testSet.has('abc'));


testSet = new Set();

var obj1 = {1: 'abc'};
var obj2 = {1: 'abc'};
testSet.add(obj1);
testSet.add(obj2);
testSet.add(obj2);

var new_array = [];
testSet.forEach(function(value) {
  new_array.push(value);
});

console.log(new_array);

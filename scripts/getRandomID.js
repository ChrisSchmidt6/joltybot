`use strict`;

var alphabet = ["a","b","c","d","e","f","g","h","i","j","k","l","m","n","o","p","q","r","s","t","u","v","w","x","y","z"];
var numbers = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];

module.exports.fetch = amount => {
	var string = "";
	for(var i = 0; i < amount; i++){
		var rand = Math.random();
		if(rand > 0.5){
			string += alphabet[Math.floor(Math.random() * alphabet.length)];
		}else{
			string += numbers[Math.floor(Math.random() * numbers.length)];
		}
	}
	return string;
}


class Data{
	constructor(data){
		this.d=data;
		this.subscriptions=[];
	}

	//allow subscriptions to be ignored to avoid bouncing
	update(type,info,excludeSubs){
		if(excludeSubs){
			if(Array.isArray(excludeSubs)){
				for(let i=0;i<this.subscriptions.length;i++){
					if(this.subscriptions[i][0]==type){
						let found=false;
						for(let j=0;j<excludeSubs.length;j++){
							if(this.subscriptions[i][1]==excludeSubs[j]){
								found=true;
								break;
							}
						}
						if(!found){
							this.subscriptions[i][1](this,info);
						}
					}
				}
			}else{
				let excludeSub=excludeSubs;
				for(let i=0;i<this.subscriptions.length;i++){
					if(this.subscriptions[i][0]==type){
						if(this.subscriptions[i][1]!=excludeSub){
							this.subscriptions[i][1](this,info);
						}
					}
				}
			}
		}else{
			for(let i=0;i<this.subscriptions.length;i++){
				if(this.subscriptions[i][0]==type){
					this.subscriptions[i][1](this,info);
				}
			}
		}
	}
	unSub(type,sub){
		for(let i=0;i<this.subscriptions.length;i++){
			if(this.subscriptions[i][1]===sub && this.subscriptions[i][0]==type){
				this.subscriptions.splice(i,1);
			}
		}
	}
	unSubFull(sub){
		for(let i=0;i<this.subscriptions.length;i++){
			if(this.subscriptions[i][1]===sub){
				this.subscriptions.splice(i,1);
			}
		}
	}
	sub(type,sub){
		this.subscriptions.push([type,sub]);
	}
}

//creates a Data wrapper object
function D(data){
	return new Data(data);
}

//created an element
function newElm(tag,classes){
	let elm=document.createElement(tag);
	if(classes){
		let classSplit=classes.split(" ");
		for(let i=0;i<classSplit.length;i++){
			elm.classList.add(classSplit[i]);
		}
	}
	return elm;
}
function appElm(toAdd,target){
	target.appendChild(toAdd);
}
function addClass(classes,elm){
	let classSplit=classes.split(" ");
	for(let i=0;i<classSplit.length;i++){
		elm.classList.add(classSplit[i]);
	}
}
function getElm(selector,target){
	if(target!=null){
		return target.querySelector(selector);
	}
	return document.querySelector(selector);
}
function getElms(selector,target){
	if(target!=null){
		return target.querySelectorAll(selector);
	}
	return document.querySelectorAll(selector);
}



function isDecendant(child,parent){
	if (parent == child){
		return true;
	}
	let x=child;
	while (x = x.parentNode) {
	    if (x == parent){
	    	return true;
	 	}
	}
	return false;
}

/*
	█ █ ▀█▀ █ █   █ ▀█▀ █▄█
	█▄█  █  █ █▄▄ █  █   █
*/

function isDecendant(child,parent){
	if (parent == child){
		return true;
	}
	let x=child;
	while (x = x.parentNode) {
	    if (x == parent){
	    	return true;
	 	}
	}
	return false;
}

function cleanStr(str){
	return str.replace(" ","_");
}

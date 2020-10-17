class ScoreBoard extends HTMLElement{
	constructor(){
		super();
	}
	init(){

	}
	connectedCallback(){

  	}

  	update(){

  	}
}
customElements.define('io-scoreboard', ScoreBoard);

class SpawnDialog extends HTMLElement{
	constructor(){
		super();
	}
	init(){
		let stats=[
		new StatData("health",0),
		new StatData("regen",0),
		new StatData("speed",0),
		new StatData("size",0),
		new StatData("sight",0),
		new StatData("meleeDamage",0),
		new StatData("reload",0),
		new StatData("damage",0),
		//new StatData("range",0),
		new StatData("bulletSpeed",0),
		new StatData("bulletSize",0),
		new StatData("knockback",0),
		new StatData("kickback",0),
		new StatData("accuracy",0)
		];

		this.statHolder=new StatGroup(stats,400);

	}
	connectedCallback(){
		addClass("spawnDialog",this);
		this.innerHTML=`
			<div class="inner">
				<div class="head">
					<p>Username</p>
					<div class="username">
						<input type="text" maxlength="20">
						<button onclick="spawnIn()"><div class="right arrow"></div></button>
					</div>
				</div>
				<div class="body">
				</div>
			</div>
		`;
		let body=getElm(".body",this);

		this.username=getElm(".username input",this);

		this.wepSel=new WeaponSelect();
		this.wepSel.init();
		appElm(this.wepSel,body);

		this.statList=new StatSelList();
		this.statList.init(this.statHolder);
		appElm(this.statList,body);
  	}
  	getPlayer(settings){
  		let wepName=this.wepSel.getWeaponName();
  		let stats=this.statList.getStats();
  		stats.weapon=wepName;
  		let col=this.wepSel.getColor();
  		let player=new Player(this.username.value,col,stats,new Vector(),settings);
  		player.color=col;
  		return player;
  	}

}
customElements.define('io-spawn', SpawnDialog);

class StatDisp extends HTMLElement{
	constructor(){
		super();
	}
	init(){

	}
	connectedCallback(){

  	}

  	update(){

  	}
}
customElements.define('io-stat-disp', StatDisp);

class StatSelect extends HTMLElement{
	constructor(){
		super();
		this.statSub=()=>{this.update()};
		this.mDownFunc=(e)=>{this.mDown(e)};
		this.mUpFunc=()=>{this.mUp()};
		this.mMoveFunc=(e)=>{this.mMove(e)};
	}
	init(statD){
		this.stat=statD;
		statD.sub("general",this.statSub);
	}
	connectedCallback(){
		/*
		<div class="item">
			<p>Health <span class="fade">25%</span></p>
			<div class="bar"><div><div class="grabber"></div></div></div>
		</div>
		*/
		this.classList.add("item");
		this.addEventListener("mousedown",this.mDownFunc);
		let label=newElm("P");
		label.innerHTML=this.stat.d.name;
		let top=newElm("DIV","top");
		this.statIn=new StatInput();
		this.statIn.init(this.stat);
		appElm(label,top);
		appElm(this.statIn,top);
		appElm(top,this);
		this.bar=newElm("DIV","bar");
		this.barInner=newElm("DIV");
		appElm(this.barInner,this.bar);
		this.barInner.innerHTML=`
			<div class="grabber"></div>
		`;
		appElm(this.bar,this);
		this.update();
  	}

  	mDown(e){
		if(!isDecendant(e.target,this.statIn)){
  			this.mMove(e);
			document.addEventListener("mousemove",this.mMoveFunc);
			document.addEventListener("mouseup",this.mUpFunc);
		}
  	}
  	mUp(){
  		document.removeEventListener("mouseup",this.mUpFunc);
		document.removeEventListener("mousemove",this.mMoveFunc);
  	}

  	mMove(e){
  		let target=this.bar;
  		let elmPos=new Vector(target.offsetLeft,target.offsetTop);
  		let elmSize=new Vector(target.offsetWidth,target.offsetHeight);
  		let clickPos=new Vector(e.clientX,e.clientY);
  		clickPos.subVec(elmPos);
  		if(elmSize.x!=0){
  			let amount=Math.min(Math.max(clickPos.x/elmSize.x,0),1)*100;
  			this.setVal(amount);
  		}

  	}
  	update(){
  		this.barInner.style.width=this.stat.d.val+"%";
  	}
  	setVal(val){
  		this.stat.d.val=val;
  		this.stat.update("general");
  	}
}
customElements.define('io-stat-select', StatSelect);

class StatInput extends HTMLElement{
	constructor(){
		super();
		this.statSub=()=>{this.update()};
		this.deselectFunc=()=>{this.deselect()};
		this.keyFunc=(e)=>{this.keydown(e)};
		this.lastVal=0;
	}
	init(statD){
		this.stat=statD;
		statD.sub("general",this.statSub);
	}
	connectedCallback(){
		this.in=newElm("INPUT","fade smallInput");
		this.in.maxLength=3;
		this.in.addEventListener("blur", this.deselectFunc);
		this.in.addEventListener("keydown", this.keyFunc);
		appElm(this.in,this);
		this.update();
  	}
  	keydown(e){
  		if(e.key=="Enter"){
  			this.in.blur();
  		}
  		if(e.key=="Escape"){
  			this.in.value=this.lastVal;
  			this.in.blur();
  		}
  	}
  	deselect(){
  		let toSet=+this.in.value;
  		if(!isNaN(toSet)){
  			toSet=Math.min(Math.max(toSet,0),100);
  			this.setVal(toSet);
  		}else{
  			this.update();
  		}
  	}
  	update(){
  		let toSet=Math.ceil(this.stat.d.val);
  		this.in.value=toSet;
  		this.lastVal=toSet;
  	}
  	setVal(val){
  		this.stat.d.val=val;
  		this.stat.update("general");
  	}
}
customElements.define('io-stat-input', StatInput);



class StatSelList extends HTMLElement{
	constructor(){
		super();
	}
	init(statGroupD){
		this.statGroup=statGroupD;

	}
	connectedCallback(){
		this.classList.add("stats");
		let subTitle=newElm("P","subtitle");
		subTitle.innerHTML="Stats";
		//appElm(subTitle,this);
		let inner=newElm("DIV","scroll");
		appElm(inner,this);
		for(let i=0;i<this.statGroup.dataList.length;i++){
			let toAddElm=new StatSelect();
			toAddElm.init(this.statGroup.dataList[i]);
			appElm(toAddElm,inner);
		}
  	}
  	getStats(){
  		let stat=new Stats();
		for(let i=0;i<this.statGroup.dataList.length;i++){
			stat[this.statGroup.dataList[i].d.name]=this.statGroup.dataList[i].d.val;
		}
		return stat;
  	}
}
customElements.define('io-stat-sel-list', StatSelList);

class WeaponSelect extends HTMLElement{
	constructor(){
		super();
	}
	init(){
	}
	connectedCallback(){
		addClass("weaponSelector",this);
		this.innerHTML=`
			<div class="previewContainer" id="previewContainer"><canvas id="preview"></canvas</div>
		`;
		let inputDiv=newElm("DIV","inputs");
		this.selector=new DropDown();
		let gList=[];
		for(let i=0;i<gunList.length;i++){
			gList.push(gunList[i].name);
		}
		this.selector.init(D(gList));
		appElm(this.selector,inputDiv);
		this.color=new ColorSelect();
		this.color.init();
		appElm(this.color,inputDiv);
		appElm(inputDiv,this);
	}
	getWeaponName(){
		return this.selector.getValue();
	}
	getColor(){
		return this.color.getColor();
	}
}
customElements.define('io-weapon-sel', WeaponSelect);

class ColorSelect extends HTMLElement{
	constructor(){
		super();
		this.deselectFunc=(e)=>{this.deselect(e)};
	}
	init(){
		this.toggled=false;
		this.val="";
	}
	connectedCallback(){
		addClass("colorPicker",this);
		let pickerDiv=newElm("DIV","picker");
		appElm(pickerDiv,this);
		this.icon=newElm("DIV","colorIcon");
		appElm(this.icon,pickerDiv);
		this.controlDiv=newElm("DIV","control");
		appElm(this.controlDiv,pickerDiv);
		let text=newElm("P","text");
		text.innerHTML="HEX";
		appElm(text,this.controlDiv);
		this.input=newElm("INPUT");
		this.input.setAttribute("maxlength", "6");
		this.input.addEventListener("keydown",(e)=>{this.keyDown(e)});
		appElm(this.input,this.controlDiv);
		this.icon.addEventListener("click",()=>{this.toggle()});
		this.toggle(this.toggled);
		this.validate();
	}
	keyDown(e){
		if (e.keyCode === 13) {
			e.preventDefault();
			this.validate();
			this.input.blur();
		}
	}
	toggle(toSet){
		if(toSet!=null){
			this.toggled=toSet;	
		}else{
			this.toggled=!this.toggled;
		}
		if(this.toggled){
			document.addEventListener("mousedown",this.deselectFunc);
			this.controlDiv.style.width="142px";
			this.controlDiv.style.marginLeft="10px";
		}else{
			this.validate();
			document.removeEventListener("mousedown",this.deselectFunc);
			this.controlDiv.style.width="0";
			this.controlDiv.style.marginLeft="0";
		}
	}
  	deselect(e){
		if(e){
			if(!isDecendant(e.target,this)){
				this.toggle(false);
			}
		}else{
			this.toggle(false);
		}
	}
	validate(){
		this.val=this.input.value;
		if(!isHex("#"+this.val)){
			this.val="0087E8";
		}
		this.val=this.val.toUpperCase();
		this.icon.style.backgroundColor="#"+this.val;
		this.input.value=this.val;
	}
	getColor(){
		return this.val;
	}
}
customElements.define('io-color-select', ColorSelect);

class DropDown extends HTMLElement{
	constructor(){
		super();
		this.scrollFunc=(e)=>{this.scroll(e)};
		this.deselectFunc=(e)=>{this.deselect(e)};
	}
	init(listD){
		this.list=listD;
		this.index=0;
		this.itemHeight=40;
		this.scrollTime=0;
		this.toggled=false;
	}
	connectedCallback(){
		addClass("dropDown",this);
		this.style.overflow="hidden";
		let selElm=newElm("DIV","selection");
		let listElm=newElm("DIV","list");
		this.listElm=listElm;
		appElm(listElm,selElm);
		appElm(selElm,this);
		for(let i=0;i<this.list.d.length;i++){
			let item=newElm("DIV","item");
			item.innerHTML=this.list.d[i];
			item.addEventListener("click",()=>{this.setIndex(i)});
			appElm(item,listElm);
		}

		this.arrowDown=newElm("DIV","arrow down");
		appElm(this.arrowDown,this);
		this.arrowUp=newElm("DIV","arrow up");
		appElm(this.arrowUp,this);
		this.over=newElm("DIV","over");
		appElm(this.over,this);
		this.alignIndex();
		this.addEventListener("wheel",this.scrollFunc);
  	}
  	toggle(toSet){
  		this.toggled=toSet;
  		if(this.toggled){
			this.style.overflow="";
			document.addEventListener("mousedown",this.deselectFunc);
			this.arrowUp.style.display="none";
			this.arrowDown.style.display="none";
  		}else{
			this.style.overflow="hidden";
			document.removeEventListener("mousedown",this.deselectFunc);
			this.arrowUp.style.display="";
			this.arrowDown.style.display="";
  		}
  	}
  	deselect(e){
		if(e){
			if(!isDecendant(e.target,this)||!e.target.classList.contains("item")){
				this.toggle(false);
			}
		}else{
			this.toggle(false);
		}
	}
  	alignIndex(){
  		let scrollPos=(2-this.index)*this.itemHeight;
  		this.listElm.style.top=scrollPos+"px";
  	}
  	scroll(e){
  		//limit scroll speed
		let d = new Date();
		let time=d.getTime();
		if(time-this.scrollTime<30){
			return;
		}
		this.scrollTime=time;

  		let amount=Math.sign(e.deltaY);
  		this.setIndex(this.index+amount);
  	}
  	setIndex(toSet){
  		this.index=Math.min(Math.max(toSet,0),this.list.d.length-1);
		this.alignIndex();
		this.toggle(true);
  	}

	getValue(){
		return this.list.d[this.index];
	}
}
customElements.define("io-dropdown",DropDown);


function toggleSummary(toggle){
	if(toggle){
		document.getElementById("controlContainer").style.display="block";
	}else{
		document.getElementById("controlContainer").style.display="none";
	}
	updateSize();
}


let seed=new SpawnDialog();
seed.init();
appElm(seed,document.body);
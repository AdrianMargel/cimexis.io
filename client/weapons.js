class Gun{
	constructor(){
		this.name="gun";
	}
	clone(){
		return new Gun();
	}
}

class Sniper extends Gun{
	constructor(){
		super();
		this.name="sniper";
	}
	clone(){
		return new Sniper();
	}
}

class ShotGun extends Gun{
	constructor(){
		super();
		this.name="shot gun";
	}
	clone(){
		return new ShotGun();
	}
}

class MiniGun extends Gun{
	constructor(){
		super();
		this.name="mini gun";
	}
	clone(){
		return new MiniGun();
	}
}

class Cannon extends Gun{
	constructor(){
		super();
		this.name="cannon";
	}
	clone(){
		return new Cannon();
	}
}

class Stealth extends Gun{
	constructor(){
		super();
		this.name="stealth";
		this.stored=0;
	}
	clone(){
		return new Stealth();
	}
}

class Charger extends Gun{
	constructor(){
		super();
		this.name="charger";
		this.stored=0;
	}
	clone(){
		return new Charger();
	}
}

class MineLayer extends Gun{
	constructor(){
		super();
		this.name="mine layer";
	}
	clone(){
		return new MineLayer();
	}
}

class Puncher extends Gun{
	constructor(){
		super();
		this.name="puncher";
	}
	clone(){
		return new Puncher();
	}
}

class Thruster extends Gun{
	constructor(){
		super();
		this.name="thruster";
	}
	clone(){
		return new Thruster();
	}
}

class SplitShot extends Gun{
	constructor(){
		super();
		this.name="split shot";
	}
	clone(){
		return new SplitShot();
	}
}

class Spinner extends Gun{
	constructor(){
		super();
		this.name="spinner";
		this.rot1=Math.PI/3;
		this.rot2=0;
	}
	clone(){
		return new Spinner();
	}
}

class Claw extends Gun{
	constructor(){
		super();
		this.name="claw";
		this.rot=0;
	}
	clone(){
		return new Claw();
	}
}

class Wall extends Gun{
	constructor(){
		super();
		this.name="wall";
		this.rot=0;
	}
	clone(){
		return new Wall();
	}
}
class Healer extends Gun{
	constructor(){
		super();
		this.name="healer";
	}
	clone(){
		return new Healer();
	}
}
class Unarmed extends Gun{
	constructor(){
		super();
		this.name="unarmed";
		this.timeUp=0;
		this.time=0;
		this.surrenderSpeed=1;
		this.surrenderSize=1;
	}
	clone(){
		return new Unarmed();
	}
}

var gunList=[
	new Gun(), //default gun is at index 0
	new Sniper(),
	new ShotGun(),
	new MiniGun(),
	new Cannon(),
	new Stealth(),
	new Charger(),
	new MineLayer(),
	new Puncher(),
	new Thruster(),
	new SplitShot(),
	new Spinner(),
	new Claw(),
	new Wall(),
	new Healer(),
	new Unarmed()
];
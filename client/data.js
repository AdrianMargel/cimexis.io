class StatGroup{
	constructor(dataList,max){
		this.maxTotal=max;
		this.dataList=dataList;
		this.dataSub=(e)=>{this.update(e)};
		for(let i=0;i<this.dataList.length;i++){
			this.dataList[i]=D(this.dataList[i]);
			this.dataList[i].sub("general",this.dataSub);
		}
	}
	update(exclude){
		let total=0;
		for(let i=0;i<this.dataList.length;i++){
			if(exclude!=null&&this.dataList[i]!=exclude){
				total+=this.dataList[i].d.val;
			}
		}
		let scaling=(this.maxTotal-exclude.d.val)/total;
		if(scaling<1){
			for(let i=0;i<this.dataList.length;i++){
				if(exclude!=null&&this.dataList[i]!=exclude){
					this.dataList[i].d.val*=scaling;
					this.dataList[i].update("general",this.dataList[i],this.dataSub);
				}
			}
		}
	}
}
class StatData{
	constructor(name,val){
		this.name=name;
		this.val=val;
	}
}
function playerUpdateBlob(target){
    let transparent=!target.visible||target.ghostTime>0? 1 : 0;
    return [
        target.uid,
        target.pos.x,target.pos.y,
        target.velo.x,target.velo.y,
        target.rot,
        target.health,
        transparent
    ];
}
function playerBaselineBlob(target){
    return [
        target.uid,
        target.username,
        target.healthMax,
		target.colorDark,
		target.colorLight,
        target.size,
        target.sight,
        target.weapon.name
    ];
}

function weaponUpdateBlob(target,owner){
    let data=[owner.uid];
    if(target.rot!=null){
        data.push(target.rot);
    }
    if(target.rot1!=null){
        data.push(target.rot1);
    }
    if(target.rot2!=null){
        data.push(target.rot2);
    }
    if(target.stored!=null){
        data.push(target.stored);
    }
    if(target.timeUp!=null){
        data.push(target.timeUp);
    }
    if(target.time!=null){
        data.push(target.time);
    }
    if(data.length>1){
        return data;
    }
    return null;
}

function bulletBlob(target){
    return [
        target.uid,
        target.shooterUid,
        target.name,
        target.pos.x,target.pos.y,
        target.velo.x,target.velo.y,
        target.ang,
        target.size,
    ];
}

function stateUpdateBlob(target){
    //bullet count | player count | weapon count | bullets... | players... | weapons...
    let bCount=target.bulletsList.length;
    let bs=[];
    for(let i=0;i<bCount;i++){
        let data=bulletBlob(target.bulletsList[i]);
        bs.push(data);
    }
    let pCount=target.playersList.length;
    let ps=[];
    let ws=[];
    for(let i=0;i<pCount;i++){
        let data=playerUpdateBlob(target.playersList[i]);
        ps.push(data);
        let wData=weaponUpdateBlob(target.playersList[i].weapon,target.playersList[i]);
        if(wData!=null){
            ws.push(wData);
        }
    }
    let wCount=ws.length;
    let blobArr=[bCount,pCount,wCount];
    blobArr=blobArr.concat(bs,ps,ws);
    return blobArr;
}
function stateBaselineBlob(target){
    //players...
    let pCount=target.playersList.length;
    let ps=[];
    for(let i=0;i<pCount;i++){
        let data=playerBaselineBlob(target.playersList[i]);
        ps.push(data);
    }
    return ps;
}

module.exports = function() { 
	this.stateUpdateBlob=stateUpdateBlob;
	this.stateBaselineBlob=stateBaselineBlob;
}

  
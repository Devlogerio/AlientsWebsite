// Made by Cena Abachi Known as Devlogerio, find me on Youtube, instagram and Github: Devlogeiro LinkedIn: Cena Abachi

var express = require('express');
var app = express();
var serv = require('http').Server(app);

app.get('/',function(req, res) {
	res.sendFile(__dirname + '/client/index.html');
});
app.use('/client',express.static(__dirname + '/client'));

serv.listen(process.env.PORT || 2000);
console.log("Server started.");

var SOCKET_LIST = {};
var mapsHeight = 4800;
var mapsWidth = 5000;
var globalMaxHp = 10;
var GlobalbulletDamage = 1;
var GlobalbulletSpd = 20;
var bulletRatePersentage = 10;
var globalBulletTimeOut = 100;
var defaultMaxSpd = 10;
var hpReg = 0.25;
var reverseWorldTimeOut = 30;
var sizeOfOponent = 50;
var playerName;
var ufoImageGetter;
var globalBulletNumber = 20;
var globalBulletNumberRate = 1;
var usernameLengh = 15;
var globalStarterLevelUp = 0;
var levelUpOnScore = 2;
var Entity = function(param){
	var self = {
		x:Math.random() * mapsWidth,
		y:Math.random() * mapsWidth,
		spdX:0,
		spdY:0,
		id:"",
		map:'layer12',
	}
	if(param){
		if(param.x)
			self.x = param.x;
		if(param.y)
			self.y = param.y;
		if(param.map)
			self.map = param.map;
		if(param.id)
			self.id = param.id;		
	}
	
	self.update = function(){
		self.updatePosition();
	}
	self.updatePosition = function(){
		self.x += self.spdX;
		self.y += self.spdY;
	}
	self.getDistance = function(pt){
		return Math.sqrt(Math.pow(self.x-pt.x,2) + Math.pow(self.y-pt.y,2));
	}
	return self;
}

var Player = function(param){
	var self = Entity(param);
	self.number = "" + Math.floor(10 * Math.random());
	self.pressingRight = false;
	self.bulletRate = 0;
	self.pressingLeft = false;
	self.pressingUp = false;
	self.pressingDown = false;
	self.pressingAttack = false;
	self.mouseAngle = 0;
	self.dShKLevel = bulletRatePersentage;
	self.vinchesterLevel = 0;
	self.bulletSpd = GlobalbulletSpd;
	self.bulletDamage = GlobalbulletDamage;
	self.innerDefaultMaxSpd = defaultMaxSpd;
	self.maxSpd = self.innerDefaultMaxSpd;
	self.hp = globalMaxHp;
	self.hpMax = globalMaxHp;
	self.afterUpdateHp = globalMaxHp;
	self.score = 0;
	self.name = playerName;
	self.ufoImage = ufoImageGetter;
	self.islevelUp = globalStarterLevelUp;
	self.bulletTimeOut = globalBulletTimeOut;
	self.bulletNumber = globalBulletNumber;
	self.bulletNumberMax = globalBulletNumber;
	self.afterUpdatebulletNumber = globalBulletNumber;
	var super_update = self.update;
	self.update = function(){
		self.updateSpd();
		
		super_update();
		
		if(self.pressingAttack && self.bulletNumber >= 1)
		{
			self.maxSpd = self.innerDefaultMaxSpd/2;
				self.bulletRate++;
				if(self.bulletRate % self.dShKLevel == 0 || self.bulletRate == 1 && self.bulletNumber >= 1)
				{
				if(self.vinchesterLevel === 1)
				{
				 	for(var i = -1 ; i < 1 ; i++)
					{
						self.shootBullet(i * 15 + self.mouseAngle);
					}
				}
				else if(self.vinchesterLevel === 2)
				{
					for(var i = -1 ; i < 2 ; i++)
					{
						self.shootBullet(i * 15 + self.mouseAngle);
					}
				}
				else if(self.vinchesterLevel === 3)
				{
					for(var i = -2 ; i < 2 ; i++)
					{
						self.shootBullet(i * 15 + self.mouseAngle);
					}
				}
				else if(self.vinchesterLevel === 4)
				{
					for(var i = -2 ; i < 3 ; i++)
					{
						self.shootBullet(i * 15 + self.mouseAngle);
					}
				}
				else if(self.vinchesterLevel === 5)
				{
					for(var i = -3 ; i < 3 ; i++)
					{
						self.shootBullet(i * 10 + self.mouseAngle);
					}
				}
				else
				{
				self.shootBullet(self.mouseAngle);
				
			}
			if(self.bulletNumber > 0)
			self.bulletNumber --;
			}
		}
		else if(self.pressingAttack == false)
		{
			self.maxSpd = self.innerDefaultMaxSpd;
			self.bulletRate = 0;
		}
	}
	self.shootBullet = function(angle){
		Bullet({
			parent:self.id,
			angle:angle,
			x:self.x,
			y:self.y,
			map:self.map,
		});
	}
	
	self.updateSpd = function(){
		if(self.pressingRight && self.x <= mapsWidth)
			self.spdX = self.maxSpd;
		else if(self.pressingLeft && self.x >= mapsWidth - mapsWidth)
			self.spdX = -self.maxSpd;
		else
			self.spdX = 0;
		
		if(self.pressingUp && self.y >= mapsHeight - mapsHeight)
			self.spdY = -self.maxSpd;
		else if(self.pressingDown && self.y <= mapsHeight)
			self.spdY = self.maxSpd;
		else
			self.spdY = 0;		
	}
	
	self.getInitPack = function(){
		return {
			id:self.id,
			x:self.x,
			y:self.y,	
			number:self.number,	
			hp:self.hp,
			hpMax:self.hpMax,
			score:self.score,
			map:self.map,
			pName:self.name,
			pImage:self.ufoImage,
			bulletNumber:self.bulletNumber,
		};		
	}
	self.getUpdatePack = function(){
		return {
			id:self.id,
			x:self.x,
			y:self.y,
			hp:self.hp,
			score:self.score,
			bulletNumber:self.bulletNumber,
			map:self.map,
		}	
	}
	
	Player.list[self.id] = self;
	
	initPack.player.push(self.getInitPack());
	return self;
}
Player.list = {};
Player.onConnect = function(socket){
	var map = 'layer11';
	if(Math.random() < 0.5)
		map = 'layer12';
	var player = Player({
		id:socket.id,
		map:map,
	});
	socket.on('keyPress',function(data){
		if(data.inputId === 'left')
			player.pressingLeft = data.state;
		else if(data.inputId === 'right')
			player.pressingRight = data.state;
		else if(data.inputId === 'up')
			player.pressingUp = data.state;
		else if(data.inputId === 'down')
			player.pressingDown = data.state;
		else if(data.inputId === 'attack')
			player.pressingAttack = data.state;
		else if(data.inputId === 'mouseAngle')
			player.mouseAngle = data.state;
	});
	
	
	socket.on('upgradeMe',function(data){
		if(player.islevelUp >= 1)
		{
		if(data.upgradeItem === 'hp' && player.hp <= 22.5)
		{
			player.afterUpdateHp = globalMaxHp + 2.5;
			player.hp += 2.5;
			socket.emit('updateSucceed',{whatsUpdated:'hp'});
		}
		else if(data.upgradeItem === 'damage' && player.bulletDamage < 4)
		{
			player.bulletDamage += 0.6;
			socket.emit('updateSucceed',{whatsUpdated:'damage'});
		}
		else if(data.upgradeItem === 'speed' && player.innerDefaultMaxSpd < 15)
		{
			player.innerDefaultMaxSpd += 1;
			socket.emit('updateSucceed',{whatsUpdated:'speed'});
		}
		else if(data.upgradeItem === 'bulletSpeed' && player.bulletSpd < 25)
		{
			player.bulletSpd += 1;
			player.bulletTimeOut -= 3;
			socket.emit('updateSucceed',{whatsUpdated:'bulletSpeed'});
		}
		else if(data.upgradeItem === 'dShK' && player.dShKLevel > 5)
		{
			player.dShKLevel -= 1;
			player.afterUpdatebulletNumber = globalBulletNumber + 4;
			player.bulletNumber += 4;
			socket.emit('updateSucceed',{whatsUpdated:'dShK'});
		}
		else if(data.upgradeItem === 'vinchester' && player.vinchesterLevel < 5)
		{
			player.vinchesterLevel += 1;
			socket.emit('updateSucceed',{whatsUpdated:'vinchester'});
		}
		player.islevelUp -= 1;
		}
	});
	setInterval(function(){
		if(player.hp <= player.afterUpdateHp)
			player.hp += hpReg;
	},1000);
	setInterval(function(){
		if(player.bulletNumber < player.afterUpdatebulletNumber)
			player.bulletNumber += globalBulletNumberRate;
	},1000);
	
	
	
	
	
	var reverseWorld = reverseWorldTimeOut;
	setInterval(function(){
		if(reverseWorld < reverseWorldTimeOut)
		reverseWorld++;
	},1000);
	socket.on('changeMap',function(data){
		if(reverseWorld == 30)
		{
			if(player.map === 'layer11')
			{
				player.map = 'layer12';
				reverseWorld = 0;
			}
			else
			{
				player.map = 'layer11';
				reverseWorld = 0;
			}
		}
	});
	
	socket.emit('init',{
		selfId:socket.id,
		player:Player.getAllInitPack(),
		bullet:Bullet.getAllInitPack(),
	})
}
Player.getAllInitPack = function(){
	var players = [];
	for(var i in Player.list)
		players.push(Player.list[i].getInitPack());
	return players;
}

Player.onDisconnect = function(socket){
	delete Player.list[socket.id];
	removePack.player.push(socket.id);
}
Player.update = function(){
	var pack = [];
	for(var i in Player.list){
		var player = Player.list[i];
		player.update();
		pack.push(player.getUpdatePack());		
	}
	return pack;
}
var Bullet = function(param){
	var self = Entity(param);
	self.id = Math.random();
	self.angle = param.angle;
	self.parent = param.parent;
	self.spdX = Math.cos(param.angle/180*Math.PI) * Player.list[self.parent].bulletSpd;
	self.spdY = Math.sin(param.angle/180*Math.PI) * Player.list[self.parent].bulletSpd;
	var bT =Player.list[self.parent].bulletTimeOut;
	self.timer = 0;
	self.toRemove = false;
	var super_update = self.update;
	self.update = function(){
		if(self.timer++ > bT)
			self.toRemove = true;
		super_update();
		
		for(var i in Player.list){
			var p = Player.list[i];
			if(self.map === p.map && self.getDistance(p) < sizeOfOponent && self.parent !== p.id){
				p.hp -= Player.list[self.parent].bulletDamage;
				if(p.hp <= 0){
					var shooter = Player.list[self.parent];
					if(shooter)
						shooter.score += 1;
					if(shooter.score % levelUpOnScore == 0)
					{
						shooter.islevelUp += 1;
					}
					p.hp = p.hpMax;
					p.x = Math.random() * mapsWidth;
					p.y = Math.random() * mapsHeight;		
					p.islevelUp = Math.round(p.islevelUp/2);
					p.hp = globalMaxHp;
					p.bulletDamage = GlobalbulletDamage;
					p.innerDefaultMaxSpd = defaultMaxSpd;
					p.bulletSpd = GlobalbulletSpd;
					p.dShKLevel = bulletRatePersentage;
					p.vinchesterLevel = 0;
					afterUpdateHp = globalMaxHp;
					p.bulletTimeOut = globalBulletTimeOut;
					p.score = Math.round(p.score/2);
					p.bulletNumber = globalBulletNumber;
				}
				self.toRemove = true;
			}
		}
	}
	self.getInitPack = function(){
		return {
			id:self.id,
			x:self.x,
			y:self.y,
			map:self.map,
		};
	}
	self.getUpdatePack = function(){
		return {
			id:self.id,
			x:self.x,
			y:self.y,
			score:self.score,
		};
	}
	
	Bullet.list[self.id] = self;
	initPack.bullet.push(self.getInitPack());
	return self;
	
}
Bullet.list = {};

Bullet.update = function(){
	var pack = [];
	for(var i in Bullet.list){
		var bullet = Bullet.list[i];
		bullet.update();
		if(bullet.toRemove){
			delete Bullet.list[i];
			removePack.bullet.push(bullet.id);
		} else
			pack.push(bullet.getUpdatePack());		
	}
	return pack;
}

Bullet.getAllInitPack = function(){
	var bullets = [];
	for(var i in Bullet.list)
		bullets.push(Bullet.list[i].getInitPack());
	return bullets;
}

var DEBUG = false;


var io = require('socket.io')(serv,{});
io.sockets.on('connection', function(socket){
	socket.id = Math.random();
	SOCKET_LIST[socket.id] = socket;
	socket.on('signIn',function(data){
				if(data.username.length <= usernameLengh && data.username != 'daesh' && data.username != 'DAESH' && data.username != 'Daesh')
				{
				socket.playerName = data.username;
				ufoImageGetter = data.pImage;
				playerName = data.username;
				Player.onConnect(socket);
				socket.emit('signInResponse',{success:true});
				}
	});	
	
	socket.on('disconnect',function(){
		delete SOCKET_LIST[socket.id];
		Player.onDisconnect(socket);
	});
	socket.on('sendMsgToServer',function(data){
		//.slice(2,7)
		playerName = ("" + socket.playerName);
		for(var i in SOCKET_LIST){
			SOCKET_LIST[i].emit('addToChat',playerName + ': ' + data);
		}
	});
	
	socket.on('evalServer',function(data){
		if(!DEBUG)
			return;
		var res = eval(data);
		socket.emit('evalAnswer',res);		
	});
});

var initPack = {player:[],bullet:[]};
var removePack = {player:[],bullet:[]};


setInterval(function(){
	var pack = {
		player:Player.update(),
		bullet:Bullet.update(),
	}
	
	for(var i in SOCKET_LIST){
		var socket = SOCKET_LIST[i];
		socket.emit('init',initPack);
		socket.emit('update',pack);
		socket.emit('remove',removePack);
		//for(var i < 10 in Player.list){
		//	SOCKET_LIST[i].emit('topTen',{playerName:Player.list[i].name,playerScore:Player.list[i].score});
		//}
	}
	initPack.player = [];
	initPack.bullet = [];
	removePack.player = [];
	removePack.bullet = [];
	
},1000/40);

/*
var profiler = require('v8-profiler');
var fs = require('fs');
var startProfiling = function(duration){
	profiler.startProfiling('1', true);
	setTimeout(function(){
		var profile1 = profiler.stopProfiling('1');
		
		profile1.export(function(error, result) {
			fs.writeFile('./profile.cpuprofile', result);
			profile1.delete();
			console.log("Profile saved.");
		});
	},duration);	
}
startProfiling(10000);
*/








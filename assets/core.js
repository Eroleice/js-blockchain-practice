var
typeList = ['GNTCO-23','LEIGX-84','IXNGL-92'],
fullData = [],
inputData = [],
chain = [],
bc,
done = 0;

function genData() {
	var k = Math.floor(Math.random()*3);
	var type = typeList[k];
	var amount = Math.floor((Math.random()*10)+1);
	var receipt = Math.random().toString(36).substr(2);
	
	document.getElementById("input-type").value = type;
	document.getElementById("input-amount").value = amount;
	document.getElementById("input-receipt").value = receipt;
}

function genFake() {
	var i = Math.floor(Math.random()*fullData.length);
	var k = Math.floor(Math.random()*3);
	var type = typeList[k];
	var amount = Math.floor((Math.random()*10)+1);
	var receipt = Math.random().toString(36).substr(2);
	
	document.getElementById("fake-order").value = i;
	document.getElementById("fake-type").value = type;
	document.getElementById("fake-amount").value = amount;
	document.getElementById("fake-receipt").value = receipt;
}

function insertData() {
	var type = document.getElementById("input-type").value;
	var amount = document.getElementById("input-amount").value;
	var receipt = document.getElementById("input-receipt").value;
	var d = getTime();
	
	// 添加到右侧表格中
	var str = '<div class="tr"><div class="td" style="flex-grow: 2;"><span>'+receipt+'</span></div><div class="td" style="justify-content: center;"><span>'+type+'</span></div><div class="td" style="justify-content: center;"><span>'+amount+'</span></div><div class="td" style="justify-content: center;"><span>'+d+'</span></div><div class="td" style="justify-content: center;"><span class="data-status"><a style="color:red;">未录入</a></span></div></div>';
	document.getElementById("data-table").innerHTML = document.getElementById("data-table").innerHTML + str;
	
	// 添加到区块链准备区
	var obj = {
		'receipt':receipt,
		'type':type,
		'amount':amount,
		'time':d
	};
	inputData.push(obj);
	
	// 总数据备份
	fullData.push(obj);
}

function getTime() {
	var currentdate = new Date();
	return currentdate.getFullYear() + "-"
				+ (currentdate.getMonth()+1)  + "-" 
                + currentdate.getDate() + " @ "  
                + currentdate.getHours() + ":"  
                + currentdate.getMinutes() + ":" 
                + currentdate.getSeconds();
}

function fakeData() {
	var k = document.getElementById("fake-order").value;
	var type = document.getElementById("fake-type").value;
	var amount = document.getElementById("fake-amount").value;
	var receipt = document.getElementById("fake-receipt").value;
	var d = getTime();
				
	var c = document.getElementsByClassName("tr"); 
	c[k].innerHTML = '<div class="td" style="flex-grow: 2;"><span>'+receipt+'</span></div><div class="td" style="justify-content: center;"><span>'+type+'</span></div><div class="td" style="justify-content: center;"><span>'+amount+'</span></div><div class="td" style="justify-content: center;"><span>'+d+'</span></div><div class="td" style="justify-content: center;"><span><a style="color:orange;">虚假内容</a></span></div>';
	
	bc.chain[1].data =  {
                    "receipt": receipt,
                    "type": type,
                    "amount": amount,
                    "time": d
                };
}

class Block {
    constructor(timestamp, data, previousHash = '') {
        this.previousHash = previousHash;
        this.timestamp = timestamp;
        this.data = data;
        this.hash = this.calculateHash();
        this.nonce = 0;
    }

    calculateHash() {
        return sha256(this.index + this.previousHash + this.timestamp + JSON.stringify(this.data) + this.nonce);
    }

    mineBlock(difficulty) {
        while (this.hash.substring(0, difficulty) !== Array(difficulty + 1).join("0")) {
            this.nonce++;
            this.hash = this.calculateHash();
        }

        console.log("BLOCK MINED: " + this.hash);
    }
}

class Blockchain{
    constructor() {
        this.chain = [this.createGenesisBlock()];
        this.difficulty = 4;
    }

    createGenesisBlock() {
        return new Block("2018-1-1 @ 0:0:0", "This is little small start... by Eroleice", "0");
    }

    getLatestBlock() {
        return this.chain[this.chain.length - 1];
    }

    addBlock(newBlock) {
        newBlock.previousHash = this.getLatestBlock().hash;
        newBlock.mineBlock(this.difficulty);
        this.chain.push(newBlock);
    }

    isChainValid() {
        for (let i = 1; i < this.chain.length; i++){
            const currentBlock = this.chain[i];
            const previousBlock = this.chain[i - 1];

            if (currentBlock.hash !== currentBlock.calculateHash()) {
                return false;
            }

            if (currentBlock.previousHash !== previousBlock.hash) {
                return false;
            }
        }

        return true;
    }
}

function buildBlock() {
	var temData = inputData;
	done = fullData.length;
	inputData = [];
	var t = getTime();
	bc.addBlock(new Block(t, temData));
	var c = document.getElementsByClassName("data-status"); 
	for (i=0;i<done;i++) {
		c[i].innerHTML = '<a style="color:green;">已记录</a>';
	}
	document.getElementById("chain-json").value = JSON.stringify(bc, null, 4);
}

bc = new Blockchain();
document.getElementById("chain-json").value = JSON.stringify(bc, null, 4);

function start() {	
	loop = setInterval(buildBlock, 60000);
}

function check() {
	if (bc.isChainValid()) {
		alert('所有记录有效！');
	} else {
		alert('检测到异常记录！');
	}
}

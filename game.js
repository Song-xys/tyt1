
cc.Class({
    extends: cc.Component,

    properties: {
       nodeReady:cc.Node,//声明准备界面
       nodePlay:cc.Node,//声明玩的界面
       nodePHB:cc.Node,//声明排行榜界面
       nodeOver:cc.Node,//声明游戏结束界面
       itemParent:cc.Node,
       pre_item:cc.Prefab,//预制排行榜信息和方块
       pre_block:cc.Prefab,
       hero:cc.Node,//声明人物
       hero_2:cc.Node,
       lab_score:cc.Label,//声明分数
       lab_currScoreOver:cc.Label,//声明玩后的分数
       lab_bestScoreOver:cc.Label,//声明历史最高分
    },
    
    onLoad () {//最初的界面显示的内容
        window.game = this
        this.nodeReady.active = true//开始界面显示
        this.nodePlay.active = false//玩的界面不显示
        this.nodePHB.active = false//排行榜的界面不显示
        this.nodeOver.active = false//结束游戏后的界面不显示
        this.nodeOver.zIndex = 9//index优先级设置，那个的数值大，哪个就显示在上面
        this.nodePHB.zIndex = 10
        this.setInfor()
        this.setTouch()
        this.gameType = 0//0:Ready  1:play 2:over
        this.blockPool = new cc.NodePool()//对象池
        this.hero.active = false//刚开始不显示任务

        // 开启碰撞检测系统，未开启时无法检测
        cc.director.getCollisionManager().enabled = true;
    },

    addScore:function(num){//分数增加
        this.currScore += num//屏幕显示分
        this.lab_score.string = this.currScore//游戏结束时的分数
    },

    createBlock: function (pos_dian,blockType,isFirst) {
        let block = null;
        if (this.blockPool.size() > 0) { // 通过 size 接口判断对象池中是否有空闲的对象
            block = this.blockPool.get();
        } else { // 如果没有空闲对象，也就是对象池中备用对象不够时，我们就用 cc.instantiate 重新创建
            block = cc.instantiate(this.pre_block);//instantiate 复制预置资源0
        }
        block.parent = this.node; // 将生成的敌人加入节点树
        block.zIndex = 1

        block.getComponent('block').init(pos_dian,0,isFirst)
    },

    onBlockKilled: function (block) {
        // block应该是一个 cc.Node
        this.blockPool.put(block); // 和初始化时的方法一样，将节点放进对象池，这个方法会同时调用节点的 removeFromParent
    },

    pdDir:function(){//根据单位向量添加块
        var arr_pos = []//定义一个放方块的数组
        var children = this.node.children
        for (let i = children.length-1; i >= 0; i--) {
            var js = children[i].getComponent('block')
            if(js){
                arr_pos.push(js.pos_dianWorld)
            }
        }

        var pos_1 = arr_pos[0].sub(arr_pos[1]).normalize()
        var f_random = 290 + Math.random() * 160
        if(Math.random()*10 < 5){
            pos_1.x = pos_1.x *-1
        }
        
        var pos_end = cc.v2(arr_pos[0].x+pos_1.x*f_random,arr_pos[0].y+pos_1.y*f_random)//根据向量求最新生成的方块的位置
        var numRandom = Math.floor(Math.random()*4)
        this.createBlock(pos_end,numRandom,3)
    },

    moveDir:function(){//所有块的移动距离，就是屏幕的移动
        var arr_pos = []
        var children = this.node.children
        for (let i = children.length-1; i >= 0; i--) {
            var js = children[i].getComponent('block')
            if(js){
                arr_pos.push(js.pos_dianWorld)
            }
        }
        var pos_cha = cc.v2((arr_pos[0].x-arr_pos[1].x)/2,(arr_pos[0].y-arr_pos[1].y)/2)
        var pos_move = cc.v2(0-(arr_pos[1].x+pos_cha.x),-150-(arr_pos[1].y+pos_cha.y))

        for (let i = children.length-1; i >= 0; i--) {
            var js = children[i].getComponent('block')
            if(js){
                js.canTouch = false
                var act_1 = cc.moveBy(0.5,cc.v2(pos_move.x,pos_move.y))
                var act_2 = cc.callFunc(function(){
                    children[i].getComponent('block').setDianPos()
                },this)
                var end = cc.sequence(act_1,act_2)
                children[i].runAction(end)
            }
        }

        var act_1 = cc.moveBy(0.5,cc.v2(pos_move.x,pos_move.y))
        this.hero.runAction(act_1)

        cc.log(children.length)
    },

    canTouch:function(){//在所有动作完成后才能再次进行下次动作
        var children = this.node.children
        for (let i = children.length-1; i >= 0; i--) {
            var js = children[i].getComponent('block')
            if(js){
                if(js.canTouch == false){
                    return false
                }
            }
        }
        return true
    },

    cleanBlock:function(){//移除不在屏幕内的方块，避免资源浪费
        var children = this.node.children
        for (let i = children.length-1; i >= 0; i--) {
            var js = children[i].getComponent('block')
            if(js){
                if(js.pos_dianWorld.y < -900){
                    this.onBlockKilled(children[i])
                }
            }
        }
    },

    setTouch:function(){//鼠标事件
        this.node.on('touchstart', function (event) {
            if(this.gameType != 1) return
            if(this.canTouch() == false) return
            if(this.hero.getComponent('hero').canTouch == false) return
            this.isTouchStart = true
            this.isGetScore = -1

            this.hero.rotation = 0//旋转角度
            this.hero_2.active = false
            this.isTouchBegin = true
            this.timeTouch = 0
            cc.log('touchstart')
        }, this)
        this.node.on('touchmove', function (event) {
            if(this.gameType != 1) return
            cc.log('touchmove')
        }, this)
        this.node.on('touchend', function (event) {
            if(this.isTouchStart == false) return
            if(this.gameType != 1) return
            if(this.canTouch() == false) return
            if(this.hero.getComponent('hero').canTouch == false) return
            this.isTouchStart = false
            this.isTouchBegin = false
            
            var pos_blockEnd = cc.v2(0,0)
            var numnum = 0
            var children = this.node.children
            for (let i = children.length-1; i >= 0; i--) {
                var js = children[i].getComponent('block')
                if(js){
                    numnum++
                    if(numnum == 2){
                        js.touchEnd()
                    }else if(numnum == 1){
                        pos_blockEnd = js.pos_dianWorld
                    }
                }
            }

            var pos_hero = this.hero.getPosition()
            var pos_1 = pos_blockEnd.sub(pos_hero).normalize()
            var timeDir = this.timeTouch*8
            var pos_end = cc.v2(pos_hero.x+pos_1.x*timeDir,pos_hero.y+pos_1.y*timeDir+this.hero.height/2)

            var act_0 = cc.callFunc(function(){
                this.hero.getComponent('hero').canTouch = false
                this.hero.anchorY = 0.5
                this.hero.y = this.hero.y + this.hero.height / 2
            }.bind(this))
            var act_1 = cc.jumpTo(0.4,pos_end,200,1)
            var act_2 = cc.rotateBy(0.4,360)
            var act_3 = cc.rotateBy(0.4,-360)
            var act_4 = cc.callFunc(function(){
                this.hero.anchorY = 0
                this.hero.y = this.hero.y - this.hero.height / 2
                this.hero_2.active = true
                this.scheduleOnce(function(){
                    if(this.isGetScore == -1){
                        this.hero_2.active = false
                        cc.log('踩空死亡')
                        this.gameType = 2
                        

                        var children = this.node.children
                        var arr_num = []
                        for (let i = children.length-1; i >= 0; i--) {
                            var js = children[i].getComponent('block')
                            if(js){
                                arr_num.push(i)
                            }                            
                        }

                        var pos_end_1 = children[arr_num[0]].getComponent('block').pos_dianWorld
                        var pos_end_2 = children[arr_num[1]].getComponent('block').pos_dianWorld
                        var pos_hero = this.hero.getPosition()

                        if(pos_hero.x > pos_end_1.x && pos_hero.x > pos_end_2.x){
                            children[arr_num[0]].zIndex = 3
                        }else if(pos_hero.x < pos_end_1.x && pos_hero.x < pos_end_2.x){
                            children[arr_num[0]].zIndex = 3
                        }else{
                            children[arr_num[1]].zIndex = 3
                        }


                        var act_001 = cc.moveBy(0.5,cc.v2(0,-75))
                        var act_002 = cc.callFunc(function(){
                            this.gameOver()
                        }.bind(this))
                        this.hero.runAction(cc.sequence(act_001,act_002))
                    }else if(this.isGetScore == 0){
                        cc.log('滑到死亡')
                        
                    }
                    this.pdCreateBlock()
                    this.hero.getComponent('hero').canTouch = true
                },0.2)
            }.bind(this))
            if(pos_1.x > 0){
                var act_5 = cc.spawn(act_1,act_2)
                var end = cc.sequence(act_0,act_5,act_4)
                this.hero.runAction(end)
            }else{
                var act_6 = cc.spawn(act_1,act_3)
                var end = cc.sequence(act_0,act_6,act_4)
                this.hero.runAction(end)
            }
            
            cc.log('touchend')
        }, this)
    },

    gameOver:function(){//游戏结束界面
        this.lab_currScoreOver.string = this.currScore//分数显示
        var bestScore = cc.sys.localStorage.getItem('bestScore')
        if(bestScore == null){
            bestScore = this.currScore
            cc.sys.localStorage.setItem('bestScore',bestScore)
        }else{
            if(bestScore < this.currScore){
                bestScore = this.currScore
                cc.sys.localStorage.setItem('bestScore',bestScore)
            }
        }
        this.lab_bestScoreOver.string = '历史最高分：' + bestScore
        this.nodeOver.active = true
    },

    pdCreateBlock:function(){//判断在人物发生动作后要不要生成新方块
        var children = this.node.children
        for (let i = children.length-1; i >= 0; i--) {
            var js = children[i].getComponent('block')
            if(js){
                if(js.isPZ){
                    this.cleanBlock()
                    this.pdDir()
                }
                return
            }
        }
    },
    
    compare:function(property){//分数比较
        return function(a,b){
            var value1 = a[property];
            var value2 = b[property];
            return value2 - value1;
        }
    },

    addItem:function(num){//添加排行榜信息
        this.itemParent.removeAllChildren()
        for (let i = 0; i < this.arr_infor.length; i++) {
            if(this.arr_infor[i].name == '我'){
                var bestScore = cc.sys.localStorage.getItem('bestScore')
                if(bestScore == null){
                    bestScore = 0
                    cc.sys.localStorage.setItem('bestScore',bestScore)
                }else{
                    bestScore = cc.sys.localStorage.getItem('bestScore')
                }
                this.arr_infor[i].score = bestScore
            }
        }
        this.arr_infor.sort(this.compare('score'))
        cc.log(this.arr_infor)
        var item = cc.instantiate(this.pre_item)
        var itemH = item.height
        this.itemParent.height = itemH * num
        for (let i = 0; i < num; i++) {
            var item = cc.instantiate(this.pre_item)
            item.parent = this.itemParent
            var js = item.getComponent('item')
            if(js){
                var name = this.arr_infor[i].name
                var score = this.arr_infor[i].score
                var touxing = this.arr_infor[i].touXiang
                js.init(i+1,name,score,touxing)
            }
            item.y = -48 - i * itemH
        }
    },

    clickBtn:function(sender,str){//点击按钮方法
        if(str == 'play'){
            cc.log('点击了开始按钮')
            this.currScore = 0
            this.lab_score.string = this.currScore
            this.gameType = 1
            this.nodePlay.active = true
            this.nodeReady.active = false
            this.hero.active = true
            this.hero.zIndex = 2
            this.setHeroAct(cc.v2(-140,-140))//点击开始按钮后生成人物的位置
            this.createBlock(cc.v2(-140,-140),0,1)//点击开始按钮后初始时有两个方块
            this.createBlock(cc.v2(110,32),1,2)

            
        }else if(str == 'phb'){
            cc.log('点击了排行榜按钮')
            this.addItem(10)//添加10个数据
            this.nodePHB.active = true//排行榜显示
        }else if(str == 'closePhb'){
            cc.log('点击了排行榜关闭按钮')
            this.nodePHB.active = false//排行榜关闭
        }else if(str == 'btnRePlay'){//再玩一次
            this.cleanAllblock()//移除上局的所有方块
            this.nodeOver.active = false//结束界面关闭
            this.currScore = 0//游戏界面初始分数为0
            this.lab_score.string = this.currScore//结束界面的分数等于游戏界面的分数
            this.gameType = 1//点击重玩按钮后，再次显示游戏界面
            this.hero.zIndex = 2//优先级设置
            this.hero.rotation = 0//英雄旋转角度
            this.setHeroAct(cc.v2(-140,-140))
            this.createBlock(cc.v2(-140,-140),0,1)//再次创建两个方块
            this.createBlock(cc.v2(110,32),1,2)
        }else if(str == 'btnphbOver'){//游戏结束界面的排行榜按钮
            this.addItem(10)
            this.nodePHB.active = true
        }
       
    },

    setHeroAct:function(pos){//第一次创建hero的动作时设置落地小动作
        this.hero.setPosition(cc.v2(pos.x,pos.y+200))//设置人物的位置高出y轴200，做出跳出的动作
        var act_0 = cc.callFunc(function(){
            this.hero.getComponent('hero').canTouch = false//刚开始不能点击
        }.bind(this))
        var act_1 = cc.moveTo(0.2,cc.v2(pos.x,pos.y-10))//动作定义
        var act_2 = cc.moveTo(0.08,cc.v2(pos.x,pos.y+50))
        var act_3 = cc.moveTo(0.07,cc.v2(pos.x,pos.y-5))
        var act_4 = cc.moveTo(0.06,cc.v2(pos.x,pos.y+10))
        var act_5 = cc.moveTo(0.03,cc.v2(pos.x,pos.y))
        var act_6 = cc.callFunc(function(){//动作回调，等动作都做完了才能再次点击
            this.hero.getComponent('hero').canTouch = true
        }.bind(this))
        var end = cc.sequence(act_0,act_1,act_2,act_3,act_4,act_5,act_6)//依次执行动作
        this.hero.runAction(end)//运行动作
    },

    cleanAllblock:function(){//游戏结束后移除上局的所有方块重新开始
        var children = this.node.children
        for (let i = children.length-1; i >= 0; i--) {
            var js = children[i].getComponent('block')
            if(js){
                this.onBlockKilled(children[i])
            }
        }
    },

    update (dt) {
        if(this.isTouchBegin){
            this.timeTouch++
            if(this.timeTouch >= 400){
                this.timeTouch = 400
            }
            var numnum = 0
            var children = this.node.children
            for (let i = children.length-1; i >= 0; i--) {
                var js = children[i].getComponent('block')
                if(js){
                    numnum++
                    if(numnum == 2){
                        js.touchBegin(dt)
                    }
                }
            }
        }
    },

    setInfor:function(){//添加排行榜数据
        this.arr_infor = [
            {name:'马守义',touXiang:0,score:1003},
            {name:'郭新友',touXiang:1,score:1002},
            {name:'徐沄嵩',touXiang:2,score:1001},
            {name:'万帅',touXiang:3,score:Math.round(Math.random() * 1000)},
            {name:'王正旭',touXiang:4,score:Math.round(Math.random() * 1000)},
            {name:'路飞',touXiang:5,score:Math.round(Math.random() * 1000)},
            {name:'索隆',touXiang:6,score:Math.round(Math.random() * 1000)},
            {name:'娜美',touXiang:7,score:Math.round(Math.random() * 1000)},
            {name:'布鲁斯',touXiang:8,score:Math.round(Math.random() * 1000)},
            {name:'汉库克',touXiang:9,score:Math.round(Math.random() * 1000)},
        ]
    },
});

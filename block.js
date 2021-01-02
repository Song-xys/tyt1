
cc.Class({
    extends: cc.Component,

    properties: {

    },

    onLoad () {
        this.canTouch = true
        this.arrChildren = this.node.children
    },

    init:function(pos_dian,blockType,isFirst){
        this.score = 0
        this.isPZ = false
        this.canTouch = false
        this.blockType = blockType
        this.pos_dianParent = this.arrChildren[blockType].getChildByName('dian').getPosition()
        var pos_node = cc.v2(pos_dian.x-this.pos_dianParent.x,pos_dian.y-this.pos_dianParent.y)
        this.node.setPosition(cc.v2(pos_node.x,pos_node.y+100))
        var act_1 = cc.moveTo(0.2,cc.v2(pos_node.x,pos_node.y-10))
        var act_2 = cc.moveTo(0.05,cc.v2(pos_node.x,pos_node.y+10))
        var act_3 = cc.moveTo(0.05,cc.v2(pos_node.x,pos_node.y-3))
        var act_4 = cc.moveTo(0.03,cc.v2(pos_node.x,pos_node.y))
        var act_5 = cc.callFunc(function(){
            game.moveDir()
        },this)
        var act_end = cc.sequence(act_1,act_2,act_3,act_4,act_5)
        if(isFirst < 3){
            this.canTouch = true
            this.node.setPosition(pos_node)
            if(isFirst == 1){
                this.score = 1
            }
        }else{
            this.node.runAction(act_end)
        }
        this.pos_dianWorld = pos_dian
        this.setBlock()
    },

    setBlock:function(){
        var children = this.node.children
        for (let i = 0; i < children.length; i++) {
            if(i ==  this.blockType){
                children[i].active = true
            }else{
                children[i].active = false
            }
        }
    },

    setDianPos:function(){
        this.canTouch = true
        var pos_node = this.node.getPosition()
        this.pos_dianWorld = cc.v2(pos_node.x+this.pos_dianParent.x,pos_node.y+this.pos_dianParent.y)
    },

    touchBegin:function(dt){//蓄力中
        this.node.scaleY = this.node.scaleY - dt/6
        if(this.node.scaleY <= 0.8){
            this.node.scaleY = 0.8
        }
        game.hero.scaleY = this.node.scaleY
        game.hero.scaleX = game.hero.scaleX + dt/10
        if(game.hero.scaleX >= 1.2){
            game.hero.scaleX = 1.2
        }

        if(this.node.scaleY > 0.8){
            game.hero.y =  game.hero.y - dt/8 * this.arrChildren[this.blockType].getChildByName('block').height
        }
    },

    touchEnd:function(){
        game.hero.scaleX = 1
        game.hero.scaleY = 1
        var scale_Y = 1 - this.node.scaleY
        var act_1 = cc.scaleTo(scale_Y/5,1+scale_Y/2)
        var act_2 = cc.scaleTo(scale_Y/8,1-scale_Y/5)
        var act_3 = cc.scaleTo(scale_Y/10,1)
        var end = cc.sequence(act_1,act_2,act_3)
        this.node.runAction(end)
    },

    update (dt) {

    },
});

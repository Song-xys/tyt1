
cc.Class({
    extends: cc.Component,

    properties: {
        lab_num:cc.Label,
        lab_name:cc.Label,
        lab_score:cc.Label,
        sp_touxinag:cc.Sprite,
        spf_bg:cc.SpriteFrame,
        spa_touXiang:cc.SpriteAtlas,
    },

    onLoad () {
        
    },

    init:function(num,name,score,touxing){
        this.lab_num.string = num
        this.lab_name.string = name
        this.lab_score.string = score
        if(num % 2 == 0){//排行榜背景颜色改变
            this.node.getComponent(cc.Sprite).spriteFrame = this.spf_bg
        }
        this.sp_touxinag.spriteFrame = this.spa_touXiang.getSpriteFrame('tou_'+touxing)
    },

    update (dt) {

    },
});

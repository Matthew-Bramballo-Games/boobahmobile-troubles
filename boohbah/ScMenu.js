class ScMenu extends Phaser.Scene   {
    constructor()   {
        super("menuGame")
    }

    MenuStartGame()    {
        sceneIndex.scene.start("playGame")
    }

    MenuStartCredits()    {
        sceneIndex.scene.start("playGame")
    }

    create()    {
        this.funnymouth = this.sound.add("funnymouth")
        new TextButton(this, 32, 490, "this button plays a funny\nsound i made with my mouth", {}, () => {
            this.funnymouth.play();
            unlockMedal("PLAY THE FUNNY MOUTH SOUND")
        }).setOrigin(0, 1)
        new TextButton(this, 32, 370, "Play Matthew Bramballo", {}, () => {
            this.scene.start("playGame");
            this.musicIndex.stop();
            this.musicIndex.destroy();
        })

        this.add.image(480, 270, "menuBackground").setDepth(-20)
        this.musicIndex = this.sound.add("Music1");
        this.musicIndex.setLoop(true);
        this.musicIndex.play();
    }

    update()    {
        
    }
}
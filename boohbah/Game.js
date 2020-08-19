window.onload = function () {
    var gameConfig = {
        width: 960,
        height: 540,
        backgroundColor: 0x000000,
        scene:  [
            ScInit, ScMenu, ScGame
        ]
    }
    var gameInstance = new Phaser.Game(gameConfig);
}
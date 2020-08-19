ngio = new Newgrounds.io.core("50702:gmnLtrH2", "wHyk2fY1PqXos1+Pn1qJ6g==");

function onLoggedIn() {
    console.log("Welcome " + ngio.user.name + "!");
}

function onLoginFailed() {
    console.log("There was a problem logging in: " . ngio.login_error.message );
}

function onLoginCancelled() {
    console.log("The user cancelled the login.");
}

/*
 * Before we do anything, we need to get a valid Passport session.  If the player
 * has previously logged in and selected 'remember me', we may have a valid session
 * already saved locally.
 */
function initSession() {
    ngio.getValidSession(function() {
        if (ngio.user) {
            /* 
             * If we have a saved session, and it has not expired, 
             * we will also have a user object we can access.
             * We can go ahead and run our onLoggedIn handler here.
             */
            onLoggedIn();
            console.log("you worked")
        } else {
            /*
             * If we didn't have a saved session, or it has expired
             * we should have been given a new one at this point.
             * This is where you would draw a 'sign in' button and
             * have it execute the following requestLogin function.
             */
            console.log("you didnt")
        }

    });
}

/* vars to record any medals and scoreboards that get loaded */
var medals, scoreboards;

/* handle loaded medals */
function onMedalsLoaded(result) {
    if (result.success) medals = result.medals;
}

/* handle loaded scores */
function onScoreboardsLoaded(result) {
    if (result.success) scoreboards = result.scoreboards;
}

/* load our medals and scoreboards from the server */
ngio.queueComponent("Medal.getList", {}, onMedalsLoaded);
ngio.queueComponent("ScoreBoard.getBoards", {}, onScoreboardsLoaded);
ngio.executeQueue();

/* You could use this function to draw the medal notification on-screen */
function onMedalUnlocked(medal) {
    console.log('MEDAL GET:', medal.name);
}

function unlockMedal(medal_name) {

    /* If there is no user attached to our ngio object, it means the user isn't logged in and we can't unlock anything */
    if (!ngio.user) return;

    var medal;

    for (var i = 0; i < medals.length; i++) {

        medal = medal[i];

        /* look for a matching medal name */
        if (medal.name == medal_name) {

            /* we can skip unlocking a medal that's already been earned */
            if (!medal.unlocked) {

                /* unlock the medal from the server */
                ngio.callComponent('Medal.unlock', {id:medal.id}, function(result) {

                    if (result.success) onMedalUnlocked(result.medal);

                });
            }

            return;
        }
    }
}

preloadTextObject = null;
preloadTextStrings = [
    "MATTHEW BRAMBALLO is LOADING...\n",
    "MATTHEW BRAMBALLO is FINISHED.\n\nCLICK TO CONTINUE."
]
testButton = null;
class TextButton extends Phaser.GameObjects.Text  {
    constructor(scene, x, y, text, style, callback)   {
        super(scene, x, y, text, style, callback);
        scene.add.existing(this)

        this.redTween = 200;
        this.tweenAmount = 0;
        this.startX = x;
        this.startY = y;
    
        this.setInteractive({useHandCursor: true});
        this.setStyle({
            fontFamily: "WarioWareIncV2",
            fontSize: "32px",
            color: rgbToHex(128, 128, 128),
            strokeThickness: 2,
            stroke: "#000000"
        })
        .on("pointerover", () => this.buttonStateHover())
        .on("pointerout", () => this.buttonStateRest())
        .on("pointerdown", () => this.buttonStateActive())
        .on("pointerup", () => {
            this.buttonStateHover();
            callback();
        })
        
        this.setStyle({ fontSize: "32px"})
    }

    preUpdate()    {
        this.tweenAmount += 0.1;
        switch(this.buttonState)    {
            case "Hover":
                this.x = this.startX + Math.sin(this.tweenAmount);
                this.y = this.startY;
                this.buttonSetColour(rgbToHex(180, 200, 220))
                break;
            case "Rest":
                this.x = this.startX;
                this.y = this.startY;
                this.buttonSetColour(rgbToHex(128, 128, 128))
                break;
            case "Active":
                this.buttonSetColour(rgbToHex(255, 255, 255))
                this.x = this.startX;
                this.y = this.startY;
                break;
        }
    }

    buttonSetColour(colour) {
        this.setStyle({color: colour})
    }

    buttonStateHover()  {
        this.buttonState = "Hover";
    }

    buttonStateRest()   {
        this.buttonState = "Rest";
    }

    buttonStateActive() {
        this.buttonState = "Active";
    }
}

class ScInit extends Phaser.Scene   {
    constructor()   {
        super("initGame")
    }

    preload()   {
        this.tweenAmount = 0;

        let preloadTextStringsAdd = "0%";
        preloadTextObject = this.add.text(480, 270, preloadTextStrings[0] + preloadTextStringsAdd, {
            fontSize: '24px',
            align: "center",
            fontFamily: "WarioWareIncV2"
        }).setOrigin(0.5, 2)

        // Music Loading
        this.load.audio("Music1", ["Assets/Audio/Music1.mp3", "Assets/Audio/Music1.ogg"])
        this.load.audio("Music2", ["Assets/Audio/Music2.mp3", "Assets/Audio/Music2.ogg"])
        this.load.audio("Music3", ["Assets/Audio/Music3.mp3", "Assets/Audio/Music3.ogg"])
        this.load.audio("funnymouth", ["Assets/Audio/funnymouth.mp3", "Assets/Audio/funnymouth.ogg"])
        
        // Art Loading
        this.load.image("menuBackground", "Assets/Graphics/Background.png")

        // Video Loading
        this.load.video("videoGame", "Assets/Video/videoGame.mp4")

        // Loading Progress
        var progressBox = this.add.graphics();
        var progressBar = this.add.graphics();
        var progressBarWidth = 320;
        var progressBarHeight = 40;
        progressBox.fillStyle(0x202020, 0.8);
        progressBox.fillRect(480 - (progressBarWidth / 2), 270, progressBarWidth + 4, progressBarHeight + 4)

        this.load.on("progress", function (value) {
            console.log(value);
            let preloadTextStringsAdd = Math.floor(value * 100) + "%";
            preloadTextObject.text = preloadTextStrings[0] + preloadTextStringsAdd;

            progressBar.clear();
            progressBar.fillStyle(0xffffff, 1);
            progressBar.fillRect(480 - (progressBarWidth / 2), 270 + (Math.sin), (progressBarWidth * value) + 2, progressBarHeight)
        });

        // Loading File Statuses
        this.load.on("fileprogress", function(file) {
            console.log("Loaded: " + file.src)
        })

        // Loading Finish
        this.load.on("complete", function ()   {
            progressBar.destroy();
            progressBox.destroy();
        })
    }

    create()    {
        preloadTextObject.text = preloadTextStrings[1];

        this.input.on("pointerdown", function (pointer) {
            this.scene.start("menuGame")
        }, this);
    }

    update()    {
        this.tweenAmount += 0.1;
        preloadTextObject.x = 480 + Math.sin(this.tweenAmount);
    }
}
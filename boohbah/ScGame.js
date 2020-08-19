function clamp(_val, _min, _max) {
    return (Math.min(Math.max(_val, _min), _max))
}

function componentToHex(c) {
    var hex = c.toString(16);
    return hex.length == 1 ? "0" + hex : hex;
}

function rgbToHex(r, g, b) {
    return "#" + componentToHex(Math.floor(r)) + componentToHex(Math.floor(g)) + componentToHex(Math.floor(b));
}

function hexToRgb(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}

floatyDate = new Date();
function FloatyColour(r, g, b, r_variation, g_variation, b_variation, timeScale) {
    let _sinFactor = (Math.sin(floatyDate.now * timeScale));
    return rgbToHex(clamp(r + (r_variation * _sinFactor), 0, 255), clamp(g + (g_variation * _sinFactor), 0, 255), clamp(b + (b_variation * _sinFactor), 0, 255));
}

videoPauseForInput = false;
videoPauseForSound = false;
videoPaused = false;
videoTimestamps = null;
videoInstance = null;
videoSceneIndex = 1;
videoSceneMin = 1;
videoSceneMax = 19;
videoSceneCheckpoint = 1;
videoPosition = 0;
videoTintRed = 255;
videoTintGreen = 255;
videoTintBlue = 255;
videoTint = rgbToHex(255, 255, 255);

musicInstance = null;
musicVolumeMin = 0.1;
musicVolumeMax = 0.6;
musicVolume = musicVolumeMin;
musicPlaytimeLast = null;
musicCreditsPlayed = false;

creditsString = "\nA GAME BY MATTHEW BRAMBALLO\n\nGRAPHICS\nMatthew Bramballo\n\nMUSIC\nMatthew Bramballo\n\nSOUND EFFECTS\nMatthew Bramballo\n\nART\nMatthew Bramballo\n\nCUTSCENES\nMatthew Bramballo\n\nMARKETING\nMATTHEW BRAMBALLO\n\nPROFESSIONAL PORN\nMATTHEW BRAMBALLO\n\n\nTHANKS FOR PLAYING\nMY GAME"
creditsInstance = null;

function MusicPlay(_scene, _musicKey)    {
    if (musicInstance != null)  {
        musicInstance.pause();
        musicInstance.destroy();
    }

    musicInstance = _scene.sound.add(_musicKey).setLoop(true);
    musicInstance.play({
        volume: musicVolume
    });
}

function MusicStop()    {
    if (musicInstance != null)  {
        musicInstance.pause();
        musicInstance.destroy();
    }
}

buttonsArray = [];

function SceneInit() {
    videoPauseForInput = false;
    videoPauseForSound = false;
    videoTimestamps = null;
    videoInstance = null;
    videoSceneIndex = 1;
    videoSceneMin = 1;
    videoSceneMax = 19;
    videoPosition = 0;
    videoTint = rgbToHex(255, 255, 255);
}

function SceneGoto(_sceneIndex) {
    _sceneIndex = clamp(_sceneIndex, videoSceneMin, videoSceneMax)
    console.log("Scene Was " + videoSceneIndex + ", Is Now " + _sceneIndex)
    videoSceneIndex = _sceneIndex;
    let _sceneNewTime = videoTimestamps[videoSceneIndex] + 0.05;
    videoInstance.setCurrentTime(_sceneNewTime);
    videoPosition = _sceneNewTime;
}

function SceneButtonsAddArray(_sceneHolder, _arrayButtons) {
    let _buttonPosX = 32;
    let _buttonPosY = (540 - 48);
    videoPauseForInput = true;
    videoInstance.isPaused(true);
    videoInstance.setCurrentTime(videoTimestamps[videoSceneIndex + 1] - 0.1)
    for (let i = 0; i < _arrayButtons.length; i++) {
        let _buttonInfoObject = _arrayButtons[i];
        let _buttonText = _buttonInfoObject.Text;
        let _buttonScene = _buttonInfoObject.Scene;
        let _buttonInstance = new TextButton(_sceneHolder,_buttonPosX,_buttonPosY,_buttonText,{},()=>{
            SceneGoto(_buttonScene);
            SceneButtonsDestroy();
            videoPauseForInput = false;
        }
        )
        buttonsArray.push(_buttonInstance)
        _buttonPosY -= 48;
    }
}

function SceneButtonsDestroy() {
    while (buttonsArray.length > 0) {
        let buttonInstance = buttonsArray[0];
        buttonInstance.destroy();
        buttonsArray.shift();
    }
}

class ScGame extends Phaser.Scene {
    constructor() {
        super("playGame")
    }

    create() {
        SceneInit();
        videoTimestamps = [null, 0, 18.902, 35.452, 55.905, 66.483, 74.657, 80.013, 92.342, 111.478, 116.866, 131.898, 145.078, 158.791, 173.590, 188.371, 207.106, 226.526, 286.736, 337.587, 345.0];
        videoInstance = this.add.video(480, 270, "videoGame").setDepth(-5)
        videoInstance.play()

        MusicPlay(this, "Music3");
    }

    update() {

        // Clamp Bounds
        videoSceneIndex = Math.min(videoSceneIndex, 19);
        videoSceneIndex = Math.max(videoSceneIndex, 1)

        // Pause Video if Music Stops or Waiting for Input, Resume Otherwise
        if (videoPauseForSound || videoPauseForInput) {
            videoInstance.setPaused(true);
            videoPaused = true;
            videoTint = 0xa8ebff;
            musicVolume = clamp(musicVolume + 0.01, 0, musicVolumeMax)
        } else {
            videoTint = 0xffffff;
            if (videoInstance.isPaused()) {
                videoInstance.setPaused(false);
                videoPaused = false;
            }
            musicVolume = clamp(musicVolume - 0.02, musicVolumeMin, 1)
        }

        //Tint Video
        videoInstance.tint = videoTint;

        //Music
        if (musicInstance != null)  {
            musicInstance.setVolume(musicVolume);
        }

        console.log(musicInstance);

        // Outerbounds Detection
        if (videoPaused == false) {
            if (videoPosition > (videoTimestamps[videoSceneIndex + 1] - 0.1)) {
                switch (videoSceneIndex) {
                case 1:
                    videoSceneCheckpoint = 1;
                    musicCreditsPlayed = false;
                    //First Scene Checkpoint
                    SceneGoto(2);
                    break;
                case 2:
                    if (Math.random() < 0.15) {
                        //Random Encounter
                        SceneGoto(3);
                    } else {
                        SceneGoto(4);
                    }
                    break;
                case 3:
                    unlockMedal("RANDOM ENCOUNTER PT. 1");
                    SceneGoto(4);
                    break;
                case 4:
                    videoSceneCheckpoint = 4;
                    SceneButtonsAddArray(this, [{
                        Text: "bang around on the hood some",
                        Scene: 5
                    }, {
                        Text: "pull the hood latch",
                        Scene: 7
                    }])
                    break;
                case 5:
                    SceneGoto(6);
                    break;
                case 6:
                case 10:
                case 11:
                case 12:
                case 13:
                case 14:
                case 15:
                case 16:
                    SceneGoto(19);
                    break;
                case 9:
                    videoSceneCheckpoint = 9;
                    SceneButtonsAddArray(this, [
                        {Text: "the straw",
                        Scene: 10},
                        {Text: "the plastic bag from dollar general",
                        Scene: 15},
                        {Text: "the grass",
                        Scene: 12},
                        {Text: "the little bit of a coat hanger",
                        Scene: 13},
                        {Text: "the plastic ring",
                        Scene: 16},
                        {Text: "the slimjim wrapper",
                        Scene: 14},
                        {Text: "the rock",
                        Scene: 17},
                        {Text: "the leaf",
                        Scene: 11},
                    ])
                    break;
                case 18:
                    MusicStop();
                    unlockMedal("BOOHBAH MOBILE FIXED");
                    unlockMedal("DIE")
                    this.scene.start("menuGame");
                    break;
                case 19:
                    SceneGoto(videoSceneCheckpoint)
                    break;
                default:
                    SceneGoto(videoSceneIndex + 1)
                    break;
                }
            }

            if (videoPosition > 288)    {
                if (musicCreditsPlayed == false)    {
                    MusicPlay(this, "Music2")
                    musicCreditsPlayed = true;
                }
            }
        }
        videoPosition = videoInstance.getCurrentTime();
    }
}

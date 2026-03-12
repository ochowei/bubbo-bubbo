import { GameScreen } from './GameScreen';

/** The screen that runs the game in time-attack mode. */
export class TimeAttackGameScreen extends GameScreen {
    /** A unique identifier for the screen */
    public static SCREEN_ID = 'time-attack-game';
    /** An array of bundle IDs for dynamic asset loading. */
    public static assetBundles = ['game-screen'];

    /** Called before the screen is shown. Hardcodes the mode to 'time-attack'. */
    public override prepare() {
        super.prepare({ mode: 'time-attack' });
    }
}

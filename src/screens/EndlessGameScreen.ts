import { GameScreen } from './GameScreen';

/** The screen that runs the game in endless mode. */
export class EndlessGameScreen extends GameScreen {
    /** A unique identifier for the screen */
    public static SCREEN_ID = 'endless-game';
    /** An array of bundle IDs for dynamic asset loading. */
    public static assetBundles = ['game-screen'];

    /** Called before the screen is shown. Hardcodes the mode to 'endless'. */
    public override prepare() {
        super.prepare({ mode: 'endless' });
    }
}

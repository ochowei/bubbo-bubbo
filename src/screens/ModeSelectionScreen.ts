import gsap from 'gsap';
import { Container, Text, Texture, TilingSprite } from 'pixi.js';

import { designConfig } from '../game/designConfig';
import type { AppScreen } from '../navigation';
import { navigation } from '../navigation';
import { SecondaryButton } from '../ui/buttons/SecondaryButton';
import { i18n } from '../utils/i18n';
import { GameScreen } from './GameScreen';
import { TitleScreen } from './TitleScreen';

/** The game modes available for selection. */
export type GameMode = 'endless' | 'time-attack';

/** Shared text style for mode description labels. */
const DESC_STYLE = {
    fontSize: 16,
    fontFamily: 'Opensans-Semibold',
    fill: 0x555555,
    align: 'left' as const,
    lineHeight: 22,
    wordWrap: true,
    wordWrapWidth: 250,
} as const;

/** The screen that lets the player choose a game mode before playing. */
export class ModeSelectionScreen extends Container implements AppScreen {
    /** A unique identifier for the screen */
    public static SCREEN_ID = 'mode-selection';
    /**
     * 'title-screen' supplies the background tile and font assets.
     * 'game-screen' supplies the button-flat sprite used by SecondaryButton.
     */
    public static assetBundles = ['title-screen', 'game-screen'];

    private readonly _background: TilingSprite;
    private readonly _title: Text;
    private readonly _endlessBtn: SecondaryButton;
    private readonly _endlessDesc: Text;
    private readonly _timeAttackBtn: SecondaryButton;
    private readonly _timeAttackDesc: Text;
    private readonly _backBtn: SecondaryButton;

    /** Container animated in from the top */
    private readonly _topAnimContainer = new Container();
    /** Container animated in from the bottom */
    private readonly _bottomAnimContainer = new Container();

    constructor() {
        super();

        this._background = new TilingSprite({
            texture: Texture.from('background-tile'),
            width: 64,
            height: 64,
            tileScale: {
                x: designConfig.backgroundTileScale,
                y: designConfig.backgroundTileScale,
            },
        });
        this.addChild(this._background);

        // Title — black text is clearly readable on the light dotted background
        this._title = new Text({
            text: i18n.t('modeSelectTitle'),
            style: {
                fontSize: 58,
                fontFamily: 'Bungee-Regular',
                fill: 0x000000,
                align: 'center',
            },
        });
        this._title.anchor.set(0.5);
        this._topAnimContainer.addChild(this._title);

        // Endless
        this._endlessBtn = new SecondaryButton({ text: i18n.t('modeEndless'), tint: 0x49c8ff });
        this._endlessBtn.onPress.connect(() => {
            navigation.goToScreen(GameScreen, { mode: 'endless' as GameMode });
        });
        this._endlessDesc = new Text({ text: i18n.t('modeEndlessDesc'), style: DESC_STYLE });
        this._endlessDesc.anchor.set(0, 0.5);
        this._endlessDesc.visible = false;
        this.bindHoverDescription(this._endlessBtn, this._endlessDesc);

        // Time Attack
        this._timeAttackBtn = new SecondaryButton({
            text: i18n.t('modeTimeAttack'),
            tint: 0xffca42,
            textStyle: { fontSize: 33 },
        });
        this._timeAttackBtn.onPress.connect(() => {
            navigation.goToScreen(GameScreen, { mode: 'time-attack' as GameMode });
        });
        this._timeAttackDesc = new Text({ text: i18n.t('modeTimeAttackDesc'), style: DESC_STYLE });
        this._timeAttackDesc.anchor.set(0, 0.5);
        this._timeAttackDesc.visible = false;
        this.bindHoverDescription(this._timeAttackBtn, this._timeAttackDesc);

        this._backBtn = new SecondaryButton({
            text: i18n.t('modeBack'),
            tint: 0xbcbcbc,
            textStyle: { fontSize: 26 },
        });
        this._backBtn.onPress.connect(() => {
            navigation.goToScreen(TitleScreen);
        });

        this._bottomAnimContainer.addChild(
            this._endlessBtn,
            this._endlessDesc,
            this._timeAttackBtn,
            this._timeAttackDesc,
            this._backBtn,
        );

        this.addChild(this._topAnimContainer, this._bottomAnimContainer);
    }

    /** Displays mode descriptions only while the mouse hovers a mode button. */
    private bindHoverDescription(button: SecondaryButton, description: Text) {
        button.on('pointerover', () => {
            this._endlessDesc.visible = false;
            this._timeAttackDesc.visible = false;
            description.visible = true;
        });

        button.on('pointerout', () => {
            description.visible = false;
        });
    }

    /** Called before `show`, resets animation containers to off-screen positions. */
    public prepare() {
        gsap.set(this._topAnimContainer, { y: -300 });
        gsap.set(this._bottomAnimContainer, { y: 400 });
    }

    /** Called when the screen is being shown. */
    public async show() {
        gsap.killTweensOf(this);
        this.alpha = 0;

        await gsap.to(this, { alpha: 1, duration: 0.2, ease: 'linear' });

        const slideIn = { y: 0, duration: 0.75, ease: 'elastic.out(1, 0.5)' };

        gsap.to(this._topAnimContainer, slideIn);
        gsap.to(this._bottomAnimContainer, slideIn);
    }

    /** Called when the screen is being hidden. */
    public async hide() {
        gsap.killTweensOf(this);
        await gsap.to(this, { alpha: 0, duration: 0.2, ease: 'linear' });
    }

    /**
     * Gets called every time the screen resizes.
     * @param w - width of the screen.
     * @param h - height of the screen.
     */
    public resize(w: number, h: number) {
        this._background.width = w;
        this._background.height = h;

        const cx = w * 0.5;

        this._title.x = cx;
        this._title.y = h * 0.18;

        // Vertical spacing between mode rows.
        const rowHeight = 124;
        const groupTop = h * 0.38;
        const descOffsetX = 180;

        // Endless row
        this._endlessBtn.x = cx;
        this._endlessBtn.y = groupTop;
        this._endlessDesc.x = cx + descOffsetX;
        this._endlessDesc.y = groupTop;

        // Time Attack row
        this._timeAttackBtn.x = cx;
        this._timeAttackBtn.y = groupTop + rowHeight;
        this._timeAttackDesc.x = cx + descOffsetX;
        this._timeAttackDesc.y = groupTop + rowHeight;

        this._backBtn.x = 110;
        this._backBtn.y = h - 45;
    }
}

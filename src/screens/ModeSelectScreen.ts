import gsap from 'gsap';
import { Container, Graphics, Text, Texture, TilingSprite } from 'pixi.js';

import { sfx } from '../audio';
import { boardConfig, randomType } from '../game/boardConfig';
import { designConfig } from '../game/designConfig';
import type { GameMode } from '../game/GameMode';
import type { AppScreen } from '../navigation';
import { navigation } from '../navigation';
import { storage } from '../storage';
import { AudioButton } from '../ui/buttons/AudioButton';
import { IconButton } from '../ui/buttons/IconButton';
import { Porthole } from '../ui/Porthole';
import { i18n } from '../utils/i18n';
import { GameScreen } from './GameScreen';
import { TitleScreen } from './TitleScreen';

/** A card that represents a single game mode option. */
class ModeCard extends Container {
    constructor(name: string, desc: string, color: number, onSelect: () => void) {
        super();

        const bg = new Graphics()
            .roundRect(-100, -70, 200, 140, 16)
            .fill({ color, alpha: 0.85 })
            .stroke({ color: 0xffffff, alpha: 0.4, width: 2 });

        this.addChild(bg);

        const nameText = new Text({
            text: name,
            style: {
                fontSize: 20,
                fontWeight: '900',
                fontFamily: 'Bungee-Regular',
                fill: 0xffffff,
                align: 'center',
            },
        });

        nameText.anchor.set(0.5);
        nameText.y = -32;
        this.addChild(nameText);

        const descText = new Text({
            text: desc,
            style: {
                fontSize: 14,
                fontFamily: 'Opensans-Semibold',
                fill: 0xffffff,
                align: 'center',
            },
        });

        descText.anchor.set(0.5);
        descText.y = 20;
        this.addChild(descText);

        this.interactive = true;
        this.cursor = 'pointer';

        this.on('pointerover', () => {
            gsap.to(this.scale, { x: 1.06, y: 1.06, duration: 0.15, ease: 'power2.out' });
        });

        this.on('pointerout', () => {
            gsap.to(this.scale, { x: 1, y: 1, duration: 0.15, ease: 'power2.out' });
        });

        this.on('pointertap', () => {
            sfx.play('audio/primary-button-press.wav');
            onSelect();
        });
    }
}

/** The mode selection screen shown before the game starts. */
export class ModeSelectScreen extends Container implements AppScreen {
    /** A unique identifier for the screen */
    public static SCREEN_ID = 'mode-select';
    /** An array of bundle IDs for dynamic asset loading. */
    public static assetBundles = ['title-screen'];

    private readonly _background: TilingSprite;
    private _porthole!: Porthole;
    private _footer!: Graphics;
    private _titleText!: Text;
    private _backBtn!: IconButton;
    private _audioBtn!: AudioButton;
    private readonly _cardContainer = new Container();

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

        this._buildDetails();
        this._buildCards();

        this.addChild(this._cardContainer);
    }

    /** Called when the screen is being shown. */
    public async show() {
        gsap.killTweensOf(this);
        this.alpha = 0;
        this._porthole.start();
        this._audioBtn.forceSwitch(storage.getStorageItem('muted'));
        gsap.set(this._cardContainer, { y: 60, alpha: 0 });
        await gsap.to(this, { alpha: 1, duration: 0.2, ease: 'linear' });
        gsap.to(this._cardContainer, { y: 0, alpha: 1, duration: 0.5, ease: 'back.out(1.4)' });
    }

    /** Called when the screen is being hidden. */
    public async hide() {
        gsap.killTweensOf(this);
        await gsap.to(this, { alpha: 0, duration: 0.2, ease: 'linear' });
        this._porthole.stop();
    }

    /**
     * Gets called every time the screen resizes.
     * @param w - width of the screen.
     * @param h - height of the screen.
     */
    public resize(w: number, h: number) {
        this._background.width = w;
        this._background.height = h;

        this._footer.width = w * 1.2;
        this._footer.x = w * 0.5;
        this._footer.y = h;

        this._porthole.view.x = w - 40;
        this._porthole.view.y = 60;

        this._backBtn.x = 50;
        this._backBtn.y = h - 50;

        this._audioBtn.x = w - 40;
        this._audioBtn.y = 40;

        this._titleText.x = w * 0.5;
        this._titleText.y = h * 0.28;

        this._cardContainer.x = w * 0.5;
        this._cardContainer.y = h * 0.55;
    }

    private _buildDetails() {
        this._porthole = new Porthole();
        this.addChild(this._porthole.view);

        const type = randomType();

        this._footer = new Graphics()
            .ellipse(0, 0, 300, 125)
            .fill({ color: boardConfig.bubbleTypeToColor[type] });
        this.addChild(this._footer);

        this._titleText = new Text({
            text: i18n.t('modeSelectTitle'),
            style: {
                fontSize: 36,
                fontWeight: '900',
                fontFamily: 'Bungee-Regular',
                fill: 0xffffff,
                align: 'center',
                dropShadow: true,
                dropShadowAngle: Math.PI / 2,
                dropShadowDistance: 4,
                dropShadowColor: 0x000033,
            },
        });

        this._titleText.anchor.set(0.5);
        this.addChild(this._titleText);

        this._backBtn = new IconButton('icon-back', 1);
        this._backBtn.onPress.connect(() => {
            navigation.goToScreen(TitleScreen);
        });
        this.addChild(this._backBtn);

        this._audioBtn = new AudioButton();
        this.addChild(this._audioBtn);
    }

    private _buildCards() {
        const modes: Array<{ mode: GameMode; name: string; desc: string; color: number }> = [
            {
                mode: 'endless',
                name: i18n.t('modeEndlessName'),
                desc: i18n.t('modeEndlessDesc'),
                color: 0x2244aa,
            },
            {
                mode: 'timeAttack',
                name: i18n.t('modeTimeAttackName'),
                desc: i18n.t('modeTimeAttackDesc'),
                color: 0xaa4422,
            },
            {
                mode: 'puzzle',
                name: i18n.t('modePuzzleName'),
                desc: i18n.t('modePuzzleDesc'),
                color: 0x226622,
            },
        ];

        const cardSpacing = 220;
        const startX = -cardSpacing;

        modes.forEach(({ mode, name, desc, color }, index) => {
            const card = new ModeCard(name, desc, color, () => {
                navigation.goToScreen(GameScreen, { mode });
            });

            card.x = startX + index * cardSpacing;
            this._cardContainer.addChild(card);
        });
    }
}

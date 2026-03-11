import { Container } from 'pixi.js';
import { Signal } from 'typed-signals';

import type { Game } from '../Game';
import { TIME_ATTACK_DURATION } from '../GameMode';
import type { System } from '../SystemRunner';
import { PauseSystem } from './PauseSystem';

/**
 * A system that manages the countdown timer for Time Attack mode.
 * Counts down from TIME_ATTACK_DURATION seconds and emits onTimerEnd when it reaches zero.
 */
export class TimerSystem implements System {
    /**
     * A unique identifier used by the system runner.
     */
    public static SYSTEM_ID = 'timer';
    /**
     * The instance of the game the system is attached to.
     */
    public game!: Game;
    /** The container for the timer display. */
    public view = new Container();

    /** Signals emitted by this system. */
    public signals = {
        /** Emitted when the timer reaches zero. */
        onTimerEnd: new Signal<() => void>(),
        /** Emitted each second with the remaining seconds. */
        onTick: new Signal<(remaining: number) => void>(),
    };

    /** Remaining time in seconds. */
    private _remaining = TIME_ATTACK_DURATION;
    /** Accumulated elapsed time in seconds. */
    private _elapsed = 0;
    /** Whether the timer is running. */
    private _running = false;

    /** Called at the start of the game. */
    public start() {
        this._running = true;
    }

    /** Called when the game ends. */
    public end() {
        this._running = false;
    }

    /** Resets the timer back to the full duration. */
    public reset() {
        this._remaining = TIME_ATTACK_DURATION;
        this._elapsed = 0;
        this._running = false;
    }

    /** Returns the remaining time in seconds. */
    public get remaining(): number {
        return this._remaining;
    }

    /**
     * Called every frame.
     * @param delta - PixiJS deltaTime (frames elapsed, ~1 at 60 fps).
     */
    public update(delta: number) {
        if (!this._running) return;
        if (this.game.systems.get(PauseSystem).isPaused) return;

        // PixiJS deltaTime is in frames (1 frame = 1/60 s at 60 fps)
        const deltaSeconds = delta / 60;

        this._elapsed += deltaSeconds;

        const newRemaining = Math.max(0, TIME_ATTACK_DURATION - Math.floor(this._elapsed));

        if (newRemaining !== this._remaining) {
            this._remaining = newRemaining;
            this.signals.onTick.emit(this._remaining);

            if (this._remaining === 0) {
                this._running = false;
                this.signals.onTimerEnd.emit();
            }
        }
    }
}

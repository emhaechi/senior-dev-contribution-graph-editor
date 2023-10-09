/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */


/**
 * Scoped readonly state for this extension.
 * 
 * @see SENCON_CONSTANTS
 */
'use strict';

/**
 * Readonly state and enums for this extension.
 */
const SENCON_CONSTANTS = (function setupConstants() {
    function deepFreeze(object) {
        if (object && typeof object === 'object') {
            for (let prop in object) {
                if (object && typeof object[prop] === 'object') {
                    deepFreeze(object[prop]);
                }
            }
        }
        return Object.freeze(object);
    }

    const wavePattern = {
        hori: 0,
        vert: 10,
        tri: 20,
        shift: 30,
        blink: 40
    };

    const waveLevelIndicator = {
        L0: 'sencon-contrib-0',
        L1: 'sencon-contrib-1',
        L2: 'sencon-contrib-2',
        L3: 'sencon-contrib-3',
        L4: 'sencon-contrib-4'
    };

    const senconMode = {
        colors: 'colors',
        animation: 'animation',
    };

    const storageKey = 'sencon';

    const frameUpdateSpeedMinimumChange = 17;

    const delay = 67;

    const colorsLightDefault = {
        0: {
            fill: '#ebedf0'
        },
        1: {
            fill: '#9be9a8'
        },
        2: {
            fill: '#40c463'
        },
        3: {
            fill: '#30a14e'
        },
        4: {
            fill: '#216e39'
        }
    };
    const colorsDarkDefault = {
        0: {
            fill: '#161b22',
        },
        1: {
            fill: '#0e4429'
        },
        2: {
            fill: '#006d32'
        },
        3: {
            fill: '#26a641'
        },
        4: {
            fill: '#39d353'
        }
    };
    const colorsDefault = window.matchMedia && window.matchMedia('(prefers-color-scheme:dark)').matches ?
        colorsDarkDefault :
        colorsLightDefault;


    const constants = {
        get optionsDefault() {
            return {
                [storageKey]: {
                    settings: {
                        mode: senconMode.colors,
                        colors: colorsDefault
                    }
                }
            };
        },
        storageKey: storageKey,
        /** based on 60 fps, this is enough elapsed time to exceed time btw frames */
        frameUpdateSpeedMinimumChange: frameUpdateSpeedMinimumChange,

        /** async delay when needed for render, raf, ... */
        delay: delay,

        senconMode: senconMode,
        waveLevelIndicator: waveLevelIndicator,
        wavePattern: wavePattern
    };
    deepFreeze(constants);
    return constants;
})();


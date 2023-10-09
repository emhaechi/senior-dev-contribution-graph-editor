/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */


/**
 * Implements the extension's options menu shown in Firefox's Add-on Manager 
 * to allow persisting options such as color choice.
 */
'use strict';

/**
 * The form element for the adjustable settings.
 */
var optionsForm;

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initOptions);
} else {
    initOptions();
}

function initOptions() {
    optionsForm = document.getElementById('sencon-options-form');
    optionsForm.addEventListener('submit', saveOptions);

    document.getElementById('sencon-options-mode-color').setAttribute('value', SENCON_CONSTANTS.senconMode.colors);
    document.getElementById('sencon-options-mode-animation').setAttribute('value', SENCON_CONSTANTS.senconMode.animation);

    const resetColorsBtn = document.getElementById('sencon-options-btn-reset-colors');
    resetColorsBtn.addEventListener('click', resetColors);

    // restore settings as needed
    browser.storage.local.get(SENCON_CONSTANTS.storageKey).then(function(items) {
        const options = items && items[SENCON_CONSTANTS.storageKey] ? items : SENCON_CONSTANTS.optionsDefault;
        
        optionsForm.elements['mode'].value = options[SENCON_CONSTANTS.storageKey].settings.mode;

        setColors(options);
    });
}

function saveOptions(event) {
    event.preventDefault();

    // init color inputs as needed
    optionsForm.elements['color-level-0'].elements['fill'].select();
    optionsForm.elements['color-level-1'].elements['fill'].select();
    optionsForm.elements['color-level-2'].elements['fill'].select();
    optionsForm.elements['color-level-3'].elements['fill'].select();
    optionsForm.elements['color-level-4'].elements['fill'].select();

    const optionsFormData = {
        mode: optionsForm.elements['mode'].value,
        colors: {
            0: {
                fill: optionsForm.elements['color-level-0'].elements['fill'].value
            },
            1: {
                fill: optionsForm.elements['color-level-1'].elements['fill'].value
            },
            2: {
                fill: optionsForm.elements['color-level-2'].elements['fill'].value
            },
            3: {
                fill: optionsForm.elements['color-level-3'].elements['fill'].value
            },
            4: {
                fill: optionsForm.elements['color-level-4'].elements['fill'].value
            }
        }
    };

    // save settings
    browser.storage.local.set({
        [SENCON_CONSTANTS.storageKey]: {
            settings: optionsFormData,
            version: browser.runtime.getManifest().version
        }
    }).then();
}

/**
 * Set colors in the form to the given options.
 */
function setColors(options) {
    optionsForm.elements['color-level-0'].elements['fill'].value = options[SENCON_CONSTANTS.storageKey].settings.colors['0'].fill;
    optionsForm.elements['color-level-1'].elements['fill'].value = options[SENCON_CONSTANTS.storageKey].settings.colors['1'].fill;
    optionsForm.elements['color-level-2'].elements['fill'].value = options[SENCON_CONSTANTS.storageKey].settings.colors['2'].fill;
    optionsForm.elements['color-level-3'].elements['fill'].value = options[SENCON_CONSTANTS.storageKey].settings.colors['3'].fill;
    optionsForm.elements['color-level-4'].elements['fill'].value = options[SENCON_CONSTANTS.storageKey].settings.colors['4'].fill;
}

/**
 * Init color in the form back to their default values.
 */
function resetColors() {
    setColors(SENCON_CONSTANTS.optionsDefault);
}


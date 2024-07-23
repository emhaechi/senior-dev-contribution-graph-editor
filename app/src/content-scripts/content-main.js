/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */


/**
 * Implements the functionality to update GitHub's contribution graph's 
 * template to:
 * 
 * - adjust the contribution graph colors
 * - run predefined animations over the graph
 * 
 */
'use strict';

/**
 * scoped state for this script.
 */
var sencon = {
    /**
     * The patterns animating over the graph.
     * 
     * Fields:
     * - pattern: SENCON_CONSTANTS.wavePattern
     * - row: number - index into graphBodyRows
     * - col: number - index into graphBodyRows[row]
     * - updateSpeed: number - minimum elapsed time necessary to trigger an update
     * - timeElapsedSinceUpdate: number
     * - timeUpdated: number
     * - visited: HTMLElement[]
     */
    waves: [],
    /**
     * Template references or relevant state.
     */
    template: {
        /** requestAnimationFrame id of update/animation loop. */
        _rafId: null,
        /** setTimeout id of a pending init retry. */
        _initRetryId: null,
        /** if true, the page/tab is hidden. */
        hidden: false,
        /** the contribution graph template change observer. triggers reinitialization as needed. */
        observer: null,
        /** the document body observer. triggers initialization as needed. */
        docObserver: null,
        overviewTab: null,
        /** the highest ancestor element (most root) containing the graph that's updated on its template changes. */
        graphContainer: null,
        /** the lowest ancestor element (most leaf) containing the contribution graph. */
        graph: null,
        /** the parent elements within the graph whose children (i.e. the graph's cells) show the wave animations. */
        graphBodyRows: null

    },
    /**
     * State relevant to time as it concerns animation.
     */
    time: {
        /** the time the last frame had been executed on. */
        previous: -1
    },
    /** the options initialized with. */
    options: null,
    enabled: true,
    /**
     * If true, extension initialized correctly.
     */
    initialized: false
};

/**
 * Sets up styles to show chosen colors.
 */
function initColors() {
    document.documentElement.style.setProperty('--sencon-color-fill-0', sencon.options[SENCON_CONSTANTS.storageKey].settings.colors['0'].fill);
    document.documentElement.style.setProperty('--sencon-color-fill-1', sencon.options[SENCON_CONSTANTS.storageKey].settings.colors['1'].fill);
    document.documentElement.style.setProperty('--sencon-color-fill-2', sencon.options[SENCON_CONSTANTS.storageKey].settings.colors['2'].fill);
    document.documentElement.style.setProperty('--sencon-color-fill-3', sencon.options[SENCON_CONSTANTS.storageKey].settings.colors['3'].fill);
    document.documentElement.style.setProperty('--sencon-color-fill-4', sencon.options[SENCON_CONSTANTS.storageKey].settings.colors['4'].fill);
}

/**
 * Sets up the template to show animation of the waves.
 */
function initWaves() {

    // clear any wave state reflected in the template from prior runs, as needed
    for (let i = 0; i < sencon.template.graphBodyRows.length; i++) {
        for (let j = 0; j < sencon.template.graphBodyRows[i].children.length; j++) {
            sencon.template.graphBodyRows[i].children[j].classList.remove(SENCON_CONSTANTS.waveLevelIndicator.L4);
            sencon.template.graphBodyRows[i].children[j].classList.remove(SENCON_CONSTANTS.waveLevelIndicator.L3);
            sencon.template.graphBodyRows[i].children[j].classList.remove(SENCON_CONSTANTS.waveLevelIndicator.L2);
            sencon.template.graphBodyRows[i].children[j].classList.remove(SENCON_CONSTANTS.waveLevelIndicator.L1);
            sencon.template.graphBodyRows[i].children[j].classList.remove(SENCON_CONSTANTS.waveLevelIndicator.L0);
        }
    }

    sencon.waves = [];
    if (sencon.options[SENCON_CONSTANTS.storageKey].settings.mode === SENCON_CONSTANTS.senconMode.animation) {
        for (let i = 0; i < sencon.template.graphBodyRows.length; i++) {
            sencon.waves.push({
                pattern: SENCON_CONSTANTS.wavePattern.hori,
                row: i,
                col: 0 - i,
                updateSpeed: 50 + i * SENCON_CONSTANTS.frameUpdateSpeedMinimumChange,
                timeElapsedSinceUpdate: 0,
                timeUpdated: 0,
                visited: []
            });

            sencon.waves.push({
                pattern: SENCON_CONSTANTS.wavePattern.hori,
                row: i,
                col: -11 - i,
                updateSpeed: 50 + i * SENCON_CONSTANTS.frameUpdateSpeedMinimumChange,
                timeElapsedSinceUpdate: 0,
                timeUpdated: 0,
                visited: []
            });

            sencon.waves.push({
                pattern: SENCON_CONSTANTS.wavePattern.hori,
                row: i,
                col: -22 - i,
                updateSpeed: 50 + i * SENCON_CONSTANTS.frameUpdateSpeedMinimumChange,
                timeElapsedSinceUpdate: 0,
                timeUpdated: 0,
                visited: []
            });

            sencon.waves.push({
                pattern: SENCON_CONSTANTS.wavePattern.hori,
                row: i,
                col: -33 - i,
                updateSpeed: 50 + i * SENCON_CONSTANTS.frameUpdateSpeedMinimumChange,
                timeElapsedSinceUpdate: 0,
                timeUpdated: 0,
                visited: []
            });

            sencon.waves.push({
                pattern: SENCON_CONSTANTS.wavePattern.hori,
                row: i,
                col: -43 - i,
                updateSpeed: 50 + i * SENCON_CONSTANTS.frameUpdateSpeedMinimumChange,
                timeElapsedSinceUpdate: 0,
                timeUpdated: 0,
                visited: []
            });
        }
    }
}

/**
 * Sets state from either saved settings or the default options if none found.
 */
function initStateFromSettings(items) {
    sencon.options = items && items.sencon ? items : SENCON_CONSTANTS.optionsDefault;

    initColors();

    if (sencon.options[SENCON_CONSTANTS.storageKey].settings.mode === SENCON_CONSTANTS.senconMode.colors) {
        sencon.time.previous = -1;
    }

    initWaves();
}

/**
 * Initializes template references and fetches any saved settings to
 * fully initialize everything.
 */
function initTemplate() {
    return new Promise(function(resolve, reject) {
        sencon.initialized = false;
        if (document.body.classList.contains('page-profile') && sencon.template.overviewTab != null && sencon.template.overviewTab.classList.contains('selected')) {
            const graph = document.getElementsByClassName('ContributionCalendar-grid');
            const graphContainer = document.getElementsByClassName('js-yearly-contributions');
            if (graph.length && graphContainer.length) {
                sencon.template.graph = graph[0];
                sencon.template.graphContainer = graphContainer[0];

                const graphBody = sencon.template.graph.querySelector('tbody');
                if (graphBody) {
                    const graphBodyRows = graphBody.getElementsByTagName('tr');
                    if (graphBodyRows) {
                        sencon.template.graphBodyRows = graphBodyRows;

                        browser.storage.local.get(SENCON_CONSTANTS.storageKey).then(function(items) {
                            initStateFromSettings(items || null);
                            sencon.initialized = true;
                            resolve(true);
                        }).catch(function(e) {
                            console.debug('[SENCON] error while getting settings on init:', e);
                            reject('settings');
                        });
                    } else {
                        resolve(false);
                    }
                } else {
                    resolve(false);
                }
            } else {
                resolve(false);
            }
        } else {
            reject('profile-overview');
        }
    });
}

/**
 * Steps the animation of the waves forward.
 */
function updateWaves(currentTime) {
    // ensure the colors are set (browser nav can sometimes discard)
    initColors();

    for (let w = 0; w < sencon.waves.length; w++) {
        sencon.waves[w].timeElapsedSinceUpdate = currentTime - sencon.waves[w].timeUpdated;
        if (sencon.waves[w].timeElapsedSinceUpdate >= sencon.waves[w].updateSpeed) {

            sencon.waves[w].timeUpdated = currentTime;

            if (sencon.waves[w].pattern === SENCON_CONSTANTS.wavePattern.hori) {

                // step the wave
                sencon.waves[w].col++;

                // wrap-around the wave as needed
                if (sencon.waves[w].col >= sencon.template.graphBodyRows[sencon.waves[w].row].children.length) {
                    sencon.waves[w].col = 1;
                }

                // visually fade out the visited as needed
                for (let v = sencon.waves[w].visited.length - 1; v >= 0; v--) { // skip first element [0] (i.e. the row's label column)
                    if (sencon.waves[w].visited[v].classList.contains(SENCON_CONSTANTS.waveLevelIndicator.L4)) {
                        sencon.waves[w].visited[v].classList.remove(SENCON_CONSTANTS.waveLevelIndicator.L4);
                        sencon.waves[w].visited[v].classList.add(SENCON_CONSTANTS.waveLevelIndicator.L3);
                    } else if (sencon.waves[w].visited[v].classList.contains(SENCON_CONSTANTS.waveLevelIndicator.L3)) {
                        sencon.waves[w].visited[v].classList.remove(SENCON_CONSTANTS.waveLevelIndicator.L3);
                        sencon.waves[w].visited[v].classList.add(SENCON_CONSTANTS.waveLevelIndicator.L2);
                    } else if (sencon.waves[w].visited[v].classList.contains(SENCON_CONSTANTS.waveLevelIndicator.L2)) {
                        sencon.waves[w].visited[v].classList.remove(SENCON_CONSTANTS.waveLevelIndicator.L2);
                        sencon.waves[w].visited[v].classList.add(SENCON_CONSTANTS.waveLevelIndicator.L1);
                    } else if (sencon.waves[w].visited[v].classList.contains(SENCON_CONSTANTS.waveLevelIndicator.L1)) {
                        sencon.waves[w].visited[v].classList.remove(SENCON_CONSTANTS.waveLevelIndicator.L1);
                        sencon.waves[w].visited[v].classList.add(SENCON_CONSTANTS.waveLevelIndicator.L0);
                    }

                    if (sencon.waves[w].visited[v].classList.contains(SENCON_CONSTANTS.waveLevelIndicator.L0)) {
                        sencon.waves[w].visited[v].classList.remove(SENCON_CONSTANTS.waveLevelIndicator.L0);
                        sencon.waves[w].visited.splice(v, 1);
                    }
                }

                // visually update the wave head
                if (sencon.waves[w].col > 0) {
                    sencon.template.graphBodyRows[sencon.waves[w].row].children[sencon.waves[w].col].classList.add(SENCON_CONSTANTS.waveLevelIndicator.L4);
                    sencon.waves[w].visited.push(sencon.template.graphBodyRows[sencon.waves[w].row].children[sencon.waves[w].col]);
                }

            } else {
                throw new Error('cannot update wave - pattern not implemented for wave: index=' + w + ', pattern=' + sencon.waves[w].pattern);
            }
        }
    }

}

/**
 * Steps all animations forward.
 */
function updateFrame(currentTime) {
    if (sencon.enabled) {
        if (currentTime !== sencon.time.previous) {
            if (sencon.initialized && !sencon.template.hidden) {
                updateWaves(currentTime);
            }
        }

        sencon.time.previous = currentTime;
        requestUpdate();
    }
}

function requestUpdate() {
    sencon.template._rafId = window.requestAnimationFrame(updateFrame);
}

function cancelUpdate() {
    sencon.time.previous = -1;
    window.cancelAnimationFrame(sencon.template._rafId);
}

function enableUpdates(enable) {
    const wasEnabled = sencon.enabled;
    sencon.enabled = enable;
    if (!wasEnabled && sencon.enabled) {
        requestUpdate();
    } else if (!sencon.enabled) {
        cancelUpdate();
    }
}

function onSettingsChange(optionsChanges) {
    if (optionsChanges.sencon) {
        console.debug('[SENCON] settings changed:', optionsChanges);
        initStateFromSettings({
            sencon: optionsChanges[SENCON_CONSTANTS.storageKey].newValue
        });
    }
}

function onPageVisibilityChange() {
    sencon.template.hidden = document.visibilityState === 'hidden';
}

function getOverviewTab() {
    return document.getElementById('overview-tab') ||
        document.querySelector('a[data-tab-item="overview"]');
}

/**
 * 
 */
function start() {
    if (browser.storage.local.onChanged.hasListener(onSettingsChange)) {
        browser.storage.local.onChanged.removeListener(onSettingsChange);
    }
    browser.storage.local.onChanged.addListener(onSettingsChange);

    if (sencon.template.observer == null) {
        sencon.template.observer = new MutationObserver(function onGraphTemplateChange()  {
            console.debug('[SENCON] graph template changed...');
            init();
        });
    } else {
        sencon.template.observer.disconnect();
    }
    sencon.template.observer.observe(sencon.template.graphContainer.parentElement, { childList: true });

    document.removeEventListener('visibilitychange', onPageVisibilityChange);
    document.addEventListener('visibilitychange', onPageVisibilityChange);

    requestUpdate(); 
}

/**
 * General initialization for everything once the page load has been handled.
 */
function init() {
    cancelUpdate();
    clearTimeout(sencon._initRetryId);

    initTemplate().then(function(initialized) {
        console.debug('[SENCON] init attempt 1...');
        if (initialized) {
            start();
        } else {
            return new Promise(function(resolve, reject) {
                sencon._initRetryId = setTimeout(function() {
                    resolve(initTemplate());
                }, 1500);
            });
        }
    }).then(function(initialized) {
        if (initialized != null) {
            console.debug('[SENCON] init attempt 2...');
            if (initialized) {
                start();
            } else {
                return new Promise(function(resolve, reject) {
                    sencon._initRetryId = setTimeout(function() {
                        resolve(initTemplate());   
                    }, 3000);
                });
            }
        }
    }).then(function(initialized) {
        if (initialized != null) {
            console.debug('[SENCON] init attempt 3...');
            if (initialized) {
                start();
            } else {
                console.debug('[SENCON] init failed!');
            }
        }
    }).catch(function(e) {
        console.debug('[SENCON] init cancelled or errored:', e);
    });
}

/**
 * Page load initialization.
 */
function onPageInit() {
    if (sencon.template.docObserver == null) {
        sencon.template.docObserver = new MutationObserver(function onPageChange(e) {
            console.debug('[SENCON] doc template changed...', e);

            if (document.body.classList.contains('page-profile')) {
                // note: there are 2 of these in the template (small- and medium+ bs-like versions) but 
                // both currently would show ".selected" when either activated
                const overviewElement = getOverviewTab();
                if (sencon.template.overviewTab !== overviewElement) {
                    sencon.template.overviewTab = overviewElement;
                    sencon.template.docObserver.observe(sencon.template.overviewTab, { attributeFilter: ['class'] });
                }

                init();
            } else {
                sencon.initialized = false;
            }
        });
    }

    const pageProfileElement = document.body;
    sencon.template.docObserver.observe(pageProfileElement, { attributeFilter: ['class'] });

    const overviewElement = getOverviewTab(); // init if found
    if (sencon.template.overviewTab !== overviewElement) {
        sencon.template.overviewTab = overviewElement;
        sencon.template.docObserver.observe(sencon.template.overviewTab, { attributeFilter: ['class'] });
    }
    sencon.template.overviewTab = overviewElement;

    init();
}


if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', onPageInit);
} else {
    onPageInit();
}

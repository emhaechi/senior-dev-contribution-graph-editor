/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */


/**
 * Mocks dependencies, state and template as needed for the extension's scripts for tests.
 */
'use strict';

/** "browser" browser extension javascript api mock */
var browser = {
    storage: {
        /** "browser.storage.local" browser extension javascript api mock */
        local: {
            _mockItems: {},
            _changeListeners: [],
            onChanged: {
                addListener: function(callback) {
                    browser.storage.local._changeListeners.push(callback);
                },
                hasListener: function(callback) {
                    return browser.storage.local._changeListeners.some(function(cb) { return cb === callback; });
                },
                removeListener: function(callback) {
                    const i = browser.storage.local._changeListeners.findIndex(function(cb) { return cb === callback; });
                    if (i >= 0) {
                        browser.storage.local._changeListeners.splice(i, 1);
                    }
                }
            },
            get: function(key) {
                return new Promise(function(resolve, reject) {
                    resolve(browser.storage.local._mockItems[key] || {});
                });
            },
            set: function(object) {
                const changes = {};
                for (let prop in object) {
                    browser.storage.local._mockItems[prop] = {
                        [prop]: object[prop]
                    };
                    changes[prop] = {
                        newValue: object[prop]
                    };
                }
                return new Promise(function(resolve, reject) {
                    resolve();
                    for (let callback of browser.storage.local._changeListeners) {
                        callback(changes);
                    }
                });
            }
        }
    },
    runtime: {
        getManifest: function() {
            return {
                version: "1.0.0"
            };
        }
    }
};

/**
 * Removes the mock page profile (or the expected indication of it).
 */
function removePageProfileMock() {
    document.body.classList.remove('page-profile');
}

/**
 * Removes the mock contribution graph.
 */
function removeTemplateMock() {
    const graphContainerParent = document.getElementById('mock-graph');
    const graphContainer = graphContainerParent ? 
        graphContainerParent.getElementsByClassName('js-yearly-contributions')[0] :
        null;
    if (graphContainer) {
        graphContainerParent.removeChild(graphContainer);
    }
}

function selectNonOverviewTabMock() {
    document.getElementById('mock-overview-tab').classList.remove('selected');
    document.getElementById('mock-repo-tab').classList.add('selected');
}

function selectOverviewTabMock() {
    document.getElementById('mock-repo-tab').classList.remove('selected');
    document.getElementById('mock-overview-tab').classList.add('selected');
}

/** Mocks the page profile template (or the indication of it) for use in specs */
function setupPageProfileMock() {
    document.body.classList.add('page-profile');
}

/** Mocks the contribution graph template for use in specs for testing. */
function setupTemplateMock() {
    // set up page profile
    if (!document.body.classList.contains('page-profile')) {
        document.body.classList.add('page-profile');
    }

    // set up overview tab
    if (document.getElementById('mock-body-nav') == null) {
        const navParent = document.createElement('div');
        navParent.id = 'mock-body-nav';
        const nav = document.createElement('nav');
        nav.setAttribute('aria-label', 'User profile');
        const overviewTab = document.createElement('a');
        overviewTab.id = 'mock-overview-tab';
        overviewTab.dataset.tabItem = 'overview';
        overviewTab.classList.add('selected');
        overviewTab.innerText = 'Overview';
        const repositoriesTab = document.createElement('a');
        repositoriesTab.id = 'mock-repo-tab';
        repositoriesTab.dataset.tabItem = 'repositories';
        repositoriesTab.innerText = 'Repositories';
        nav.appendChild(overviewTab);
        nav.appendChild(repositoriesTab);
        navParent.appendChild(nav);
        document.body.appendChild(navParent);
    } else if (!document.getElementById('mock-overview-tab').classList.contains('selected')) {
        document.getElementById('mock-repo-tab').classList.remove('selected');
        document.getElementById('mock-overview-tab').classList.add('selected');
    }

    // set up contribution graph
    const graphContainerParent = document.getElementById('mock-graph') || document.createElement('div');
    graphContainerParent.id = 'mock-graph';
    graphContainerParent.innerHTML = `
        <div class="js-yearly-contributions">
            <table class="ContributionCalendar-grid" style="border-spacing:4px">
                <thead>
                </thead>
                <tbody>
                </tbody>
            </table>
        </div>
    `;

    const graphBody = graphContainerParent.querySelector('tbody');
    for (let i = 0; i < 7; i++) {
        const graphBodyRow = document.createElement('tr');
        graphBodyRow.style.height = '11px';
        // graphBodyRow.innerHTML = `<td class="ContributionCalendar-label">Day of the Week Name ${i}</td>`;
        graphBodyRow.insertAdjacentHTML('afterbegin', `<td class="ContributionCalendar-label">Day of the Week Name ${i}</td>`);
        for (let j = 0; j < 52; j++) {
            // graphBodyRow.innerHTML += `<td data-level="0" style="width:11px" class="ContributionCalendar-day"></td>`;
            graphBodyRow.insertAdjacentHTML('beforeend', `<td data-level="0" style="width:11px" class="ContributionCalendar-day"></td>`);
        }
        graphBody.appendChild(graphBodyRow);
    }

    if (document.getElementById('mock-graph') == null) {
        document.body.appendChild(graphContainerParent);
    }
}
setupTemplateMock();

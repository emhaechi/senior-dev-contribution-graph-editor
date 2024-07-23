/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */


/**
 * Mocks state and template as needed for the extension's specs for tests.
 */
'use strict';

/**
 * Mocks the contribution graph template rendered snapshots for manual 
 * visual verification as needed.
 */
function setupSnapshotFrameTemplateMock() {
    return new Promise(function(resolve, reject) {
        const printTemplateContainer = document.createElement('div');
        printTemplateContainer.id = 'print-template';
    
        const frameIndexDisplay = document.createElement('div');
        frameIndexDisplay.id = 'snapshot-frame-index';
        frameIndexDisplay.innerHTML = '#';
        printTemplateContainer.appendChild(frameIndexDisplay);
    
        const expectedFrameContainer = document.createElement('div');
        expectedFrameContainer.innerHTML = '<p>Expected Frame:</p>';
        const expectedFrame = document.createElement('iframe');
        expectedFrame.id = 'expected-frame';
        expectedFrame.width = '100%';
        expectedFrame.height = 200;
        expectedFrameContainer.appendChild(expectedFrame);
        printTemplateContainer.appendChild(expectedFrameContainer);
    
        const actualFrameContainer = document.createElement('div');
        actualFrameContainer.innerHTML = '<p>Actual Frame:</p>';
        const actualFrame = document.createElement('iframe');
        actualFrame.id = 'actual-frame';
        actualFrame.width = '100%';
        actualFrame.height = 200;
        actualFrameContainer.appendChild(actualFrame);
        printTemplateContainer.appendChild(actualFrameContainer);
    
        document.body.appendChild(printTemplateContainer);
        setTimeout(function() {
            const rootStyle = getComputedStyle(document.documentElement);

            expectedFrame.contentWindow.document.body.style = document.body.style;
            expectedFrame.contentWindow.document.head.innerHTML = document.head.innerHTML;
            expectedFrame.contentWindow.document.documentElement.style.setProperty('--sencon-color-fill-0', rootStyle.getPropertyValue('--sencon-color-fill-0'));
            expectedFrame.contentWindow.document.documentElement.style.setProperty('--sencon-color-fill-1', rootStyle.getPropertyValue('--sencon-color-fill-1'));
            expectedFrame.contentWindow.document.documentElement.style.setProperty('--sencon-color-fill-2', rootStyle.getPropertyValue('--sencon-color-fill-2'));
            expectedFrame.contentWindow.document.documentElement.style.setProperty('--sencon-color-fill-3', rootStyle.getPropertyValue('--sencon-color-fill-3'));
            expectedFrame.contentWindow.document.documentElement.style.setProperty('--sencon-color-fill-4', rootStyle.getPropertyValue('--sencon-color-fill-4'));
            actualFrame.contentWindow.document.head.innerHTML = document.head.innerHTML;
            actualFrame.contentWindow.document.documentElement.style.setProperty('--sencon-color-fill-0', rootStyle.getPropertyValue('--sencon-color-fill-0'));
            actualFrame.contentWindow.document.documentElement.style.setProperty('--sencon-color-fill-1', rootStyle.getPropertyValue('--sencon-color-fill-1'));
            actualFrame.contentWindow.document.documentElement.style.setProperty('--sencon-color-fill-2', rootStyle.getPropertyValue('--sencon-color-fill-2'));
            actualFrame.contentWindow.document.documentElement.style.setProperty('--sencon-color-fill-3', rootStyle.getPropertyValue('--sencon-color-fill-3'));
            actualFrame.contentWindow.document.documentElement.style.setProperty('--sencon-color-fill-4', rootStyle.getPropertyValue('--sencon-color-fill-4'));

            resolve();
        }, SENCON_CONSTANTS.delay);
    });
}

function displaySnapshotFrameTemplateMock(expectedFrameTemplate, snapshotFrameIndex) {

    document.getElementById('snapshot-frame-index').innerHTML = snapshotFrameIndex;
    document.getElementById('expected-frame').contentWindow.document.body.innerHTML = expectedFrameTemplate;

    const actualFrameTemplate = document.getElementById('mock-graph').outerHTML;
    document.getElementById('actual-frame').contentWindow.document.body.innerHTML = actualFrameTemplate;

    console.debug('[SENCON] - displaying actual frame#', snapshotFrameIndex);
    console.debug(actualFrameTemplate);
    return actualFrameTemplate;

}

/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */


describe('content-main', function() {

    beforeAll(function() {
        console.debug('// before all');
        this.requestAnimationFrameSpy = spyOn(window, 'requestAnimationFrame').and.callThrough();
    });

    beforeEach(function(done) {
        console.debug('// before each');
        setupTemplateMock();

        this.sencon = sencon;
        this.requestAnimationFrameSpy.and.callThrough();
        enableUpdates(true);

        setTimeout(done, SENCON_CONSTANTS.delay);
    });

    afterEach(function(done) {
        console.debug('// after each');
        this.requestAnimationFrameSpy.and.callThrough();
        enableUpdates(false);

        const options = SENCON_CONSTANTS.optionsDefault;
        browser.storage.local.set(options);

        setTimeout(done, SENCON_CONSTANTS.delay);
    });

    afterAll(function() {
        console.debug('// after all');
        enableUpdates(false);
        removeTemplateMock();
    });

    it(`should initialize successfully if graph found on page load and 
        on contribution graph template changes
    `, function() {
        // contribution graph template changes happen on year changes, 
        // interaction with the graph's cells, ...

        expect(this.sencon.initialized).toBeTrue();

        removeTemplateMock();
        return new Promise(function(resolve, reject) {
            setTimeout(resolve, SENCON_CONSTANTS.delay);
        }).then(function() {
            expect(this.sencon.initialized).toBeFalse();

            setupTemplateMock();
            return new Promise(function(resolve, reject) {
                setTimeout(resolve, SENCON_CONSTANTS.delay);
            });
        }).then(function() {
            expect(this.sencon.initialized).toBeTrue();
        });
    });

    it('should not be initialized if not on page profile or not on overview tab', function() {

        expect(this.sencon.initialized).toBeTrue();

        removePageProfileMock();
        return new Promise(function(resolve, reject) {
            setTimeout(resolve, SENCON_CONSTANTS.delay);
        }).then(function() {
            expect(this.sencon.initialized).toBeFalse();  

            setupPageProfileMock();
            return new Promise(function(resolve, reject) {
                setTimeout(resolve, SENCON_CONSTANTS.delay);
            });
        }).then(function() {
            expect(this.sencon.initialized).toBeTrue();

            selectNonOverviewTabMock();
            return new Promise(function(resolve, reject) {
                setTimeout(resolve, SENCON_CONSTANTS.delay);
            });
        }).then(function() {
            expect(this.sencon.initialized).toBeFalse();  

            selectOverviewTabMock();
            return new Promise(function(resolve, reject) {
                setTimeout(resolve, SENCON_CONSTANTS.delay);
            });
        }).then(function() {
            expect(this.sencon.initialized).toBeTrue();
        });
    });

    it('should default to colors mode', function() {
        return new Promise(function(resolve, reject) {
            setTimeout(resolve, SENCON_CONSTANTS.delay);
        }).then(function() {
            expect(this.sencon.options[SENCON_CONSTANTS.storageKey].settings.mode).toEqual(SENCON_CONSTANTS.senconMode.colors);
        });
    });

    /**
     * Note - This test uses a rendered snapshot testing technique like in jest
     * to verify the expected animation.
     */
    it('should animate the hori wave pattern correctly', function() {
        // alter rendering to unlock framerate
        cancelUpdate();
        this.requestAnimationFrameSpy.and.stub();
        enableUpdates(false);
        const options = SENCON_CONSTANTS.optionsDefault;
        options[SENCON_CONSTANTS.storageKey].settings.mode = SENCON_CONSTANTS.senconMode.animation;
        browser.storage.local.set(options);
        removeTemplateMock();
        return new Promise(function(resolve, reject) {
            setTimeout(resolve, SENCON_CONSTANTS.delay);
        }).then(function() {
            return new Promise(function(resolve, reject) {
                enableUpdates(true);
                setupTemplateMock();
                // delay to be added by snapshot frame template mock setup
                resolve();
            }).then(function() {
                return setupSnapshotFrameTemplateMock();
            });
        }).then(function() {
            expect(this.sencon.options[SENCON_CONSTANTS.storageKey].settings.mode).toEqual(SENCON_CONSTANTS.senconMode.animation);

            let currentSnapshotFrameIndexesIndex = 0;
            let currentSnapshotFrameIndex = mockHoriSnapshotFrameIndexes[currentSnapshotFrameIndexesIndex];
            const totalFrames = mockHoriSnapshotFrameIndexes[mockHoriSnapshotFrameIndexes.length-1];
            const actualFrames = [];
            for (let i = 0; i <= totalFrames; i++) {
                updateFrame(SENCON_CONSTANTS.frameUpdateSpeedMinimumChange * i);

                if (i === currentSnapshotFrameIndex) {
                    actualFrames.push(displaySnapshotFrameTemplateMock(mockHoriSnapshotFrames[currentSnapshotFrameIndexesIndex], mockHoriSnapshotFrameIndexes[currentSnapshotFrameIndexesIndex]));
                    currentSnapshotFrameIndex = mockHoriSnapshotFrameIndexes[++currentSnapshotFrameIndexesIndex];
                }
            }

            expect(actualFrames).toEqual(mockHoriSnapshotFrames);
        });
    });

});


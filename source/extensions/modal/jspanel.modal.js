/**
 * If option.dragit is enabled on a modal AND an already open panel has option.syncMargins set to true the modal somehow inherits
 * the option.dragit.containment setting of the already open panel. Reason unknown!
 * Workaround: Set option.dragit.containment to a suitable value on the modal.
 */

if (!jsPanel.modal) {

    jsPanel.modal = {

        version: '1.2.5',
        date: '2020-04-26 23:23',

        defaults: {
            closeOnEscape:  true,
            closeOnBackdrop:true,
            dragit:         false,
            headerControls: 'closeonly',
            resizeit:       false,
            syncMargins:    false
        },

        /**
        * Create a backdrop element with this id
        **/
        createBackdrop(id) {
            let modalCount = document.getElementsByClassName('jsPanel-modal-backdrop').length,
                mb = document.createElement('div');
            mb.id = 'jsPanel-modal-backdrop-' + id;
            if (modalCount === 0) {
                mb.className = 'jsPanel-modal-backdrop';
            } else if (modalCount > 0) {
                mb.className = 'jsPanel-modal-backdrop jsPanel-modal-backdrop-multi';
            }
            mb.style.zIndex = this.ziModal.next();
            return mb;
        },

        /**
        * Create a backdrop element with this id and append it to DOM
        **/
        addBackdrop(id) {
          var backdrop = this.createBackdrop(id);
          document.body.append(backdrop);
          return backdrop;
        },

        /**
        * Get existing backdrop element with this id
        **/
        getBackdrop(id) {
          return document.getElementById(`jsPanel-modal-backdrop-${id}`);
        },

        /**
        * Delete backdrop element with this id
        */
        removeBackdrop(id) {
            let mb = this.getBackdrop(id);
            if(!mb) { return; }
            mb.classList.add('jsPanel-modal-backdrop-out');
            let delay = parseFloat(getComputedStyle(mb).animationDuration) * 1000;
            window.setTimeout(function() {
                document.body.removeChild(mb);
            }, delay);
        },

        /**
        * Plug all events related to backdrop cancel action.
        * @param modal Current modal
        * @param backdrop backdrop element
        */
        enableCloseOnBackdrop(modal, backdrop) {
          jsPanel.pointerup.forEach(function (evt) {
              backdrop.addEventListener(evt, function () {
                  modal.close.call(modal, null, true);
              });
          });
        },

        create(options = {}) {
            options.paneltype = 'modal';
            if (!options.id) {
                options.id = `jsPanel-${jsPanel.idCounter += 1}`;
            } else if (typeof options.id === 'function') {
                options.id = options.id();
            }

            let opts = options;
            let backdrop;
            if(opts.setStatus !== 'minimized') {
              backdrop = this.addBackdrop(opts.id);
            }
            if (options.config) {
                opts = Object.assign({}, options.config, options);
                delete opts.config;
            }
            opts = Object.assign({}, this.defaults, opts, {container: 'window'});

            return jsPanel.create(opts, modal => {
                modal.style.zIndex = jsPanel.modal.ziModal.next();
                modal.header.style.cursor = 'default';
                modal.footer.style.cursor = 'default';
                // close modal on click in backdrop
                if (opts.setStatus !== 'minimized' && opts.closeOnBackdrop) {
                  this.enableCloseOnBackdrop(modal, backdrop);
                }
                // remove modal backdrop when modal is closed
                // callback should be the first item in the onclosed array
                modal.options.onclosed.unshift(function() {
                    jsPanel.modal.removeBackdrop(opts.id);
                    // must return true in order to have the next callbacks (added via modal config) in the array execute as well
                    return true;
                });

                modal.options.onminimized.unshift(function() {
                    jsPanel.modal.removeBackdrop(opts.id);
                    // must return true in order to have the next callbacks (added via modal config) in the array execute as well
                    return true;
                });

                modal.options.onnormalized.unshift(function() {
                    backdrop = jsPanel.modal.getBackdrop(opts.id);
                    if(!!backdrop) {
                      return;
                    }
                    backdrop = jsPanel.modal.addBackdrop(opts.id);
                    modal.style.zIndex = jsPanel.modal.ziModal.next();
                    if (opts.closeOnBackdrop) {
                      this.enableCloseOnBackdrop(modal, backdrop);
                    }
                    // must return true in order to have the next callbacks (added via modal config) in the array execute as well
                    return true;
                });
            });
        }
    };

    jsPanel.modal.ziModal = (() => {
        let val = jsPanel.ziBase + 10000;
        return {
            next: function() {
                return val++;
            }
        };
    })();

}

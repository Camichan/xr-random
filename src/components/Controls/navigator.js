/* global AFRAME */
if (typeof AFRAME === 'undefined') {
    throw new Error('Component attempted to register before AFRAME was available.');
}

AFRAME.registerComponent('navigator', {
    schema: {},

    /**
    * Set if component needs multiple instancing.
    */
    multiple: false,
    isPaused: undefined,
    sliderEl: undefined,
    toPresent: undefined,
   
    /**
     * Initial creation and setting of the mesh.
     */
    init: function () {
        this.toPresent = true
        this.isPaused = false

        // NEED: wait for 'babiaSelectorDataReady'
        this.el.addEventListener('babiaSelectorDataReady', _listener = (e) => {
            this.initializeControls();
            toTest(this)
        });


        // Listener of the other events (should be re-sended to selector)
        let events = ['babiaContinue', 'babiaStop', 'babiaToPresent', 'babiaToPast', 'babiaSpeedUpdated', 'babiaSetPosition']
        events.forEach(evt => {
            this.el.addEventListener(evt, _listener = (e) => {
                // Re-send event
                console.log('Re-emit... ', evt)

                // TO TEST FUNCIONALITIES
                if(evt === 'babiaContinue'){
                    this.isPaused = false
                } else if (evt === 'babiaStop'){
                    this.isPaused = true
                }

                if(evt === 'babiaToPresent'){
                    this.toPresent = true
                } else if (evt === 'babiaToPast'){
                    this.toPresent = false
                }
            });
        })

        let skip_events = ['babiaSkipNext', 'babiaSkipPrev']
        skip_events.forEach (evt => {
            this.el.addEventListener(evt, _listener = (e) => {
                // Update Slider
                this.isPaused = true
                this.updateSlider(evt)
            });
        })
    },

    /**
    * Called when component is attached and when component data changes.
    * Generally modifies the entity based on the data.
    */

    update: function (oldData) {
        // To Test
        this.el.emit('babiaSelectorDataReady')
    },

    initializeControls: function(){
        //console.log(e.detail)
        // Get selector data

        // Initialize Slider
        this.sliderEl = document.createElement('a-entity');
        this.sliderEl.setAttribute('my-slider', {
            size: 1.5,
            min: 0,
            max: 10,
            value: 5
        }); // When implement with selector, add the attributes
        this.sliderEl.classList.add("babiaxraycasterclass");
        this.sliderEl.id = "timeline"
        this.sliderEl.setAttribute('scale', {x:2.3, y:2.3, z:2.3})
        this.el.appendChild(this.sliderEl);

        // Initialize Controls
        let controlsEl = document.createElement('a-entity');
        controlsEl.setAttribute('navigation-bar', ""); 
        controlsEl.classList.add("babiaxraycasterclass");
        controlsEl.setAttribute('scale', {x:0.15, y:0.15, z:0.3})
        controlsEl.object3D.position.y = -0.5;
        this.el.appendChild(controlsEl);

        // Initialize Speed Controller

    },

    updateSlider: function(evt){
        let value = this.sliderEl.getAttribute('my-slider').value
        if (evt ==='babiaSkipNext'){
            value++
        } else if (evt === 'babiaSkipPrev'){
            value--
        }
        // Out of range
        if ((value >= 0) && (value <= 10)){
            this.sliderEl.setAttribute('my-slider', 'value', value)
        } else {
            this.el.querySelector('.babiaPause').emit('click')
        }
    },

})

function toTest(self){
    setInterval(() => {
        let evt
        if (self.sliderEl) {
            if (!self.isPaused){
                if(self.toPresent){
                    evt = 'babiaSkipNext'
                } else {
                    evt = 'babiaSkipPrev'
                }
                self.updateSlider(evt)
            }
        }
    }, 3000);
}
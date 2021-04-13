/* global AFRAME */
if (typeof AFRAME === 'undefined') {
    throw new Error('Component attempted to register before AFRAME was available.');
}

const colors = {
    'palettes': {
        "blues": ["#142850", "#27496d", "#00909e", "#dae1e7"],
        "foxy": ["#f79071", "#fa744f", "#16817a", "#024249"],
        "flat": ["#120136", "#035aa6", "#40bad5", "#fcbf1e"],
        "sunset": ["#202040", "#543864", "#ff6363", "#ffbd69"],
        "bussiness": ["#de7119", "#dee3e2", "#116979", "#18b0b0"],
        "icecream": ["#f76a8c", "#f8dc88", "#f8fab8", "#ccf0e1"],
        "ubuntu": ["#511845", "#900c3f", "#c70039", "#ff5733"],
        "pearl": ["#efa8e4", "#f8e1f4", "#fff0f5", "#97e5ef"],
        "commerce": ["#222831", "#30475e", "#f2a365", "#ececec"]    
    },
    'get': function (i, palette) {
        let length = this.palettes[palette].length;
        return this.palettes[palette][i%length];
    }
};

/*
 * BabiaXR Label component
 *
 * Builds a label, usually to show data for a chart element
 */
AFRAME.registerComponent('babia-label', {
    schema: {
        // Text to show in the label
        text: { type: 'string' },
        // Label height
        height: { type: 'number', default: 1 },
        // Label width
        width: { type: 'number', default: 3 },
        // Text width
        textWidth: { type: 'number', default: 6 },
        // Text color
        color: { type: 'color', default: 'white' },
        // Text font
        font: {type: 'string', default: 'default'},
        // Background color
        background: { type: 'color', default: 'black' },
        // Align text
        align: { type: 'string', default: 'center' }
    },

    update: function (oldData) {
        console.log("Starting label...")
        this.el.setAttribute('geometry', {
            'primitive': 'plane',
            'height': this.data.height,
            'width': this.data.width
        });
        this.el.setAttribute('material', {
            'color': this.data.color
        });
        this.el.setAttribute('text', {
            'value': this.data.text,
            'align': this.data.align,
            'width': this.data.textWidth,
            'color': this.data.background
        });
        this.el.classList.add("babiaxrLegend")
        }
});

/*
 * Class for building axis (x, y, or z), with labels and everything
 */
class Axis {
    /*
    * @param el Element
    * @param axis Axis ('x´, 'y', 'z')
    * @param anim Is done with animation?
    * @param dur Duration of the animation
    */
    constructor(el, axis, anim, dur) {
        this.el = el;
        this.axis = axis;
        this.anim = anim;
        this.dur = dur;
    }
    /*
    * Update axis line
    *
    * @param length Lenght of axis line
    * @param color Color of axis line
    */
    updateLine(length, color) {
        const axis = this.axis;
        const el = this.el;
        const anim = this.anim;
        const dur = this.dur;

        const comp = `line__${axis}axis`
        let lineEl = el.components[comp];
        let end = { x: 0, y: 0, z: 0};
        end[axis] = length;

        if (anim && lineEl) {
            el.setAttribute(`animation__${axis}axis`, {
                'property': `${comp}.end`,
                'to': end,
                'dur': dur
            });
            el.setAttribute(comp, { 'color': color });
        } else {
            el.setAttribute(comp, {
                'start': { x: 0, y: 0, z: 0 },
                'end': end,
                'color': color
            });
        };

    };

    /*
    * Remove labels which are children of an element
    *
    * @param el Element
    * @param anim Is done with animation?
    * @param dur Duration of the animation
    */
    removeLabels() {
        const el = this.el;
        const anim = this.anim;
        const dur = this.dur;
        
        let labels = el.querySelectorAll('[text]');
        for (const label of labels) {
            if (anim) {
                label.addEventListener('animationcomplete', function (e) {
                    e.target.remove();
                });
                label.setAttribute('animation', {
                    'property': 'text.opacity',
                    'to': 0,
                    'dur': dur
                });
            } else {
                label.remove();
            }
        };
    };

    /*
    * Update labels
    *
    * @param ticks Points in the axis for the labels
    * @param labels Labels to write in the ticks
    * @param color Color to use
    * @param palette Palette of colors to use
    */
    updateLabels(ticks, labels, color, palette) {
        const axis = this.axis;
        let el = this.el;
        const anim = this.anim;
        const dur = this.dur;
        
        for (let i = 0; i < ticks.length; ++i) {
            let label = document.createElement('a-entity');
            let icolor = color;
            if (palette) {
                icolor = colors.get(i, palette);
            };
            label.setAttribute('text', {
                'value': labels[i],
                'align': 'right',
                'width': 10,
                'color': icolor,
                'opacity': 0
            });
            let pos;
            if (axis === 'x') {
                pos = { x: ticks[i], y: 0, z: 5 };
            } else if (axis === 'y') {
                pos = { x: - 5.2, y: ticks[i], z: 0 };
            }
            label.setAttribute('position', pos);
            if (axis === 'x') {
                label.setAttribute('rotation', { x: -90, y: 90, z: 0 });
            };
            if (anim) {
                label.setAttribute('animation', {
                    'property': 'text.opacity',
                    'to': 1,
                    'dur': dur
                });
            } else {
                label.setAttribute('text', {'opacity': 1})
            };
            el.appendChild(label);
        };
    };
}

 /*
 * BabiaXR Y Axis component
 *
 * Builds a Y axis for a chart
 */
AFRAME.registerComponent('babia-axis-y', {
    schema: {
        // Max value to show for this axis
        maxValue: { type: 'number' },
        // Length of the axis
        length: { type: 'number' },
        // Minimum number of steps
        minSteps: { type: 'number', default: 6 },
        // Color for axis and labels
        color: { type: 'color', default: '#000' },
        // Should this be animated
        animation: { type: 'boolean', default: true},
        // Duration of animations
        dur: { type: 'number', default: 2000}
    },

    init: function() {
        this.axis = new Axis(this.el, 'y', this.data.animation, this.data.dur);
    },

    update: function (oldData) {
        const data = this.data;
        let maxValue = this.data.maxValue;
        let length = this.data.length;
        let minSteps = this.data.minSteps;
        const animation = this.data.animation;
        const dur = this.data.dur;
        let decimals = 0;
        console.log('Starting babia-axis-y:', maxValue, length, this.data.color);

        if ((maxValue != oldData.maxValue) || (length != oldData.maxValue) ||
            (minSteps != oldData.minSteps)) {
            // Get number of significant digits (negative is decimals)
            let maxValueLog = Math.floor(Math.log10(maxValue));
            if (maxValueLog <= 0) {
                decimals = - maxValueLog + 1;
            };
            let axisScale = length / maxValue;
            let step = Math.pow(10, maxValueLog);
            let steps = maxValue / step;
            while (steps <= minSteps) {
                step = step / 2;
                steps = maxValue / step;
            };

            // Set axis line
            this.axis.updateLine(length, data.color);
            // Remove old labels
            this.axis.removeLabels();

            // Create new labels
            let ticks = [];
            let labels = [];
            for (let tick = 1; step * tick < maxValue; tick++) {
                vtick = step * tick;
                ticks.push(vtick * axisScale);
                labels.push(vtick.toFixed(decimals));
            };
            this.axis.updateLabels(ticks, labels, data.color, data.palette);
        };
    }
});      

/*
 * BabiaXR X Axis component
 *
 * Builds a X axis for a chart
 */
AFRAME.registerComponent('babia-axis-x', {
    schema: {
        // Labels to show (list)
        labels: { type: 'array' },
        // Points to have labels in the axis
        ticks: { type: 'array'},
        // Length of the axis
        length: { type: 'number' },
        // Color for axis and labels
        color: { type: 'color', default: '#000' },
        // Color palette (if not 'None', have precedence over color)
        palette: { type: 'string', default: '' },
        // Should this be animated
        animation: { type: 'boolean', default: true},
        // Duration of animations
        dur: { type: 'number', default: 2000}
    },

    init: function() {
        this.axis = new Axis(this.el, 'x', this.data.animation, this.data.dur);
    },

    update: function (oldData) {
        const data = this.data;
        console.log('Starting babia-axis-x:');

         // Set axis line
        this.axis.updateLine(data.length, data.color);
        // Remove old labels
        this.axis.removeLabels();
        // Update labels with new values
        this.axis.updateLabels(data.ticks, data.labels, data.color, data.palette);
     }

});

/*
 * BabiaXR Bar component
 *
 * Builds a bar (usually for the bar chart)
 */
AFRAME.registerComponent('babia-bar', {
    schema: {
        // Height of the bar
        height: { type: 'number' },
        // Width of the bar
        width: { type: 'number' },
        // Depth of the bar
        depth: { type: 'number' },
        // Color for axis and labels
        color: { type: 'color', default: '#000' },
        // Should this be animated
        animation: { type: 'boolean', default: true},
        // Duration of animations
        dur: { type: 'number', default: 2000},
        // Label for the bar ('', 'fixed', 'events')
        label: { type: 'string', default: ''},
        // Label text (valid if label is not empty)
        labelText: { type: 'string', default: ''}
    },

    init: function() {
        console.log("Starting bar:", this.data.height, this.data.color);
        let data = this.data;
        this.box = document.createElement('a-entity');
        this.el.appendChild(this.box);
        let props = {}
        if (data.animation) {
            props = {'height': 0, 'width': data.width, 'depth': data.depth};
        } else {
            props = {'height': data.height, 
                'width': data.width,
                'depth': data.depth};
        }
        this.box.setAttribute('geometry', {
            'primitive': 'box',
            'height': props.height,
            'width': props.width,
            'depth': props.depth
        });
        this.box.setAttribute('material', {
            'color': data.color
        });
    },

    update: function (oldData) {
        let data = this.data;
        let box = this.box;

        this.updateProperty(box, 'geometry', 'height', data.animation,
            data['height'], oldData.height);
        if (data.height != oldData.height) {
            // If there is change in height, update position
            if (data.animation) {
                box.setAttribute('animation__pos', {
                    'property': 'position',
                    'to': { x: 0, y: data.height/2, z:0 },
                    'dur': data.dur
                });
            } else {
                box.setAttribute('position', { x: 0, y: data.height/2, z: 0 });
            };
        };
        this.updateProperty(box, 'geometry', 'width', data.animation,
            data.width, oldData.width);
        this.updateProperty(box, 'geometry', 'depth', data.animation,
            data.depth, oldData.depth);
        this.updateProperty(box, 'material', 'color', data.animation,
            data.color, oldData.color);
        if (this.data.label === 'events') {
            box.addEventListener('mouseenter', this.showLabel.bind(this)); 
            box.addEventListener('mouseleave', this.hideLabel.bind(this));          
        } else if (this.data.label === 'fixed') {
            this.showLabel(oldData);
        };
    },

    /*
     * Update a property in an element, having animation into account
     *
     * @param el Element
     * @param component Component in which to update property
     * @param property Property to update in element
     * @param name: Property name in data, oldData
     * @param oldValue: Old value
     */
    updateProperty: function (el, component, property, anim, newValue, oldValue) {
        let data = this.data;

        if (newValue !== oldValue) {
            if (anim) {
                let prop = component;
                if (property) { prop = prop + '.' + property };
                el.setAttribute('animation__'+component+'_'+property, {
                    'property': prop,
                    'to': newValue,
                    'dur': data.dur
                });
            } else {
                if (property) {
                    el.setAttribute(component, { [property]: newValue });        
                } else {
                    el.setAttribute(component, newValue);
                }
            };
        };
    },

    showLabel: function (oldData) {
        let data = this.data;

        if (data.label === 'events') {
            this.el.setAttribute('scale', { x: 1.1, y: 1.1, z: 1.1 });
        };

        text = data.labelText;
        let width = 2;
        if (text.length > 16) { width = text.length / 8 };
        let height = 1;
        oldHeight = oldData.height || 0;
        oldDepth = oldData.depth || 0;
        let oldPosition = {
            x: 0, y: oldHeight + 0.6 * height,
            z: 0
        }

        if (!this.labelEl) {
            this.labelEl = document.createElement('a-entity');
            this.labelEl.setAttribute('babia-label', {
                'width': width, 'textWidth': 6
            });
            if (data.animation && (data.label === 'fixed')) {
                this.labelEl.setAttribute('position', oldPosition);
            };
            this.el.appendChild(this.labelEl);
        };

        let position = {
            x: 0, y: data.height + 0.6 * height,
            z: 0.7 * data.depth
        };

        let anim = data.animation && (data.label === 'fixed');
        this.updateProperty(this.labelEl, 'position', '', anim, position, oldPosition);
        this.labelEl.setAttribute('rotation', {x: 0, y: 0, z: 0});
        if (text != oldData.labelText) {
            this.labelEl.setAttribute('babia-label', { 'text': data.labelText });
        }

    },

    hideLabel: function () {
        if (this.data.label === 'events') {
            this.el.setAttribute('scale', { x: 1, y: 1, z: 1 });
        };
        if (this.labelEl) {
            this.el.removeChild(this.labelEl);
            this.labelEl = null;
        }
    }
});


/**
* A-Charts component for A-Frame.
*/
AFRAME.registerComponent('babiaxr-simplebarchart', {
    schema: {
        data: { type: 'string' },
        height: { type: 'string', default: 'height' },
        x_axis: { type: 'string', default: 'x_axis' },
        from: { type: 'string' },
        legend: { type: 'boolean', default: false },
        axis: { type: 'boolean', default: true },
        palette: { type: 'string', default: 'ubuntu' },
        title: { type: 'string' },
        titleFont: { type: 'string' },
        titleColor: { type: 'string' },
        titlePosition: { type: 'vec3', default: {x: 0, y: 0, z: 0} },
        scale: { type: 'number' },
        // Height of the chart
        chartHeight: { type: 'number', default: 10 },
        // Keep height when updating data
        keepHeight: { type: 'boolean', default: true},
        // Should this be animated
        animation: { type: 'boolean', default: true},
        // Duration of animations
        dur: { type: 'number', default: 2000},
        
    },

//    dependencies: ['babiaxr-querier_json'],

    /**
     * List of visualization properties
     */
    visProperties: ['height', 'x_axis'],

    /**
    * Set if component needs multiple instancing.
    */
    multiple: false,

    /**
    * Called once when component is attached. Generally for initial setup.
    */
    init: function () {
        // Build chartEl
        this.chartEl = document.createElement('a-entity');
        this.chartEl.classList.add('babiaxrChart')
        this.el.appendChild(this.chartEl);
        // Build titleEl
        this.titleEl = document.createElement('a-entity');
        this.titleEl.classList.add("babiaxrTitle")
        this.el.appendChild(this.chartEl);
    },

    /**
    * Called when component is attached and when component data changes.
    * Generally modifies the entity based on the data.
    */

    update: function (oldData) {
        const self = this;
        let data = this.data;
        let el = this.el;

        console.log("Starting Bars");
        this.animation = data.animation
        this.bar_array = []

        // Load data, or set event handler for when the data is ready in other component
        result = this.loadData(oldData);
        if (result === "Ready") {
            // Data is ready, build chart
            this.updateChart();
            // Dispatch events because I updated my visualization
            dataReadyToSend("babiaData", self);
        };
    },

    /**
    * Called when a component is removed (e.g., via removeAttribute).
    * Generally undoes all modifications to the entity.
    */
    remove: function () { },

    /**
    * Querier component target
    */
    dataComponent: undefined,

    /**
     * Property of the querier where the data is saved
     */
    dataComponentDataPropertyName: "babiaData",

    /**
     * Event name to difference between querier and filterdata
     */
    dataComponentEventName: undefined,


    /**
     * Where the data is gonna be stored
     */
    babiaData: undefined,

    /**
     * Where the metaddata is gonna be stored
     */
    babiaMetadata: {
        id: 0
    },

    /**
     * Bars width
     */
    widthBars: 1,

    /**
     * Proportion of the bars
     */
    proportion: undefined,

    /**
     * Value max
     */
    valueMax: undefined,

    /**
    * Register function when I'm updated
    */
    register: function (interestedElem) {
        let el = this.el
        this.interestedElements.push(interestedElem)

        // Send the latest version of the data
        if (this.babiaData) {
            dispatchEventOnElement(interestedElem, "babiaData")
        }
    },

    /**
     * Unregister function when I'm updated
     */
    unregister: function (interestedElem) {
        const index = this.interestedElements.indexOf(interestedElem)

        // Remove from the interested elements if still there
        if (index > -1) {
            this.interestedElements.splice(index, 1);
        }
    },

    /**
     * Interested elements when I'm updated
     */
    interestedElements: [],

    /**
     * Load data from the different possible sources
     * @param {*} oldData - Previous data attribute
     * @return {string} Data loaded ("Ready") or handler prepared ("Waiting")
     * 
     * Data is loaded in this.babiaData
     * Precedence: data attribute, else component in same element, else other component
     */
    loadData: function (oldData) {
        let el = this.el;
        let data;

        if (this.data.data && oldData.data !== this.data.data) {
            // Data in data argument, load it
            console.log("Data in data argument");
            data = this.data.data;
            if (typeof(data) === 'string' || data instanceof String) {
                this.babiaData = JSON.parse(data);
            } else {
                this.babiaData = data;
            };
            self.babiaMetadata = { id: this.babiaMetadata.id++ };
            return "Ready";
        } else if (this.data.from !== oldData.from) {
            // From changed, re-register to the new data component
            // Unregister for old querier
            if (this.dataComponent) { this.dataComponent.unregister(el) };
            // Find the new component and check if querier or filterdata from the event               
            let eventName = findDataComponent(this.data, el, this)
            // If changed to filterdata or to querier
            if (this.dataComponentEventName && this.dataComponentEventName !== eventName) {
                el.removeEventListener(this.dataComponentEventName, _listener, true)
            }
            // Assign new eventName
            this.dataComponentEventName = eventName

            // Attach to the events of the data component
            el.addEventListener(this.dataComponentEventName, _listener = (e) => {
                attachNewDataEventCallback(this, e);
            });

            // Register for the new one
            this.dataComponent.register(el);
            return "Waiting";
        }
    },

    /*
     * Update title
     */
    updateTitle: function() {
        const titleEl = this.titleEl;
        const data = this.data;

        titleEl.setAttribute('text-geometry', {'value': data.title});
        if (data.font) titleEl.setAttribute('text-geometry', {'font': data.titleFont});
        if (data.color) titleEl.setAttribute('material', {'color': data.titleColor});
        titleEl.setAttribute('position', data.titlePosition);
        titleEl.setAttribute('rotation', { x: 0, y: 0, z: 0 });
    },

    /*
     * Update axis
     */
    updateAxis: function(labels, ticks, lengthX, maxValue) {
        const data = this.data;
        if (data.axis) {
            if (!this.xAxisEl) {
                this.xAxisEl = document.createElement('a-entity');
                this.chartEl.appendChild(this.xAxisEl);
            };
            this.xAxisEl.setAttribute('babia-axis-x',
                {'labels': labels, 'ticks': ticks, 'length': lengthX,
                 'palette': data.palette});
            this.xAxisEl.setAttribute('position', {
                x: 0, y: 0, z: this.widthBars/2
            });

            if (!this.yAxisEl) {
                this.yAxisEl = document.createElement('a-entity');
                this.chartEl.appendChild(this.yAxisEl);
            };
            this.yAxisEl.setAttribute('babia-axis-y',
                {'maxValue': maxValue, 'length': this.lengthY});
            this.yAxisEl.setAttribute('position', {
                x: -this.widthBars/2, y: 0, z: this.widthBars/2
            });
        }
    },

    /*
     * Build chart
     * @return {} Data loaded
     * 
     */
    updateChart: function () {
        console.log("updateChart:", this.babiaData);

        const el = this.el;
        const data = this.data;

        const babiaData = this.babiaData;
        const widthBars = this.widthBars;
        const palette = data.palette
        const scale = data.scale
        
        // Update title
        this.updateTitle();

        let maxValue = Math.max.apply(Math, babiaData.map(function (o) {
            return o[data.height];
        }));

        if (!this.lengthY) {
            this.lengthY = data.chartHeight;
        } else if (!data.keepHeight) {
            this.lengthY = this.lengthY * maxValue / this.maxValue;
        };
        this.maxValue = maxValue;

        let xLabels = [];
        let xTicks = [];
        let colorId = 0

        let chartEl = this.chartEl;
        for (let i = 0; i < babiaData.length; i++) {
            let item = babiaData[i]
 
            // Build bar
            xLabel = item[data.x_axis];
            let posX = i * widthBars * 1.25;
            let barEl = chartEl.querySelector('a-entity[babia-bar][babia-name="'+xLabel+'"]');
            if (!barEl) {
                barEl = document.createElement('a-entity');
                barEl.setAttribute('babia-name', xLabel);
                barEl.classList.add("babiaxraycasterclass");
                barEl.object3D.position.x = posX;
                chartEl.appendChild(barEl);
            };
            barEl.setAttribute('babia-bar', {
                'height': item[data.height] * this.lengthY / maxValue,
                'width': widthBars,
                'depth': widthBars,
                'color': colors.get(colorId, palette),
                'label': 'events'
            });
            if (data.legend) {
                barEl.setAttribute('babia-bar', {
                    'labelText': xLabel + ': ' + item[data.height]
                });
            };
            console.log("Position:", posX, barEl.getAttribute('position')['x']);
            if (posX !== barEl.object3D.position.x) {
                if (data.animation) {
                    console.log("Setting position anim:", posX, barEl.object3D.position.x)
                    barEl.setAttribute('animation', {
                        'property': 'object3D.position.x',
                        'to': posX,
                        'dur': data.dur
                    });
                    console.log(barEl);
                } else {
                    console.log("Setting position")
                    barEl.object3D.position.x = posX;
                };
            }

            xLabels.push(item[data.x_axis]);
            xTicks.push(posX);

            colorId++
        }

        //Print axis
        const lengthX = widthBars * (babiaData.length * 1.25 + 0.75);
        this.updateAxis(xLabels, xTicks, lengthX, maxValue);
    },
})

let findDataComponent = (data, el, self) => {
    let eventName = "babiaQuerierDataReady"
    if (data.from) {
        // Save the reference to the querier or filterdata
        let dataElement = document.getElementById(data.from)
        if (dataElement.components['babiaxr-filterdata']) {
            self.dataComponent = dataElement.components['babiaxr-filterdata']
            eventName = "babiaFilterDataReady"
        } else if (dataElement.components['babiaxr-querier_json']) {
            self.dataComponent = dataElement.components['babiaxr-querier_json']
        } else if (dataElement.components['babiaxr-querier_es']) {
            self.dataComponent = dataElement.components['babiaxr-querier_es']
        } else if (dataElement.components['babiaxr-querier_github']) {
            self.dataComponent = dataElement.components['babiaxr-querier_github']
        } else {
            console.error("Problem registering to the querier")
            return
        }
    } else {
        // Look for a querier or filterdata in the same element and register
        if (el.components['babiaxr-filterdata']) {
            self.dataComponent = el.components['babiaxr-filterdata']
            eventName = "babiaFilterDataReady"
        } else if (el.components['babiaxr-querier_json']) {
            self.dataComponent = el.components['babiaxr-querier_json']
        } else if (el.components['babiaxr-querier_es']) {
            self.dataComponent = el.components['babiaxr-querier_es']
        } else if (el.components['babiaxr-querier_github']) {
            self.dataComponent = el.components['babiaxr-querier_github']
        } else {
            // Look for a querier or filterdata in the scene
            if (document.querySelectorAll("[babiaxr-filterdata]").length > 0) {
                self.dataComponent = document.querySelectorAll("[babiaxr-filterdata]")[0].components['babiaxr-filterdata']
                eventName = "babiaFilterDataReady"
            } else if (document.querySelectorAll("[babiaxr-querier_json]").length > 0) {
                self.dataComponent = document.querySelectorAll("[babiaxr-querier_json]")[0].components['babiaxr-querier_json']
            } else if (document.querySelectorAll("[babiaxr-querier_json]").length > 0) {
                self.dataComponent = document.querySelectorAll("[babiaxr-querier_es]")[0].components['babiaxr-querier_es']
            } else if (document.querySelectorAll("[babiaxr-querier_github]").length > 0) {
                self.dataComponent = document.querySelectorAll("[babiaxr-querier_github]")[0].components['babiaxr-querier_github']
            } else {
                console.error("Error, querier not found")
                return
            }
        }
    }
    return eventName
}

let attachNewDataEventCallback = (self, e) => {
    // Get the data from the info of the event (propertyName)
    self.dataComponentDataPropertyName = e.detail
    let rawData = self.dataComponent[self.dataComponentDataPropertyName]

    self.babiaData = rawData
    self.babiaMetadata = {
        id: self.babiaMetadata.id++
    }

    // Generate chart
    while (self.el.firstChild)
        self.el.firstChild.remove();
//    self.chart = generateBarChart(self, self.data, rawData, self.el, self.animation, self.chart, self.bar_array, self.widthBars)
    self.updateChart();
    // Dispatch interested events because I updated my visualization
    dataReadyToSend("babiaData", self)
}


let dataReadyToSend = (propertyName, self) => {
    self.interestedElements.forEach(element => {
        dispatchEventOnElement(element, propertyName)
    });
}

let dispatchEventOnElement = (element, propertyName) => {
    element.emit("babiaVisualizerUpdated", propertyName)
}

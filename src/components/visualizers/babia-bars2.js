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
        color: { type: 'color', default: '#000' }
    },

    update: function (oldData) {
        let maxValue = this.data.maxValue;
        let length = this.data.length;
        let decimals = 0;
        console.log('Starting babia-axis-y:', maxValue, length, this.data.color);

        // Get number of significant digits (negative is decimals)
        let maxValueLog = Math.floor(Math.log10(maxValue));
        if (maxValueLog <= 0) {
            decimals = - maxValueLog + 1;
        };
        let axisScale = length / maxValue;
        let step = Math.pow(10, maxValueLog);
        let steps = maxValue / step;
        while (steps <= this.data.minSteps) {
            step = step / 2;
            steps = maxValue / step;
        };

        this.el.setAttribute('line__yaxis', {
            'start': { x: 0, y: 0, z: 0 },
            'end': { x: 0, y: length, z: 0 },
            'color': this.data.color
        });

        for (let tick = 1; step * tick < maxValue; tick++) {
            let value = step * tick;
            let pos = value * axisScale;

            let label = document.createElement('a-entity');
            label.setAttribute('text', {
                'value': value.toFixed(decimals),
                'align': 'right',
                'width': 10,
                'color': this.data.color
            });
            label.setAttribute('position', 
                { x: - 5.2, y: pos, z: 0 });
            this.el.appendChild(label)
        }    
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
        palette: { type: 'string', default: '' }
    },

    update: function (oldData) {
        let length = this.data.length;
        let labels = this.data.labels;
        let ticks = this.data.ticks;
        let color = this.data.color;
        let palette = this.data.palette;
        console.log('Starting babia-axis-x:', length, color, labels);

        this.el.setAttribute('line__xaxis', {
            'start': { x: 0, y: 0, z: 0 },
            'end': { x: length, y: 0, z: 0 },
            'color': color
        });

        for (let i = 0; i < ticks.length; ++i) {
            let label = document.createElement('a-entity');
            if (palette !== '') {
                color = colors.get(i, palette);
            };
            label.setAttribute('text', {
                'value': labels[i],
                'align': 'right',
                'width': 10,
                'color': color
            });
            label.setAttribute('position', 
                { x: ticks[i], y: 0, z: 5 });
            label.setAttribute('rotation', { x: -90, y: 90, z: 0 });
            this.el.appendChild(label);
        };
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
        // Label for the bar ('', 'fixed', 'events')
        label: { type: 'string', default: ''},
        // Label text (valid if label is not empty)
        labelText: { type: 'string', default: ''}
    },

    update: function (oldData) {
        console.log("Starting bar:", this.data.height, this.data.color);
        let self = this;
        while (self.el.firstChild)
            self.el.firstChild.remove();
        let box = document.createElement('a-entity');
        box.setAttribute('material', { 'color': this.data.color });
        box.setAttribute('geometry', {
            'primitive': 'box',
            'width': this.data.width,
            'depth': this.data.depth,
            'height': 0
        });
        if (this.data.animation) {
            box.setAttribute('animation__height', {
                'property': 'geometry.height',
                'from': 0,
                'to': this.data.height,
                'dur': 2000
            });
            box.setAttribute('animation__pos', {
                'property': 'position',
                'from': { x: 0, y: 0, z:0 },
                'to': { x: 0, y: this.data.height/2, z:0 },
                'dur': 2000
            });
        } else {
            box.setAttribute('geometry', { height: this.data.height });
            box.setAttribute('position', { x: 0, y: this.data.height/2, z: 0 });
        };
        if (this.data.label === 'events') {
            box.addEventListener('mouseenter', this.showLabel.bind(this)); 
            box.addEventListener('mouseleave', this.hideLabel.bind(this));          
        } else if (this.data.label === 'fixed') {
            this.showLabel();
        };
        this.el.appendChild(box);
    },

    showLabel: function () {
        if (this.data.label === 'events') {
            this.el.setAttribute('scale', { x: 1.1, y: 1.1, z: 1.1 });
        };

        let text = this.data.labelText;
        let width = 2;
        if (text.length > 16) width = text.length / 8;
        let height = 1;
        let position = {
            x: 0, y: this.data.height + 0.6 * height,
            z: 0.7 * this.data.depth
        }
    
        label = document.createElement('a-entity');
        label.setAttribute('babia-label', {
            'text': text, 'width': width, 'textWidth': 6
        });
        label.setAttribute('position', position);
        label.setAttribute('rotation', {x: 0, y: 0, z: 0});
        this.el.appendChild(label);    
    },

    hideLabel: function () {
        if (this.data.label === 'events') {
            this.el.setAttribute('scale', { x: 1, y: 1, z: 1 });
        };
        this.el.removeChild(label);    
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
        animation: { type: 'boolean', default: false },
        palette: { type: 'string', default: 'ubuntu' },
        title: { type: 'string' },
        titleFont: { type: 'string' },
        titleColor: { type: 'string' },
        titlePosition: { type: 'vec3', default: {x: 0, y: 0, z: 0} },
        scale: { type: 'number' },
        // Height of the chart
        chartHeight: { type: 'number', default: 10 },
        incremental: { type: 'boolean', default: false},
        index: { type: 'string', default: 'x_axis'}
    },

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
        this.time = Date.now();
        this.anime_finished = false
    },

    /**
    * Called when component is attached and when component data changes.
    * Generally modifies the entity based on the data.
    */

    update: function (oldData) {
        const self = this;
        let data = this.data;
        let el = this.el;

        this.chart
        this.animation = data.animation
        this.bar_array = []
        /**
         * Update or create chart component
         */

        // Highest priority to data
        if (data.data && oldData.data !== data.data) {
            console.log("Caso 1")
            // From data embedded, save it anyway
            self.newData = self.data
            self.babiaMetadata = {
                id: self.babiaMetadata.id++
            }

            while (self.el.firstChild)
                self.el.firstChild.remove();
            self.chart = generateBarChart(self, self.data, JSON.parse(data.data), el, self.animation, self.chart, self.bar_array, self.widthBars)

            // Dispatch interested events because I updated my visualization
            dataReadyToSend("newData", self)
            self.currentData = JSON.parse(JSON.stringify(self.newData))

        } else {

            // If changed from, need to re-register to the new data component
            if (data.from !== oldData.from) {
                console.log("Caso 2")
                // Unregister for old querier
                if (self.dataComponent) { self.dataComponent.unregister(el) }

                // Find the component and get if querier or filterdata by the event               
                let eventName = findDataComponent(data, el, self)
                // If changed to filterdata or to querier
                if (self.dataComponentEventName && self.dataComponentEventName !== eventName) {
                    el.removeEventListener(self.dataComponentEventName, _listener, true)
                }
                // Assign new eventName
                self.dataComponentEventName = eventName

                // Attach to the events of the data component
                el.addEventListener(self.dataComponentEventName, _listener = (e) => {
                    attachNewDataEventCallback(self, e)
                });

                // Register for the new one
                self.dataComponent.register(el)
                return
            }

            // If changed whatever, re-print with the current data
            if (data !== oldData && self.newData) {
                console.log("Caso 3")
                if (!self.data.incremental){
                    console.log("Generating barchart...")
                    while (self.el.firstChild)
                        self.el.firstChild.remove();
                    self.chart = generateBarChart(self, self.data, self.newData, el, self.animation, self.chart, self.bar_array, self.widthBars)
                }

                // Dispatch interested events because I updated my visualization
                dataReadyToSend("newData", self)
                self.currentData = JSON.parse(JSON.stringify(self.newData))
            }

        }
    },
    /**
    * Called when a component is removed (e.g., via removeAttribute).
    * Generally undoes all modifications to the entity.
    */
    remove: function () { },

    /**
    * Called on each scene tick.
    */
    tick: function (t, delta) {
        const time_wait = 2000;
        const self = this;
        let new_time = Date.now();
        if (this.animation && !this.anime_finished && this.chart) {
            let elements = this.chart.children;
            let diff_time = new_time - this.time;
            if (diff_time >= time_wait) {
                for (let bar in this.bar_array) {
                    let prev_height = parseFloat(elements[bar].getAttribute('height'));
                    let height_max = this.bar_array[bar].height_max;
                    let pos_x = this.bar_array[bar].position_x;
                    if (prev_height < height_max) {
                        let new_height = ((diff_time - time_wait) * height_max) / self.total_duration;
                        elements[bar].setAttribute('height', new_height);
                        elements[bar].setAttribute('position', { x: pos_x, y: new_height / 2, z: 0 });
                    } else {
                        this.anime_finished = true;
                        elements[bar].setAttribute('height', height_max);
                        elements[bar].setAttribute('position', { x: pos_x, y: height_max / 2, z: 0 });
                        console.log('Total time (wait + animation): ' + diff_time + 'ms')
                    }
                }
            }
        }
    },

    /**
    * Querier component target
    */
    dataComponent: undefined,

    /**
     * Property of the querier where the data is saved
     */
    dataComponentDataPropertyName: "newData",

    /**
     * Event name to difference between querier and filterdata
     */
    dataComponentEventName: undefined,

    /**
     * Where the data is gonna be stored
     */
    newData: undefined,

    /**
     * Where the previous state data is gonna be stored
     */
    currentData: undefined,

    /**
     * Where the metaddata is gonna be stored
     */
    babiaMetadata: {
        id: 0
    },

    /**
     * Duration of the animation if activated
     */
    widthBars: 1,

    /**
     * Duration of the animation if activated
     */
    total_duration: 3000,

    /**
     * Proportion of the bars
     */
    proportion: undefined,

    /**
     * Value max
     */
    valueMax: undefined,

    labels: [],
    ticks: [],

    /**
    * Called when entity pauses.
    * Use to stop or remove any dynamic or background behavior such as events.
    */
    pause: function () { },

    /**
    * Called when entity resumes.
    * Use to continue or add any dynamic or background behavior such as events.
    */
    play: function () { },

    /**
    * Register function when I'm updated
    */
    register: function (interestedElem) {
        let el = this.el
        this.interestedElements.push(interestedElem)

        // Send the latest version of the data
        if (this.newData) {
            dispatchEventOnElement(interestedElem, "newData")
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

})

let findDataComponent = (data, el, self) => {
    let eventName = "babiaQuerierDataReady"
    if (data.from) {
        // Save the reference to the querier or filterdata
        let dataElement = document.getElementById(data.from)
        if (dataElement.components['babia-filter']) {
            self.dataComponent = dataElement.components['babia-filter']
            eventName = "babiaFilterDataReady"
        } else if (dataElement.components['babia-queryjson']) {
            self.dataComponent = dataElement.components['babia-queryjson']
        } else if (dataElement.components['babia-queryes']) {
            self.dataComponent = dataElement.components['babia-queryes']
        } else if (dataElement.components['babia-querygithub']) {
            self.dataComponent = dataElement.components['babia-querygithub']
        } else {
            console.error("Problem registering to the querier")
            return
        }
    } else {
        // Look for a querier or filterdata in the same element and register
        if (el.components['babia-filter']) {
            self.dataComponent = el.components['babia-filter']
            eventName = "babiaFilterDataReady"
        } else if (el.components['babia-queryjson']) {
            self.dataComponent = el.components['babia-queryjson']
        } else if (el.components['babia-queryes']) {
            self.dataComponent = el.components['babia-queryes']
        } else if (el.components['babia-querygithub']) {
            self.dataComponent = el.components['babia-querygithub']
        } else {
            // Look for a querier or filterdata in the scene
            if (document.querySelectorAll("[babia-filter]").length > 0) {
                self.dataComponent = document.querySelectorAll("[babia-filter]")[0].components['babia-filter']
                eventName = "babiaFilterDataReady"
            } else if (document.querySelectorAll("[babia-queryjson]").length > 0) {
                self.dataComponent = document.querySelectorAll("[babia-queryjson]")[0].components['babia-queryjson']
            } else if (document.querySelectorAll("[babia-queryjson]").length > 0) {
                self.dataComponent = document.querySelectorAll("[babia-queryes]")[0].components['babia-queryes']
            } else if (document.querySelectorAll("[babia-querygithub]").length > 0) {
                self.dataComponent = document.querySelectorAll("[babia-querygithub]")[0].components['babia-querygithub']
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

    self.newData = rawData
    self.babiaMetadata = {
        id: self.babiaMetadata.id++
    }

    if (!self.data.incremental){
        // Generate chart
        while (self.el.firstChild)
            self.el.firstChild.remove();
        console.log("Generating 2 barchart...")
        self.chart = generateBarChart(self, self.data, rawData, self.el, self.animation, self.chart, self.bar_array, self.widthBars)
        self.currentData = JSON.parse(JSON.stringify(self.newData))
    } else {
        // First add the new data in current data
        self.newData.forEach(bar => {
            let found = false
            for(let i in self.currentData){
                if (self.currentData[i][self.data.index] == bar[self.data.index]){
                    self.currentData[i] = bar
                    found = true
                }
            }
            if (!found){
                self.currentData.push(bar)
            }
        });
        console.log(self.currentData)
        console.log("Updating barchart...")
        // To calculate maxValue you need all data before
        let maxValue = Math.max.apply(Math, self.currentData.map(function (o) { return o[self.data.height]; }))
        self.newData.forEach(bar => {
            if (!bar._not){
                if (document.getElementById(bar[self.data.index])){
                    // Update bar
                    document.getElementById(bar[self.data.index]).setAttribute('babia-bar', 'height', bar[self.data.height] * self.data.chartHeight / maxValue)
                    document.getElementById(bar[self.data.index]).setAttribute('babia-bar', {
                        'labelText': bar[self.data.index] + ': ' + bar[self.data.height]
                    })
                } else {
                    // Find last bar and get its position
                    let colorId = self.el.querySelectorAll('[babia-bar]').length
                    let posX = self.el.querySelectorAll('[babia-bar]')[colorId - 1].getAttribute('position').x + self.widthBars + self.widthBars / 4
                    // Create new bar
                    let barEntity = generateBar(self, self.data, bar, maxValue, self.widthBars, colorId, self.data.palette, posX);
                    self.el.querySelector('.babiaxrChart').appendChild(barEntity)
                    // Add label and tick
                    self.labels.push(barEntity.id)
                    self.ticks.push(posX)
                }
            } else {
                // Delete bar
                document.getElementById(bar[self.data.index]).setAttribute('babia-bar', 'height', -1)
                //document.getElementById(bar[self.data.index]).remove()
            }
        });
        // Update axis
        let len = self.ticks[self.ticks.length - 1] + self.widthBars * 3 / 4
        self.el.querySelector('[babia-axis-x]').setAttribute('babia-axis-x', {'length': len})
    }

    // Dispatch interested events because I updated my visualization
    dataReadyToSend("newData", self)
}


let generateBarChart = (self, data, dataRetrieved, element, animation, chart, list, widthBars) => {

    if (dataRetrieved) {
        const dataToPrint = dataRetrieved
        const palette = data.palette
        const title = data.title
        const font = data.titleFont
        const color = data.titleColor
        const title_position = data.titlePosition
        const scale = data.scale

        let colorId = 0
        let stepX = 0
        let axis_dict = []

        //Print Title
        let titleEl = document.createElement('a-entity');
        titleEl.setAttribute('text-geometry', {'value': title});
        if (font) titleEl.setAttribute('text-geometry', {'font': font});
        if (color) titleEl.setAttribute('material', {'color': color});    
        titleEl.setAttribute('position', title_position);
        titleEl.setAttribute('rotation', { x: 0, y: 0, z: 0 });
        titleEl.classList.add("babiaxrTitle")
        element.appendChild(titleEl);

        // let title_3d = showTitle(title, font, color, title_position);
        //element.appendChild(title_3d);

        let maxValue = Math.max.apply(Math, dataToPrint.map(function (o) { return o[self.data.height]; }))
//        if (scale) {
//            maxY = maxY / scale
//        } else if (heightMax) {
//            self.valueMax = maxY
//            self.proportion = heightMax / maxY
//            maxY = heightMax
//        }

        let chart_entity = document.createElement('a-entity');
        chart_entity.classList.add('babiaxrChart')

        element.appendChild(chart_entity)

        let labels = self.labels;
        let ticks = self.ticks;
        for (let item of dataToPrint) {
            let bar = document.createElement('a-entity');
            bar.setAttribute('babia-bar', {
                'height': item[self.data.height] * data.chartHeight / maxValue,
                'width': widthBars,
                'depth': widthBars,
                'color': colors.get(colorId, palette),
                'label': 'events'
            });
            if (data.legend) {
                bar.setAttribute('babia-bar', {
                    'labelText': item[self.data.x_axis] + ': ' + item[self.data.height]
                });
            };
            bar.setAttribute('position', { x: stepX, y: 0, z: 0 }); 
            bar.id = item[self.data.index]
            bar.classList.add("babiaxraycasterclass");
            console.log(bar);

            //Axis dict
            let bar_printed = {
                colorid: colorId,
                posX: stepX,
                key: item[self.data.x_axis]
            }
            axis_dict.push(bar_printed)

            labels.push(item[self.data.x_axis]);
            ticks.push(stepX);
            chart_entity.appendChild(bar);
            //Calculate stepX
            stepX += widthBars + widthBars / 4
            //Increase color id
            colorId++
        }

        //Print axis
        if (data.axis) {
            let xAxis = document.createElement('a-entity');
            let len = ticks[ticks.length - 1] + widthBars * 3 / 4
            xAxis.setAttribute('babia-axis-x',
                {'labels': labels, 'ticks': ticks, 'length': len,
                 'palette': palette});
            chart_entity.appendChild(xAxis);
            xAxis.setAttribute('position', {x: 0, y: 0, z: widthBars/2});
            let yAxis = document.createElement('a-entity');
            yAxis.setAttribute('babia-axis-y',
                {'maxValue': maxValue, 'length': data.chartHeight});
            yAxis.setAttribute('position', {x: -widthBars/2, y: 0, z: widthBars/2});
            chart_entity.appendChild(yAxis);
        }
        return chart;
    }
}

let generateBar = (self, data, item, maxValue, widthBars, colorId, palette, stepX ) => {
    let bar = document.createElement('a-entity');
    bar.setAttribute('babia-bar', {
        'height': item[self.data.height] * data.chartHeight / maxValue,
        'width': widthBars,
        'depth': widthBars,
        'color': colors.get(colorId, palette),
        'label': 'events'
    });
    if (data.legend) {
        bar.setAttribute('babia-bar', {
            'labelText': item[self.data.x_axis] + ': ' + item[self.data.height]
        });
    };
    bar.setAttribute('position', { x: stepX, y: 0, z: 0 }); 
    bar.id = item[self.data.index]
    bar.classList.add("babiaxraycasterclass");
    return bar
}

let dataReadyToSend = (propertyName, self) => {
    self.interestedElements.forEach(element => {
        dispatchEventOnElement(element, propertyName)
    });
}

let dispatchEventOnElement = (element, propertyName) => {
    element.emit("babiaVisualizerUpdated", propertyName)
}
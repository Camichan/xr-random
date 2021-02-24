AFRAME.registerComponent('my-slider', {
    schema: {
        color: { type: 'color', default: '#fff' },
        size: { type: 'number', default: 0.5 },
        min: { type: 'number', default: -6 },
        max: { type: 'number', default: -4 },
        value: { type: 'number', default: -5 },
        innerSize: { type: 'number', default: 0.8 },
        precision: { type: 'number', default: 2 }
      },
    
      multiple: true,
    
      init: function () {
        this.loader = new THREE.FontLoader();

        let material = new THREE.MeshBasicMaterial({color: this.data.color });
        this.material = material
        let lever= new THREE.Mesh(new THREE.BoxGeometry( 0.04, 0.15, 0.04 ), material);
        let track = new THREE.Mesh(new THREE.CylinderGeometry(0.005,0.005, this.data.size, 12), material);
        track.rotateZ(Math.PI / 2);
        let chassis = new THREE.Group();
    
        this.lever = lever;
        chassis.add(track);
        chassis.add(lever);

        this.el.setObject3D('mesh', chassis);
    
        this.controllers = Array.prototype.slice.call(document.querySelectorAll('a-entity[hand-controls]'));

        this.fontURL = 'https://threejsfundamentals.org/threejs/resources/threejs/fonts/helvetiker_regular.typeface.json'
        this.loader.load(this.fontURL, (font) => { 
            this.font = font
            let minText = this.createTextGeometry(this.data.min, -this.data.size / 2 - .1, -.025)
            let maxText = this.createTextGeometry(this.data.max, this.data.size / 2 + .05, -.025)
            chassis.add(minText)
            chassis.add(maxText) 
            //this.setTextGeometry(this.data.value)
        })

        //this.setValue(this.data.value);
      },

      createTextGeometry: function(text, x, y) {
        let textGeometry = new THREE.TextGeometry(text.toString(), {
            font: this.font,
            size: .06,
            height: .01,
            curveSegments: 12,
            bevelEnabled: false,
          });
        let textMesh = new THREE.Mesh(textGeometry, this.material)
        textMesh.position.x = x
        textMesh.position.y = y
        return textMesh
      },

      setTextGeometry: function(text) {
        if (this.textmesh != null) {
            this.textmesh.text = text;
        } else {
            this.loader.load(this.fontURL, (font) => { 
                this.font = font
                this.textmesh = this.createTextGeometry(text, -.025, .15)
                this.lever.add(this.textmesh)
            })
        }
      },

      play: function () {
        this.grabbed = false;
        this.el.addEventListener('rangeout', this.onTriggerUp.bind(this));
        this.controllers.forEach(function (controller){
          controller.addEventListener('triggerdown', this.onTriggerDown.bind(this));
          controller.addEventListener('triggerup', this.onTriggerUp.bind(this));
        }.bind(this));
      },
    
      pause: function () {
        this.el.removeEventListener('rangeout', this.onTriggerUp.bind(this));
        this.controllers.forEach(function (controller){
          controller.removeEventListener('triggerdown', this.onTriggerDown.bind(this));
          controller.removeEventListener('triggerup', this.onTriggerUp.bind(this));
        }.bind(this));
      },
    
      onTriggerDown: function(e) {
        var hand = e.target.object3D;
        var lever = this.lever;
    
        var handBB = new THREE.Box3().setFromObject(hand);
        var leverBB = new THREE.Box3().setFromObject(lever);
        var collision = handBB.intersectsBox(leverBB);
    
        if (collision) {
          let handWorld = new THREE.Vector3();
          hand.getWorldPosition(handWorld);
          let knobWorld = new THREE.Vector3();;
          lever.getWorldPosition(knobWorld);
          let distance = handWorld.distanceTo(knobWorld);
          if (distance < 0.1) {
            this.grabbed = hand;
            this.grabbed.visible = false;
            this.knob.material = this.knobGrabbedMaterial;
          }
        };
      },
    
      onTriggerUp: function() {
        if (this.grabbed) {
          this.grabbed.visible = true;
          this.grabbed = false;
          this.knob.material = this.knobMaterial;
        }
      },
    
      setValue: function(value) {
        var lever = this.lever;
        if (value < this.data.min) {
          value = this.data.min;
        } else if (value > this.data.max) {
          value = this.data.max;
        }
    
        this.value = value;
    
        lever.position.x = this.valueToLeverPosition(value);
        this.setTextGeometry(value.toFixed(this.data.precision))
      },
      valueToLeverPosition: function(value) {
        var sliderRange = this.data.size * this.data.innerSize;
        var valueRange = Math.abs(this.data.max - this.data.min);
        
        let sliderMin = -1 * sliderRange / 2;

        return (((value - this.data.min) * sliderRange) / valueRange) + sliderMin
      },
      leverPositionToValue: function(position) {
        var sliderRange = this.data.size * this.data.innerSize;
        var valueRange = Math.abs(this.data.max - this.data.min);
        
        let sliderMin = -1 * sliderRange / 2;

        return (((position - sliderMin) * valueRange) / sliderRange) + this.data.min
    },

    tick: function() {
        if (this.grabbed) {
          var hand = this.grabbed;
          var lever = this.lever;
          var sliderSize = this.data.size;
          var sliderRange = (sliderSize * this.data.innerSize);
    
          var handWorld = new THREE.Vector3().setFromMatrixPosition(hand.matrixWorld);
          lever.parent.worldToLocal(handWorld);
          
    
            if (Math.abs(handWorld.x) > sliderRange / 2) {
                lever.position.x = sliderRange / 2 * Math.sign(lever.position.x);
            // this.el.emit('rangeout');
            } else {
                lever.position.x = handWorld.x;
            }    
            var value = this.leverPositionToValue(lever.position.x);
            
            if (Math.abs(this.value - value) >= Math.pow(10, -this.data.precision)) {
                this.el.emit('change', { value: value });
                this.value = value;
                this.setTextGeometry(value.toFixed(this.data.precision))
            }
        }
      },
    
      update: function(old) {
        if(this.data.value !== old.value) {
          this.setValue(this.data.value);
        }
      }
})
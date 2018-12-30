
defineThreeUniverse(function (THREE, UNIVERSE, options) {
    var queryTexture = null;
    return new Promise(function (resolve, reject) {

        var geometry = new THREE.PlaneBufferGeometry(2000, 2000, 1, 1);

        options.requestAnimationFrame(()=>{});

            // var groundTexture = textures[0];
            // groundTexture.wrapS = groundTexture.wrapT = THREE.RepeatWrapping;
            // groundTexture.repeat.set(25, 25);
            // groundTexture.anisotropy = 16;

            // var queryTexture= textures[1];
            // var displacementMap = queryTexture.texture;

            // var mesh = new THREE.Water( geometry, {
			// 	color: params.color,
			// 	scale: params.scale,
			// 	flowDirection: new THREE.Vector2( params.flowX, params.flowY ),
			// 	textureWidth: 1024,
			// 	textureHeight: 1024
            // } );
            
            
            // var material = new THREE.MeshLambertMaterial({
            //     color:'#4285F4', 
            //     transparent:true,
            //     opacity :0.9
            // });

            let code = `void mainImage( out vec4 fragColor, in vec2 fragCoord )
            {
                // input: pixel coordinates
                vec2 p = (-iResolution.xy + 2.0*fragCoord)/iResolution.y;
            
                // angle of each pixel to the center of the screen
                float a = atan(p.y,p.x);
                
                // modified distance metric
                float r = pow( pow(p.x*p.x,4.0) + pow(p.y*p.y,4.0), 1.0/8.0 );
                
                // index texture by (animated inverse) radious and angle
                vec2 uv = vec2( 1.0/r + 0.2*iTime, a );
            
                // pattern: cosines
                float f = cos(12.0*uv.x)*cos(6.0*uv.y);
            
                // color fetch: palette
                vec3 col = 0.5 + 0.5*sin( 3.1416*f + vec3(0.0,0.5,1.0) );
                
                // lighting: darken at the center    
                col = col*r;
                
                // output: pixel color
                fragColor = vec4( col, 1.0 );
            }`
            var material = new THREE.ShaderToyMaterial(code)

            var mesh = new THREE.Mesh(geometry, material);
            mesh.rotation.x = - Math.PI / 2;
            mesh.position.y= -40;
            mesh.receiveShadow = true;

            

            // var originalRaycast = mesh.raycast;
            // mesh.raycast = function (raycaster, intersects) {
            //     originalRaycast.call(mesh, raycaster, intersects);
            //     var thisobjectsIntersects = intersects.filter((element) => element.object == mesh);
            //     if (thisobjectsIntersects.length) {
            //         let uv = new THREE.Vector2().copy(thisobjectsIntersects[0].uv);
            //         displacementMap.transformUv(uv);
            //         var hightpixel = queryTexture.getPixelAtUv(uv.x, uv.y);
            //         var hightVal = hightpixel.r / 255 * material.displacementScale + material.displacementBias;
            //     }

            //     thisobjectsIntersects.forEach(element => {
            //         element.point.y = hightVal;

            //     });



            // }

            UNIVERSE.GroundManager.add(mesh);            
            resolve(mesh);

        });







});
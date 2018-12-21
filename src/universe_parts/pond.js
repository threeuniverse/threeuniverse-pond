
defineThreeUniverse(function (THREE, UNIVERSE, options) {
    var queryTexture = null;
    return new Promise(function (resolve, reject) {

        var geometry = new THREE.PlaneBufferGeometry(2000, 2000, 1, 1);



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
            

            var material = new THREE.MeshLambertMaterial({
                color:'skyblue', 
                transparent:true,
                opacity :0.68
            });

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
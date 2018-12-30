import * as THREE from 'three';
import seedrandom from 'seedrandom'
import QueryTextureWrapper from './utils/QueryTextureWrapper'
import TextureLoader from './utils/TextureLoader'
import { loadnExecute } from './partLoader';
import {MTLLoader, OBJLoader} from 'three-obj-mtl-loader'
import ShaderToyMaterial from 'three-shadertoy-material'
import path from 'path'




export let THREEEX = Object.assign({}, THREE,MTLLoader, OBJLoader,{ShaderToyMaterial:ShaderToyMaterial});
import  {  GroundManager, GetGroundHitPoint } from './utils/GroundRayCaster'

function castShadow(object){
    object.traverse(object => {
        if (object.isMesh) {
            object.castShadow = true;
        }

    })
}

function loadMTLNObject(baseUrl, mtl, obj) {
    
    var objLoader = new THREEEX.OBJLoader();
    var mtlLoader = new THREEEX.MTLLoader()

    return new Promise((resolve, reject) => {
        
        mtlLoader.setTexturePath(baseUrl+path.dirname(mtl)+"/");
        mtlLoader.load(baseUrl+mtl,  function (materials) {
            materials.crossOrigin="anonymous";
            let oldloadTexture = materials.loadTexture;
            let textureCount=0;
            let textureloadComplted=null;
            materials.loadTexture = function myloadTexture(url,mapping,onLoad,onProgress,onFail) {

                // texturePromiseArray.push (new Promise((resolve,reject)=>{
                    
                // }));

                textureCount++;

                function myOnload(params) {
                    textureCount--;
                    if(textureCount==0 && textureloadComplted){
                        textureloadComplted();
                    }
                    if(onLoad)
                    onLoad(params);
                }
                function myOnFail(params) {
                    reject("failed to load texture");
                    if(onFail)
                    onFail(params);
                }
                
                return oldloadTexture.call(materials,url,mapping,myOnload,onProgress,myOnFail)
            }

            objLoader.setMaterials(materials);
            objLoader.load(baseUrl + obj, (objnode) => {
                setTimeout(() => {
                    if(textureCount>0){
                        textureloadComplted = ()=>resolve(objnode);
                    }else{
                        resolve(objnode);
                    }
                        
                    
                }, 0);
                
            }, null, reject);

        },null,reject);
    });

}


export let UNIVERSE = Object.assign({}, {
    seedrandom,loadMTLNObject,castShadow, loadnExecute, QueryTextureWrapper,
     TextureLoader,GetGroundHitPoint, GroundManager,
});


export let cameraUpdateList = [];
export let requestAnimationFrameList =[];


export function GeneratePartOptions(item,baseUrl,vectposition){
    item.disposer = function () {
        item.object.traverse(function (obj) {
            if (obj.isMesh) {
                if (obj.geometry)
                    obj.geometry.dispose();
                if (obj.material instanceof Array) {
                    obj.material.forEach(item => {
                        if (item.map) {
                            item.map.dispose();
                        }
                        item.dispose();
                    });
                } else {
                    if (obj.material.map)
                        obj.material.map.dispose();
                    obj.material.dispose();
                }


            }

        });
    };


    let PARTOption = {
        dispose: function (disposer) {
            item.disposer = disposer;
        },
        onCameraUpdate: function (fun) {
            item.onCameraUpdate = fun;
            cameraUpdateList.push(item);
        },
        requestAnimationFrame: function (fun) {
            item.requestAnimationFrame = fun;
            requestAnimationFrameList.push(item);
        },
        baseUrl: baseUrl,
        getPartPosition: () => vectposition,
        GetGroundHitPoint:function (position) {
            return UNIVERSE.GetGroundHitPoint(new THREE.Vector3().addVectors(position,vectposition))
        },
        loadMTLNObject:function (mtlpath) {
            let objectpath = mtlpath.replace(/\.obj$/,".mtl");
            return UNIVERSE.loadMTLNObject(baseUrl,objectpath,mtlpath);
        }
    };

    return PARTOption;

}
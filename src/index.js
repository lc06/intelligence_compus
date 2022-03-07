window.CESIUM_BASE_URL = "/"

import * as Cesium from "cesium"
import "./Widgets/widgets.css"
import "./css/main.css"
import "./css/head.css"
import "./css/leftPanel.css"
import "./css/rightPanel.css"
import "./css/footer.css"
// import linepng from './img/line.png';
import xueyuanloupng from "./img/xueyuanlou.png"
import gongjiaoqupng from "./img/gongjiaoqu.png"
import yundongchangpng from "./img/yundongchang.png"
import jingdianpng from "./img/jingdian.png"
import shitangpng from "./img/shitang.png"
import data from "./data/data.json"
import campus from "./data/campus.kml"
import $ from "jquery"
import { extractValues } from "./dataUtil"
// import { chart1, chart2, chart3 } from './chart';

Cesium.Ion.defaultAccessToken = data.cesium_token

const mapIds = [
    "mapbox.satellite",
    "mapbox.streets",
    "mapbox.streets-basic",
    "mapbox.light",
    "mapbox.streets-satellite",
    "mapbox.wheatpaste",
    "mapbox.comic",
    "mapbox.outdoors",
    "mapbox.run-bike-hike",
    "mapbox.pencil",
    "mapbox.pirates",
    "mapbox.emerald",
    "mapbox.high-contrast",
]

const mapbox = new Cesium.MapboxImageryProvider({
    mapId: mapIds[0],
    accessToken: data.mapbox_token,
})

const viewer = new Cesium.Viewer("container", {
    geocoder: false, //位置查找工具
    homeButton: false, //复位按钮
    sceneModePicker: false, //模式切换
    baseLayerPicker: false, //图层选择
    navigationHelpButton: false, //帮助按钮
    animation: false, //速度控制
    timeline: false, //时间轴
    fullscreenButton: false, //全屏
    infoBox: false, //关闭infobox
    shouldAnimate: true,
    imageryProvider: mapbox,
    terrainProvider: Cesium.createWorldTerrain({
        requestWaterMask: true,
        requestVertexNormals: true,
    }),
})

viewer._cesiumWidget._creditContainer.style.display = "none" // 隐藏版权信息
viewer.scene.skyAtmosphere.show = false // 隐藏大气层

// 添加OSM三维建筑
const osmBuildings = viewer.scene.primitives.add(
    Cesium.createOsmBuildings({
        defaultColor: Cesium.Color.PALETURQUOISE,
    })
)

viewer.camera.flyTo({
    destination: new Cesium.Cartesian3(
        -2410241.313289892,
        4698818.674062929,
        3566254.493884579
    ),
    orientation: {
        heading: 5.076275243419188,
        pitch: -0.5453434649772722,
        roll: 6.279773633921092,
    },
})

const roadsStrArr = extractValues(campus, "coordinates")

const roadsArr = []

for (let i = 0; i < roadsStrArr.length; i++) {
    const singleRoadArr = []
    //按逗号或空格进行分割，数组元素为路径点的单个x|y|z坐标字符串["117.1352471043988","34.21418380356213","49.99442335617072"...]
    const singleRoad = roadsStrArr[i][0].split(/[,| ]/)
    for (let j = 0; j < singleRoad.length; j++) {
        if (!/^\s+$/g.test(singleRoad[j])) {
            singleRoadArr.push(parseFloat(singleRoad[j]))
        }
    }
    roadsArr.push(singleRoadArr)
}

const xingjian = new Cesium.Entity({
    name: "xingjian road",
    polyline: {
        positions: Cesium.Cartesian3.fromDegreesArrayHeights(roadsArr[0]),
        width: 5,
        clampToGround: true,
        material: new Cesium.PolylineDashMaterialProperty({
            color: Cesium.Color.CYAN,
        }),
    },
})

const xueyuan = new Cesium.Entity({
    name: "xueyuan road",
    polyline: {
        positions: Cesium.Cartesian3.fromDegreesArrayHeights(roadsArr[1]),
        width: 5,
        clampToGround: true,
        material: new Cesium.PolylineDashMaterialProperty({
            color: Cesium.Color.BLUEVIOLET,
        }),
    },
})

const roadCollection = new Cesium.EntityCollection()
roadCollection.add(xingjian)
roadCollection.add(xueyuan)

//面积绑定点击事件
$("ul#display li:nth-child(1) div:nth-child(1)").on("click", function () {
    viewer.entities.removeAll()
    $(".main").remove()
    for (let entity in roadCollection.values) {
        viewer.entities.add(roadCollection.values[entity])
    }
    viewer.flyTo(roadCollection)
})

const kmlOptions = {
    camera: viewer.scene.camera,
    canvas: viewer.scene.canvas,
    //clampToGround : true
}

const xylCollection = new Cesium.EntityCollection()
const gjqCollection = new Cesium.EntityCollection()
const ydcCollection = new Cesium.EntityCollection()
const stCollection = new Cesium.EntityCollection()
const jdCollection = new Cesium.EntityCollection()

function createCollection(url, collection, image) {
    const geocachePromise = Cesium.KmlDataSource.load(url, kmlOptions)

    // Add geocache billboard entities to scene and style them
    geocachePromise.then(function (dataSource) {
        // Get the array of entities
        const geocacheEntities = dataSource.entities.values

        for (let i = 0; i < geocacheEntities.length; i++) {
            const entity = geocacheEntities[i]

            entity.billboard = {
                image: image,
            }

            if (Cesium.defined(entity.billboard)) {
                // Adjust the vertical origin so pins sit on terrain
                entity.billboard.verticalOrigin = Cesium.VerticalOrigin.BOTTOM
                // Disable the labels to reduce clutter
                entity.label = undefined
                // Add distance display condition
                entity.billboard.distanceDisplayCondition =
                    new Cesium.DistanceDisplayCondition(10.0, 20000.0)
                // Compute latitude and longitude in degrees
                const cartographicPosition = Cesium.Cartographic.fromCartesian(
                    entity.position.getValue(Cesium.JulianDate.now())
                )
                const latitude = Cesium.Math.toDegrees(
                    cartographicPosition.latitude
                )
                const longitude = Cesium.Math.toDegrees(
                    cartographicPosition.longitude
                )
                // Modify description
                const description =
                    '<div class="main" style="display: block;">' +
                    '<div class="main_tit">名称: ' +
                    entity.name +
                    "</div>" +
                    '<div class="main_tit">位置: ' +
                    "(" +
                    longitude.toFixed(5) +
                    ", " +
                    latitude.toFixed(5) +
                    ")" +
                    "</div></div>"
                // const description = '<table class="cesium-infoBox-defaultTable cesium-infoBox-defaultTable-lighter"><tbody>' +
                //     '<tr><th>' + "Longitude" + '</th><td>' + longitude.toFixed(5) + '</td></tr>' +
                //     '<tr><th>' + "Latitude" + '</th><td>' + latitude.toFixed(5) + '</td></tr>' +
                //     '</tbody></table>';
                //entity.description = description;
            }

            collection.add(entity)
        }
    })
}

createCollection("./data/xueyuanlou.kml", xylCollection, xueyuanloupng)
createCollection("./data/gongjiaoqu.kml", gjqCollection, gongjiaoqupng)
createCollection("./data/yundongchang.kml", ydcCollection, yundongchangpng)
createCollection("./data/jingdian.kml", jdCollection, jingdianpng)
createCollection("./data/shitang.kml", stCollection, shitangpng)

//学院楼绑定点击事件
$("ul#display li:nth-child(1) div:nth-child(2)").on("click", function () {
    viewer.entities.removeAll()
    $(".main").remove()
    for (let key in xylCollection.values) {
        viewer.entities.add(xylCollection.values[key])
    }
    viewer.flyTo(xylCollection)
})

//景点绑定点击事件
$("ul#display li:nth-child(2) div:nth-child(1)").on("click", function () {
    viewer.entities.removeAll()
    $(".main").remove()
    for (let key in jdCollection.values) {
        viewer.entities.add(jdCollection.values[key])
    }
    viewer.flyTo(jdCollection)
})

//食堂绑定点击事件
$("ul#display li:nth-child(2) div:nth-child(2)").on("click", function () {
    viewer.entities.removeAll()
    $(".main").remove()
    for (let key in stCollection.values) {
        viewer.entities.add(stCollection.values[key])
    }
    viewer.flyTo(stCollection)
})

//运动场绑定点击事件
$("ul#display li:nth-child(3) div:nth-child(1)").on("click", function () {
    viewer.entities.removeAll()
    $(".main").remove()
    for (let key in ydcCollection.values) {
        viewer.entities.add(ydcCollection.values[key])
    }
    viewer.flyTo(ydcCollection)
})

//公教区绑定点击事件
$("ul#display li:nth-child(3) div:nth-child(2)").on("click", function () {
    viewer.entities.removeAll()
    $(".main").remove()
    for (let key in gjqCollection.values) {
        viewer.entities.add(gjqCollection.values[key])
    }
    viewer.flyTo(gjqCollection)
})

function existEntity(collection, name) {
    for (let key in collection.values) {
        const entity = collection.values[key]
        if (entity.name === name) return entity
    }
    return false
}

//搜索按钮绑定点击事件
$("#searchBtn").on("click", function () {
    $(".main").remove()
    const value = $("#searchBox").val()
    const type = value.slice(-2, -1)
    let entity
    //根据搜索文本倒数第2个字符进行判断
    switch (type) {
        case "学":
            entity = existEntity(xylCollection, value)
            if (entity) {
                viewer.entities.removeAll()
                viewer.entities.add(entity)
                viewer.flyTo(entity)
            } else {
                alert("未找到指定学院！")
            }
            break
        case "号":
            entity = existEntity(gjqCollection, value)
            if (entity) {
                viewer.entities.removeAll()
                viewer.entities.add(entity)
                viewer.flyTo(entity)
            } else {
                alert("未找到指定公教区！")
            }
            break
        case "动":
            entity = existEntity(ydcCollection, value)
            if (entity) {
                viewer.entities.removeAll()
                viewer.entities.add(entity)
                viewer.flyTo(entity)
            } else {
                alert("未找到指定运动场！")
            }
            break
        case "餐":
            entity = existEntity(stCollection, value)
            if (entity) {
                viewer.entities.removeAll()
                viewer.entities.add(entity)
                viewer.flyTo(entity)
            } else {
                alert("未找到指定餐厅！")
            }
            break
        default:
            alert("未找到指定学院楼|公教区|运动场！")
            break
    }
    $("#searchBox").val("")
})

//Entity点击事件监听
const handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas)
handler.setInputAction(function (movement) {
    $(".main").remove()
    const pick = viewer.scene.pick(movement.position)
    if (Cesium.defined(pick) && pick.id) {
        const name = pick.id.name
        const description = pick.id.name
        const left = movement.position.x + 20
        const top = movement.position.y - 20
        const descriptionEle =
            '<div class="main" style="' +
            "left:" +
            left +
            "px; top:" +
            top +
            "px; " +
            'display: block;">' +
            '<div class="main_tit">名称: ' +
            name +
            "</div>" +
            '<div class="main_tit">描述: ' +
            description +
            "</div></div>"
        $("#dynamic-layer").append(descriptionEle)
        console.log("Mouse clicked rectangle.")
    }
}, Cesium.ScreenSpaceEventType.LEFT_CLICK)

const runData = []
const xingjianRoad = roadsArr[0]

for (let i = 0; i < xingjianRoad.length; i++) {
    runData.push({
        longitude: xingjianRoad[i],
        latitude: xingjianRoad[i + 1],
        height: xingjianRoad[i + 2],
    })
    i = i + 2
}

const timeStepInSeconds = 30
const totalSeconds = timeStepInSeconds * (runData.length - 1)
const start = Cesium.JulianDate.fromIso8601("2021-01-07T20:10:00Z")
const stop = Cesium.JulianDate.addSeconds(
    start,
    totalSeconds,
    new Cesium.JulianDate()
)

viewer.clock.startTime = start.clone()
viewer.clock.stopTime = stop.clone()
viewer.clock.currentTime = start.clone()
viewer.clock.multiplier = 80
viewer.clock.shouldAnimate = true

const positionProperty = new Cesium.SampledPositionProperty()

for (let i = 0; i < runData.length; i++) {
    const dataPoint = runData[i]

    const time = Cesium.JulianDate.addSeconds(
        start,
        i * timeStepInSeconds,
        new Cesium.JulianDate()
    )
    const position = Cesium.Cartesian3.fromDegrees(
        dataPoint.longitude,
        dataPoint.latitude,
        dataPoint.height
    )

    positionProperty.addSample(time, position)
}

const timeInterval = new Cesium.TimeInterval({ start: start, stop: stop })
let airplaneUri

async function loadModel() {
    airplaneUri = await Cesium.IonResource.fromAssetId(247276)
}

loadModel()

function animateRun() {
    viewer.clock.currentTime = start.clone()
    const airplaneEntity = viewer.entities.add({
        availability: new Cesium.TimeIntervalCollection([timeInterval]),
        position: positionProperty,

        model: {
            uri: airplaneUri,
            minimumPixelSize: 128,
            maximumScale: 20000,
        },

        orientation: new Cesium.VelocityOrientationProperty(positionProperty),
        path: new Cesium.PathGraphics({ width: 3 }),
    })

    viewer.trackedEntity = airplaneEntity
}

$("#footer>ul li:nth-child(1)").on("click", function () {
    viewer.entities.removeAll()
    $(".main").remove()
    animateRun()
})

$("#footer>ul li:nth-child(2)").on("click", function () {
    viewer.entities.removeAll()
    $(".main").remove()
    for (let key in jdCollection.values) {
        viewer.entities.add(jdCollection.values[key])
    }
    viewer.flyTo(jdCollection)
})

$("#footer>ul li:nth-child(3)").on("click", function () {
    viewer.entities.removeAll()
    $(".main").remove()
    for (let key in xylCollection.values) {
        viewer.entities.add(xylCollection.values[key])
    }
    viewer.flyTo(xylCollection)
})

$("#footer>ul li:nth-child(4)").on("click", function () {
    viewer.entities.removeAll()
    $(".main").remove()
    for (let key in gjqCollection.values) {
        viewer.entities.add(gjqCollection.values[key])
    }
    viewer.flyTo(gjqCollection)
})

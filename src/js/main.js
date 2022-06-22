const _doc_ready = setInterval((func) => {if(document.readyState != "complete") return; clearInterval(_doc_ready); delete _doc_ready; func();}, 1, () => {
    mainScene = new Scene("mainCanvas");
    
    // background
    background = new Tile("src/img/scenario/scenary2.png", 1920, 1080, 0, ['background'], []);
    // back_collision0 = new Tile("", 0, 0, 1, ['wall'], [
    //     [0, 59],
    //     [275, 59],
    //     [250, 99],
    //     [250, 267],
    //     [212, 321],
    //     [119, 333],
    //     [55, 395],
    //     [55, 493],
    //     [119, 551],
    //     [207, 551],
    //     [275, 493],
    //     [275, 377],
    //     [339, 303],
    //     [339, 170],
    //     [349, 141],
    //     [403, 141],
    //     [548, 295],
    //     [568, 333],
    //     [568, 410],
    //     [530, 441],
    //     [467, 441],
    //     [375, 540],
    //     [375, 922],
    //     [349, 951],
    //     [259, 951],
    //     [259, 1030],
    //     [743, 1030],
    //     [826, 967],
    //     [1220, 967],
    //     [1220, 886],
    //     [1123, 886],
    //     [1097, 865],
    //     [1094, 753],
    //     [1122, 715],
    //     [1225, 715],
    //     [1225, 632],
    //     [1137, 632],
    //     [1107, 613],
    //     [1097, 583],
    //     [1107, 547],
    //     [1137, 522],
    //     [1225, 522],
    //     [1225, 441],
    //     [1137, 441],
    //     [1104, 412],
    //     [1104, 355],
    //     [1134, 333],
    //     [1225, 333],
    //     [1225, 251],
    //     [1142, 251],
    //     [1104, 223],
    //     [1104, 170],
    //     [1132, 149],
    //     [1163, 141],
    //     [1387, 141],
    //     [1418, 149],
    //     [1453, 189],
    //     [1453, 426],
    //     [1472, 456],
    //     [1554, 525],
    //     [1623, 525],
    //     [1655, 540],
    //     [1695, 583],
    //     [1695, 1080],
    //     [0, 1080]
    // ]);
    // back_collision1 = new Tile("", 0, 0, 1, ['wall'], [
    //     [234, 0],
    //     [1711, 0],
    //     [1711, 377],
    //     [1639, 441],
    //     [1593, 441],
    //     [1550, 410],
    //     [1538, 377],
    //     [1538, 156],
    //     [1453, 64],
    //     [896, 64],
    //     [896, 141],
    //     [974, 141],
    //     [1006, 162],
    //     [1006, 215],
    //     [957, 251],
    //     [896, 251],
    //     [896, 333],
    //     [979, 333],
    //     [1006, 361],
    //     [1006, 403],
    //     [957, 441],
    //     [896, 441],
    //     [896, 522],
    //     [960, 522],
    //     [1006, 551],
    //     [1006, 590],
    //     [974, 624],
    //     [896, 632],
    //     [896, 709],
    //     [957, 709],
    //     [993, 724],
    //     [1009, 753],
    //     [1009, 865],
    //     [993, 886],
    //     [926, 886],
    //     [903, 869],
    //     [903, 753],
    //     [822, 753],
    //     [822, 865],
    //     [801, 886],
    //     [716, 942],
    //     [494, 951],
    //     [459, 928],
    //     [459, 862],
    //     [488, 836],
    //     [581, 836],
    //     [581, 756],
    //     [488, 756],
    //     [459, 727],
    //     [459, 583],
    //     [482, 540],
    //     [516, 522],
    //     [553, 528],
    //     [568, 557],
    //     [568, 645],
    //     [652, 645],
    //     [652, 274],
    //     [444, 59],
    //     [234, 59]
    // ]);
    mainScene.registerObject(background);
    // mainScene.registerObject(back_collision0);
    // mainScene.registerObject(back_collision1);

    // turrets
    // mainScene.registerObject(new Turret(0), 564, 585);
    // mainScene.registerObject(new Turret(3), 516, 753);
    // mainScene.registerObject(new Turret(1), 245, 946);
    // mainScene.registerObject(new Turret(2), 817, 736);
    // mainScene.registerObject(new Turret(3), 1148, 883);
    // mainScene.registerObject(new Turret(1), 882, 624);
    // mainScene.registerObject(new Turret(3), 1150, 624);
    // mainScene.registerObject(new Turret(1), 881, 435);
    // mainScene.registerObject(new Turret(3), 1149, 435);
    // mainScene.registerObject(new Turret(1), 885, 246);
    // mainScene.registerObject(new Turret(3), 1146, 246);
    // mainScene.registerObject(new Turret(1), 882, 58);

    // player
    player = new Player();
    mainScene.registerObject(player, 65, 205);
    mainScene.camera.setTarget(player);
    player.endGame = () => {
        location.reload();
    };

    // debug purpoise
    KeyControl.whenPressed("c", () => {
        mainScene._draw_collisions = !mainScene._draw_collisions;
    }, false);

    // final line
    mainScene.registerObject(new FinalLine(), 1700, 396);

    Engine.setCollideTag('final', 'player');
    Engine.setCollideTag('bullet', 'player');
    Engine.setCollideTag('bullet', 'shield');
    Engine.setCollideTag('bullet', 'wall');
    Engine.setCollideTag('player', 'wall');

    Engine.run(mainScene);
});